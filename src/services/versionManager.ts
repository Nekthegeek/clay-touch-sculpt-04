import { ProjectVersion, ClayObjectData } from '../types/project';
import { toast } from 'sonner';

class VersionManager {
  private readonly STORAGE_KEY = 'clayplay-versions';
  private readonly MAX_VERSIONS_PER_PROJECT = 20;

  getProjectVersions(projectId: string): ProjectVersion[] {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY}-${projectId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get project versions:', error);
      return [];
    }
  }

  saveVersion(
    projectId: string, 
    objects: ClayObjectData[], 
    comment?: string
  ): string {
    try {
      const versions = this.getProjectVersions(projectId);
      const timestamp = Date.now();
      
      const version: ProjectVersion = {
        id: `version-${timestamp}`,
        timestamp,
        comment,
        objects: JSON.parse(JSON.stringify(objects)) // Deep clone
      };

      versions.unshift(version);
      
      // Keep only latest versions
      const limitedVersions = versions.slice(0, this.MAX_VERSIONS_PER_PROJECT);
      
      localStorage.setItem(
        `${this.STORAGE_KEY}-${projectId}`, 
        JSON.stringify(limitedVersions)
      );
      
      const versionLabel = comment || `Version ${new Date(timestamp).toLocaleString()}`;
      toast.success(`Version \"${versionLabel}\" saved!`);
      return version.id;
    } catch (error) {
      console.error('Failed to save version:', error);
      toast.error('Failed to save version. Please try again.');
      throw error;
    }
  }

  loadVersion(projectId: string, versionId: string): ClayObjectData[] | null {
    try {
      const versions = this.getProjectVersions(projectId);
      const version = versions.find(v => v.id === versionId);
      
      if (!version) {
        toast.error('Version not found');
        return null;
      }
      
      const versionLabel = version.comment || `Version ${new Date(version.timestamp).toLocaleString()}`;
      toast.success(`Version \"${versionLabel}\" loaded!`);
      return JSON.parse(JSON.stringify(version.objects)); // Deep clone
    } catch (error) {
      console.error('Failed to load version:', error);
      toast.error('Failed to load version. Please try again.');
      return null;
    }
  }

  deleteVersion(projectId: string, versionId: string): boolean {
    try {
      const versions = this.getProjectVersions(projectId);
      const filteredVersions = versions.filter(v => v.id !== versionId);
      
      localStorage.setItem(
        `${this.STORAGE_KEY}-${projectId}`, 
        JSON.stringify(filteredVersions)
      );
      
      toast.success('Version deleted successfully');
      return true;
    } catch (error) {
      console.error('Failed to delete version:', error);
      toast.error('Failed to delete version');
      return false;
    }
  }

  deleteAllVersions(projectId: string): boolean {
    try {
      localStorage.removeItem(`${this.STORAGE_KEY}-${projectId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete project versions:', error);
      return false;
    }
  }

  autoSaveVersion(projectId: string, objects: ClayObjectData[]): void {
    // Auto-save every 5 minutes if there are changes
    const versions = this.getProjectVersions(projectId);
    const lastVersion = versions[0];
    
    if (!lastVersion || Date.now() - lastVersion.timestamp > 5 * 60 * 1000) {
      // Check if objects actually changed
      if (!lastVersion || JSON.stringify(lastVersion.objects) !== JSON.stringify(objects)) {
        this.saveVersion(projectId, objects, 'Auto-saved');
      }
    }
  }

  compareVersions(
    projectId: string, 
    versionId1: string, 
    versionId2: string
  ): {
    added: ClayObjectData[];
    removed: ClayObjectData[];
    modified: ClayObjectData[];
  } {
    const versions = this.getProjectVersions(projectId);
    const version1 = versions.find(v => v.id === versionId1);
    const version2 = versions.find(v => v.id === versionId2);
    
    if (!version1 || !version2) {
      return { added: [], removed: [], modified: [] };
    }

    const objects1 = version1.objects;
    const objects2 = version2.objects;
    
    const added = objects2.filter(obj2 => 
      !objects1.find(obj1 => obj1.id === obj2.id)
    );
    
    const removed = objects1.filter(obj1 => 
      !objects2.find(obj2 => obj2.id === obj1.id)
    );
    
    const modified = objects2.filter(obj2 => {
      const obj1 = objects1.find(obj1 => obj1.id === obj2.id);
      return obj1 && JSON.stringify(obj1) !== JSON.stringify(obj2);
    });

    return { added, removed, modified };
  }
}

export const versionManager = new VersionManager();
