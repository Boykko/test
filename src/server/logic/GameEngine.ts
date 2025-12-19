import { PlayerState }                                   from "@/entities/hero/model/types.ts";
import { BattleLogEntry }                                from "@/features/battle/battleReducer.ts";
import { AbilityBehavior, CardData, CardType, GameMode } from "@/shared/types";
import { createGameCard, shuffleDeck }                   from "@/shared/utils";
import { AbilityService }                                from "./AbilityService";
import { AIService }                                     from "./AIService";
import { CombatService }                                 from "./CombatService";
import { initializePlayer }                              from "./gameUtils";
import { TurnManager }                                   from "./TurnManager";

export interface GameState {
  player: PlayerState;
  enemy: PlayerState;
  turn: 'PLAYER' | 'ENEMY';
  battlePhase: 'MULLIGAN' | 'PLAY' | 'GAME_OVER';
  mulliganSelected: string[];
  logs: BattleLogEntry[];
  isCombatResolving: boolean;
  turnEndTime: number;
  fatigue: { PLAYER: number, ENEMY: number };
  pendingChoice: { options: CardData[], side: 'PLAYER' | 'ENEMY' } | null;
}

type EventEmitter = (event: string, payload: any) => void;

export class GameEngine {
  public state: GameState | null = null;
  private registry: Record<string, AbilityBehavior> = {};
  private allCards: CardData[] = [];
  private emit: EventEmitter;
  public aiThinking: boolean = false;
  private turnTimeout: any = null;

  private abilityService: AbilityService;
  private combatService: CombatService;
  private turnManager: TurnManager;
  private aiService: AIService;

  constructor(allCards: CardData[], registry: any, emit: EventEmitter) {
    this.allCards = allCards;
    this.emit = emit;
    registry.forEach((r: any) => this.registry[r.id] = r.behavior);
    this.abilityService = new AbilityService(this.registry);
    this.combatService = new CombatService();
    this.turnManager = new TurnManager();
    this.aiService = new AIService(this.combatService);
  }

  public initGame(deckIds: string[], mode: GameMode = GameMode.STANDARD) {
    const p = initializePlayer(deckIds, this.allCards);
    const e = initializePlayer(this.generateRandomDeck(mode === GameMode.ARENA), this.allCards);

    this.state = {
      player: p,
      enemy: e,
      turn: 'PLAYER',
      battlePhase: 'MULLIGAN',
      mulliganSelected: [],
      logs: [],
      isCombatResolving: false,
      turnEndTime: this.turnManager.getNextTurnEndTime(),
      fatigue: { PLAYER: 0, ENEMY: 0 },
      pendingChoice: null
    };
    
    this.log("Да начнется битва!", 'INFO', 'PLAYER');
    this.resetTurnTimer();
    this.broadcastUpdate();
  }

  public log(message: string, type: BattleLogEntry['type'], turn: 'PLAYER' | 'ENEMY', extra: Partial<BattleLogEntry> = {}) {
    if (!this.state) return;
    const newLog: BattleLogEntry = { 
      id: Math.random().toString(36).substr(2, 9), 
      message, 
      type, 
      turn,
      ...extra 
    };
    this.state.logs = [newLog, ...this.state.logs].slice(0, 20);
  }

  public handleMulliganToggle(cardId: string) {
    if (!this.state || this.state.battlePhase !== 'MULLIGAN') return;
    const index = this.state.mulliganSelected.indexOf(cardId);
    if (index > -1) this.state.mulliganSelected.splice(index, 1); else this.state.mulliganSelected.push(cardId);
    this.broadcastUpdate();
  }

  public handleMulliganConfirm() {
    if (!this.state || this.state.battlePhase !== 'MULLIGAN') return;
    const player = this.state.player;
    const selectedIds = this.state.mulliganSelected;
    const keptCards = player.hand.filter(c => !selectedIds.includes(c.uniqueId));
    const returnedCards = player.hand.filter(c => selectedIds.includes(c.uniqueId));
    player.deck = shuffleDeck([...player.deck, ...returnedCards]);
    const newCards = player.deck.splice(0, returnedCards.length);
    player.hand = [...keptCards, ...newCards];
    this.state.mulliganSelected = [];
    this.state.battlePhase = 'PLAY';
    this.state.turnEndTime = this.turnManager.getNextTurnEndTime();
    this.log("Муллиган завершен", 'INFO', 'PLAYER');
    this.resetTurnTimer();
    this.broadcastUpdate();
  }

