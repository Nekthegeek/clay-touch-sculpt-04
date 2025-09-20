import React from 'react';
import { EnhancedProjectManager } from './project/EnhancedProjectManager';

interface ProjectDialogProps {
  onLoadProject: (objects: any[]) => void;
  currentObjects: any[];
  trigger?: React.ReactNode;
}

export const ProjectDialog: React.FC<ProjectDialogProps> = ({ 
  onLoadProject, 
  currentObjects, 
  trigger 
}) => {
  return (
    <EnhancedProjectManager
      onLoadProject={onLoadProject}
      currentObjects={currentObjects}
      trigger={trigger}
    />
  );
};