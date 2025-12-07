import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { Experience } from './components/Experience';
import { UI } from './components/UI';

const App: React.FC = () => {
  return (
    <>
      <div className="relative w-full h-full bg-[#000502]">
        <Canvas
          shadows
          camera={{ position: [0, 0, 20], fov: 45 }}
          gl={{ antialias: false, stencil: false, depth: true }}
          dpr={[1, 2]} // Performance optimization
        >
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        </Canvas>
        <UI />
      </div>
      <Loader 
        containerStyles={{ background: '#000502' }} 
        innerStyles={{ background: '#D4AF37', width: '200px', height: '2px' }}
        barStyles={{ background: '#D4AF37', height: '100%' }}
        dataInterpolation={(p) => `Loading ${p.toFixed(0)}%`} 
        dataStyles={{ color: '#D4AF37', fontFamily: 'Montserrat', fontSize: '12px', letterSpacing: '0.2em' }}
      />
    </>
  );
};

export default App;