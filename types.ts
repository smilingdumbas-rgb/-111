export type Vector3Array = [number, number, number];

export interface ParticleData {
  scatterPos: Vector3Array;
  treePos: Vector3Array;
  scale: number;
  rotation: Vector3Array;
  color: string;
  type: 'gift' | 'bauble' | 'foliage';
}

export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}