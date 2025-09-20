import { useCallback } from 'react';
import { commandManager, Command } from '../services/commandManager';
import { toast } from 'sonner';

export const useCommandManager = () => {
  const executeCommand = useCallback((command: Command) => {
    commandManager.executeCommand(command);
  }, []);

  const undo = useCallback(() => {
    const success = commandManager.undo();
    if (success) {
      toast.success('Action undone');
    } else {
      toast.error('Nothing to undo');
    }
    return success;
  }, []);

  const redo = useCallback(() => {
    const success = commandManager.redo();
    if (success) {
      toast.success('Action redone');
    } else {
      toast.error('Nothing to redo');
    }
    return success;
  }, []);

  const canUndo = useCallback(() => {
    return commandManager.canUndo();
  }, []);

  const canRedo = useCallback(() => {
    return commandManager.canRedo();
  }, []);

  const getUndoDescription = useCallback(() => {
    return commandManager.getUndoDescription();
  }, []);

  const getRedoDescription = useCallback(() => {
    return commandManager.getRedoDescription();
  }, []);

  const clearHistory = useCallback(() => {
    commandManager.clear();
  }, []);

  return {
    executeCommand,
    undo,
    redo,
    canUndo,
    canRedo,
    getUndoDescription,
    getRedoDescription,
    clearHistory
  };
};