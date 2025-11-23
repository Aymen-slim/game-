import React, { useState } from 'react';
import { SetupFormData } from '../types';
import RetroButton from './RetroButton';

interface SetupScreenProps {
  onStart: (data: SetupFormData[]) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
  const [tasks, setTasks] = useState<SetupFormData[]>([
    { title: '' },
    { title: '' },
    { title: '' },
  ]);

  const handleChange = (index: number, value: string) => {
    const newTasks = [...tasks];
    newTasks[index].title = value;
    setTasks(newTasks);
  };

  const isValid = tasks.every(t => t.title.trim().length > 0);

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 bg-[#2d1b2e] text-[#e0c0a0] font-serif overflow-y-auto">
      <div className="w-full max-w-2xl border-[16px] border-[#5c3a21] bg-[#f4e4bc] p-4 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative">
        {/* Nails in corners */}
        <div className="absolute top-2 left-2 w-3 h-3 bg-[#3e2723] rounded-full shadow-[inset_1px_1px_2px_rgba(255,255,255,0.2)]"></div>
        <div className="absolute top-2 right-2 w-3 h-3 bg-[#3e2723] rounded-full shadow-[inset_1px_1px_2px_rgba(255,255,255,0.2)]"></div>
        <div className="absolute bottom-2 left-2 w-3 h-3 bg-[#3e2723] rounded-full shadow-[inset_1px_1px_2px_rgba(255,255,255,0.2)]"></div>
        <div className="absolute bottom-2 right-2 w-3 h-3 bg-[#3e2723] rounded-full shadow-[inset_1px_1px_2px_rgba(255,255,255,0.2)]"></div>

        <div className="text-center mb-8 border-b-2 border-[#8b5a2b] pb-4">
          <h1 className="text-3xl md:text-5xl text-[#5c3a21] font-bold uppercase tracking-widest" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>
            Daily Quests
          </h1>
          <p className="text-[#8b5a2b] mt-2 font-bold text-sm italic">
            "Declare thy burdens, Hero."
          </p>
        </div>

        <div className="space-y-6">
          {tasks.map((task, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute -left-6 md:-left-8 top-1/2 -translate-y-1/2 text-[#8b4513] font-bold text-xl md:text-2xl opacity-60 font-['Press_Start_2P']">
                {idx + 1}
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Wash the dishes..."
                  value={task.title}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  className="w-full bg-[#e8d5b5] border-2 border-[#8b4513] text-[#4a2c18] text-lg md:text-xl p-4 pl-4 focus:outline-none focus:bg-[#fffdf5] focus:border-[#5c3a21] focus:shadow-lg transition-all placeholder-[#8b4513]/40 font-bold rounded-sm"
                />
                {/* Paper texture effect overlay */}
                <div className="pointer-events-none absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <RetroButton 
            onClick={() => isValid && onStart(tasks)} 
            disabled={!isValid}
            className={`w-full md:w-auto px-12 py-4 text-sm md:text-lg ${!isValid ? 'opacity-50 grayscale cursor-not-allowed' : 'animate-[pulse_2s_infinite]'}`}
            style={{
                fontFamily: "'Press Start 2P', cursive",
                boxShadow: "6px 6px 0 #3e2723"
            }}
          >
            SIGN CONTRACT
          </RetroButton>
        </div>
        
        <div className="absolute -bottom-16 left-0 right-0 text-center">
             <span className="text-[#e0c0a0] text-xs opacity-70">The Oracle will judge the difficulty of your fate.</span>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
