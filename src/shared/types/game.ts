import { AbilityBehavior } from "./ability";

export enum GamePhase {
  MENU = 'MENU',
  DECK_BUILDING = 'DECK_BUILDING',
  BATTLE = 'BATTLE',
  ADMIN = 'ADMIN',
}

export enum GameMode {
  STANDARD = 'STANDARD',
  ARENA = 'ARENA',
}

export interface HeroPower {
  id: string;
  name: string;
  cost: number;
  description: string;
  behavior: AbilityBehavior;
  value: number;
  isUsed: boolean;
  src: string;
}
