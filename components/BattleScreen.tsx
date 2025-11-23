import React, { useEffect, useState, useRef } from 'react';
import { Task, HeroData } from '../types';
import RetroButton from './RetroButton';
import { generatePixelArt } from '../services/geminiService';

interface BattleScreenProps {
  tasks: Task[];
  hero: HeroData;
  timeLeft: number;
  onCompleteTask: (taskId: string) => void;
  onUpdateMonsterImage: (taskId: string, imageUrl: string) => void;
}

const BattleScreen: React.FC<BattleScreenProps> = ({ tasks, hero, timeLeft, onCompleteTask, onUpdateMonsterImage }) => {
  const activeTasks = tasks.filter(t => !t.completed);
  const [targetTaskId, setTargetTaskId] = useState<string | null>(null);
  const imageGenQueueRef = useRef<Set<string>>(new Set());
  
  // Animation states
  const [heroAnim, setHeroAnim] = useState<'idle' | 'attack'>('idle');
  const [monsterAnim, setMonsterAnim] = useState<'idle' | 'hit' | 'die'>('idle');
  const [xpFloat, setXpFloat] = useState<{show: boolean, amount: number}>({show: false, amount: 0});
  
  // New Visual Effects States
  const [showSlash, setShowSlash] = useState(false);
  const [screenShake, setScreenShake] = useState(false);

  useEffect(() => {
    if (!targetTaskId && activeTasks.length > 0) {
      setTargetTaskId(activeTasks[0].id);
    }
  }, [activeTasks.length]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    tasks.forEach(async (task) => {
      if (task.isGeneratingImage && !task.monster.imageUrl && !imageGenQueueRef.current.has(task.id)) {
        imageGenQueueRef.current.add(task.id);
        
        // Improved prompt that ties visual directly to user's task
        const prompt = `A fantasy monster named "${task.monster.name}" representing the concept of "${task.title}". Type: ${task.monster.type}`;
        
        const imageUrl = await generatePixelArt(prompt, 'right');
        if (imageUrl) {
          onUpdateMonsterImage(task.id, imageUrl);
        }
        imageGenQueueRef.current.delete(task.id);
      }
    });
  }, [tasks, onUpdateMonsterImage]);

  const handleAttack = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // 1. Hero Attacks
    setHeroAnim('attack');
    
    // 2. Impact & Monster Reaction
    setTimeout(() => {
        setMonsterAnim('hit');
        setShowSlash(true);
        setScreenShake(true); // Trigger screen shake
        
        // Show XP
        setXpFloat({ show: true, amount: task.monster.xpReward });

        // Reset short-term effects
        setTimeout(() => {
          setShowSlash(false);
          setScreenShake(false);
        }, 300);

    }, 400);

    // 3. Monster Dies & Data Update
    setTimeout(() => {
        setMonsterAnim('die');
        setTimeout(() => {
             onCompleteTask(taskId);
             setHeroAnim('idle');
             setMonsterAnim('idle');
             setXpFloat({ show: false, amount: 0 });
             
             const nextTask = tasks.find(t => !t.completed && t.id !== taskId);
             if (nextTask) setTargetTaskId(nextTask.id);
             else setTargetTaskId(null);

        }, 500);
    }, 1000);
  };

  const currentTarget = tasks.find(t => t.id === targetTaskId);

  return (
    <div className="flex flex-col h-full bg-[#1a1c2c] text-white overflow-hidden relative font-['Press_Start_2P'] select-none">
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes hero-idle {
          0%, 100% { transform: translateY(0px) scaleX(-1); }
          50% { transform: translateY(-4px) scaleX(-1); }
        }
        @keyframes attack-lunge {
          0% { transform: translateX(0) scaleX(-1); }
          40% { transform: translateX(-150px) scaleX(-1); }
          100% { transform: translateX(0) scaleX(-1); }
        }
        @keyframes monster-hit {
          0% { filter: brightness(1) sepia(0) hue-rotate(0deg); transform: translateX(0) scale(1); }
          20% { filter: brightness(2) sepia(1) hue-rotate(-50deg) saturate(5); transform: translateX(-10px) scale(0.9); }
          40% { filter: brightness(1); transform: translateX(10px) scale(1.1); }
          60% { transform: translateX(-5px) scale(0.95); }
          80% { transform: translateX(5px) scale(1.05); }
          100% { transform: translateX(0) scale(1); }
        }
        @keyframes float-up {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-50px); }
        }
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        @keyframes slash-anim {
            0% { transform: translate(-50%, -50%) scale(0) rotate(-45deg); opacity: 0.8; }
            20% { transform: translate(-50%, -50%) scale(1.5) rotate(-45deg); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1.2) rotate(-45deg); opacity: 0; }
        }
      `}</style>

      {/* TOP HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent h-24">
        {/* Timer */}
        <div className="bg-slate-800/80 border-2 border-slate-500 p-2 rounded shadow-lg">
           <div className="text-[10px] text-slate-400 mb-1">TIME REMAINING</div>
           <div className={`text-sm md:text-xl ${timeLeft < 3600 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
             {formatTime(timeLeft)}
           </div>
        </div>

        {/* Hero Stats */}
        <div className="bg-slate-800/80 border-2 border-blue-500 p-2 rounded shadow-lg min-w-[150px]">
           <div className="flex justify-between items-end mb-1">
              <span className="text-blue-300 text-xs">{hero.name}</span>
              <span className="text-yellow-400 text-xs">LVL {hero.level}</span>
           </div>
           <div className="w-full h-2 bg-gray-900 border border-gray-600 relative">
             <div 
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (hero.currentXp / hero.xpToNextLevel) * 100)}%` }}
             ></div>
           </div>
           <div className="text-[8px] text-right text-gray-400 mt-1">{hero.currentXp} / {hero.xpToNextLevel} XP</div>
        </div>
      </div>

      {/* BATTLE ARENA */}
      <div 
        className={`flex-1 relative flex items-end justify-between px-4 md:px-20 pb-8 overflow-hidden bg-[url('https://picsum.photos/seed/darkforest/800/600?grayscale&blur=2')] bg-cover bg-center ${screenShake ? 'animate-[shake_0.5s_cubic-bezier(.36,.07,.19,.97)_both]' : ''}`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none"></div>

        {/* LEFT SIDE: MONSTER (Facing Right) */}
        <div className="relative z-10 w-1/2 flex flex-col items-center justify-end h-full">
            {currentTarget && !currentTarget.completed ? (
                <div className={`transition-all duration-500 relative ${monsterAnim === 'die' ? 'opacity-0 scale-90 blur-sm' : 'opacity-100'}`}>
                    {/* Floating XP Text */}
                    {xpFloat.show && (
                        <div className="absolute -top-20 left-1/2 -translate-x-1/2 text-yellow-300 text-2xl font-bold drop-shadow-md z-50 animate-[float-up_1s_ease-out_forwards]">
                            +{xpFloat.amount} XP
                        </div>
                    )}
                    
                    {/* Slash Effect Overlay */}
                    {showSlash && (
                        <div className="absolute top-1/2 left-1/2 w-64 h-2 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-50 animate-[slash-anim_0.2s_ease-out_forwards]"></div>
                    )}

                    {/* Monster Sprite */}
                    <div 
                        className="w-32 h-32 md:w-64 md:h-64 relative"
                        style={{
                            animation: monsterAnim === 'hit' ? 'monster-hit 0.5s' : 'float 3s ease-in-out infinite'
                        }}
                    >
                         {currentTarget.monster.imageUrl ? (
                             <img 
                                src={currentTarget.monster.imageUrl} 
                                className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,0,0,0.3)] mix-blend-screen" 
                                style={{ imageRendering: 'pixelated' }} 
                             />
                         ) : (
                             <div className="w-full h-full bg-black/40 rounded-full animate-pulse flex items-center justify-center text-[10px] text-red-300">Summoning...</div>
                         )}
                    </div>

                    {/* Monster Info Plate */}
                    <div className="mt-4 bg-black/60 backdrop-blur-sm border border-red-900 p-2 rounded text-center min-w-[160px]">
                        <div className="text-red-400 text-xs md:text-sm truncate font-bold mb-1">{currentTarget.monster.name}</div>
                        <div className="text-[9px] text-gray-400 mb-1">{currentTarget.monster.type}</div>
                        <div className="w-full h-2 bg-red-950 border border-red-800">
                             <div 
                                className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                                style={{ width: `${(currentTarget.monster.currentHp / currentTarget.monster.maxHp) * 100}%` }}
                             ></div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 opacity-30">
                    <div className="text-4xl mb-2">💀</div>
                    <div className="text-xs">Select a target</div>
                </div>
            )}
        </div>

        {/* RIGHT SIDE: HERO (Facing Left) */}
        <div className="relative z-10 w-1/2 flex flex-col items-center justify-end h-full">
            <div 
                className="relative"
                style={{
                    animation: heroAnim === 'attack' ? 'attack-lunge 0.6s ease-in-out' : 'hero-idle 3s ease-in-out infinite'
                }}
            >
                <div className="w-32 h-32 md:w-56 md:h-56">
                    {hero.imageUrl ? (
                        <img 
                            src={hero.imageUrl} 
                            className="w-full h-full object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] mix-blend-screen" 
                            style={{ imageRendering: 'pixelated' }} 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">🛡️</div>
                    )}
                </div>
            </div>
            {/* Hero Base Shadow */}
            <div className="w-32 h-4 bg-black/50 rounded-[100%] blur-sm mt-[-10px]"></div>
        </div>

      </div>

      {/* BOTTOM CONTROL PANEL */}
      <div className="bg-[#0f0f1a] border-t-4 border-[#3a3a50] h-1/3 min-h-[180px] p-2 md:p-4 grid grid-cols-12 gap-4">
        
        {/* Combat Log */}
        <div className="hidden md:block col-span-3 bg-black/30 p-3 rounded border border-gray-800 overflow-y-auto text-[10px] text-gray-400 font-mono leading-relaxed">
            <div className="text-yellow-600 mb-2 border-b border-gray-800 pb-1">COMBAT LOG</div>
            {currentTarget ? (
                <>
                    <p>Encountered <span className="text-red-400">{currentTarget.monster.name}</span>.</p>
                    <p className="mt-2 italic">"{currentTarget.monster.description}"</p>
                </>
            ) : (
                <p>Waiting for orders...</p>
            )}
        </div>

        {/* Target List */}
        <div className="col-span-8 md:col-span-6 flex flex-col gap-2 overflow-y-auto pr-1">
             <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 sticky top-0 bg-[#0f0f1a] z-10">Select Target</div>
             {tasks.map(task => (
                 <button
                    key={task.id}
                    onClick={() => !task.completed && setTargetTaskId(task.id)}
                    disabled={task.completed}
                    className={`
                        w-full flex items-center justify-between p-3 border-2 transition-all group
                        ${task.completed 
                            ? 'bg-gray-900 border-gray-800 opacity-40 grayscale order-last' 
                            : targetTaskId === task.id 
                                ? 'bg-red-900/20 border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.3)] translate-x-1' 
                                : 'bg-slate-800 border-slate-600 hover:border-slate-400 hover:bg-slate-700'
                        }
                    `}
                 >
                    <div className="flex flex-col items-start text-left overflow-hidden w-2/3">
                        <span className={`text-xs md:text-sm truncate w-full font-bold ${targetTaskId === task.id ? 'text-red-300' : 'text-gray-300'}`}>
                            {task.monster.name}
                        </span>
                        <span className="text-[9px] text-gray-500 truncate w-full">{task.title}</span>
                    </div>
                    
                    {task.completed ? (
                         <span className="text-[10px] text-green-500 font-bold">DEFEATED</span>
                    ) : (
                         <div className="flex flex-col items-end">
                            <span className="text-[10px] text-yellow-500">{task.monster.difficulty}</span>
                            <span className="text-[9px] text-blue-400">{task.monster.xpReward} XP</span>
                         </div>
                    )}
                 </button>
             ))}
        </div>

        {/* Action Button */}
        <div className="col-span-4 md:col-span-3 flex flex-col justify-center">
            <RetroButton 
                variant="danger" 
                disabled={!currentTarget || currentTarget.completed || heroAnim === 'attack'}
                onClick={() => currentTarget && handleAttack(currentTarget.id)}
                className={`h-full text-xs md:text-lg shadow-lg flex flex-col items-center justify-center gap-2 ${!currentTarget ? 'opacity-50' : ''}`}
            >
                {heroAnim === 'attack' ? (
                    'ATTACKING...'
                ) : (
                    <>
                        <span>⚔️ STRIKE</span>
                    </>
                )}
            </RetroButton>
        </div>

      </div>
    </div>
  );
};

export default BattleScreen;