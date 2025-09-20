import { useState, useCallback } from 'react';
import { ProjectFolder } from '../types/project';
import { toast } from 'sonner';

const STORAGE_KEY = 'clayplay-project-folders';

const DEFAULT_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
  '#8B5CF6', '#EC4899', '#6B7280', '#F97316'
];

export const useProjectFolders = () => {
  const [folders, setFolders] = useState<ProjectFolder[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load folders:', error);
      return [];
    }
  });

  const saveFolders = useCallback((newFolders: ProjectFolder[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFolders));
      setFolders(newFolders);
    } catch (error) {
      console.error('Failed to save folders:', error);
      toast.error('Failed to save folders');
    }
  }, []);

  const createFolder = useCallback((name: string, parentId?: string, color?: string) => {
    if (!name.trim()) {
      toast.error('Folder name cannot be empty');
      return null;
    }

    // Check for duplicate names in the same parent
    const sameLevelFolders = folders.filter(f => f.parentId === parentId);
    if (sameLevelFolders.some(folder => folder.name.toLowerCase() === name.toLowerCase())) {
      toast.error('A folder with this name already exists');
      return null;
    }

    const newFolder: ProjectFolder = {
      id: `folder-${Date.now()}`,
      name: name.trim(),
      parentId,
      color: color || DEFAULT_COLORS[folders.length % DEFAULT_COLORS.length],
      createdAt: Date.now()
    };

    const updatedFolders = [...folders, newFolder];
    saveFolders(updatedFolders);
    
    toast.success(`Folder "${name}" created successfully!`);
    return newFolder.id;
  }, [folders, saveFolders]);

  const updateFolder = useCallback((folderId: string, updates: Partial<ProjectFolder>) => {
    const updatedFolders = folders.map(folder =>
      folder.id === folderId ? { ...folder, ...updates } : folder
    );
    
    saveFolders(updatedFolders);
    toast.success('Folder updated successfully!');
  }, [folders, saveFolders]);

  const deleteFolder = useCallback((folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return false;

    // Check if folder has subfolders
    const hasSubfolders = folders.some(f => f.parentId === folderId);
    if (hasSubfolders) {
      toast.error('Cannot delete folder that contains subfolders. Move or delete subfolders first.');
      return false;
    }

    const updatedFolders = folders.filter(f => f.id !== folderId);
    saveFolders(updatedFolders);
    
    toast.success(`Folder "${folder.name}" deleted successfully!`);
    return true;
  }, [folders, saveFolders]);

  const getFolder = useCallback((folderId: string) => {
    return folders.find(folder => folder.id === folderId);
  }, [folders]);

  const getRootFolders = useCallback(() => {
    return folders.filter(folder => !folder.parentId);
  }, [folders]);

  const getSubfolders = useCallback((parentId: string) => {
    return folders.filter(folder => folder.parentId === parentId);
  }, [folders]);

  const getFolderPath = useCallback((folderId: string): ProjectFolder[] => {
    const path: ProjectFolder[] = [];
    let currentId: string | undefined = folderId;

    while (currentId) {
      const folder = getFolder(currentId);
      if (folder) {
        path.unshift(folder);
        currentId = folder.parentId;
      } else {
        break;
      }
    }

    return path;
  }, [folders, getFolder]);

  return {
    folders,
    createFolder,
    updateFolder,
    deleteFolder,
    getFolder,
    getRootFolders,
    getSubfolders,
    getFolderPath
  };
};