import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { TREE_HEIGHT } from '../utils';
import { useStore } from '../store';
import { TreeState } from '../types';

export const Topper: React.FC = () => {
  const treeState = useStore((state) => state.treeState);
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if(!meshRef.current) return;

    const targetY = treeState === TreeState.TREE_SHAPE ? (TREE_HEIGHT / 2) + 0.5 : (TREE_HEIGHT / 2) + 5;
    const targetScale = treeState === TreeState.TREE_SHAPE ? 1 : 0.01; // Hide when scattered

    // Lerp position
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, delta * 2);
    
    // Lerp Scale (pop in/out)
    const currentScale = meshRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 3);
    meshRef.current.scale.setScalar(newScale);

    // Rotation
    meshRef.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={meshRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh castShadow>
          <icosahedronGeometry args={[0.6, 0]} />
          <meshStandardMaterial 
            color="#FFD700" 
            emissive="#FFD700" 
            emissiveIntensity={2} 
            toneMapped={false} 
          />
        </mesh>
        {/* Halo */}
        <mesh scale={1.5}>
          <icosahedronGeometry args={[0.5, 1]} />
          <meshBasicMaterial 
            color="#FFD700" 
            transparent 
            opacity={0.2} 
            wireframe
          />
        </mesh>
        <pointLight intensity={20} distance={10} color="#FFD700" decay={2} />
      </Float>
    </group>
  );
};