import React, { useRef, useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ClayObjectProps {
  id: string;
  position: [number, number, number];
  currentTool: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  color: string;
  size: number;
  onGeometryChange?: (id: string, geometry: THREE.BufferGeometry) => void;
  toolStrength?: number;
  toolSize?: number;
}

export interface ClayObjectRef {
  getGeometry: () => THREE.BufferGeometry | null;
  getModifiedGeometry: () => THREE.BufferGeometry | null;
}

export const ClayObject = forwardRef<ClayObjectRef, ClayObjectProps>(({
  id,
  position,
  currentTool,
  isSelected,
  onSelect,
  color,
  size,
  onGeometryChange,
  toolStrength = 50,
  toolSize = 1.0
}, ref) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.SphereGeometry>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [selectedVertices, setSelectedVertices] = useState<Set<number>>(new Set());
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const [geometryModified, setGeometryModified] = useState(false);
  const { raycaster, camera } = useThree();

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getGeometry: () => geometryRef.current,
    getModifiedGeometry: () => {
      if (!geometryRef.current || !geometryModified) return null;
      // Clone the geometry to avoid reference issues
      const clonedGeometry = geometryRef.current.clone();
      return clonedGeometry;
    }
  }), [geometryModified]);

  // Initialize paint texture
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 256, 256);
    
    const paintTexture = new THREE.CanvasTexture(canvas);
    paintTexture.needsUpdate = true;
    setTexture(paintTexture);
    
    return () => {
      paintTexture.dispose();
    };
  }, []);

  const handleVertexManipulation = useCallback((event: any) => {
    if (!clicked || !meshRef.current || !geometryRef.current) return;

    const intersects = raycaster.intersectObject(meshRef.current);
    if (intersects.length === 0) return;

    const point = intersects[0].point;
    const geometry = geometryRef.current;
    const positions = geometry.attributes.position;

    if (currentTool === 'vertex-select') {
      // Find nearest vertex for selection
      let closestVertex = 0;
      let minDistance = Infinity;
      
      for (let i = 0; i < positions.count; i++) {
        const vertex = new THREE.Vector3().fromBufferAttribute(positions, i);
        vertex.applyMatrix4(meshRef.current.matrixWorld);
        const distance = vertex.distanceTo(point);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestVertex = i;
        }
      }
      
      setSelectedVertices(prev => {
        const newSet = new Set(prev);
        if (newSet.has(closestVertex)) {
          newSet.delete(closestVertex);
        } else {
          newSet.add(closestVertex);
        }
        return newSet;
      });
    } else if (currentTool === 'vertex-move' && selectedVertices.size > 0) {
      // Move selected vertices
      const localPoint = point.clone();
      meshRef.current.worldToLocal(localPoint);
      
      selectedVertices.forEach(vertexIndex => {
        const vertex = new THREE.Vector3().fromBufferAttribute(positions, vertexIndex);
        const direction = localPoint.clone().sub(vertex).normalize();
        vertex.addScaledVector(direction, 0.05);
        positions.setXYZ(vertexIndex, vertex.x, vertex.y, vertex.z);
      });
      
      positions.needsUpdate = true;
      geometry.computeVertexNormals();
    } else if (currentTool === 'paint' && texture) {
      // Paint on surface
      const uv = intersects[0].uv;
      if (uv) {
        const canvas = (texture as THREE.CanvasTexture).image as HTMLCanvasElement;
        const ctx = canvas.getContext('2d')!;
        
        const x = Math.floor(uv.x * canvas.width);
        const y = Math.floor((1 - uv.y) * canvas.height);
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
        
        texture.needsUpdate = true;
      }
    } else {
      // Standard sculpting tools with dynamic strength and size
      const baseStrength = currentTool === 'push' ? -0.1 : currentTool === 'pull' ? 0.1 : 0.05;
      const adjustedStrength = baseStrength * (toolStrength / 50); // Scale by strength setting
      const influenceRadius = 0.3 * toolSize; // Scale by size setting
      
      const localPoint = point.clone();
      meshRef.current.worldToLocal(localPoint);
      
      for (let i = 0; i < positions.count; i++) {
        const vertex = new THREE.Vector3().fromBufferAttribute(positions, i);
        const distance = vertex.distanceTo(localPoint);
        
        if (distance < influenceRadius) {
          const influence = Math.max(0, 1 - distance / influenceRadius);
          const normal = vertex.clone().normalize();
          
          switch (currentTool) {
            case 'push':
              vertex.addScaledVector(normal, adjustedStrength * influence);
              break;
            case 'pull':
              vertex.addScaledVector(normal, adjustedStrength * influence);
              break;
            case 'smooth':
              // More sophisticated smoothing
              const avgPosition = new THREE.Vector3();
              let count = 0;
              
              // Average nearby vertices
              for (let j = 0; j < positions.count; j++) {
                const neighborVertex = new THREE.Vector3().fromBufferAttribute(positions, j);
                const neighborDistance = vertex.distanceTo(neighborVertex);
                if (neighborDistance < influenceRadius && j !== i) {
                  avgPosition.add(neighborVertex);
                  count++;
                }
              }
              
              if (count > 0) {
                avgPosition.divideScalar(count);
                const smoothFactor = influence * (toolStrength / 100);
                vertex.lerp(avgPosition, smoothFactor);
              }
              break;
            case 'flatten':
              vertex.y *= (1 - influence * (toolStrength / 100));
              break;
            case 'inflate':
              vertex.addScaledVector(normal, adjustedStrength * influence * 2);
              break;
            case 'twist':
              const angle = influence * 0.2 * (toolStrength / 50);
              const cos = Math.cos(angle);
              const sin = Math.sin(angle);
              const x = vertex.x * cos - vertex.z * sin;
              const z = vertex.x * sin + vertex.z * cos;
              vertex.x = x;
              vertex.z = z;
              break;
          }
          
          positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
      }
      
      positions.needsUpdate = true;
      geometry.computeVertexNormals();
      setGeometryModified(true);
      
      // Notify parent of geometry change
      if (onGeometryChange && geometryRef.current) {
        onGeometryChange(id, geometryRef.current);
      }
    }
  }, [clicked, currentTool, raycaster, selectedVertices, texture, color, id, onGeometryChange, toolStrength, toolSize]);

  useFrame((state, delta) => {
    if (meshRef.current && !clicked) {
      // Subtle floating animation
      meshRef.current.rotation.y += delta * 0.02;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.3 + position[0]) * 0.02;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        scale={clicked ? 1.02 : hovered ? 1.01 : 1}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onPointerDown={() => {
          setClicked(true);
          onSelect(id);
        }}
        onPointerUp={() => setClicked(false)}
        onPointerMove={handleVertexManipulation}
        onClick={() => onSelect(id)}
      >
        <sphereGeometry ref={geometryRef} args={[size, 64, 64]} />
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          roughness={0.7}
          metalness={0.05}
          map={texture}
          transparent={currentTool === 'paint'}
          opacity={currentTool === 'paint' ? 0.9 : 1}
        />
      </mesh>
      
      {/* Vertex selection indicators */}
      {isSelected && currentTool === 'vertex-select' && (
        <>
          {Array.from(selectedVertices).map(vertexIndex => {
            if (!geometryRef.current) return null;
            const vertex = new THREE.Vector3().fromBufferAttribute(
              geometryRef.current.attributes.position,
              vertexIndex
            );
            return (
              <mesh key={vertexIndex} position={[vertex.x, vertex.y, vertex.z]}>
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshBasicMaterial color="#00ff00" />
              </mesh>
            );
          })}
        </>
      )}
      
      {/* Selection highlight */}
      {isSelected && (
        <mesh scale={[size + 0.1, size + 0.1, size + 0.1]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial 
            color="#00ff00" 
            transparent 
            opacity={0.1} 
            wireframe 
          />
        </mesh>
      )}
    </group>
  );
});