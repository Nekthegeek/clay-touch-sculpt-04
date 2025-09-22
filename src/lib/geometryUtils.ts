import * as THREE from 'three';
import type { ClayObjectData } from '@/types/project';

export type SerializedGeometry = NonNullable<ClayObjectData['geometry']>;

export function deserializeGeometry(
  serialized?: ClayObjectData['geometry'] | null
): THREE.BufferGeometry | null {
  if (!serialized || !serialized.vertices || serialized.vertices.length === 0) {
    return null;
  }

  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array(serialized.vertices);
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

  if (serialized.faces && serialized.faces.length > 0) {
    const maxIndex = serialized.faces.reduce((max, value) => (value > max ? value : max), 0);
    const IndexArray = maxIndex > 65535 ? Uint32Array : Uint16Array;
    const indices = new IndexArray(serialized.faces);
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  }

  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  return geometry;
}
