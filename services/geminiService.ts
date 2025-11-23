import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, MonsterData } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateMonsterMeta = async (taskTitle: string): Promise<Omit<MonsterData, 'imageUrl'>> => {
  const model = 'gemini-2.5-flash';
  
  const prompt = `
    I am creating a pixel art game where daily tasks turn into monsters.
    The user has a task: "${taskTitle}".
    
    1. Analyze the difficulty of this real-world task (Trivial, Easy, Medium, Hard, Legendary).
    2. Generate a creative fantasy monster based on this task.
       - "Do Laundry" -> "Sock Devourer" (Slime).
       - "Write Thesis" -> "The Unending Scroll" (Construct).
    3. Assign HP and XP based on difficulty:
       - Trivial: 30 HP, 50 XP
       - Easy: 60 HP, 100 XP
       - Medium: 120 HP, 250 XP
       - Hard: 300 HP, 600 XP
       - Legendary: 800 HP, 2000 XP
    
    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            type: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ["Trivial", "Easy", "Medium", "Hard", "Legendary"] },
            hp: { type: Type.INTEGER },
            xp: { type: Type.INTEGER }
          },
          required: ["name", "description", "type", "difficulty", "hp", "xp"]
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    
    return {
      name: json.name || "Unknown Beast",
      description: json.description || "A mysterious entity.",
      type: json.type || "Unknown",
      maxHp: json.hp || 100,
      currentHp: json.hp || 100,
      xpReward: json.xp || 100
    };
  } catch (error) {
    console.error("Error generating monster meta:", error);
    // Fallback
    return {
      name: "Shadow of Procrastination",
      description: "It feeds on time.",
      type: "Shadow",
      maxHp: 100,
      currentHp: 100,
      xpReward: 100
    };
  }
};

export const generatePixelArt = async (promptText: string, facing: 'left' | 'right' = 'right'): Promise<string | undefined> => {
  const model = 'gemini-2.5-flash-image';
  
  // Monsters (Left side) should face Right. Hero (Right side) should face Left.
  const facingDirection = facing === 'right' ? 'facing RIGHT' : 'facing LEFT';

  // Requesting Solid Black background allows us to use CSS mix-blend-mode: screen to remove it visually
  const prompt = `Generate a retro 8-bit pixel art sprite. 
  Subject: ${promptText}.
  Action: Standing ready for battle, ${facingDirection}.
  Background: Solid Black (#000000). 
  Style: SNES RPG, Final Fantasy 6 style. High contrast.
  View: Side view (battle sprite).
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    return undefined;
  } catch (error) {
    console.error("Error generating image:", error);
    return undefined;
  }
};