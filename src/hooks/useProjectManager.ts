import { useState, useCallback } from 'react';
import { projectManager, ProjectData, ClayObjectData } from '../services/projectManager';

export const useProjectManager = () => {
  const [projects, setProjects] = useState<ProjectData[]>(() => 
    projectManager.getAllProjects()
  );
  const [currentProject, setCurrentProject] = useState<ProjectData | null>(() =>
    projectManager.getCurrentProject()
  );

  const saveProject = useCallback((objects: ClayObjectData[], projectName?: string) => {
    const projectId = projectManager.saveProject(objects, projectName);
    setProjects(projectManager.getAllProjects());
    setCurrentProject(projectManager.getCurrentProject());
    return projectId;
  }, []);

  const loadProject = useCallback((projectId: string) => {
    const objects = projectManager.loadProject(projectId);
    if (objects) {
      setCurrentProject(projectManager.getCurrentProject());
      return objects;
    }
    return null;
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    const success = projectManager.deleteProject(projectId);
    if (success) {
      setProjects(projectManager.getAllProjects());
      setCurrentProject(projectManager.getCurrentProject());
    }
    return success;
  }, []);

  const refreshProjects = useCallback(() => {
    setProjects(projectManager.getAllProjects());
    setCurrentProject(projectManager.getCurrentProject());
  }, []);

  const exportProjectAsJSON = useCallback((projectId?: string) => {
    projectManager.exportProjectAsJSON(projectId);
  }, []);

  const importProjectFromJSON = useCallback(async (file: File) => {
    try {
      const objects = await projectManager.importProjectFromJSON(file);
      setProjects(projectManager.getAllProjects());
      setCurrentProject(projectManager.getCurrentProject());
      return objects;
    } catch (error) {
      return null;
    }
  }, []);

  return {
    projects,
    currentProject,
    saveProject,
    loadProject,
    deleteProject,
    refreshProjects,
    exportProjectAsJSON,
    importProjectFromJSON
  };
};