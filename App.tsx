import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Task, SetupFormData, HeroData } from './types';
import SetupScreen from './components/SetupScreen';
import BattleScreen from './components/BattleScreen';
import EndScreen from './components/EndScreen';
import { generateMonsterMeta, generatePixelArt } from './services/geminiService';

const HERO_STORAGE_KEY = 'task_slayer_hero_img_v1';

const getSecondsUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeLeft, setTimeLeft] = useState(getSecondsUntilMidnight());
  
  const [hero, setHero] = useState<HeroData>({
    name: "Hero",
    level: 1,
    currentXp: 0,
    xpToNextLevel: 500,
    imageUrl: undefined
  });

  // Generate Hero Image on Mount (only once)
  // Requesting Hero facing LEFT because they stand on the RIGHT
  useEffect(() => {
    const fetchHero = async () => {
        // Check local storage first
        const savedHeroImg = localStorage.getItem(HERO_STORAGE_KEY);
        if (savedHeroImg) {
            setHero(h => ({ ...h, imageUrl: savedHeroImg }));
            return;
        }

        // If not found, generate and save
        const url = await generatePixelArt("A brave fantasy knight hero, golden armor, sword raised, heroic stance", "left");
        if (url) {
            localStorage.setItem(HERO_STORAGE_KEY, url);
            setHero(h => ({ ...h, imageUrl: url }));
        }
    };
    fetchHero();
  }, []);

  // Timer Loop
  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;

    const interval = setInterval(() => {
      const seconds = getSecondsUntilMidnight();
      setTimeLeft(seconds);

      if (seconds <= 0) {
        const anyMonstersAlive = tasks.some(t => !t.completed);
        setGameState(anyMonstersAlive ? GameState.LOST : GameState.WON);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, tasks]);

  // Win Check
  useEffect(() => {
    if (gameState === GameState.PLAYING && tasks.length > 0) {
      const allComplete = tasks.every(t => t.completed);
      if (allComplete) {
        // Small delay to let animations finish
        setTimeout(() => setGameState(GameState.WON), 2000);
      }
    }
  }, [tasks, gameState]);

  const handleStartDay = async (formData: SetupFormData[]) => {
    setGameState(GameState.LOADING);

    const newTasks: Task[] = formData.map((data, index) => ({
      id: `task-${Date.now()}-${index}`,
      title: data.title,
      difficulty: 0 as any, // Will be overwritten by AI
      completed: false,
      isGeneratingImage: true,
      monster: {
        name: "Summoning...",
        description: "...",
        maxHp: 100,
        currentHp: 100,
        xpReward: 100,
        type: "Unknown"
      }
    }));

    setTasks(newTasks);
    
    try {
        const updatedTasks = await Promise.all(newTasks.map(async (task) => {
            // AI determines difficulty and XP here
            const meta = await generateMonsterMeta(task.title);
            return {
                ...task,
                monster: {
                    ...task.monster,
                    ...meta
                }
            };
        }));
        
        setTasks(updatedTasks);
        setGameState(GameState.PLAYING);
    } catch (e) {
        console.error("Failed to start day", e);
        setGameState(GameState.SETUP);
    }
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(prev => {
        const task = prev.find(t => t.id === taskId);
        if (task && !task.completed) {
             // Award XP immediately in local state for UI update
             setHero(h => {
                let newXp = h.currentXp + task.monster.xpReward;
                let newLevel = h.level;
                let nextLevelXp = h.xpToNextLevel;

                if (newXp >= nextLevelXp) {
                    newXp -= nextLevelXp;
                    newLevel += 1;
                    nextLevelXp = Math.floor(nextLevelXp * 1.5);
                }

                return {
                    ...h,
                    level: newLevel,
                    currentXp: newXp,
                    xpToNextLevel: nextLevelXp
                };
            });
        }

        return prev.map(t => {
          if (t.id === taskId && !t.completed) {
            return { 
              ...t, 
              completed: true,
              monster: { ...t.monster, currentHp: 0 } 
            };
          }
          return t;
        });
    });
  };

  const handleUpdateMonsterImage = useCallback((taskId: string, imageUrl: string) => {
    setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
            return {
                ...t,
                isGeneratingImage: false,
                monster: { ...t.monster, imageUrl }
            };
        }
        return t;
    }));
  }, []);

  const handleReset = () => {
    setTasks([]);
    setGameState(GameState.SETUP);
    setTimeLeft(getSecondsUntilMidnight());
  };

  return (
    <div className="w-full h-full">
      {gameState === GameState.SETUP && <SetupScreen onStart={handleStartDay} />}
      
      {gameState === GameState.LOADING && (
        <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-white p-8 font-['Press_Start_2P'] text-center">
          <div className="animate-[spin_3s_linear_infinite] text-6xl mb-8">⏳</div>
          <h2 className="text-xl md:text-2xl text-yellow-400 mb-4 leading-relaxed">The Oracle is Thinking...</h2>
          <p className="text-xs md:text-sm text-gray-400 max-w-md mx-auto">
            Judging your deeds and summoning the beasts...
          </p>
        </div>
      )}

      {gameState === GameState.PLAYING && (
        <BattleScreen 
            tasks={tasks} 
            hero={hero}
            timeLeft={timeLeft} 
            onCompleteTask={handleCompleteTask}
            onUpdateMonsterImage={handleUpdateMonsterImage}
        />
      )}

      {(gameState === GameState.WON || gameState === GameState.LOST) && (
        <EndScreen won={gameState === GameState.WON} onReset={handleReset} />
      )}
    </div>
  );
};

export default App;