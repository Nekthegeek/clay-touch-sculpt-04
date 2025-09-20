import { toast } from 'sonner';
import { ProjectData, ClayObjectData, ProjectVersion } from '../types/project';

class ProjectManager {
  private readonly STORAGE_KEY = 'clayplay-projects';
  private readonly CURRENT_PROJECT_KEY = 'clayplay-current-project';

  saveProject(objects: ClayObjectData[], projectName?: string): string {
    try {
      const projects = this.getAllProjects();
      const currentProjectId = this.getCurrentProjectId();
      
      let project: ProjectData;
      
      if (currentProjectId) {
        // Update existing project
        const existingProject = projects.find(p => p.id === currentProjectId);
        if (existingProject) {
          project = {
            ...existingProject,
            objects,
            updatedAt: Date.now()
          };
        } else {
          // Create new if existing not found
          project = this.createNewProject(objects, projectName);
        }
      } else {
        // Create new project
        project = this.createNewProject(objects, projectName);
      }

      // Update projects array
      const updatedProjects = projects.filter(p => p.id !== project.id);
      updatedProjects.unshift(project);
      
      // Keep only latest 20 projects
      const limitedProjects = updatedProjects.slice(0, 20);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedProjects));
      localStorage.setItem(this.CURRENT_PROJECT_KEY, project.id);
      
      toast.success(`Project \"${project.name}\" saved successfully!`);
      return project.id;
    } catch (error) {
      console.error('Failed to save project:', error);
      toast.error('Failed to save project. Please try again.');
      throw error;
    }
  }

  loadProject(projectId: string): ClayObjectData[] | null {
    try {
      const projects = this.getAllProjects();
      const project = projects.find(p => p.id === projectId);
      
      if (!project) {
        toast.error('Project not found');
        return null;
      }
      
      localStorage.setItem(this.CURRENT_PROJECT_KEY, projectId);
      toast.success(`Project \"${project.name}\" loaded successfully!`);
      return project.objects;
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project. Please try again.');
      return null;
    }
  }

  getAllProjects(): ProjectData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get projects:', error);
      return [];
    }
  }

  deleteProject(projectId: string): boolean {
    try {
      const projects = this.getAllProjects();
      const filteredProjects = projects.filter(p => p.id !== projectId);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredProjects));
      
      // Clear current project if it was deleted
      if (this.getCurrentProjectId() === projectId) {
        localStorage.removeItem(this.CURRENT_PROJECT_KEY);
      }
      
      toast.success('Project deleted successfully');
      return true;
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
      return false;
    }
  }

  getCurrentProjectId(): string | null {
    return localStorage.getItem(this.CURRENT_PROJECT_KEY);
  }

  getCurrentProject(): ProjectData | null {
    const projectId = this.getCurrentProjectId();
    if (!projectId) return null;
    
    const projects = this.getAllProjects();
    return projects.find(p => p.id === projectId) || null;
  }

  private createNewProject(objects: ClayObjectData[], name?: string): ProjectData {
    const timestamp = Date.now();
    return {
      id: `project-${timestamp}`,
      name: name || `Clay Project ${new Date().toLocaleDateString()}`,
      objects,
      createdAt: timestamp,
      updatedAt: timestamp,
      tagIds: [],
      versions: []
    };
  }

  exportProjectAsJSON(projectId?: string): void {
    try {
      const project = projectId 
        ? this.getAllProjects().find(p => p.id === projectId)
        : this.getCurrentProject();
        
      if (!project) {
        toast.error('No project to export');
        return;
      }

      const dataStr = JSON.stringify(project, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `${project.name.replace(/\s+/g, '_')}.json`;
      link.click();
      
      toast.success('Project exported as JSON!');
    } catch (error) {
      console.error('Failed to export project:', error);
      toast.error('Failed to export project');
    }
  }

  importProjectFromJSON(file: File): Promise<ClayObjectData[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const projectData = JSON.parse(e.target?.result as string) as ProjectData;
          
          // Validate project data structure
          if (!projectData.objects || !Array.isArray(projectData.objects)) {
            throw new Error('Invalid project file format');
          }
          
          // Save imported project
          const importedProject: ProjectData = {
            ...projectData,
            id: `imported-${Date.now()}`,
            name: `${projectData.name} (Imported)`,
            updatedAt: Date.now(),
            tagIds: projectData.tagIds || [],
            versions: projectData.versions || []
          };
          
          const projects = this.getAllProjects();
          projects.unshift(importedProject);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects.slice(0, 20)));
          localStorage.setItem(this.CURRENT_PROJECT_KEY, importedProject.id);
          
          toast.success(`Project \"${importedProject.name}\" imported successfully!`);
          resolve(projectData.objects);
        } catch (error) {
          console.error('Failed to import project:', error);
          toast.error('Failed to import project. Invalid file format.');
          reject(error);
        }
      };
      
      reader.onerror = () => {
        toast.error('Failed to read project file');
        reject(new Error('File read error'));
      };
      
      reader.readAsText(file);
    });
  }
}

export const projectManager = new ProjectManager();

// Re-export types for backwards compatibility
export type { ClayObjectData, ProjectData, ProjectVersion } from '../types/project';
