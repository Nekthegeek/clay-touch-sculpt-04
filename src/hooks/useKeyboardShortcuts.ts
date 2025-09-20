import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';

type ToolType = 'push' | 'pull' | 'smooth' | 'pinch' | 'flatten' | 'inflate' | 'twist' | 'vertex-select' | 'vertex-move' | 'paint';

interface KeyboardShortcutsProps {
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onExport: () => void;
  onAddObject: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  currentTool: string;
  onToolChange: (tool: ToolType) => void;
  selectedObjectId: string | null;
}

const tools: ToolType[] = ['push', 'pull', 'smooth', 'flatten', 'inflate', 'twist', 'paint', 'vertex-select', 'vertex-move'];

export const useKeyboardShortcuts = ({
  onUndo,
  onRedo,
  onSave,
  onExport,
  onAddObject,
  onDelete,
  onDuplicate,
  currentTool,
  onToolChange,
  selectedObjectId
}: KeyboardShortcutsProps) => {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Prevent shortcuts when typing in inputs
    if ((event.target as HTMLElement).tagName === 'INPUT' || 
        (event.target as HTMLElement).tagName === 'TEXTAREA') {
      return;
    }

    const { key, ctrlKey, metaKey, shiftKey, altKey } = event;
    const isCtrlOrCmd = ctrlKey || metaKey;

    // Prevent default browser shortcuts when we handle them
    if (isCtrlOrCmd && ['z', 'y', 's', 'e', 'n', 'd'].includes(key.toLowerCase())) {
      event.preventDefault();
    }

    // Core shortcuts
    if (isCtrlOrCmd) {
      switch (key.toLowerCase()) {
        case 'z':
          if (shiftKey) {
            onRedo();
          } else {
            onUndo();
          }
          break;
        case 'y':
          onRedo();
          break;
        case 's':
          onSave();
          break;
        case 'e':
          onExport();
          break;
        case 'n':
          onAddObject();
          break;
        case 'd':
          if (selectedObjectId) {
            onDuplicate();
          }
          break;
      }
      return;
    }

    // Tool shortcuts (number keys)
    const toolIndex = parseInt(key) - 1;
    if (toolIndex >= 0 && toolIndex < tools.length) {
      onToolChange(tools[toolIndex]);
      toast.success(`Switched to ${tools[toolIndex]} tool`, { duration: 1000 });
      return;
    }

    // Single key shortcuts
    switch (key.toLowerCase()) {
      case 'delete':
      case 'backspace':
        if (selectedObjectId) {
          onDelete();
        }
        break;
      case 'p':
        onToolChange('push');
        break;
      case 'l':
        onToolChange('pull');
        break;
      case 'g':
        onToolChange('smooth');
        break;
      case 'f':
        onToolChange('flatten');
        break;
      case 'i':
        onToolChange('inflate');
        break;
      case 't':
        onToolChange('twist');
        break;
      case 'c':
        onToolChange('paint');
        break;
      case 'v':
        onToolChange('vertex-select');
        break;
      case 'm':
        onToolChange('vertex-move');
        break;
      case '?':
        if (shiftKey) {
          showShortcutsHelp();
        }
        break;
    }
  }, [
    onUndo, onRedo, onSave, onExport, onAddObject, onDelete, onDuplicate,
    currentTool, onToolChange, selectedObjectId
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Show shortcuts help
  const showShortcutsHelp = useCallback(() => {
    const shortcuts = [
      'Ctrl+Z: Undo | Ctrl+Y: Redo',
      'Ctrl+S: Save | Ctrl+E: Export', 
      'Ctrl+N: Add Object | Ctrl+D: Duplicate',
      '1-9: Switch Tools | Del: Delete',
      'P: Push | L: Pull | G: Smooth',
      'F: Flatten | I: Inflate | T: Twist',
      'C: Paint | V: Vertex Select | M: Move'
    ].join('\n');
    
    toast.info(shortcuts, { duration: 5000 });
  }, []);

  return { showShortcutsHelp };
};