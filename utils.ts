import * as THREE from 'three';
import { Vector3Array } from './types';

// Constants
export const TREE_HEIGHT = 12;
export const TREE_RADIUS_BASE = 4.5;
export const SCATTER_RADIUS = 15;

/**
 * Generates a random position within a sphere
 */
export const getScatterPosition = (): Vector3Array => {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = SCATTER_RADIUS * Math.cbrt(Math.random());

  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);

  return [x, y, z];
};

/**
 * Generates a position on a cone surface (Christmas Tree shape)
 */
export const getTreePosition = (ratio: number, angleOffset: number = 0): Vector3Array => {
  // Ratio 0 = bottom, Ratio 1 = top
  const y = (ratio * TREE_HEIGHT) - (TREE_HEIGHT / 2); // Center vertically
  
  // Radius gets smaller as we go up
  const radius = TREE_RADIUS_BASE * (1 - ratio);

  // Spiral distribution
  const angle = angleOffset;

  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  return [x, y, z];
};

// Color palettes
export const COLORS = {
  EMERALD_DARK: new THREE.Color('#002b19'),
  EMERALD_LIGHT: new THREE.Color('#006b3e'),
  GOLD_METALLIC: new THREE.Color('#FFD700'),
  GOLD_ROSE: new THREE.Color('#E0BFB8'),
  RED_VELVET: new THREE.Color('#8a0303'),
};