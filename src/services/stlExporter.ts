import { STLExporter } from 'three-stdlib';
import * as THREE from 'three';
import { toast } from 'sonner';
import { ClayObjectData } from './projectManager';

class STLExportService {
  private exporter: STLExporter;

  constructor() {
    this.exporter = new STLExporter();
  }

  async exportObjectsToSTL(objects: ClayObjectData[], filename?: string): Promise<void> {
    try {
      if (objects.length === 0) {
        toast.error('No objects to export');
        return;
      }

      // Create a group to hold all objects
      const group = new THREE.Group();

      // Convert each clay object to a mesh
      objects.forEach((obj, index) => {
        let geometry: THREE.BufferGeometry;
        
        // Use actual sculpted geometry if available, otherwise fall back to sphere
        if (obj.geometry && obj.geometry.vertices && obj.geometry.faces) {
          geometry = new THREE.BufferGeometry();
          
          // Convert stored geometry data back to BufferGeometry
          const vertices = new Float32Array(obj.geometry.vertices);
          const indices = new Uint32Array(obj.geometry.faces);
          
          geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
          if (indices.length > 0) {
            geometry.setIndex(new THREE.BufferAttribute(indices, 1));
          }
          geometry.computeVertexNormals();
        } else {
          // Fallback to basic sphere geometry
          geometry = new THREE.SphereGeometry(obj.size, 32, 32);
        }
        
        const material = new THREE.MeshBasicMaterial({ color: obj.color });
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(...obj.position);
        mesh.name = obj.name || `Object_${index + 1}`;
        
        group.add(mesh);
      });

      // Export to STL
      const stlString = this.exporter.parse(group, { binary: false });
      
      // Create download
      const blob = new Blob([stlString], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `clay-sculpture-${Date.now()}.stl`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast.success('STL file exported successfully!');
    } catch (error) {
      console.error('STL export failed:', error);
      toast.error('Failed to export STL file. Please try again.');
    }
  }

  async exportSingleObjectToSTL(object: ClayObjectData, filename?: string): Promise<void> {
    await this.exportObjectsToSTL([object], filename);
  }

  // Export with custom geometry (for deformed objects)
  async exportCustomGeometryToSTL(
    geometry: THREE.BufferGeometry, 
    filename?: string,
    objectName?: string
  ): Promise<void> {
    try {
      const material = new THREE.MeshBasicMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = objectName || 'CustomObject';

      const stlString = this.exporter.parse(mesh, { binary: false });
      
      const blob = new Blob([stlString], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `clay-sculpture-${Date.now()}.stl`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast.success('STL file exported successfully!');
    } catch (error) {
      console.error('STL export failed:', error);
      toast.error('Failed to export STL file. Please try again.');
    }
  }

  // Validate if objects can be exported
  validateForExport(objects: ClayObjectData[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (objects.length === 0) {
      errors.push('No objects to export');
    }

    objects.forEach((obj, index) => {
      if (!obj.position || obj.position.length !== 3) {
        errors.push(`Object ${index + 1}: Invalid position data`);
      }
      if (!obj.size || obj.size <= 0) {
        errors.push(`Object ${index + 1}: Invalid size`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const stlExporter = new STLExportService();