import { GameCard }                              from "@/entities/card/model/types.ts";
import { PlayerState }                           from "@/entities/hero/model/types.ts";
import { AbilityBehavior, CardAbility, CardData} from "@/shared/types";

export type GameEventCallback = (type: string, data?: any) => void;

export class AbilityService {
  constructor(private registry: Record<string, AbilityBehavior>) {}

  public applyMinionAbilities(
    card: GameCard,
    owner: PlayerState,
    opponent: PlayerState,
    emitEvent: GameEventCallback,
    allCards: CardData[]
  ): boolean {
    let needsChoice = false;

    card.abilities.forEach((ab) => {
      const behavior = this.registry[ab.abilityId];

      if (!behavior) {
        console.warn(`[Server] Unknown ability ID: ${ab.abilityId} on card ${card.title}`);
        emitEvent("UNKNOWN_MECHANIC", { abilityId: ab.abilityId, cardTitle: card.title });
        return;
      }

      const choiceRequested = this.resolveAbilityBehavior(behavior, ab.value, card, owner, opponent, emitEvent);
      if (choiceRequested) needsChoice = true;
    });

    return needsChoice;
  }

  private resolveAbilityBehavior(
    behavior: AbilityBehavior,
    value: number,
    card: GameCard,
    owner: PlayerState,
    opponent: PlayerState,
    emitEvent: GameEventCallback
  ): boolean {
    switch (behavior) {
      case AbilityBehavior.TAUNT:
        card.isTaunt = true;
        break;
      case AbilityBehavior.CHARGE:
        card.canAttack = true;
        break;
      case AbilityBehavior.WINDFURY:
        card.maxAttacks = 2;
        break;
      case AbilityBehavior.DIVINE_SHIELD:
        card.hasDivineShield = true;
        break;
      case AbilityBehavior.INSTAKILL:
        card.isInstakill = true;
        break;
      case AbilityBehavior.REFLECTION:
        card.hasReflection = true;
        break;
      case AbilityBehavior.LIFESTEAL:
        card.hasLifesteal = true;
        break;
      case AbilityBehavior.POISON:
        card.hasPoison = true;
        break;
      case AbilityBehavior.DRAW_CARD:
        this.drawCards(owner, value);
        break;
      case AbilityBehavior.GAIN_ARMOR:
        owner.heroArmor += value;
        emitEvent("HERO_HEALTH", { target: "PLAYER", amount: value, isArmor: true });
        break;
      case AbilityBehavior.BUFF_SELF:
        card.currentAttack += value;
        card.currentHealth += value;
        emitEvent("BUFF", { cardId: card.uniqueId });
        break;
      case AbilityBehavior.HEAL_HERO:
        owner.heroHealth = Math.min(owner.maxHealth, owner.heroHealth + value);
        emitEvent("HERO_HEALTH", { target: "PLAYER", amount: value });
        break;
      case AbilityBehavior.DAMAGE_ENEMY_HERO:
        this.damageHero(opponent, value, emitEvent, "ENEMY");
        break;
      case AbilityBehavior.DISCOVER:
        return true;
      default:
        console.warn(`[Server] Behavior ${behavior} is registered but not implemented in AbilityService`);
        emitEvent("UNIMPLEMENTED_MECHANIC", { behavior, cardTitle: card.title });
    }
    return false;
  }

  private drawCards(player: PlayerState, count: number) {
    for (let i = 0; i < count; i++) {
      const drawn = player.deck.shift();
      if (drawn && player.hand.length < 10) {
        player.hand.push(drawn);
      }
    }
  }

  private damageHero(hero: PlayerState, amount: number, emitEvent: GameEventCallback, targetSide: string) {
    if (hero.heroArmor >= amount) {
      hero.heroArmor -= amount;
    } else {
      const remaining = amount - hero.heroArmor;
      hero.heroArmor = 0;
      hero.heroHealth -= remaining;
    }
    emitEvent("HERO_HEALTH", { target: targetSide, amount: -amount });
  }

