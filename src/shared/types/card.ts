import { CardAbility } from "./ability";

export enum CardRank {
    BRONZE   = "BRONZE",
    SILVER   = "SILVER",
    GOLD     = "GOLD",
    PLATINUM = "PLATINUM",
    DIAMOND  = "DIAMOND",
}

export enum CardType {
    MINION = "MINION",
    SPELL  = "SPELL",
}

export interface CardData {
    id: string;
    monsterId: string; // Persistent ID for the base monster type
    src: string;
    title: string;
    type: CardType;
    baseCost: number;
    baseAttack: number;
    baseHealth: number;
    baseArmor: number;
    rank: CardRank;
    isUnlocked: boolean;
    abilities: CardAbility[];
}

export interface Deck {
  id: string;
  name: string;
  cardIds: string[];
}
