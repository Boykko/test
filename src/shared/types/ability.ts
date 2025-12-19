export enum AbilityBehavior {
  HEAL_HERO = 'HEAL_HERO',
  DAMAGE_ENEMY_HERO = 'DAMAGE_ENEMY_HERO',
  BUFF_SELF = 'BUFF_SELF',
  DRAW_CARD = 'DRAW_CARD',
  GAIN_ARMOR                 = 'GAIN_ARMOR',
  TAUNT                      = 'TAUNT',
  CHARGE                     = 'CHARGE',
  WINDFURY                   = 'WINDFURY',
  END_TURN_HEAL_SELF         = 'END_TURN_HEAL_SELF',
  END_TURN_DAMAGE_ENEMY_HERO = 'END_TURN_DAMAGE_ENEMY_HERO',
  DEATHRATTLE_SUMMON         = 'DEATHRATTLE_SUMMON',
  DEATHRATTLE_DAMAGE_ENEMY   = 'DEATHRATTLE_DAMAGE_ENEMY',
  DEATHRATTLE_DRAW           = 'DEATHRATTLE_DRAW',
  DIVINE_SHIELD   = 'DIVINE_SHIELD',
  INSTAKILL       = 'INSTAKILL',
  REFLECTION      = 'REFLECTION',
  LIFESTEAL       = 'LIFESTEAL',
  SPELL_DAMAGE    = 'SPELL_DAMAGE',
  SPELL_HEAL      = 'SPELL_HEAL',
  SPELL_AOE_ENEMY = 'SPELL_AOE_ENEMY',
  SPELL_BUFF      = 'SPELL_BUFF',
  FREEZE_TARGET   = 'FREEZE_TARGET',
  DISCOVER        = 'DISCOVER',
  POISON          = 'POISON',
  NONE            = 'NONE',
}

export enum TargetRequirement {
  ANY = 'ANY',
  FRIENDLY = 'FRIENDLY',
  ENEMY = 'ENEMY',
}

export interface AbilityDefinition {
  id: string;
  name: string;
  behavior: AbilityBehavior;
  targetRequirement: TargetRequirement;
  descriptionTemplate: string;
}

export interface CardAbility {
  abilityId: string;
  value: number;
}
