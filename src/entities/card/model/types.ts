import { CardData } from "@/shared/types.ts";

export interface GameCard extends CardData {
  uniqueId: string;
  currentHealth: number;
  currentAttack: number;
  currentCost: number;
  currentArmor: number;
  canAttack: boolean;
  attacksMade: number;
  maxAttacks: number;
  isTaunt?: boolean;
  isFrozen?: boolean;
  hasDivineShield?: boolean;
  isInstakill?: boolean;
  hasReflection?: boolean;
  hasLifesteal?: boolean;
  hasPoison?: boolean;
  poisonDuration?: number;
}
