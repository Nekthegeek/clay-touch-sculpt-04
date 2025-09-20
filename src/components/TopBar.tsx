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
    <header className="absolute top-0 left-0 right-0 z-10 p-4 animate-slide-up">
      <div className="floating-panel flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="touch-target">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-clay rounded-xl flex items-center justify-center shadow-glow">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
            <h1 className="font-display font-bold text-lg text-primary hidden sm:block">
              ClayPlay 3D
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ProjectDialog
            onLoadProject={onLoadProject}
            currentObjects={currentObjects}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="touch-target btn-tool hover:scale-110 transition-transform"
              >
                <FolderOpen className="h-4 w-4" />
              </Button>
            }
          />
          
          <div className="flex items-center bg-muted/30 rounded-full p-1">
            <Button
              variant="ghost"
              size="icon"
              className="touch-target h-8 w-8 rounded-full hover:scale-110 transition-all"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="touch-target h-8 w-8 rounded-full hover:scale-110 transition-all"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
            >
              <Redo className="h-3 w-3" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="touch-target btn-tool hover:scale-110 transition-transform"
            onClick={onSave}
            title="Save Project (Ctrl+S)"
          >
            <Save className="h-4 w-4" />
          </Button>
          
          <Button
            size="icon"
            className="touch-target btn-clay hover:scale-110 transition-all duration-300 shadow-glow"
            onClick={onExport}
            title="Export STL (Ctrl+E)"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};