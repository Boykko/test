import { GameCard, PlayerState } from "@/shared/types";

export class CombatService {
  /**
   * Validates if an attack can proceed. 
   * Rule: If there are minions with Taunt (Provocation) on the board, 
   * only those minions can be targeted.
   */
  public canAttackTarget(attacker: GameCard, targetId: string, opponent: PlayerState): boolean {
    if (!attacker.canAttack || attacker.attacksMade >= attacker.maxAttacks || attacker.isFrozen) return false;

    const tauntMinions = opponent.board.filter(m => m.isTaunt);
    
    if (tauntMinions.length > 0) {
      // If there are taunt minions, the target MUST be one of them
      // Hero targeting is BLOCKED
      if (targetId === 'HERO_ENEMY' || targetId === 'HERO_PLAYER') return false;

      const target = opponent.board.find(m => m.uniqueId === targetId);
      return !!(target && target.isTaunt);
    }

    // No taunts? Any minion or the hero can be attacked
    return true; 
  }

  /**
   * Calculates combat outcome and returns updated cards
   */
  public calculateCombat(attacker: GameCard, target: GameCard) {
    let damageToTarget = attacker.currentAttack;
    let damageToAttacker = target.currentAttack;

    // Handle Divine Shield
    if (target.hasDivineShield && damageToTarget > 0) {
      damageToTarget = 0;
      target.hasDivineShield = false;
    }
    if (attacker.hasDivineShield && damageToAttacker > 0) {
      damageToAttacker = 0;
      attacker.hasDivineShield = false;
    }

    // Handle Reflection (target reflects 50% damage back to attacker)
    if (target.hasReflection && damageToTarget > 0) {
        damageToAttacker += Math.ceil(damageToTarget * 0.5);
    }

    // Handle Poisonous (Instakill if ANY damage dealt)
    // Poisonous only applies to minions, not heroes
    const attackerIsDead = (target.isInstakill && damageToAttacker > 0) || (attacker.currentHealth - damageToAttacker <= 0);
    const targetIsDead = (attacker.isInstakill && damageToTarget > 0) || (target.currentHealth - damageToTarget <= 0);

    return {
      damageToTarget,
      damageToAttacker,
      targetHealthRemaining: target.currentHealth - damageToTarget,
      attackerHealthRemaining: attacker.currentHealth - damageToAttacker,
      attackerIsDead,
      targetIsDead,
      // Internal flags to notify engine about poisonous death even if health > 0
      _targetDeadByInstakill: (attacker.isInstakill && damageToTarget > 0),
      _attackerDeadByInstakill: (target.isInstakill && damageToAttacker > 0)
    };
  }
}
