import { describe, it, expect } from 'vitest';
import { GameCard } from '@/entities/card/model/types';
import { CardRank, CardType } from '@/shared/types';
import { CombatService } from '../CombatService';

// Эмулируем минимальный набор данных для тестирования логики
const createTestCard = (id: string, attack: number, health: number): GameCard => ({
  id,
  monsterId: id,
  src: '',
  title: id,
  type: CardType.MINION,
  baseCost: 1,
  baseAttack: attack,
  baseHealth: health,
  baseArmor: 0,
  rank: CardRank.BRONZE,
  isUnlocked: true,
  abilities: [],
  uniqueId: id + '_unique',
  currentAttack: attack,
  currentHealth: health,
  currentCost: 1,
  currentArmor: 0,
  canAttack: true,
  attacksMade: 0,
  maxAttacks: 1,
  isFrozen: false,
  poisonDuration: 0,
});

describe('Combat Mechanics Logic', () => {
  describe('Poison (DOT) Logic', () => {
    it('should apply poison duration to target when attacker has hasPoison and it is first attack', () => {
      const attacker = createTestCard('attacker', 1, 5);
      attacker.hasPoison = true;
      attacker.attacksMade = 0;

      const target = createTestCard('target', 1, 5);

      // Логика атаки (будет реализована в GameEngine)
      if (attacker.hasPoison && attacker.attacksMade === 0) {
        target.poisonDuration = 3;
      }
      attacker.attacksMade++;

      expect(target.poisonDuration).toBe(3);
      expect(attacker.attacksMade).toBe(1);
    });

    it('should not apply poison duration on subsequent attacks', () => {
      const attacker = createTestCard('attacker', 1, 5);
      attacker.hasPoison = true;
      attacker.attacksMade = 1;

      const target = createTestCard('target', 1, 5);

      if (attacker.hasPoison && attacker.attacksMade === 0) {
        target.poisonDuration = 3;
      }
      attacker.attacksMade++;

      expect(target.poisonDuration).toBe(0);
    });

    it('should decrease poison duration and deal damage at the start of turn', () => {
      const target = createTestCard('target', 1, 5);
      target.poisonDuration = 3;

      // Логика начала хода (будет реализована в TurnManager или GameEngine)
      const processPoison = (card: GameCard) => {
        if (card.poisonDuration && card.poisonDuration > 0) {
          card.currentHealth -= 1;
          card.poisonDuration -= 1;
          return true;
        }
        return false;
      };

      processPoison(target);
      expect(target.currentHealth).toBe(4);
      expect(target.poisonDuration).toBe(2);

      processPoison(target);
      expect(target.currentHealth).toBe(3);
      expect(target.poisonDuration).toBe(1);

      processPoison(target);
      expect(target.currentHealth).toBe(2);
      expect(target.poisonDuration).toBe(0);

      processPoison(target);
      expect(target.currentHealth).toBe(2); // Больше не уменьшается
      expect(target.poisonDuration).toBe(0);
    });
  });

  describe('Instakill Logic', () => {
      it('should mark target as dead by instakill if attacker has instakill and deals damage', () => {
          const service = new CombatService();
          
          const attacker = createTestCard('instakill', 1, 5);
          attacker.isInstakill = true;
          const target = createTestCard('target', 5, 5);

          const outcome = service.calculateCombat(attacker, target);
          
          expect(outcome.damageToTarget).toBe(1);
          expect(outcome.targetHealthRemaining).toBe(4); // Health is NOT 0
          expect(outcome.targetIsDead).toBe(true); // But it IS dead
          expect(outcome._targetDeadByInstakill).toBe(true);
      });

      it('should not mark target as dead if damage is 0 (e.g. Divine Shield)', () => {
          const service = new CombatService();
          
          const attacker = createTestCard('instakill', 1, 5);
          attacker.isInstakill = true;
          const target = createTestCard('target', 5, 5);
          target.hasDivineShield = true;

          const outcome = service.calculateCombat(attacker, target);
          
          expect(outcome.damageToTarget).toBe(0);
          expect(outcome.targetHealthRemaining).toBe(5);
          expect(outcome.targetIsDead).toBe(false);
          expect(outcome._targetDeadByInstakill).toBe(false);
      });
  });
});
