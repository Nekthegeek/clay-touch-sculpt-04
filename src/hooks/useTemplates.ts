import { useState, useCallback } from 'react';
import { ProjectTemplate } from '../types/project';
import { templateManager } from '../services/templateManager';

export const useTemplates = () => {
  const [templates, setTemplates] = useState<ProjectTemplate[]>(() =>
    templateManager.getAllTemplates()
  );

  const refreshTemplates = useCallback(() => {
    setTemplates(templateManager.getAllTemplates());
  }, []);

  const saveTemplate = useCallback((
    name: string, 
    objects: any[], 
    toolSettings?: any,
    description?: string
  ) => {
    const templateId = templateManager.saveTemplate(name, objects, toolSettings, description);
    refreshTemplates();
    return templateId;
  }, [refreshTemplates]);

  const loadTemplate = useCallback((templateId: string) => {
    const template = templateManager.loadTemplate(templateId);
    return template;
  }, []);

  const deleteTemplate = useCallback((templateId: string) => {
    const success = templateManager.deleteTemplate(templateId);
    if (success) {
      refreshTemplates();
    }
    return success;
  }, [refreshTemplates]);

  const exportTemplate = useCallback((templateId: string) => {
    templateManager.exportTemplate(templateId);
  }, []);

  const importTemplate = useCallback(async (file: File) => {
    try {
      const template = await templateManager.importTemplate(file);
      refreshTemplates();
      return template;
    } catch (error) {
      return null;
    }
  }, [refreshTemplates]);

  const getBuiltInTemplates = useCallback(() => {
    return templates.filter(t => t.isBuiltIn);
  }, [templates]);

  const getCustomTemplates = useCallback(() => {
    return templates.filter(t => !t.isBuiltIn);
  }, [templates]);

  return {
    templates,
    builtInTemplates: getBuiltInTemplates(),
    customTemplates: getCustomTemplates(),
    refreshTemplates,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    exportTemplate,
    importTemplate
  };
};