  public resolveSpellEffect(
    ability: CardAbility,
    targetId: string | undefined,
    owner: PlayerState,
    opponent: PlayerState,
    emitEvent: GameEventCallback
  ): boolean {
    const behavior = this.registry[ability.abilityId];

    if (!behavior) {
      console.warn(`[Server] Unknown spell ability ID: ${ability.abilityId}`);
      emitEvent("UNKNOWN_MECHANIC", { abilityId: ability.abilityId, cardTitle: "Заклинание" });
      return false;
    }

    switch (behavior) {
      case AbilityBehavior.DISCOVER:
        return true;
      case AbilityBehavior.SPELL_DAMAGE:
        this.handleSpellDamage(ability.value, targetId, owner, opponent, emitEvent);
        break;
      case AbilityBehavior.SPELL_HEAL:
        this.handleSpellHeal(ability.value, targetId, owner, emitEvent);
        break;
      case AbilityBehavior.SPELL_AOE_ENEMY:
        this.handleSpellAOE(ability.value, opponent, emitEvent);
        break;
      case AbilityBehavior.SPELL_BUFF:
        this.handleSpellBuff(ability.value, targetId, owner, emitEvent);
        break;
      case AbilityBehavior.FREEZE_TARGET:
        this.handleFreeze(targetId, owner, opponent, emitEvent);
        break;
      default:
        console.warn(`[Server] Spell behavior ${behavior} not implemented`);
        emitEvent("UNIMPLEMENTED_MECHANIC", { behavior, cardTitle: "Заклинание" });
    }
    return false;
  }

  private handleSpellDamage(
    value: number,
    targetId: string | undefined,
    owner: PlayerState,
    opponent: PlayerState,
    emitEvent: GameEventCallback
  ) {
    if (targetId === "HERO_ENEMY") {
      this.damageHero(opponent, value, emitEvent, "ENEMY");
    } else if (targetId === "HERO_PLAYER") {
      this.damageHero(owner, value, emitEvent, "PLAYER");
    } else if (targetId) {
      const minion = [...owner.board, ...opponent.board].find((m) => m.uniqueId === targetId);
      if (minion) {
        minion.currentHealth -= value;
        emitEvent("DAMAGE", { targetId, value });
      }
    }
  }

  private handleSpellHeal(value: number, targetId: string | undefined, owner: PlayerState, emitEvent: GameEventCallback) {
    if (targetId === "HERO_PLAYER") {
      owner.heroHealth = Math.min(owner.maxHealth, owner.heroHealth + value);
      emitEvent("HERO_HEALTH", { target: "PLAYER", amount: value });
    } else if (targetId) {
      const minion = owner.board.find((m) => m.uniqueId === targetId);
      if (minion) {
        minion.currentHealth = Math.min(minion.baseHealth + 10, minion.currentHealth + value);
        emitEvent("HEAL", { targetId });
      }
    }
  }

  private handleSpellAOE(value: number, opponent: PlayerState, emitEvent: GameEventCallback) {
    opponent.board.forEach((m) => {
      m.currentHealth -= value;
      emitEvent("DAMAGE", { targetId: m.uniqueId, value });
    });
    emitEvent("AOE_DAMAGE", { value });
  }

  private handleSpellBuff(value: number, targetId: string | undefined, owner: PlayerState, emitEvent: GameEventCallback) {
    if (targetId) {
      const minion = owner.board.find((m) => m.uniqueId === targetId);
      if (minion) {
        minion.currentAttack += value;
        minion.currentHealth += value;
        emitEvent("BUFF", { cardId: targetId });
      }
    }
  }

  private handleFreeze(
    targetId: string | undefined,
    owner: PlayerState,
    opponent: PlayerState,
    emitEvent: GameEventCallback
  ) {
    if (targetId) {
      const minion = [...owner.board, ...opponent.board].find((m) => m.uniqueId === targetId);
      if (minion) {
        minion.isFrozen = true;
        emitEvent("FREEZE", { targetId });
      }
    }
  }

  public generateDiscoverOptions(allCards: CardData[]): CardData[] {
      const options: CardData[] = [];
      const pool = allCards.filter(c => c.isUnlocked && c.rank !== 'DIAMOND');
      while (options.length < 3) {
          const random = pool[Math.floor(Math.random() * pool.length)];
          if (!options.find(o => o.id === random.id)) {
              options.push(random);
          }
      }
      return options;
  }

  public resolveDeathrattles(card: GameCard, owner: PlayerState, opponent: PlayerState, emitEvent: Function) {
      // Placeholder for expansion
  }
}
