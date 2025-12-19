import { type ClassValue, clsx } from "clsx";
import { twMerge }               from "tailwind-merge";
import { v4 as uuidv4 }          from "uuid";
import { CardData, GameCard }    from "./types";

// Utility for safe Tailwind class merging
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createGameCard = (cardData: CardData): GameCard => {
  return {
    ...cardData,
    // Use UUID for robust unique IDs instead of random strings
    uniqueId: `${cardData.id}_${uuidv4()}`,
    currentAttack: cardData.baseAttack,
    currentHealth: cardData.baseHealth,
    currentCost: cardData.baseCost, 
    currentArmor: cardData.baseArmor || 0,
    canAttack: false, // Summoning sickness
    attacksMade: 0,
    maxAttacks: 1,
    isFrozen: false,
    poisonDuration: 0,
  };
};

export const shuffleDeck = (deck: GameCard[]): GameCard[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export const getDescription = (template: string, value: number): string => {
  return template.replace('{value}', value.toString());
};