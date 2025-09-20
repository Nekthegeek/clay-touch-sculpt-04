import { useState, useMemo } from 'react';
import { ProjectData, ProjectFilters } from '../types/project';

export const useProjectFilters = (projects: ProjectData[]) => {
  const [filters, setFilters] = useState<ProjectFilters>({
    searchQuery: '',
    folderId: undefined,
    tagIds: [],
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  });

  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Search by name and description
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query)
      );
    }

    // Filter by folder
    if (filters.folderId !== undefined) {
      filtered = filtered.filter(project => project.folderId === filters.folderId);
    }

    // Filter by tags
    if (filters.tagIds.length > 0) {
      filtered = filtered.filter(project => 
        filters.tagIds.some(tagId => project.tagIds.includes(tagId))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'updatedAt':
        default:
          aValue = a.updatedAt;
          bValue = b.updatedAt;
          break;
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [projects, filters]);

  const updateFilters = (newFilters: Partial<ProjectFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      folderId: undefined,
      tagIds: [],
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    });
  };

  return {
    filters,
    filteredProjects,
    updateFilters,
    resetFilters
  };
};