  public handlePlayCard(cardId: string, side: 'PLAYER' | 'ENEMY', targetId?: string) {
    if (!this.state || (this.state.battlePhase as string) === 'GAME_OVER' || this.state.pendingChoice) return;
    const actor = side === 'PLAYER' ? this.state.player : this.state.enemy;
    const opponent = side === 'PLAYER' ? this.state.enemy : this.state.player;
    const cardIdx = actor.hand.findIndex(c => c.uniqueId === cardId);
    if (cardIdx === -1) return;
    const card = actor.hand[cardIdx];
    if (actor.mana < card.currentCost) return;
    
    actor.mana -= card.currentCost;
    actor.hand.splice(cardIdx, 1);

    const logType = card.type === CardType.SPELL ? 'SPELL' : 'PLAY';
    this.log(
        card.type === CardType.SPELL ? `Заклинание: ${card.title}` : `Призыв: ${card.title}`, 
        logType, 
        side, 
        { cardSrc: card.src, cardTitle: card.title }
    );

    let triggerChoice = false;

    if (card.type === CardType.MINION) {
      actor.board.push(card);
      triggerChoice = this.abilityService.applyMinionAbilities(card, actor, opponent, this.broadcastEvent.bind(this), this.allCards);
    } else {
      for (const ab of card.abilities) {
         const res = this.abilityService.resolveSpellEffect(ab, targetId, actor, opponent, this.broadcastEvent.bind(this));
         if (res) triggerChoice = true;
      }
      actor.graveyard.push(card);
    }

    this.reapDeadMinions();
    if (this.state.battlePhase === 'GAME_OVER') {
      this.broadcastUpdate();
      return;
    }

    if (triggerChoice) {
        const options = this.abilityService.generateDiscoverOptions(this.allCards);
        this.state.pendingChoice = { options, side };
        this.broadcastEvent('CHOICE_REQUIRED', { options, side });
    }

    this.broadcastEvent('CARD_PLAYED', { cardId, side });
    this.broadcastUpdate();
  }

  public handleChooseCard(cardId: string, side: 'PLAYER' | 'ENEMY') {
      if (!this.state || this.state.battlePhase === 'GAME_OVER' || !this.state.pendingChoice || this.state.pendingChoice.side !== side) return;
      
      const chosenData = this.state.pendingChoice.options.find(o => o.id === cardId);
      if (chosenData) {
          const actor = side === 'PLAYER' ? this.state.player : this.state.enemy;
          if (actor.hand.length < 10) {
              const newCard = createGameCard(chosenData);
              actor.hand.push(newCard);
              this.log(`Раскопки: ${newCard.title}`, 'INFO', side, { cardSrc: newCard.src });
          }
      }

      this.state.pendingChoice = null;
      this.broadcastUpdate();
  }

  public handleUseHeroPower(side: 'PLAYER' | 'ENEMY', targetId?: string) {
    if (!this.state || this.state.battlePhase === 'GAME_OVER' || this.state.pendingChoice) return;
    const actor = side === 'PLAYER' ? this.state.player : this.state.enemy;
    const opponent = side === 'PLAYER' ? this.state.enemy : this.state.player;
    const hp = actor.heroPower;
    
    if (!hp || hp.isUsed || actor.mana < hp.cost) return;

    actor.mana -= hp.cost;
    hp.isUsed = true;

    this.log(`Сила героя: ${hp.name}`, 'SPELL', side, { cardSrc: hp.src });
    
    this.abilityService.resolveSpellEffect(
      { abilityId: hp.behavior, value: hp.value },
      targetId,
      actor,
      opponent,
      this.broadcastEvent.bind(this)
    );

    this.reapDeadMinions();

    this.broadcastEvent('HERO_POWER_USED', { side, targetId });
    this.broadcastUpdate();
  }

  private reapDeadMinions() {
    if (!this.state || this.state.battlePhase === 'GAME_OVER') return;
    
    const checkSide = (side: 'PLAYER' | 'ENEMY') => {
        const pState = side === 'PLAYER' ? this.state!.player : this.state!.enemy;
        const oState = side === 'PLAYER' ? this.state!.enemy : this.state!.player;
        
        const deadMinions = pState.board.filter(m => m.currentHealth <= 0 || (m as any)._isDeadByInstakill);
        if (deadMinions.length > 0) {
            deadMinions.forEach(m => {
                this.log(`Погиб: ${m.title}`, 'DEATH', side, { cardSrc: m.src, cardTitle: m.title });
                this.broadcastEvent('MINION_DEATH', { cardId: m.uniqueId });
                this.abilityService.resolveDeathrattles(m, pState, oState, this.broadcastEvent.bind(this));
            });
            pState.board = pState.board.filter(m => m.currentHealth > 0 && !(m as any)._isDeadByInstakill);
        }
    };

    checkSide('PLAYER');
    checkSide('ENEMY');

    const playerDead = this.state.player.heroHealth <= 0;
    const enemyDead = this.state.enemy.heroHealth <= 0;

    if (playerDead || enemyDead) {
        this.state.battlePhase = 'GAME_OVER';
        let winner: 'PLAYER' | 'ENEMY' | 'DRAW' = 'DRAW';
        if (playerDead && !enemyDead) winner = 'ENEMY';
        else if (!playerDead && enemyDead) winner = 'PLAYER';
        this.emit('GAME_OVER', { winner });
        if (this.turnTimeout) clearTimeout(this.turnTimeout);
    }
  }

