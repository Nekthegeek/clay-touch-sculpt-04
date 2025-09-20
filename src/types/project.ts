export interface ClayObjectData {
  id: string;
  position: [number, number, number];
  color: string;
  size: number;
  name: string;
  geometry?: {
    vertices: number[];
    faces: number[];
  };
}

export interface ProjectVersion {
  id: string;
  timestamp: number;
  comment?: string;
  objects: ClayObjectData[];
}

export interface ProjectFolder {
  id: string;
  name: string;
  parentId?: string;
  color?: string;
  createdAt: number;
}

export interface ProjectTag {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description?: string;
  objects: ClayObjectData[];
  toolSettings?: {
    strength: number;
    brushSize: number;
    selectedTool: string;
  };
  thumbnail?: string;
  isBuiltIn: boolean;
  createdAt: number;
}

export interface ProjectData {
  id: string;
  name: string;
  objects: ClayObjectData[];
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
  folderId?: string;
  tagIds: string[];
  versions: ProjectVersion[];
  description?: string;
}

export interface ProjectFilters {
  searchQuery: string;
  folderId?: string;
  tagIds: string[];
  sortBy: 'name' | 'updatedAt' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}