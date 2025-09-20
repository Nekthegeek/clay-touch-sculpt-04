import { ProjectTemplate, ClayObjectData } from '../types/project';
import { toast } from 'sonner';

class TemplateManager {
  private readonly STORAGE_KEY = 'clayplay-templates';

  private getBuiltInTemplates(): ProjectTemplate[] {
    return [
      {
        id: 'template-sphere',
        name: 'Basic Sphere',
        description: 'Simple sphere to get you started',
        objects: [{
          id: 'obj-sphere-1',
          position: [0, 0, 0],
          color: '#8B5CF6',
          size: 1,
          name: 'Sphere'
        }],
        toolSettings: {
          strength: 0.5,
          brushSize: 0.2,
          selectedTool: 'push'
        },
        isBuiltIn: true,
        createdAt: Date.now()
      },
      {
        id: 'template-cube',
        name: 'Basic Cube',
        description: 'Simple cube for angular sculptures',
        objects: [{
          id: 'obj-cube-1',
          position: [0, 0, 0],
          color: '#F59E0B',
          size: 1,
          name: 'Cube'
        }],
        toolSettings: {
          strength: 0.3,
          brushSize: 0.15,
          selectedTool: 'sculpt'
        },
        isBuiltIn: true,
        createdAt: Date.now()
      },
      {
        id: 'template-multi',
        name: 'Multiple Objects',
        description: 'Three objects to practice with',
        objects: [
          {
            id: 'obj-multi-1',
            position: [-1.5, 0, 0],
            color: '#EF4444',
            size: 0.8,
            name: 'Object 1'
          },
          {
            id: 'obj-multi-2',
            position: [0, 0, 0],
            color: '#10B981',
            size: 1,
            name: 'Object 2'
          },
          {
            id: 'obj-multi-3',
            position: [1.5, 0, 0],
            color: '#3B82F6',
            size: 0.9,
            name: 'Object 3'
          }
        ],
        toolSettings: {
          strength: 0.4,
          brushSize: 0.18,
          selectedTool: 'smooth'
        },
        isBuiltIn: true,
        createdAt: Date.now()
      }
    ];
  }

  getAllTemplates(): ProjectTemplate[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const customTemplates = stored ? JSON.parse(stored) : [];
      const builtInTemplates = this.getBuiltInTemplates();
      
      return [...builtInTemplates, ...customTemplates];
    } catch (error) {
      console.error('Failed to get templates:', error);
      return this.getBuiltInTemplates();
    }
  }

  getCustomTemplates(): ProjectTemplate[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get custom templates:', error);
      return [];
    }
  }

  saveTemplate(
    name: string, 
    objects: ClayObjectData[], 
    toolSettings?: any,
    description?: string
  ): string {
    try {
      const templates = this.getCustomTemplates();
      const timestamp = Date.now();
      
      const template: ProjectTemplate = {
        id: `template-${timestamp}`,
        name,
        description,
        objects: JSON.parse(JSON.stringify(objects)), // Deep clone
        toolSettings,
        isBuiltIn: false,
        createdAt: timestamp
      };

      templates.unshift(template);
      
      // Keep only latest 50 custom templates
      const limitedTemplates = templates.slice(0, 50);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedTemplates));
      
      toast.success(`Template \"${name}\" saved successfully!`);
      return template.id;
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Failed to save template. Please try again.');
      throw error;
    }
  }

  loadTemplate(templateId: string): ProjectTemplate | null {
    const templates = this.getAllTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      toast.error('Template not found');
      return null;
    }
    
    return template;
  }

  deleteTemplate(templateId: string): boolean {
    try {
      // Can't delete built-in templates
      const template = this.loadTemplate(templateId);
      if (template?.isBuiltIn) {
        toast.error("Built-in templates cannot be deleted");
        return false;
      }

      const templates = this.getCustomTemplates();
      const filteredTemplates = templates.filter(t => t.id !== templateId);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredTemplates));
      
      toast.success('Template deleted successfully');
      return true;
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
      return false;
    }
  }

  exportTemplate(templateId: string): void {
    try {
      const template = this.loadTemplate(templateId);
      if (!template) return;

      const dataStr = JSON.stringify(template, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `${template.name.replace(/\s+/g, '_')}_template.json`;
      link.click();
      
      toast.success('Template exported successfully!');
    } catch (error) {
      console.error('Failed to export template:', error);
      toast.error('Failed to export template');
    }
  }

  importTemplate(file: File): Promise<ProjectTemplate> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const templateData = JSON.parse(e.target?.result as string) as ProjectTemplate;
          
          // Validate template structure
          if (!templateData.objects || !Array.isArray(templateData.objects)) {
            throw new Error('Invalid template file format');
          }
          
          // Save imported template
          const importedTemplate: ProjectTemplate = {
            ...templateData,
            id: `imported-${Date.now()}`,
            name: `${templateData.name} (Imported)`,
            isBuiltIn: false,
            createdAt: Date.now()
          };
          
          const templates = this.getCustomTemplates();
          templates.unshift(importedTemplate);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates.slice(0, 50)));
          
          toast.success(`Template \"${importedTemplate.name}\" imported successfully!`);
          resolve(importedTemplate);
        } catch (error) {
          console.error('Failed to import template:', error);
          toast.error('Failed to import template. Invalid file format.');
          reject(error);
        }
      };
      
      reader.onerror = () => {
        toast.error('Failed to read template file');
        reject(new Error('File read error'));
      };
      
      reader.readAsText(file);
    });
  }
}

export const templateManager = new TemplateManager();