  public handleAttack(attackerId: string, targetId: string, side: 'PLAYER' | 'ENEMY') {
    if (!this.state || (this.state.battlePhase as string) === 'GAME_OVER' || this.state.pendingChoice) return;
    const attackerOwner = side === 'PLAYER' ? this.state.player : this.state.enemy;
    const targetOwner = side === 'PLAYER' ? this.state.enemy : this.state.player;
    const attacker = attackerOwner.board.find(c => c.uniqueId === attackerId);
    
    if (!attacker) return;
    if (!this.combatService.canAttackTarget(attacker, targetId, targetOwner)) return;

    this.broadcastEvent('ATTACK_INIT', { attackerId, targetId, isPlayer: side === 'PLAYER' });

    if (targetId === 'HERO_ENEMY' || targetId === 'HERO_PLAYER') {
      const targetHero = targetId === 'HERO_ENEMY' ? this.state.enemy : this.state.player;
      
      const dmg = attacker.currentAttack;
      if (targetHero.heroArmor >= dmg) {
          targetHero.heroArmor -= dmg;
      } else {
          const remaining = dmg - targetHero.heroArmor;
          targetHero.heroArmor = 0;
          targetHero.heroHealth -= remaining;
      }
      
      this.log(`${attacker.title} бьет Героя`, 'ATTACK', side, { 
          cardSrc: attacker.src, 
          cardTitle: attacker.title, 
          targetTitle: 'Герой',
          targetSrc: 'hero_portrait.jpg',
          value: dmg 
      });

      if (attacker.hasLifesteal) {
          attackerOwner.heroHealth = Math.min(attackerOwner.maxHealth, attackerOwner.heroHealth + dmg);
          this.broadcastEvent('HERO_HEALTH', { target: side, amount: dmg, isLifesteal: true });
      }

      this.broadcastEvent('HERO_HEALTH', { target: targetId === 'HERO_ENEMY' ? 'ENEMY' : 'PLAYER', amount: -dmg });
    } else {
      const target = targetOwner.board.find(c => c.uniqueId === targetId);
      if (target) {
        const outcome = this.combatService.calculateCombat(attacker, target);
        
        target.currentHealth = outcome.targetHealthRemaining;
        attacker.currentHealth = outcome.attackerHealthRemaining;
        
        if (outcome._targetDeadByInstakill) (target as any)._isDeadByInstakill = true;
        if (outcome._attackerDeadByInstakill) (attacker as any)._isDeadByInstakill = true;

        if (attacker.hasPoison && attacker.attacksMade === 0) {
            target.poisonDuration = 3;
        }

        this.broadcastEvent('DAMAGE', { targetId, value: outcome.damageToTarget, isInstakill: attacker.isInstakill });
        this.broadcastEvent('DAMAGE', { targetId: attackerId, value: outcome.damageToAttacker, isInstakill: target.isInstakill });

        if (attacker.hasLifesteal && outcome.damageToTarget > 0) {
            attackerOwner.heroHealth = Math.min(attackerOwner.maxHealth, attackerOwner.heroHealth + outcome.damageToTarget);
            this.broadcastEvent('HERO_HEALTH', { target: side, amount: outcome.damageToTarget, isLifesteal: true });
        }
      }
    }
    
    this.reapDeadMinions();
    
    if (this.state.battlePhase !== 'GAME_OVER') {
        const aliveAttacker = attackerOwner.board.find(c => c.uniqueId === attackerId);
        if (aliveAttacker) {
            aliveAttacker.attacksMade++;
            aliveAttacker.canAttack = aliveAttacker.attacksMade < aliveAttacker.maxAttacks && !aliveAttacker.isFrozen;
        }
    }
    this.broadcastUpdate();
  }

