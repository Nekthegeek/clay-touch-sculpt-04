import { useState, useCallback } from 'react';
import { ProjectTag } from '../types/project';
import { toast } from 'sonner';

const STORAGE_KEY = 'clayplay-project-tags';

const DEFAULT_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
  '#8B5CF6', '#EC4899', '#6B7280', '#F97316'
];

export const useProjectTags = () => {
  const [tags, setTags] = useState<ProjectTag[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load tags:', error);
      return [];
    }
  });

  const saveTags = useCallback((newTags: ProjectTag[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTags));
      setTags(newTags);
    } catch (error) {
      console.error('Failed to save tags:', error);
      toast.error('Failed to save tags');
    }
  }, []);

  const createTag = useCallback((name: string, color?: string) => {
    if (!name.trim()) {
      toast.error('Tag name cannot be empty');
      return null;
    }

    // Check for duplicate names
    if (tags.some(tag => tag.name.toLowerCase() === name.toLowerCase())) {
      toast.error('A tag with this name already exists');
      return null;
    }

    const newTag: ProjectTag = {
      id: `tag-${Date.now()}`,
      name: name.trim(),
      color: color || DEFAULT_COLORS[tags.length % DEFAULT_COLORS.length],
      createdAt: Date.now()
    };

    const updatedTags = [...tags, newTag];
    saveTags(updatedTags);
    
    toast.success(`Tag "${name}" created successfully!`);
    return newTag.id;
  }, [tags, saveTags]);

  const updateTag = useCallback((tagId: string, updates: Partial<ProjectTag>) => {
    const updatedTags = tags.map(tag =>
      tag.id === tagId ? { ...tag, ...updates } : tag
    );
    
    saveTags(updatedTags);
    toast.success('Tag updated successfully!');
  }, [tags, saveTags]);

  const deleteTag = useCallback((tagId: string) => {
    const tag = tags.find(t => t.id === tagId);
    if (!tag) return false;

    const updatedTags = tags.filter(t => t.id !== tagId);
    saveTags(updatedTags);
    
    toast.success(`Tag "${tag.name}" deleted successfully!`);
    return true;
  }, [tags, saveTags]);

  const getTag = useCallback((tagId: string) => {
    return tags.find(tag => tag.id === tagId);
  }, [tags]);

  const getTagsByIds = useCallback((tagIds: string[]) => {
    return tags.filter(tag => tagIds.includes(tag.id));
  }, [tags]);

  return {
    tags,
    createTag,
    updateTag,
    deleteTag,
    getTag,
    getTagsByIds
  };
};