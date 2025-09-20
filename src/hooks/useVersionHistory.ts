import { useState, useCallback } from 'react';
import { ProjectVersion } from '../types/project';
import { versionManager } from '../services/versionManager';

export const useVersionHistory = (projectId: string | null) => {
  const [versions, setVersions] = useState<ProjectVersion[]>(() =>
    projectId ? versionManager.getProjectVersions(projectId) : []
  );

  const refreshVersions = useCallback(() => {
    if (projectId) {
      setVersions(versionManager.getProjectVersions(projectId));
    }
  }, [projectId]);

  const saveVersion = useCallback((objects: any[], comment?: string) => {
    if (!projectId) return null;
    
    const versionId = versionManager.saveVersion(projectId, objects, comment);
    refreshVersions();
    return versionId;
  }, [projectId, refreshVersions]);

  const loadVersion = useCallback((versionId: string) => {
    if (!projectId) return null;
    
    const objects = versionManager.loadVersion(projectId, versionId);
    return objects;
  }, [projectId]);

  const deleteVersion = useCallback((versionId: string) => {
    if (!projectId) return false;
    
    const success = versionManager.deleteVersion(projectId, versionId);
    if (success) {
      refreshVersions();
    }
    return success;
  }, [projectId, refreshVersions]);

  const autoSaveVersion = useCallback((objects: any[]) => {
    if (!projectId) return;
    
    versionManager.autoSaveVersion(projectId, objects);
    refreshVersions();
  }, [projectId, refreshVersions]);

  const compareVersions = useCallback((versionId1: string, versionId2: string) => {
    if (!projectId) return { added: [], removed: [], modified: [] };
    
    return versionManager.compareVersions(projectId, versionId1, versionId2);
  }, [projectId]);

  return {
    versions,
    refreshVersions,
    saveVersion,
    loadVersion,
    deleteVersion,
    autoSaveVersion,
    compareVersions
  };
};