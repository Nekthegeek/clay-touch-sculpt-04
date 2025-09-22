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

  // Batch pointer events with requestAnimationFrame to avoid processing many events per frame
  const latestPointRef = useRef<THREE.Vector3 | null>(null);
  const rafScheduledRef = useRef(false);
  const tmpVec = useRef(new THREE.Vector3());

  // Process a single point (in world space) per frame
  const processPoint = useCallback((point: THREE.Vector3) => {
    if (!meshRef.current || !geometryRef.current) return;

    const strength = currentTool === 'push' ? -0.1 : currentTool === 'pull' ? 0.1 : 0.05;

    setDeformations(prev => [...prev, { position: point.clone(), strength, tool: currentTool }]);

    const geometry = geometryRef.current;
    const positions = geometry.attributes.position;

    // Convert world point to local mesh space once
    const localPoint = tmpVec.current.copy(point);
    meshRef.current.worldToLocal(localPoint);

    const radius = 0.3;
    const radiusSq = radius * radius;

    for (let i = 0; i < positions.count; i++) {
      const vx = positions.getX(i);
      const vy = positions.getY(i);
      const vz = positions.getZ(i);

      const dx = vx - localPoint.x;
      const dy = vy - localPoint.y;
      const dz = vz - localPoint.z;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < radiusSq) {
        const distance = Math.sqrt(distSq);
        const influence = Math.max(0, 1 - distance / radius);

        // approximate normal by normalizing vertex position
        const nx = vx;
        const ny = vy;
        const nz = vz;
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
        const inx = nx / len;
        const iny = ny / len;
        const inz = nz / len;

        let newX = vx;
        let newY = vy;
        let newZ = vz;

        if (currentTool === 'push') {
          newX += -strength * influence * inx;
          newY += -strength * influence * iny;
          newZ += -strength * influence * inz;
        } else if (currentTool === 'pull') {
          newX += strength * influence * inx;
          newY += strength * influence * iny;
          newZ += strength * influence * inz;
        } else if (currentTool === 'smooth') {
          // lightweight smoothing: nudge towards origin-normal direction
          newX += (inx - vx) * 0.02 * influence;
          newY += (iny - vy) * 0.02 * influence;
          newZ += (inz - vz) * 0.02 * influence;
        } else if (currentTool === 'flatten') {
          newY *= (1 - influence * 0.5);
        } else if (currentTool === 'inflate') {
          newX += strength * influence * 2 * inx;
          newY += strength * influence * 2 * iny;
          newZ += strength * influence * 2 * inz;
        } else if (currentTool === 'twist') {
          const angle = influence * 0.2;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          newX = vx * cos - vz * sin;
          newZ = vx * sin + vz * cos;
        }

        positions.setXYZ(i, newX, newY, newZ);
      }
    }

    positions.needsUpdate = true;
    geometry.computeVertexNormals();
  }, [currentTool]);

  const handlePointerMove = useCallback((event: any) => {
    if (!clicked) return;
    if (!event.point) return; // rely on r3f intersection point

    latestPointRef.current = event.point.clone();

    if (!rafScheduledRef.current) {
      rafScheduledRef.current = true;
      requestAnimationFrame(() => {
        rafScheduledRef.current = false;
        if (latestPointRef.current) processPoint(latestPointRef.current);
      });
    }
  }, [clicked, processPoint]);

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