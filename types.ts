export enum Difficulty {
  TRIVIAL = 'Trivial',
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
  LEGENDARY = 'Legendary'
}

export interface MonsterData {
  name: string;
  description: string;
  maxHp: number;
  currentHp: number;
  xpReward: number;
  imageUrl?: string; // Base64 data URI
  type: string; // e.g., "Slime", "Undead"
}

export interface HeroData {
  name: string;
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  imageUrl?: string;
}

export interface Task {
  id: string;
  title: string;
  difficulty: Difficulty;
  completed: boolean;
  monster: MonsterData;
  isGeneratingImage: boolean;
}

export enum GameState {
  SETUP = 'SETUP',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  WON = 'WON',
  LOST = 'LOST'
}

export interface SetupFormData {
  title: string;
}
