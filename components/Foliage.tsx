import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getScatterPosition, getTreePosition, TREE_HEIGHT } from '../utils';
import { useStore } from '../store';
import { TreeState } from '../types';

const FOLIAGE_COUNT = 12000;

// Custom Shader for high performance morphing particles
const FoliageMaterial = {
  vertexShader: `
    uniform float uTime;
    uniform float uProgress;
    uniform float uPixelRatio;
    
    attribute vec3 aScatterPos;
    attribute vec3 aTreePos;
    attribute float aRandom;
    
    varying vec3 vColor;
    varying float vAlpha;

    // Cubic easing
    float easeInOutCubic(float x) {
      return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
    }

    void main() {
      float t = easeInOutCubic(uProgress);
      
      // Mix positions
      vec3 pos = mix(aScatterPos, aTreePos, t);
      
      // Add "breathing" / floating animation
      // More chaotic when scattered, subtle when tree
      float noiseFreq = mix(0.5, 2.0, t);
      float noiseAmp = mix(0.2, 0.05, t);
      
      pos.x += sin(uTime * noiseFreq + aRandom * 10.0) * noiseAmp;
      pos.y += cos(uTime * noiseFreq + aRandom * 15.0) * noiseAmp;
      pos.z += sin(uTime * noiseFreq + aRandom * 5.0) * noiseAmp;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Size attenuation
      gl_PointSize = (40.0 * uPixelRatio) * (1.0 + sin(uTime + aRandom * 100.0) * 0.3) / -mvPosition.z;

      // Color variation
      float heightGradient = (aTreePos.y + 6.0) / 12.0; // Normalized height roughly
      vec3 darkGreen = vec3(0.0, 0.2, 0.1);
      vec3 lightGreen = vec3(0.0, 0.4, 0.2);
      vec3 gold = vec3(1.0, 0.8, 0.2);
      
      // Occasional gold sparkle
      float sparkle = step(0.98, sin(uTime * 2.0 + aRandom * 100.0));
      
      vColor = mix(darkGreen, lightGreen, heightGradient + sin(aRandom));
      vColor = mix(vColor, gold, sparkle);
      vAlpha = 1.0;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      // Circular particle
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      if (dist > 0.5) discard;
      
      // Soft glow edge
      float strength = 1.0 - (dist * 2.0);
      strength = pow(strength, 1.5);

      gl_FragColor = vec4(vColor, vAlpha * strength);
    }
  `
};

export const Foliage: React.FC = () => {
  const treeState = useStore((state) => state.treeState);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  
  // Generate attributes once
  const { positions, scatterPos, treePos, randoms } = useMemo(() => {
    const pos = new Float32Array(FOLIAGE_COUNT * 3);
    const scat = new Float32Array(FOLIAGE_COUNT * 3);
    const tr = new Float32Array(FOLIAGE_COUNT * 3);
    const rnd = new Float32Array(FOLIAGE_COUNT);

    for (let i = 0; i < FOLIAGE_COUNT; i++) {
      // Scatter
      const [sx, sy, sz] = getScatterPosition();
      scat[i * 3] = sx;
      scat[i * 3 + 1] = sy;
      scat[i * 3 + 2] = sz;

      // Tree Shape - Dense packing
      // Use Golden Ratio for spiral packing to make it look organic
      const phi = Math.PI * (3.0 - Math.sqrt(5.0)); // Golden angle
      const y = 1 - (i / (FOLIAGE_COUNT - 1)) * 2; // -1 to 1
      const radius = Math.sqrt(1 - y * y); // Sphere... wait we need Cone
      
      // Cone Logic
      const ratio = i / FOLIAGE_COUNT; // 0 to 1 (bottom to top)
      // Add randomness to ratio to avoid distinct horizontal lines
      const jitteredRatio = Math.max(0, Math.min(1, ratio + (Math.random() - 0.5) * 0.05));
      const angle = i * phi * 50; // multiply to wrap around
      
      const [tx, ty, tz] = getTreePosition(jitteredRatio, angle);
      // Add thickness to the tree shell
      const thickness = (Math.random() - 0.5) * 1.5;
      
      tr[i * 3] = tx + (Math.cos(angle) * thickness);
      tr[i * 3 + 1] = ty + (Math.random() * 0.5);
      tr[i * 3 + 2] = tz + (Math.sin(angle) * thickness);

      rnd[i] = Math.random();
      
      // Initial position
      pos[i * 3] = sx;
      pos[i * 3 + 1] = sy;
      pos[i * 3 + 2] = sz;
    }

    return {
      positions: pos,
      scatterPos: scat,
      treePos: tr,
      randoms: rnd
    };
  }, []);

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Target progress based on state
      const target = treeState === TreeState.TREE_SHAPE ? 1 : 0;
      // Smooth lerp for uniform
      shaderRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        shaderRef.current.uniforms.uProgress.value,
        target,
        0.02
      );
      
      shaderRef.current.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={FOLIAGE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={FOLIAGE_COUNT}
          array={scatterPos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={FOLIAGE_COUNT}
          array={treePos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={FOLIAGE_COUNT}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        vertexShader={FoliageMaterial.vertexShader}
        fragmentShader={FoliageMaterial.fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uPixelRatio: { value: 1 }
        }}
      />
    </points>
  );
};