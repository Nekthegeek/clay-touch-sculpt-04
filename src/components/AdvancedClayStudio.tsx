import React, { useState, Suspense, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { ClayObject, ClayObjectRef } from './ClayObject';
import { ToolPanel } from './ToolPanel';
import { TopBar } from './TopBar';
import { ObjectManager } from './ObjectManager';
import { ErrorBoundary } from './ErrorBoundary';
import { TutorialSystem } from './TutorialSystem';
import { ToolFeedback } from './ToolFeedback';
import { ToolStrengthControls } from './ToolStrengthControls';
import { StatusIndicator } from './StatusIndicator';
import { ContextualTooltip } from './ContextualTooltip';
import { toast } from 'sonner';
import { useCommandManager } from '@/hooks/useCommandManager';
import { useProjectManager } from '@/hooks/useProjectManager';
import { useGeometryCache } from '@/hooks/useGeometryCache';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useMobileOptimizations, useMobilePerformance } from '@/hooks/useMobileOptimizations';
import { MobileNavigation } from './MobileNavigation';
import { stlExporter } from '@/services/stlExporter';
import {
  AddObjectCommand,
  DeleteObjectCommand,
  DuplicateObjectCommand,
  ColorChangeCommand
} from '@/services/commandManager';
import { ClayObjectData } from '@/services/projectManager';
import { deserializeGeometry } from '@/lib/geometryUtils';

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
        <p className="text-muted-foreground">Loading advanced clay studio...</p>
      </div>
    </div>
  );
}

