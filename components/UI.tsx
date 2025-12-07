import React from 'react';
import { useStore } from '../store';
import { TreeState } from '../types';

export const UI: React.FC = () => {
  const { treeState, toggleState } = useStore();
  const isTree = treeState === TreeState.TREE_SHAPE;

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex flex-col justify-between p-8 md:p-12">
      {/* Header */}
      <header className="flex flex-col items-center md:items-start text-center md:text-left">
        <h1 className="font-[Playfair_Display] text-4xl md:text-6xl text-[#D4AF37] tracking-wider drop-shadow-lg" style={{textShadow: '0 0 20px rgba(212, 175, 55, 0.5)'}}>
          ARIX
        </h1>
        <p className="font-[Montserrat] text-white/80 text-sm md:text-base tracking-[0.3em] mt-2 uppercase">
          Signature Collection
        </p>
      </header>

      {/* Footer Controls */}
      <footer className="flex flex-col items-center pointer-events-auto">
        <button 
          onClick={toggleState}
          className={`
            group relative px-8 py-3 bg-transparent 
            border border-[#D4AF37]/30 hover:border-[#D4AF37] 
            text-[#D4AF37] font-[Montserrat] text-sm tracking-[0.2em] uppercase 
            transition-all duration-500 ease-out overflow-hidden
            backdrop-blur-sm
          `}
        >
          <span className="relative z-10 group-hover:text-[#002b19] transition-colors duration-500">
            {isTree ? "Deconstruct" : "Assemble"}
          </span>
          <div className="absolute inset-0 bg-[#D4AF37] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </button>
        
        <div className="mt-6 flex gap-4">
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
        </div>
        <p className="mt-4 font-[Montserrat] text-[10px] text-white/40 tracking-widest">
          INTERACTIVE EXPERIENCE
        </p>
      </footer>
    </div>
  );
};