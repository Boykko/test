import { GameCard }                                  from "@/entities/card/model/types.ts";
import { PlayerState }                               from "@/entities/hero/model/types.ts";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AbilityBehavior,
    AbilityDefinition,
    CardType,
    HeroPower,
    TargetRequirement,
}                                                    from "@/shared/types";

interface UseTargetingProps {
  player: PlayerState;
  enemy: PlayerState;
  abilitiesRegistry: AbilityDefinition[];
  playCard: (card: GameCard, targetId?: string) => void;
  useHeroPower: (targetId?: string) => void;
  runCombatSequence: (attackerId: string, targetId: string) => void;
  turn: 'PLAYER' | 'ENEMY';
  battlePhase: string;
  sounds: any;
  setMessage: (msg: string) => void;
  setSelectedCardId: (id: string | null) => void;
}

export interface CombatPreview {
  targetId: string;
  damageToTarget: number;
  isTargetLethal: boolean;
  damageToSource: number;
  isSourceLethal: boolean;
}

export const useTargeting = ({
  player,
  enemy,
  abilitiesRegistry,
  playCard,
  useHeroPower,
  runCombatSequence,
  turn,
  battlePhase,
  sounds,
  setMessage,
  setSelectedCardId
}: UseTargetingProps) => {
  const [targetingSourceId, setTargetingSourceId] = useState<string | null>(null);
  const [startPos, setStartPos] = useState<{x: number, y: number} | null>(null);
  const [hoveredTargetId, setHoveredTargetId] = useState<string | null>(null);

  // Resets all targeting state
  const cancelTargeting = useCallback(() => {
    setTargetingSourceId(null);
    setStartPos(null);
    setHoveredTargetId(null);
  }, []);

  const checkNeedsTarget = useCallback((source: GameCard | HeroPower): boolean => {
      const isHeroPower = (source as HeroPower).cost !== undefined && (source as any).uniqueId === undefined;
      
      if (isHeroPower) {
        const hp = source as HeroPower;
        return [AbilityBehavior.SPELL_DAMAGE, AbilityBehavior.SPELL_HEAL, AbilityBehavior.SPELL_BUFF, AbilityBehavior.FREEZE_TARGET].includes(hp.behavior);
      }

      const card = source as GameCard;
      const defs = card.abilities.map(a => abilitiesRegistry.find(r => r.id === a.abilityId)).filter(Boolean) as AbilityDefinition[];
      if (card.type === CardType.SPELL) {
          return defs.some(d => 
             [AbilityBehavior.SPELL_DAMAGE, AbilityBehavior.SPELL_HEAL, AbilityBehavior.SPELL_BUFF, AbilityBehavior.FREEZE_TARGET].includes(d.behavior)
          );
      }
      return false;
  }, [abilitiesRegistry]);

  const getValidTargets = useCallback((sourceId: string) => {
      const ids = new Set<string>();

      // Check if it's Hero Power
      if (sourceId === 'HERO_POWER_PLAYER') {
        const hp = player.heroPower;
        if (!hp) return ids;
        
        if (hp.behavior === AbilityBehavior.SPELL_HEAL) {
          player.board.forEach(c => ids.add(c.uniqueId));
          ids.add('HERO_PLAYER');
        } else if (hp.behavior === AbilityBehavior.SPELL_DAMAGE) {
          enemy.board.forEach(c => ids.add(c.uniqueId));
          ids.add('HERO_ENEMY');
        }
        return ids;
      }

      const sourceCard = player.hand.find(c => c.uniqueId === sourceId) || player.board.find(c => c.uniqueId === sourceId);
      if (!sourceCard) return ids;
      
      if (sourceCard.type === CardType.SPELL) {
          // Spells ignore Taunt priority
          const defs = sourceCard.abilities.map(a => abilitiesRegistry.find(r => r.id === a.abilityId)).filter(Boolean) as AbilityDefinition[];
          const targetDef = defs.find(d => 
             [AbilityBehavior.SPELL_DAMAGE, AbilityBehavior.SPELL_HEAL, AbilityBehavior.SPELL_BUFF, AbilityBehavior.FREEZE_TARGET].includes(d.behavior)
          );

          if (targetDef) {
              let req = targetDef.targetRequirement;
              const isBuff = targetDef.behavior === AbilityBehavior.SPELL_BUFF; 

              if (req === TargetRequirement.FRIENDLY || req === TargetRequirement.ANY) {
                  player.board.forEach(c => ids.add(c.uniqueId));
                  if (!isBuff) ids.add('HERO_PLAYER'); 
              }

              if (req === TargetRequirement.ENEMY || req === TargetRequirement.ANY) {
                  enemy.board.forEach(c => ids.add(c.uniqueId));
                  if (!isBuff) ids.add('HERO_ENEMY');
              }
          }

      } else {
          // Physical attacks MUST respect Taunt
          const taunts = enemy.board.filter(c => c.isTaunt);
          
          if (taunts.length > 0) {
              // Only Taunt minions are valid targets. Hero is BLOCKED.
              taunts.forEach(c => ids.add(c.uniqueId));
          } else {
              // Standard behavior: anything on the enemy board or the enemy hero
              enemy.board.forEach(c => ids.add(c.uniqueId));
              ids.add('HERO_ENEMY');
          }
      }
      return ids;
  }, [player, enemy, abilitiesRegistry]);

  const validTargetIds = useMemo(() => {
      if (!targetingSourceId) return new Set<string>();
      return getValidTargets(targetingSourceId);
  }, [targetingSourceId, getValidTargets]);

  // Calculates the combat outcome for visual feedback before committing the action
  const combatPreview = useMemo((): CombatPreview | null => {
    if (!targetingSourceId || !hoveredTargetId || !validTargetIds.has(hoveredTargetId)) return null;

    const source = player.hand.find(c => c.uniqueId === targetingSourceId) || 
                   player.board.find(c => c.uniqueId === targetingSourceId);
    
    // Hero Power Preview
    if (targetingSourceId === 'HERO_POWER_PLAYER') {
        const hp = player.heroPower;
        if (!hp || (hp.behavior !== AbilityBehavior.SPELL_DAMAGE && hp.behavior !== AbilityBehavior.SPELL_HEAL)) return null;
        
        let targetHealth = 0;
        if (hoveredTargetId === 'HERO_ENEMY') targetHealth = enemy.heroHealth;
        else if (hoveredTargetId === 'HERO_PLAYER') targetHealth = player.heroHealth;
        else {
            const minion = [...enemy.board, ...player.board].find(m => m.uniqueId === hoveredTargetId);
            if (minion) targetHealth = minion.currentHealth;
        }

        return {
            targetId: hoveredTargetId,
            damageToTarget: hp.value,
            isTargetLethal: hp.behavior === AbilityBehavior.SPELL_DAMAGE && hp.value >= targetHealth,
            damageToSource: 0,
            isSourceLethal: false
        };
    }

    // Spell Preview
    if (!source || source.type === CardType.SPELL) {
        if (source && source.type === CardType.SPELL) {
             const damageAb = source.abilities.find(a => abilitiesRegistry.find(r => r.id === a.abilityId)?.behavior === AbilityBehavior.SPELL_DAMAGE);
             if (!damageAb) return null;

             let targetHealth = 0;
             if (hoveredTargetId === 'HERO_ENEMY') targetHealth = enemy.heroHealth;
             else if (hoveredTargetId === 'HERO_PLAYER') targetHealth = player.heroHealth;
             else {
                 const minion = [...player.board, ...enemy.board].find(m => m.uniqueId === hoveredTargetId);
                 if (minion) targetHealth = minion.currentHealth;
             }

             return {
                 targetId: hoveredTargetId,
                 damageToTarget: damageAb.value,
                 isTargetLethal: damageAb.value >= targetHealth,
                 damageToSource: 0,
                 isSourceLethal: false
             };
        }
        return null;
    }

    // Physical Combat Preview
    const attacker = source;
    let targetHealth = 0;
    let targetAttack = 0;

    if (hoveredTargetId === 'HERO_ENEMY') {
        targetHealth = enemy.heroHealth;
        targetAttack = 0;
    } else {
        const targetMinion = enemy.board.find(m => m.uniqueId === hoveredTargetId);
        if (!targetMinion) return null;
        targetHealth = targetMinion.currentHealth;
        targetAttack = targetMinion.currentAttack;
    }

    return {
        targetId: hoveredTargetId,
        damageToTarget: attacker.currentAttack,
        isTargetLethal: attacker.currentAttack >= targetHealth,
        damageToSource: targetAttack,
        isSourceLethal: targetAttack >= attacker.currentHealth
    };
  }, [targetingSourceId, hoveredTargetId, validTargetIds, player, enemy, abilitiesRegistry]);

  const onHoverTarget = (id: string) => setHoveredTargetId(id);
  const onLeaveTarget = () => setHoveredTargetId(null);

  const handleHandClick = (e: React.MouseEvent, card: GameCard) => {
    e.stopPropagation();
    if (turn !== 'PLAYER' || battlePhase !== 'PLAY') return;

    if (checkNeedsTarget(card)) {
        setTargetingSourceId(card.uniqueId);
        setStartPos({ x: e.clientX, y: e.clientY });
        sounds?.playSfx('click');
    } else {
        playCard(card);
    }
  };

  const handleHeroPowerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (turn !== 'PLAYER' || battlePhase !== 'PLAY') return;
    const hp = player.heroPower;
    if (!hp || hp.isUsed || player.mana < hp.cost) return;

    if (checkNeedsTarget(hp)) {
        setTargetingSourceId('HERO_POWER_PLAYER');
        setStartPos({ x: e.clientX, y: e.clientY });
        sounds?.playSfx('click');
    } else {
        useHeroPower();
    }
  };

  const handlePlayerMinionClick = (e: React.MouseEvent, card: GameCard) => {
    e.stopPropagation();
    if (turn !== 'PLAYER' || battlePhase !== 'PLAY' || !card.canAttack) return;

    setTargetingSourceId(card.uniqueId);
    setStartPos({ x: e.clientX, y: e.clientY });
    sounds?.playSfx('click');
  };

  const handleTargetClick = (targetId: string, isHero: boolean = false) => {
    if (!targetingSourceId) return;

    if (!validTargetIds.has(targetId)) {
        if (enemy.board.some(c => c.isTaunt)) {
            setMessage("Сначала уничтожьте стражей (Провокация)!");
        } else {
            setMessage("Недопустимая цель");
        }
        sounds?.playSfx('click');
        return;
    }

    if (targetingSourceId === 'HERO_POWER_PLAYER') {
      useHeroPower(targetId);
    } else {
      const cardInHand = player.hand.find(c => c.uniqueId === targetingSourceId);
      if (cardInHand) {
          playCard(cardInHand, targetId); 
      } else {
          runCombatSequence(targetingSourceId, targetId);
      }
    }

    cancelTargeting();
  };

  return {
      targetingSourceId,
      startPos,
      validTargetIds,
      combatPreview,
      handleHandClick,
      handleHeroPowerClick,
      handlePlayerMinionClick,
      handleTargetClick,
      cancelTargeting,
      onHoverTarget,
      onLeaveTarget
  };
};
