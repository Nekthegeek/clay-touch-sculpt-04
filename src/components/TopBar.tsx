import React from 'react';
import { Undo, Redo, Save, Download, Menu, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectDialog } from './ProjectDialog';

interface TopBarProps {
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onExport: () => void;
  onLoadProject: (objects: any[]) => void;
  currentObjects: any[];
  canUndo: boolean;
  canRedo: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onUndo,
  onRedo,
  onSave,
  onExport,
  onLoadProject,
  currentObjects,
  canUndo,
  canRedo
}) => {

  return (
    <header className="absolute top-0 left-0 right-0 z-10 p-4">
      <div className="floating-panel flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="touch-target">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-lg text-primary hidden sm:block">
            ClayPlay 3D
          </h1>
        </div>

        <div className="flex items-center gap-1">
          <ProjectDialog
            onLoadProject={onLoadProject}
            currentObjects={currentObjects}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="touch-target btn-tool"
              >
                <FolderOpen className="h-4 w-4" />
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="icon"
            className="touch-target btn-tool"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="touch-target btn-tool"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="touch-target btn-tool"
            onClick={onSave}
            title="Save Project"
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            className="touch-target btn-clay ml-2"
            onClick={onExport}
            title="Export STL"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};