import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter, SortAsc, SortDesc } from 'lucide-react';
import { ProjectFilters, ProjectFolder, ProjectTag } from '@/types/project';

interface ProjectSearchFiltersProps {
  filters: ProjectFilters;
  onFiltersChange: (filters: Partial<ProjectFilters>) => void;
  onResetFilters: () => void;
  folders: ProjectFolder[];
  tags: ProjectTag[];
  getTagsByIds: (tagIds: string[]) => ProjectTag[];
}

export const ProjectSearchFilters: React.FC<ProjectSearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onResetFilters,
  folders,
  tags,
  getTagsByIds
}) => {
  const selectedTags = getTagsByIds(filters.tagIds);
  const selectedFolder = folders.find(f => f.id === filters.folderId);
  
  const hasActiveFilters = filters.searchQuery || filters.folderId || filters.tagIds.length > 0;

  const handleTagToggle = (tagId: string) => {
    const newTagIds = filters.tagIds.includes(tagId)
      ? filters.tagIds.filter(id => id !== tagId)
      : [...filters.tagIds, tagId];
    onFiltersChange({ tagIds: newTagIds });
  };

  const removeTag = (tagId: string) => {
    onFiltersChange({
      tagIds: filters.tagIds.filter(id => id !== tagId)
    });
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={filters.searchQuery}
          onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
          className="pl-9"
        />
        {filters.searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange({ searchQuery: '' })}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Folder Filter */}
        <Select
          value={filters.folderId || 'all'}
          onValueChange={(value) => 
            onFiltersChange({ folderId: value === 'all' ? undefined : value })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All folders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All folders</SelectItem>
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

        {/* Sort */}
        <Select
          value={filters.sortBy}
          onValueChange={(value: any) => onFiltersChange({ sortBy: value })}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updatedAt">Last Modified</SelectItem>
            <SelectItem value="createdAt">Created Date</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => 
            onFiltersChange({ 
              sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
            })
          }
        >
          {filters.sortOrder === 'asc' ? 
            <SortAsc className="h-4 w-4" /> : 
            <SortDesc className="h-4 w-4" />
          }
        </Button>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
          >
            <X className="h-3 w-3 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Tag Filter Pills */}
      {tags.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 8).map(tag => (
              <button
                key={tag.id}
                onClick={() => handleTagToggle(tag.id)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                  filters.tagIds.includes(tag.id)
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

      {/* Active Filters */}
      {(selectedFolder || selectedTags.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {selectedFolder && (
            <Badge variant="secondary" className="gap-1">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: selectedFolder.color }}
              />
              {selectedFolder.name}
              <button
                onClick={() => onFiltersChange({ folderId: undefined })}
                className="ml-1 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedTags.map(tag => (
            <Badge key={tag.id} variant="secondary" className="gap-1">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
              <button
                onClick={() => removeTag(tag.id)}
                className="ml-1 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};