import { useRef, useCallback } from 'react';
import * as THREE from 'three';

interface GeometryCache {
  [objectId: string]: {
    geometry: THREE.BufferGeometry;
    lastModified: number;
  };
}

export const useGeometryCache = () => {
  const cacheRef = useRef<GeometryCache>({});

  const updateGeometry = useCallback((objectId: string, geometry: THREE.BufferGeometry) => {
    // Clone the geometry to avoid reference issues
    const clonedGeometry = geometry.clone();
    
    cacheRef.current[objectId] = {
      geometry: clonedGeometry,
      lastModified: Date.now()
    };
  }, []);

  const getGeometry = useCallback((objectId: string): THREE.BufferGeometry | null => {
    const cached = cacheRef.current[objectId];
    return cached ? cached.geometry.clone() : null;
  }, []);

  const getAllGeometries = useCallback((): { [objectId: string]: THREE.BufferGeometry } => {
    const result: { [objectId: string]: THREE.BufferGeometry } = {};
    
    Object.entries(cacheRef.current).forEach(([objectId, cached]) => {
      result[objectId] = cached.geometry.clone();
    });
    
    return result;
  }, []);

  const removeGeometry = useCallback((objectId: string) => {
    if (cacheRef.current[objectId]) {
      cacheRef.current[objectId].geometry.dispose();
      delete cacheRef.current[objectId];
    }
  }, []);

  const clearCache = useCallback(() => {
    Object.values(cacheRef.current).forEach(cached => {
      cached.geometry.dispose();
    });
    cacheRef.current = {};
  }, []);

  // Convert geometry to serializable format for saving
  const serializeGeometry = useCallback((geometry: THREE.BufferGeometry) => {
    const position = geometry.attributes.position;
    const index = geometry.index;
    
    return {
      vertices: Array.from(position.array),
      faces: index ? Array.from(index.array) : []
    };
  }, []);

  const getSerializedGeometry = useCallback((objectId: string) => {
    const geometry = getGeometry(objectId);
    return geometry ? serializeGeometry(geometry) : null;
  }, [getGeometry, serializeGeometry]);

  return {
    updateGeometry,
    getGeometry,
    getAllGeometries,
    removeGeometry,
    clearCache,
    serializeGeometry,
    getSerializedGeometry
  };
};