import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Plus } from 'lucide-react';
import { ProjectData, ProjectFolder, ProjectTag } from '@/types/project';

interface ProjectSaveContentProps {
  currentProject: ProjectData | null;
  onSaveProject: (name: string, folderId?: string, tagIds?: string[], description?: string) => void;
  folders: ProjectFolder[];
  tags: ProjectTag[];
}

export const ProjectSaveSection: React.FC<ProjectSaveContentProps> = ({
  currentProject,
  onSaveProject,
  folders,
  tags
}) => {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>();
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const handleSave = () => {
    if (!projectName.trim()) return;
    
    onSaveProject(
      projectName.trim(),
      selectedFolderId,
      selectedTagIds,
      description.trim() || undefined
    );
    
    // Reset form
    setProjectName('');
    setDescription('');
    setSelectedFolderId(undefined);
    setSelectedTagIds([]);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Save Current Project</h3>
      
      <div className="space-y-3">
        {/* Project Name */}
        <div>
          <Label htmlFor="projectName" className="text-xs">
            Project Name *
          </Label>
          <Input
            id="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="My Clay Sculpture"
            className="mt-1"
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description" className="text-xs">
            Description (optional)
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your sculpture..."
            className="mt-1 min-h-[60px]"
          />
        </div>

        {/* Folder Selection */}
        {folders.length > 0 && (
          <div>
            <Label className="text-xs">Folder (optional)</Label>
            <Select
              value={selectedFolderId || 'none'}
              onValueChange={(value) => 
                setSelectedFolderId(value === 'none' ? undefined : value)
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="No folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No folder</SelectItem>
                {folders.map(folder => (
                  <SelectItem key={folder.id} value={folder.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: folder.color }}
                      />
                      {folder.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Tag Selection */}
        {tags.length > 0 && (
          <div>
            <Label className="text-xs">Tags (optional)</Label>
            <div className="mt-1 flex flex-wrap gap-1 p-2 border rounded-md min-h-[40px]">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                    selectedTagIds.includes(tag.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <Button 
          onClick={handleSave}
          disabled={!projectName.trim()}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Project
        </Button>

        {currentProject && (
          <p className="text-xs text-muted-foreground">
            Current: {currentProject.name}
          </p>
        )}
      </div>
    </div>
  );
};