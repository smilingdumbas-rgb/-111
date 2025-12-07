import React from 'react';
import { OrbitControls, Environment, ContactShadows, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import { Topper } from './Topper';
import * as THREE from 'three';

export const Experience: React.FC = () => {
  return (
    <>
      {/* Controls */}
      <OrbitControls 
        makeDefault 
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 1.5}
        autoRotate
        autoRotateSpeed={0.5}
        enablePan={false}
        maxDistance={30}
        minDistance={10}
      />

      {/* Lighting - Dramatic Cinematic */}
      <ambientLight intensity={0.1} color="#001a10" />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={200} 
        castShadow 
        color="#fffaed" 
      />
      <pointLight position={[-10, 5, -10]} intensity={50} color="#004225" />
      <pointLight position={[0, -5, 5]} intensity={30} color="#ffbf00" />

      {/* Environment for Reflections */}
      <Environment preset="city" environmentIntensity={0.5} />
      
      {/* Background Ambience */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Content */}
      <group position={[0, -2, 0]}>
        <Foliage />
        <Ornaments />
        <Topper />
        <ContactShadows opacity={0.5} scale={20} blur={2} far={4} resolution={256} color="#000000" />
      </group>

      {/* Post Processing */}
      <EffectComposer enableNormalPass={false}>
        <Bloom 
          luminanceThreshold={1.0} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.4} 
        />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette eskil={false} offset={0.1} darkness={0.5} />
      </EffectComposer>
    </>
  );
};