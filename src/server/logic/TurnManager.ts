import { PlayerState } from "@/entities/hero/model/types.ts";
import { MAX_MANA }    from "@/shared/constants";

export class TurnManager {
  private turnDuration = 30000;

  public getNextTurnEndTime(): number {
    return Date.now() + this.turnDuration;
  }

  public prepareNewTurn(player: PlayerState, emitEvent?: (type: string, data: any) => void) {
    // 0. Process Poison DOT
    player.board.forEach(card => {
      if (card.poisonDuration && card.poisonDuration > 0) {
        card.currentHealth -= 1;
        card.poisonDuration -= 1;
        if (emitEvent) {
          emitEvent('DAMAGE', { targetId: card.uniqueId, value: 1, isPoison: true });
        }
      }
    });

    // 1. Increment Max Mana
    if (player.maxMana < MAX_MANA) {
      player.maxMana++;
    }
    
    // 2. Refill Mana
    player.mana = player.maxMana;

    // 3. Reset Board State
    player.board.forEach(card => {
      card.canAttack = true;
      card.attacksMade = 0;
      if (card.isFrozen) {
          card.isFrozen = false;
          card.canAttack = false; 
      }
    });

    // 4. Reset Hero Power
    if (player.heroPower) {
      player.heroPower.isUsed = false;
    }

    // 5. Draw Card
    const card = player.deck.shift();
    if (card && player.hand.length < 10) {
      player.hand.push(card);
      return card;
    }
    return null; 
  }
}
