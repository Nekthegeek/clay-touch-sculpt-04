import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Download, FolderOpen, Clock, Tag } from 'lucide-react';
import { ProjectData, ProjectFolder, ProjectTag } from '@/types/project';

interface ProjectListSectionProps {
  projects: ProjectData[];
  currentProject: ProjectData | null;
  onLoadProject: (projectId: string) => void;
  onDeleteProject: (projectId: string, projectName: string) => void;
  onExportProject: (projectId: string) => void;
  getFolder: (folderId: string) => ProjectFolder | undefined;
  getTagsByIds: (tagIds: string[]) => ProjectTag[];
}

export const ProjectListSection: React.FC<ProjectListSectionProps> = ({
  projects,
  currentProject,
  onLoadProject,
  onDeleteProject,
  onExportProject,
  getFolder,
  getTagsByIds
}) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-2">
          No projects found
        </p>
        <p className="text-xs text-muted-foreground">
          Create your first project or adjust your filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {projects.map((project) => {
        const folder = project.folderId ? getFolder(project.folderId) : undefined;
        const tags = getTagsByIds(project.tagIds);
        const isActive = currentProject?.id === project.id;

        return (
          <div
            key={project.id}
            className={`flex flex-col gap-2 p-3 rounded-lg border transition-all ${
              isActive
                ? 'bg-primary/10 border-primary/20 ring-1 ring-primary/20' 
                : 'bg-card hover:bg-muted/50 hover:shadow-sm'
            }`}
          >
            {/* Header Row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium truncate">
                    {project.name}
                  </h4>
                  {isActive && (
                    <Badge variant="default" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
                
                {/* Metadata */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FolderOpen className="h-3 w-3" />
                    {project.objects.length} objects
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                  {project.versions.length > 0 && (
                    <span>{project.versions.length} versions</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLoadProject(project.id)}
                  disabled={isActive}
                >
                  Load
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onExportProject(project.id)}
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteProject(project.id, project.name)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Description */}
            {project.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            )}

            {/* Folder and Tags */}
            {(folder || tags.length > 0) && (
              <div className="flex flex-wrap gap-1 items-center">
                {folder && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: folder.color }}
                    />
                    {folder.name}
                  </Badge>
                )}
                {tags.map(tag => (
                  <Badge key={tag.id} variant="secondary" className="text-xs gap-1">
                    <Tag className="h-2 w-2" />
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};