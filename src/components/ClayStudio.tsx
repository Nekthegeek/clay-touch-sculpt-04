import React, { useRef, useState, Suspense, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { ToolPanel } from './ToolPanel';
import { TopBar } from './TopBar';

// Interactive Clay Component with deformation
function ClayBall({ currentTool }: { currentTool: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.SphereGeometry>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [deformations, setDeformations] = useState<Array<{ position: THREE.Vector3; strength: number; tool: string }>>([]);
  const { raycaster, camera } = useThree();

  const handlePointerMove = useCallback((event: any) => {
    if (!clicked || !meshRef.current || !geometryRef.current) return;

    const intersects = raycaster.intersectObject(meshRef.current);
    if (intersects.length > 0) {
      const point = intersects[0].point;
      const strength = currentTool === 'push' ? -0.1 : currentTool === 'pull' ? 0.1 : 0.05;
      
      setDeformations(prev => [...prev, { position: point.clone(), strength, tool: currentTool }]);
      
      // Apply deformation to geometry
      const geometry = geometryRef.current;
      const positions = geometry.attributes.position;
      
      for (let i = 0; i < positions.count; i++) {
        const vertex = new THREE.Vector3().fromBufferAttribute(positions, i);
        const distance = vertex.distanceTo(point);
        
        if (distance < 0.3) {
          const influence = Math.max(0, 1 - distance / 0.3);
          const normal = vertex.clone().normalize();
          
          if (currentTool === 'push') {
            vertex.addScaledVector(normal, -strength * influence);
          } else if (currentTool === 'pull') {
            vertex.addScaledVector(normal, strength * influence);
          } else if (currentTool === 'smooth') {
            // Smooth by averaging with nearby vertices
            vertex.lerp(new THREE.Vector3().fromBufferAttribute(positions, i), 0.9);
          } else if (currentTool === 'flatten') {
            vertex.y *= (1 - influence * 0.5);
          } else if (currentTool === 'inflate') {
            vertex.addScaledVector(normal, strength * influence * 2);
          } else if (currentTool === 'twist') {
            const angle = influence * 0.2;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const x = vertex.x * cos - vertex.z * sin;
            const z = vertex.x * sin + vertex.z * cos;
            vertex.x = x;
            vertex.z = z;
          }
          
          positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
      }
      
      positions.needsUpdate = true;
      geometry.computeVertexNormals();
    }
  }, [clicked, currentTool, raycaster]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Subtle floating animation only when not being sculpted
      if (!clicked) {
        meshRef.current.rotation.y += delta * 0.05;
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      scale={clicked ? 1.02 : hovered ? 1.01 : 1}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onPointerDown={() => setClicked(true)}
      onPointerUp={() => setClicked(false)}
      onPointerMove={handlePointerMove}
    >
      <sphereGeometry ref={geometryRef} args={[1.5, 64, 64]} />
      <meshStandardMaterial
        color="#D2691E"
        roughness={0.7}
        metalness={0.05}
        bumpScale={0.1}
        envMapIntensity={0.3}
      />
    </mesh>
  );
}

// Enhanced Lighting setup
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-8, -5, -8]} intensity={0.4} color="#FFA500" />
      <pointLight position={[8, 5, 8]} intensity={0.2} color="#87CEEB" />
      <hemisphereLight args={['#87CEEB', '#D2691E', 0.2]} />
    </>
  );
}

// Loading fallback
function CanvasLoader() {
  return (
    <div className="flex items-center justify-center h-full bg-canvas-bg">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading clay studio...</p>
      </div>
    </div>
  );
}

export const ClayStudio: React.FC = () => {
  const [currentTool, setCurrentTool] = useState<'push' | 'pull' | 'smooth' | 'pinch' | 'flatten' | 'inflate' | 'twist' | 'vertex-select' | 'vertex-move' | 'paint'>('push');

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-canvas">
      {/* Top Bar */}
      <TopBar
        onUndo={() => {}}
        onRedo={() => {}}
        onSave={() => {}}
        onExport={() => {}}
        onLoadProject={() => {}}
        currentObjects={[]}
        canUndo={false}
        canRedo={false}
      />

      {/* 3D Canvas */}
      <div className="absolute inset-0 canvas-3d">
        <Suspense fallback={<CanvasLoader />}>
          <Canvas
            camera={{ position: [0, 0, 6], fov: 50 }}
            shadows
            gl={{ antialias: true, alpha: true }}
          >
            <Lighting />
            <ClayBall currentTool={currentTool} />
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              minDistance={3}
              maxDistance={10}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI - Math.PI / 6}
            />
          </Canvas>
        </Suspense>
      </div>

      {/* Floating Tool Panel */}
      <ToolPanel currentTool={currentTool} onToolChange={setCurrentTool} />

      {/* Onboarding Hint */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 floating-panel max-w-xs text-center md:hidden">
        <p className="text-sm text-muted-foreground">
          Touch and drag to rotate • Pinch to zoom
        </p>
      </div>
    </div>
  );
};