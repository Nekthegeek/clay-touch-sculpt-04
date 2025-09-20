import React, { useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ToolFeedbackProps {
  currentTool: string;
  toolStrength: number;
  toolSize: number;
  isActive: boolean;
}

export const ToolFeedback: React.FC<ToolFeedbackProps> = ({
  currentTool,
  toolStrength,
  toolSize,
  isActive
}) => {
  const { camera, raycaster, scene } = useThree();
  const [cursorPosition, setCursorPosition] = useState<THREE.Vector3>(new THREE.Vector3());
  const [showFeedback, setShowFeedback] = useState(false);

  // Create cursor indicator mesh
  const cursorGeometry = new THREE.RingGeometry(0, toolSize * 0.3, 16);
  const cursorMaterial = new THREE.MeshBasicMaterial({ 
    color: getToolColor(currentTool),
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide
  });
  const cursorMesh = new THREE.Mesh(cursorGeometry, cursorMaterial);

  // Strength indicator
  const strengthGeometry = new THREE.RingGeometry(
    toolSize * 0.3, 
    toolSize * 0.3 + (toolStrength / 100) * 0.2, 
    16
  );
  const strengthMaterial = new THREE.MeshBasicMaterial({
    color: getStrengthColor(toolStrength),
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide
  });
  const strengthMesh = new THREE.Mesh(strengthGeometry, strengthMaterial);

  useEffect(() => {
    if (isActive && showFeedback) {
      scene.add(cursorMesh);
      scene.add(strengthMesh);
    }

    return () => {
      scene.remove(cursorMesh);
      scene.remove(strengthMesh);
    };
  }, [isActive, showFeedback, scene]);

  useFrame(() => {
    if (isActive && showFeedback) {
      // Update cursor position based on mouse/pointer
      cursorMesh.position.copy(cursorPosition);
      strengthMesh.position.copy(cursorPosition);
      
      // Make indicators face the camera
      cursorMesh.lookAt(camera.position);
      strengthMesh.lookAt(camera.position);
      
      // Update material colors
      cursorMaterial.color.setHex(getToolColor(currentTool));
      strengthMaterial.color.setHex(getStrengthColor(toolStrength));
      
      // Update size
      cursorMesh.scale.setScalar(toolSize);
      strengthMesh.scale.setScalar(toolSize);
    }
  });

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isActive) return;

      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      
      // Raycast to find intersection point
      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        setCursorPosition(intersects[0].point);
        setShowFeedback(true);
      } else {
        setShowFeedback(false);
      }
    };

    const handleMouseEnter = () => setShowFeedback(true);
    const handleMouseLeave = () => setShowFeedback(false);

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseenter', handleMouseEnter);
      canvas.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseenter', handleMouseEnter);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [isActive, camera, raycaster, scene]);

  return null;
};

function getToolColor(tool: string): number {
  const colors: { [key: string]: number } = {
    push: 0xff4444,
    pull: 0x44ff44,
    smooth: 0x4444ff,
    flatten: 0xffaa44,
    inflate: 0xff44ff,
    twist: 0x44ffff,
    paint: 0xffffff,
    'vertex-select': 0x88ff88,
    'vertex-move': 0xffff44
  };
  return colors[tool] || 0xffffff;
}

function getStrengthColor(strength: number): number {
  // Gradient from green (low) to red (high)
  const normalized = strength / 100;
  const red = Math.floor(normalized * 255);
  const green = Math.floor((1 - normalized) * 255);
  return (red << 16) | (green << 8) | 0x00;
}