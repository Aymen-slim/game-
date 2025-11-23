import React from 'react';
import RetroButton from './RetroButton';

interface EndScreenProps {
  won: boolean;
  onReset: () => void;
}

const EndScreen: React.FC<EndScreenProps> = ({ won, onReset }) => {
  return (
    <div className={`flex flex-col items-center justify-center h-full p-8 text-center ${won ? 'bg-blue-900' : 'bg-red-950'}`}>
      <h1 className={`text-4xl md:text-6xl mb-6 ${won ? 'text-yellow-400' : 'text-red-500'} drop-shadow-xl`}>
        {won ? 'VICTORY!' : 'GAME OVER'}
      </h1>
      
      <div className="bg-black/40 p-6 border-4 border-white/20 max-w-md mb-8">
        <p className="text-sm md:text-base leading-relaxed mb-4">
          {won 
            ? "The monsters have been vanquished. The realm is safe... for now." 
            : "Midnight has struck. The unfinished tasks have overwhelmed the hero. Try again tomorrow."}
        </p>
      </div>

      <RetroButton onClick={onReset} variant={won ? 'success' : 'primary'}>
        NEW DAY
      </RetroButton>
    </div>
  );
};

export default EndScreen;