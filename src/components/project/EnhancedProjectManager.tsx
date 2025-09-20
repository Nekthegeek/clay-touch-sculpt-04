import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FolderOpen } from 'lucide-react';
import { useProjectManager } from '@/hooks/useProjectManager';
import { useProjectFilters } from '@/hooks/useProjectFilters';
import { useProjectTags } from '@/hooks/useProjectTags';
import { useProjectFolders } from '@/hooks/useProjectFolders';
import { useTemplates } from '@/hooks/useTemplates';
import { useVersionHistory } from '@/hooks/useVersionHistory';
import { ProjectSearchFilters } from './ProjectSearchFilters';
import { ProjectSaveSection } from './ProjectSaveSection';
import { ProjectListSection } from './ProjectListSection';
import { TemplateSection } from './TemplateSection';
import { VersionHistory } from './VersionHistory';
import { ProjectImportExport } from './ProjectImportExport';

interface EnhancedProjectManagerProps {
  onLoadProject: (objects: any[]) => void;
  currentObjects: any[];
  trigger?: React.ReactNode;
}

export const EnhancedProjectManager: React.FC<EnhancedProjectManagerProps> = ({ 
  onLoadProject, 
  currentObjects, 
  trigger 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const {
    projects,
    currentProject,
    saveProject,
    loadProject,
    deleteProject,
    exportProjectAsJSON,
    importProjectFromJSON
  } = useProjectManager();

  const { filters, filteredProjects, updateFilters, resetFilters } = useProjectFilters(projects);
  const { tags, createTag, getTagsByIds } = useProjectTags();
  const { folders, createFolder, getFolder } = useProjectFolders();
  const { builtInTemplates, customTemplates, saveTemplate, loadTemplate, deleteTemplate, exportTemplate, importTemplate } = useTemplates();
  const { versions, saveVersion, loadVersion, deleteVersion } = useVersionHistory(currentProject?.id || null);

  const handleSaveProject = (name: string, folderId?: string, tagIds?: string[], description?: string) => {
    saveProject(currentObjects, name);
    setIsOpen(false);
  };

  const handleLoadProject = (projectId: string) => {
    const objects = loadProject(projectId);
    if (objects) {
      onLoadProject(objects);
      setIsOpen(false);
    }
  };

  const handleLoadTemplate = (template: any) => {
    onLoadProject(template.objects);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="touch-target">
            <FolderOpen className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Project Manager</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="projects" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
            <TabsTrigger value="import-export">Import/Export</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-y-auto">
            <TabsContent value="projects" className="space-y-6 mt-6">
              <ProjectSaveSection
                currentProject={currentProject}
                onSaveProject={handleSaveProject}
                folders={folders}
                tags={tags}
              />
              
              <ProjectSearchFilters
                filters={filters}
                onFiltersChange={updateFilters}
                onResetFilters={resetFilters}
                folders={folders}
                tags={tags}
                getTagsByIds={getTagsByIds}
              />
              
              <ProjectListSection
                projects={filteredProjects}
                currentProject={currentProject}
                onLoadProject={handleLoadProject}
                onDeleteProject={(id, name) => {
                  if (window.confirm(`Delete "${name}"?`)) deleteProject(id);
                }}
                onExportProject={exportProjectAsJSON}
                getFolder={getFolder}
                getTagsByIds={getTagsByIds}
              />
            </TabsContent>
            
            <TabsContent value="templates" className="space-y-6 mt-6">
              <TemplateSection
                builtInTemplates={builtInTemplates}
                customTemplates={customTemplates}
                onLoadTemplate={handleLoadTemplate}
                onSaveTemplate={(name, description) => saveTemplate(name, currentObjects, undefined, description)}
                onDeleteTemplate={deleteTemplate}
                onExportTemplate={exportTemplate}
                onImportTemplate={importTemplate}
              />
            </TabsContent>
            
            <TabsContent value="versions" className="space-y-6 mt-6">
              <VersionHistory
                versions={versions}
                currentProjectId={currentProject?.id || null}
                onSaveVersion={(comment) => saveVersion(currentObjects, comment)}
                onLoadVersion={(versionId) => {
                  const objects = loadVersion(versionId);
                  if (objects) onLoadProject(objects);
                }}
                onDeleteVersion={deleteVersion}
              />
            </TabsContent>
            
            <TabsContent value="import-export" className="space-y-6 mt-6">
              <ProjectImportExport
                currentProject={currentProject}
                onExportProject={() => exportProjectAsJSON()}
                onImportProject={async (file) => {
                  const objects = await importProjectFromJSON(file);
                  if (objects) onLoadProject(objects);
                }}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};