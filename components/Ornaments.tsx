import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getScatterPosition, getTreePosition, COLORS } from '../utils';
import { useStore } from '../store';
import { TreeState } from '../types';

interface OrnamentProps {
  count: number;
  type: 'box' | 'sphere';
  colorPalette: THREE.Color[];
  scaleRange: [number, number];
}

const tempObject = new THREE.Object3D();
const tempVec3 = new THREE.Vector3();

const OrnamentsInstance: React.FC<OrnamentProps> = ({ count, type, colorPalette, scaleRange }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const treeState = useStore((state) => state.treeState);

  // Store simulation data
  const data = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => {
      // Tree Position
      // Distribute ornaments randomly but generally on surface
      const ratio = Math.random() * 0.9 + 0.05; // Avoid very top and bottom
      const angle = Math.random() * Math.PI * 2;
      const [tx, ty, tz] = getTreePosition(ratio, angle);
      
      // Push slightly outward for ornaments so they sit ON the leaves
      const outwardPush = 1.1;
      
      // Scatter Position
      const [sx, sy, sz] = getScatterPosition();

      // Color
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      
      // Scale
      const scale = Math.random() * (scaleRange[1] - scaleRange[0]) + scaleRange[0];

      return {
        treePos: new THREE.Vector3(tx * outwardPush, ty, tz * outwardPush),
        scatterPos: new THREE.Vector3(sx, sy, sz),
        color: color,
        scale: scale,
        rotationSpeed: (Math.random() - 0.5) * 1,
        randomPhase: Math.random() * Math.PI * 2
      };
    });
  }, [count, scaleRange, colorPalette]);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    
    // Set static colors once
    data.forEach((d, i) => {
      meshRef.current!.setColorAt(i, d.color);
    });
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [data]);

  // Current animation state (0 = scattered, 1 = tree)
  const animProgress = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const target = treeState === TreeState.TREE_SHAPE ? 1 : 0;
    // Smooth damping for transition
    animProgress.current = THREE.MathUtils.lerp(animProgress.current, target, delta * 2);
    
    // Smoothstep for position interpolation
    const t = animProgress.current;
    const smoothT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const time = state.clock.elapsedTime;

    data.forEach((d, i) => {
      // Interpolate position
      tempVec3.lerpVectors(d.scatterPos, d.treePos, smoothT);
      
      // Add floaty movement
      const floatAmp = THREE.MathUtils.lerp(0.5, 0.05, smoothT); // Less float when in tree
      tempVec3.y += Math.sin(time + d.randomPhase) * floatAmp;
      tempVec3.x += Math.cos(time * 0.5 + d.randomPhase) * floatAmp * 0.5;

      tempObject.position.copy(tempVec3);
      
      // Rotate
      // Spin fast when scattered, stabilize when tree
      const rotSpeed = THREE.MathUtils.lerp(2.0, 0.2, smoothT);
      tempObject.rotation.x = time * d.rotationSpeed * rotSpeed + d.randomPhase;
      tempObject.rotation.y = time * d.rotationSpeed * rotSpeed + d.randomPhase;
      
      tempObject.scale.setScalar(d.scale);

      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      castShadow
      receiveShadow
    >
      {type === 'box' ? (
        <boxGeometry args={[1, 1, 1]} />
      ) : (
        <sphereGeometry args={[1, 32, 32]} />
      )}
      <meshStandardMaterial 
        roughness={0.15} 
        metalness={0.9} 
        envMapIntensity={1.5}
      />
    </instancedMesh>
  );
};

export const Ornaments: React.FC = () => {
  return (
    <>
      {/* Gold Baubles */}
      <OrnamentsInstance 
        count={300} 
        type="sphere" 
        scaleRange={[0.2, 0.4]} 
        colorPalette={[COLORS.GOLD_METALLIC, COLORS.GOLD_ROSE]} 
      />
      {/* Red/Emerald Gift Boxes */}
      <OrnamentsInstance 
        count={150} 
        type="box" 
        scaleRange={[0.3, 0.5]} 
        colorPalette={[COLORS.RED_VELVET, COLORS.EMERALD_LIGHT]} 
      />
      {/* Tiny Lights (Small spheres, emissive via shader trick or just high lightness color) */}
      <OrnamentsInstance 
        count={500} 
        type="sphere" 
        scaleRange={[0.05, 0.08]} 
        colorPalette={[new THREE.Color('#fff9c4')]} 
      />
    </>
  );
};