  public handleEndTurn(actor: 'PLAYER' | 'ENEMY') {
    if (!this.state || (this.state.battlePhase as string) === 'GAME_OVER' || this.state.turn !== actor || this.state.pendingChoice) return;
    this.state.turn = this.state.turn === 'PLAYER' ? 'ENEMY' : 'PLAYER';
    const activePlayer = this.state.turn === 'PLAYER' ? this.state.player : this.state.enemy;
    
    if (activePlayer.deck.length === 0) {
        this.state.fatigue[this.state.turn]++;
        const dmg = this.state.fatigue[this.state.turn];
        activePlayer.heroHealth -= dmg;
        this.broadcastEvent('FATIGUE_DAMAGE', { side: this.state.turn, value: dmg });
        this.reapDeadMinions();
    } else {
        this.turnManager.prepareNewTurn(activePlayer, (type, data) => this.broadcastEvent(type, data));
        this.reapDeadMinions();
    }

    if (this.state.battlePhase !== 'GAME_OVER') {
        this.state.turnEndTime = this.turnManager.getNextTurnEndTime();
        this.resetTurnTimer();
        this.broadcastUpdate();
        if (this.state.turn === 'ENEMY') this.runAITurn();
    } else {
        this.broadcastUpdate();
    }
  }

  public handleEmote(emoji: string, side: 'PLAYER' | 'ENEMY') {
      this.emit('EMOTE_RECEIVED', { emoji, side });
  }

  public handleDevUpdateCard(updatedCard: any) {
    if (!this.state) return;

    const updateInList = (list: any[]) => {
      const idx = list.findIndex(c => c.uniqueId === updatedCard.uniqueId);
      if (idx !== -1) {
        // Apply the raw updates first
        const card = { ...list[idx], ...updatedCard };
        
        // Synchronize flags with abilities (e.g. if TAUNT was added to abilities array)
        this.abilityService.applyMinionAbilities(card, this.state!.player, this.state!.enemy, () => {}, this.allCards);
        
        list[idx] = card;
        return true;
      }
      return false;
    };

    // Поиск и обновление везде
    let found = false;
    found = found || updateInList(this.state.player.hand);
    found = found || updateInList(this.state.player.board);
    found = found || updateInList(this.state.player.deck);
    found = found || updateInList(this.state.enemy.hand);
    found = found || updateInList(this.state.enemy.board);
    found = found || updateInList(this.state.enemy.deck);

    if (found) {
        this.broadcastUpdate();
        this.broadcastEvent('VFX', { type: 'BUFF', targetId: updatedCard.uniqueId });
    }
  }

  private async runAITurn() {
    if (!this.state || this.state.turn !== 'ENEMY' || this.aiThinking) return;
    this.aiThinking = true;
    await new Promise(r => setTimeout(r, 1000));
    const actions = this.aiService.calculateTurn(this.state.enemy, this.state.player);
    for (const action of actions) {
        if (!this.state || this.state.turn !== 'ENEMY' || this.state.battlePhase === 'GAME_OVER') break;
        if (action.type === 'PLAY') this.handlePlayCard(action.cardId, 'ENEMY', action.targetId);
        else if (action.type === 'ATTACK') this.handleAttack(action.attackerId, action.targetId, 'ENEMY');
        await new Promise(r => setTimeout(r, 800));
    }
    if (this.state && this.state.turn === 'ENEMY' && this.state.battlePhase !== 'GAME_OVER') this.handleEndTurn('ENEMY');
    this.aiThinking = false;
  }

  private broadcastUpdate() {
    if (!this.state) return;
    this.emit("GAME_UPDATE", JSON.parse(JSON.stringify(this.state)));
  }

  private broadcastEvent(type: string, data?: any) {
    if (type === "UNKNOWN_MECHANIC") {
      this.log(
        `[!] Карта "${data.cardTitle}" использует неизвестную механику "${data.abilityId}"`,
        "WARNING",
        this.state?.turn || "PLAYER"
      );
    } else if (type === "UNIMPLEMENTED_MECHANIC") {
      this.log(
        `[!] Механика "${data.behavior}" в карте "${data.cardTitle}" еще не реализована`,
        "WARNING",
        this.state?.turn || "PLAYER"
      );
    }
    this.emit("BATTLE_EVENT", { type, ...data });
  }

  private resetTurnTimer() {
      if (this.turnTimeout) clearTimeout(this.turnTimeout);
      this.turnTimeout = setTimeout(() => {
          if (this.state && this.state.battlePhase === 'PLAY') this.handleEndTurn(this.state.turn);
      }, 30000);
  }

  private generateRandomDeck(highTier: boolean): string[] {
      const pool = highTier ? this.allCards.filter(c => c.rank !== 'BRONZE') : this.allCards;
      return Array.from({length: 30}, () => pool[Math.floor(Math.random() * pool.length)].id);
  }
}
