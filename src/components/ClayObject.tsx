import React, { useRef, useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useTouchGestures } from '@/hooks/useTouchGestures';

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
  const [touchIntensity, setTouchIntensity] = useState(1);
  const { raycaster, camera } = useThree();

  // Enhanced touch gestures for mobile sculpting
  const { touchHandlers, isLongPressing, triggerHaptic } = useTouchGestures({
    onLongPress: () => {
      if (currentTool === 'push' || currentTool === 'pull') {
        setTouchIntensity(2); // Increase intensity for long press
        triggerHaptic('medium');
      }
    },
    onDoubleTap: () => {
      if (currentTool === 'smooth') {
        triggerHaptic('light');
        // Quick smooth burst
        setTouchIntensity(3);
        setTimeout(() => setTouchIntensity(1), 200);
      }
    },
    onPinch: (scale) => {
      if (currentTool === 'inflate' && scale > 1.1) {
        triggerHaptic('light');
      }
    }
  });

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

  // Batch pointer processing similar to ClayStudio: use event.point from r3f and process per frame
  const latestPoint = useRef<THREE.Vector3 | null>(null);
  const rafPending = useRef(false);
  const tmpLocal = useRef(new THREE.Vector3());

  const handleVertexManipulation = useCallback((event: ThreeEvent<PointerEvent>) => {
    if (!clicked || !meshRef.current || !geometryRef.current) return;
    if (!event.point) return;

    latestPoint.current = event.point.clone();

    if (!rafPending.current) {
      rafPending.current = true;
      requestAnimationFrame(() => {
        rafPending.current = false;
        const point = latestPoint.current;
        if (!point) return;

        const geometry = geometryRef.current!;
        const positions = geometry.attributes.position;

        // For selection: find nearest vertex by squared distance in world space
        if (currentTool === 'vertex-select') {
          let closest = -1;
          let minSq = Infinity;

          // Transform vertex to world once per vertex using matrixWorld
          const matrix = meshRef.current!.matrixWorld;

          for (let i = 0; i < positions.count; i++) {
            const vx = positions.getX(i);
            const vy = positions.getY(i);
            const vz = positions.getZ(i);
            tmpLocal.current.set(vx, vy, vz).applyMatrix4(matrix);
            const dx = tmpLocal.current.x - point.x;
            const dy = tmpLocal.current.y - point.y;
            const dz = tmpLocal.current.z - point.z;
            const dsq = dx * dx + dy * dy + dz * dz;
            if (dsq < minSq) {
              minSq = dsq;
              closest = i;
            }
          }

          if (closest >= 0) {
            setSelectedVertices(prev => {
              const newSet = new Set(prev);
              if (newSet.has(closest)) newSet.delete(closest); else newSet.add(closest);
              return newSet;
            });
          }

          return;
        }

        // Paint handling stays as-is, using uv from event
        if (currentTool === 'paint' && texture) {
          const uv = event.uv;
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
          return;
        }

        // Standard sculpting: convert point to local once
        const localPoint = tmpLocal.current.copy(point);
        meshRef.current!.worldToLocal(localPoint);

        const influenceRadius = 0.3 * toolSize;
        const radiusSq = influenceRadius * influenceRadius;
        const baseStrength = currentTool === 'push' ? -0.1 : currentTool === 'pull' ? 0.1 : 0.05;
        const adjustedStrength = baseStrength * (toolStrength / 50) * touchIntensity;

        for (let i = 0; i < positions.count; i++) {
          const vx = positions.getX(i);
          const vy = positions.getY(i);
          const vz = positions.getZ(i);

          const dx = vx - localPoint.x;
          const dy = vy - localPoint.y;
          const dz = vz - localPoint.z;
          const dsq = dx * dx + dy * dy + dz * dz;

          if (dsq < radiusSq) {
            const dist = Math.sqrt(dsq);
            const influence = Math.max(0, 1 - dist / influenceRadius);

            // approximate normal by vertex position
            const len = Math.sqrt(vx * vx + vy * vy + vz * vz) || 1;
            const nx = vx / len;
            const ny = vy / len;
            const nz = vz / len;

            let newX = vx;
            let newY = vy;
            let newZ = vz;

            switch (currentTool) {
              case 'push':
              case 'pull':
                newX += adjustedStrength * influence * nx;
                newY += adjustedStrength * influence * ny;
                newZ += adjustedStrength * influence * nz;
                break;
              case 'smooth':
                // lightweight smoothing: move slightly toward normalized vertex
                newX += (nx - vx) * 0.02 * influence;
                newY += (ny - vy) * 0.02 * influence;
                newZ += (nz - vz) * 0.02 * influence;
                break;
              case 'flatten':
                newY *= (1 - influence * (toolStrength / 100));
                break;
              case 'inflate':
                newX += adjustedStrength * influence * 2 * nx;
                newY += adjustedStrength * influence * 2 * ny;
                newZ += adjustedStrength * influence * 2 * nz;
                break;
              case 'twist': {
                const angle = influence * 0.2 * (toolStrength / 50);
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                newX = vx * cos - vz * sin;
                newZ = vx * sin + vz * cos;
                break;
              }
            }

            positions.setXYZ(i, newX, newY, newZ);
          }
        }

        positions.needsUpdate = true;
        geometry.computeVertexNormals();
        setGeometryModified(true);

        if (onGeometryChange && geometryRef.current) {
          onGeometryChange(id, geometryRef.current);
        }
      });
    }
  }, [clicked, currentTool, texture, color, id, onGeometryChange, toolStrength, toolSize, touchIntensity]);

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
        onPointerUp={() => {
          setClicked(false);
          setTouchIntensity(1); // Reset touch intensity
        }}
        onPointerMove={handleVertexManipulation}
        onClick={() => onSelect(id)}
        {...touchHandlers}
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