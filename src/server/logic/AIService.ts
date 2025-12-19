import { CombatService } from "./CombatService";
import { CardType, PlayerState } from "@/shared/types";

export class AIService {
  constructor(private combatService: CombatService) {}

  public calculateTurn(aiState: PlayerState, playerState: PlayerState) {
    const actions: any[] = [];

    // 1. Play cards AI can afford
    let currentMana = aiState.mana;
    const playableCards = [...aiState.hand]
      .filter((c) => c.currentCost <= currentMana)
      .sort((a, b) => b.currentCost - a.currentCost);

    for (const card of playableCards) {
      if (currentMana >= card.currentCost) {
        if (card.type === CardType.MINION && aiState.board.length < 7) {
          actions.push({ type: "PLAY", cardId: card.uniqueId });
          currentMana -= card.currentCost;
        } else if (card.type === CardType.SPELL) {
          // Simple spell logic: spells can ignore Bodyguard minions
          actions.push({ type: "PLAY", cardId: card.uniqueId, targetId: "HERO_PLAYER" });
          currentMana -= card.currentCost;
        }
      }
    }

    // 2. Attack with ready minions
    const readyMinions = aiState.board.filter((m) => m.canAttack && m.attacksMade < m.maxAttacks);

    for (const minion of readyMinions) {
      // Find possible targets using CombatService rules
      const possibleTargets: string[] = [];

      // Check enemy minions
      playerState.board.forEach((m) => {
        if (this.combatService.canAttackTarget(minion, m.uniqueId, playerState)) {
          possibleTargets.push(m.uniqueId);
        }
      });

      // Check enemy hero
      if (this.combatService.canAttackTarget(minion, "HERO_PLAYER", playerState)) {
        possibleTargets.push("HERO_PLAYER");
      }

      if (possibleTargets.length > 0) {
        // Simple priority: 
        // 1. If we can kill a minion and survive - do it
        // 2. If we can kill a minion and we will die - maybe do it
        // 3. Otherwise hit hero if possible
        
        let bestTarget = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
        
        if (possibleTargets.includes("HERO_PLAYER") && playerState.board.length === 0) {
            bestTarget = "HERO_PLAYER";
        }

        actions.push({ type: "ATTACK", attackerId: minion.uniqueId, targetId: bestTarget });
      }
    }

    return actions;
  }
}
