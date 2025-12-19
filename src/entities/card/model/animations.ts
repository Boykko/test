export type CardAnimationType = 'idle' | 'attack-up' | 'attack-down' | 'damage' | 'buff' | 'die' | 'freeze' | null;

export type VfxType = 'FIREBALL' | 'HEAL' | 'BUFF' | 'FROST' | 'AOE_NOVA' | 'LIFESTEAL' | 'POISON' | 'EXPLOSION' | 'REFLECTION';

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
}

export interface VfxItem {
  id: string;
  type: VfxType;
  sourceId?: string;
  targetId?: string;
}

export interface DuelState {
  attackerId: string;
  targetId: string;
}

export interface DeathVfx {
  id: string;
  x: number;
  y: number;
  color?: string;
}

// Centralized animation timings for consistent feel
export const DURATIONS = {
  ATTACK: 500,
  DAMAGE: 400,
  BUFF: 600,
  DIE: 800,
  FREEZE: 600,
  VFX_PROJECTILE: 800, // Fireball, Lifesteal
  VFX_STATIC: 600,     // Heal, Explosion
  SHAKE: 500,
  DUEL: 1800,
};