export const AdvancedClayStudio: React.FC = () => {
  const [currentTool, setCurrentTool] = useState<'push' | 'pull' | 'smooth' | 'pinch' | 'flatten' | 'inflate' | 'twist' | 'vertex-select' | 'vertex-move' | 'paint'>('push');
  const [objects, setObjects] = useState<ClayObjectData[]>([
    {
      id: '1',
      position: [0, 0, 0],
      color: '#D2691E',
      size: 1.5,
      name: 'Clay Ball 1'
    }
  ]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>('1');
  const [currentColor, setCurrentColor] = useState('#D2691E');
  const [showTutorial, setShowTutorial] = useState(() => {
    return !localStorage.getItem('clay-studio-tutorial-completed');
  });
  const [toolStrength, setToolStrength] = useState(50);
  const [toolSize, setToolSize] = useState(1.0);
  const [showTooltip, setShowTooltip] = useState(true);
  const [sculptingStatus, setSculptingStatus] = useState<'idle' | 'sculpting' | 'saving' | 'exporting' | 'complete'>('idle');

  // Refs for accessing ClayObject geometries
  const objectRefs = useRef<{ [key: string]: ClayObjectRef | null }>({});

  // Geometry cache for performance and export
  const {
    updateGeometry,
    getGeometry,
    removeGeometry,
    clearCache,
    getSerializedGeometry
  } = useGeometryCache();

  // Command manager for undo/redo
  const {
    executeCommand,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory
  } = useCommandManager();

  // Project manager for save/load
  const { saveProject } = useProjectManager();

  // Mobile optimizations
  const mobileOptions = useMobileOptimizations();
  const { isHighPerformance, settings } = useMobilePerformance();

  const handleAddObject = useCallback(() => {
    const newObject: ClayObjectData = {
      id: Date.now().toString(),
      position: [
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4
      ],
      color: currentColor,
      size: 1 + Math.random() * 1,
      name: `Clay Ball ${objects.length + 1}`
    };
    
    const command = new AddObjectCommand(
      objects,
      setObjects,
      newObject,
      setSelectedObjectId
    );
    executeCommand(command);
    toast.success('New clay object added!');
  }, [objects, currentColor, executeCommand]);

  const handleDeleteObject = useCallback((id: string) => {
    if (objects.length <= 1) {
      toast.error('Cannot delete the last object!');
      return;
    }
    
    const objectToDelete = objects.find(obj => obj.id === id);
    if (!objectToDelete) return;

    // Clean up geometry cache
    removeGeometry(id);
    delete objectRefs.current[id];

    const command = new DeleteObjectCommand(
      objects,
      setObjects,
      objectToDelete,
      setSelectedObjectId,
      selectedObjectId
    );
    executeCommand(command);
    toast.success('Object deleted');
  }, [objects, selectedObjectId, executeCommand, removeGeometry]);

  const handleDuplicateObject = useCallback((id: string) => {
    const objectToDuplicate = objects.find(obj => obj.id === id);
    if (!objectToDuplicate) return;
    
    const newObject: ClayObjectData = {
      ...objectToDuplicate,
      id: Date.now().toString(),
      position: [
        objectToDuplicate.position[0] + 1,
        objectToDuplicate.position[1],
        objectToDuplicate.position[2]
      ],
      name: `${objectToDuplicate.name} Copy`
    };
    
    const command = new DuplicateObjectCommand(
      objects,
      setObjects,
      newObject,
      setSelectedObjectId
    );
    executeCommand(command);
    toast.success('Object duplicated!');
  }, [objects, executeCommand]);

  // Tutorial handlers
  const handleCloseTutorial = useCallback(() => {
    setShowTutorial(false);
  }, []);

  // Keyboard shortcuts setup
  useKeyboardShortcuts({
    onUndo: undo,
    onRedo: redo,
    onSave: () => handleSave(),
    onExport: () => handleExport(),
    onAddObject: handleAddObject,
    onDelete: () => selectedObjectId && handleDeleteObject(selectedObjectId),
    onDuplicate: () => selectedObjectId && handleDuplicateObject(selectedObjectId),
    currentTool,
    onToolChange: (tool) => setCurrentTool(tool),
    selectedObjectId
  });

  const handleColorChange = useCallback((id: string, color: string) => {
    const currentObject = objects.find(obj => obj.id === id);
    if (!currentObject) return;

    const command = new ColorChangeCommand(
      objects,
      setObjects,
      id,
      color,
      currentObject.color,
      setCurrentColor,
      selectedObjectId
    );
    executeCommand(command);
  }, [objects, selectedObjectId, executeCommand]);

  const handleSelectObject = useCallback((id: string) => {
    setSelectedObjectId(id);
    const selectedObject = objects.find(obj => obj.id === id);
    if (selectedObject) {
      setCurrentColor(selectedObject.color);
    }
  }, [objects]);

  // Handle geometry changes from ClayObjects
  const handleGeometryChange = useCallback((objectId: string, geometry: THREE.BufferGeometry) => {
    updateGeometry(objectId, geometry);
  }, [updateGeometry]);

  // Top bar handlers with improved geometry capture
  const handleSave = useCallback(() => {
    try {
      // Create objects with geometry data for saving
      const objectsWithGeometry = objects.map(obj => {
        const serializedGeometry = getSerializedGeometry(obj.id);
        return {
          ...obj,
          geometry: serializedGeometry
        };
      });
      
      saveProject(objectsWithGeometry);
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save project');
    }
  }, [objects, saveProject, getSerializedGeometry]);

  const handleExport = useCallback(async () => {
    toast.loading('Exporting STL file...', { id: 'stl-export' });
    try {
      // Create objects with current geometry data for export
      const objectsWithGeometry = objects.map(obj => {
        const serializedGeometry = getSerializedGeometry(obj.id);
        return {
          ...obj,
          geometry: serializedGeometry
        };
      });
      
      await stlExporter.exportObjectsToSTL(objectsWithGeometry);
      toast.success('STL file exported successfully!', { id: 'stl-export' });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export STL file', { id: 'stl-export' });
    }
  }, [objects, getSerializedGeometry]);

  const handleLoadProject = useCallback((loadedObjects: ClayObjectData[]) => {
    // Clear existing geometry cache
    clearCache();
    objectRefs.current = {};

    loadedObjects.forEach(obj => {
      if (obj.geometry) {
        const rebuiltGeometry = deserializeGeometry(obj.geometry);
        if (rebuiltGeometry) {
          updateGeometry(obj.id, rebuiltGeometry);
          rebuiltGeometry.dispose();
        }
      }
    });

    setObjects(loadedObjects);
    setSelectedObjectId(loadedObjects[0]?.id || null);
    if (loadedObjects[0]) {
      setCurrentColor(loadedObjects[0].color);
    }
    clearHistory(); // Clear undo/redo history when loading new project
  }, [clearHistory, clearCache, updateGeometry]);

  return (
    <ErrorBoundary>
      <div className="relative w-full h-screen overflow-hidden bg-gradient-canvas">
      {/* Top Bar */}
      <TopBar
        onUndo={undo}
        onRedo={redo}
        onSave={handleSave}
        onExport={handleExport}
        onLoadProject={handleLoadProject}
        currentObjects={objects}
        canUndo={canUndo()}
        canRedo={canRedo()}
      />

      {/* 3D Canvas */}
      <div className="absolute inset-0 canvas-3d">
        <Suspense fallback={<CanvasLoader />}>
          <Canvas
            camera={{ 
              position: [0, 0, 8], 
              fov: mobileOptions.isPortrait ? 60 : 50 
            }}
            shadows={settings.shadows}
            gl={{ 
              antialias: settings.antialiasing, 
              alpha: true,
              powerPreference: isHighPerformance ? 'high-performance' : 'low-power'
            }}
          >
            <Lighting />
            
            {objects.map((object) => (
              <ClayObject
                key={object.id}
                ref={(ref) => {
                  if (ref) {
                    objectRefs.current[object.id] = ref;
                  } else {
                    delete objectRefs.current[object.id];
                  }
                }}
                id={object.id}
                position={object.position}
                currentTool={currentTool}
                isSelected={selectedObjectId === object.id}
                onSelect={handleSelectObject}
                color={object.color}
                size={object.size}
                onGeometryChange={handleGeometryChange}
                toolStrength={toolStrength}
                toolSize={toolSize}
                geometry={object.geometry}
              />
            ))}
            
            {/* Real-time tool feedback */}
            <ToolFeedback 
              currentTool={currentTool}
              toolStrength={toolStrength}
              toolSize={toolSize}
              isActive={selectedObjectId !== null}
            />
            
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={4}
              maxDistance={settings.renderDistance}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI - Math.PI / 6}
              // Enhanced touch controls for mobile
              touches={{
                ONE: THREE.TOUCH.ROTATE,
                TWO: THREE.TOUCH.DOLLY_PAN
              }}
              mouseButtons={{
                LEFT: THREE.MOUSE.ROTATE,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.PAN
              }}
              enableDamping={true}
              dampingFactor={0.05}
            />
          </Canvas>
        </Suspense>
      </div>

      {/* Desktop Tool Panel - Hidden on mobile */}
      <div className="hidden md:block">
        <ToolPanel currentTool={currentTool} onToolChange={setCurrentTool} />
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation
        currentTool={currentTool}
        onToolChange={(tool: string) => setCurrentTool(tool as any)}
        onSave={handleSave}
        onExport={handleExport}
        onAddObject={handleAddObject}
        onShowProjects={() => {/* Handle project dialog */}}
        onShowHelp={() => setShowTutorial(true)}
        onShowColorPicker={() => {/* Handle color picker */}}
      />

      {/* Tool Strength Controls - Responsive positioning */}
      <div className={`${mobileOptions.isPortrait ? 'top-20' : 'top-4'} ${mobileOptions.safeArea.right > 0 ? 'pr-8' : ''}`}>
        <ToolStrengthControls
          toolStrength={toolStrength}
          toolSize={toolSize}
          onStrengthChange={setToolStrength}
          onSizeChange={setToolSize}
          currentTool={currentTool}
        />
      </div>

      {/* Object Manager - Desktop only, mobile uses MobileNavigation */}
      <div className="hidden md:block">
        <ObjectManager
          objects={objects}
          selectedObjectId={selectedObjectId}
          onAddObject={handleAddObject}
          onDeleteObject={handleDeleteObject}
          onDuplicateObject={handleDuplicateObject}
          onSelectObject={handleSelectObject}
          onColorChange={handleColorChange}
          currentColor={currentColor}
        />
      </div>

      {/* Tutorial System */}
      <TutorialSystem
        isOpen={showTutorial}
        onClose={handleCloseTutorial}
        currentTool={currentTool}
        onToolChange={tool => setCurrentTool(tool)}
      />

      {/* Status Indicator */}
      <div className="absolute top-20 left-4 z-20">
        <StatusIndicator
          status={sculptingStatus}
          currentTool={currentTool}
          toolStrength={toolStrength}
        />
      </div>

      {/* Contextual Tooltip */}
      <div className="absolute top-20 right-4 z-20 max-w-xs">
        <ContextualTooltip
          currentTool={currentTool}
          isVisible={showTooltip}
          onDismiss={() => setShowTooltip(false)}
        />
      </div>

      {/* Enhanced Mobile Hints */}
      {mobileOptions.screenSize === 'small' && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 floating-panel-sm max-w-xs text-center md:hidden animate-fade-in">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-primary font-medium">Touch Tips:</span><br />
            Long press for stronger sculpting • Double tap to smooth • Pinch to zoom
          </p>
        </div>
      )}

      {/* Enhanced Tool Indicator - Desktop only */}
      <div className="absolute bottom-4 left-4 floating-panel-sm hidden md:block animate-scale-in">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-primary shadow-glow animate-pulse"></div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold capitalize text-foreground">
              {currentTool.replace('-', ' ')}
            </span>
            <span className="text-xs text-muted-foreground">
              Strength: {toolStrength}%
            </span>
          </div>
          {currentTool === 'paint' && (
            <div 
              className="w-5 h-5 rounded-lg border-2 border-border shadow-inner ml-2"
              style={{ backgroundColor: currentColor }}
            />
          )}
        </div>
      </div>

      {/* Mobile Performance Indicator */}
      {!isHighPerformance && (
        <div className="absolute top-72 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-2 rounded-full text-xs md:hidden shadow-lg backdrop-blur-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse"></div>
            Performance Mode
          </div>
        </div>
      )}
      </div>
    </ErrorBoundary>
  );
};