import { AnimatePresence, motion } from "framer-motion";
import React                       from "react";
import { GameCard }                          from "@/entities/card/model/types.ts";
import { CombatPreview }           from "../model/useTargeting";
import { DuelState }               from "../useBattleVisuals";
import { BattleCard }              from "./BattleCard";

interface MinionRowProps {
  cards: GameCard[];
  onCardClick?: (card: GameCard) => void;
  onCardMouseDown?: (e: React.MouseEvent, card: GameCard) => void;
  onCardContextMenu?: (e: React.MouseEvent, card: GameCard) => void;
  onCardHover?: (id: string) => void;
  onCardLeave?: () => void;
  combatPreview?: CombatPreview | null;
  isInteractable: (card: GameCard) => boolean;
  isTargetable?: (card: GameCard) => boolean;
  isSelected: (card: GameCard) => boolean;
  animatingCards: Record<string, string>;
  align?: 'start' | 'end' | 'center';
  cardSize?: 'xs' | 'sm' | 'md' | 'lg';
  tooltipDirection?: 'top' | 'bottom';
  duelState?: DuelState | null;
}

const MinionRowComponent: React.FC<MinionRowProps> = ({ 
  cards, onCardMouseDown, onCardContextMenu, onCardHover, onCardLeave, combatPreview, isInteractable, isTargetable, isSelected, animatingCards, align = 'center', cardSize = 'md', tooltipDirection = 'top', duelState
}) => {
  const gapClass = cardSize === 'xs' ? 'gap-2' : 'gap-4 md:gap-6';
  const justifyClass = align === 'start' ? 'justify-start' : (align === 'end' ? 'justify-end' : 'justify-center');
  
  return (
    <div className={`w-full flex ${justifyClass} ${gapClass} px-2 md:px-8 perspective-1000`}>
      <AnimatePresence mode="popLayout">
        {cards.map(card => {
          const isAnimating = !!animatingCards[card.uniqueId];
          const isInteract = isInteractable(card);
          const isTarget = isTargetable?.(card);
          const isDueling = duelState && (duelState.attackerId === card.uniqueId || duelState.targetId === card.uniqueId);
          const showPreview = combatPreview && (combatPreview as any).targetId === card.uniqueId;

          return (
            <motion.div 
                key={card.uniqueId} 
                layout
                layoutId={card.uniqueId}
                data-target-id={card.uniqueId} 
                className="relative will-change-transform"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: isDueling ? 0 : 1, zIndex: isSelected(card) || isAnimating ? 50 : 0 }}
                exit={{ 
                    scale: 0.5, 
                    opacity: 0, 
                    filter: "blur(20px)",
                    transition: { duration: 0.8 } 
                }}
                whileHover={{ zIndex: 100, transition: { duration: 0.1 } }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onMouseEnter={() => isInteract && onCardHover?.(card.uniqueId)}
                onMouseLeave={() => isInteract && onCardLeave?.()}
            >
                <BattleCard 
                    data={card} 
                    size={cardSize}
                    isInteractable={isInteract && !isDueling}
                    isTargetable={isTarget}
                    isSelected={isSelected(card)}
                    onClick={onCardMouseDown ? (e) => onCardMouseDown(e, card) : undefined} 
                    onContextMenu={(e) => onCardContextMenu?.(e, card)}
                    animation={animatingCards[card.uniqueId] as any || null}
                    tooltipDirection={tooltipDirection}
                    combatPreview={showPreview ? { willDie: combatPreview!.isTargetLethal, damageTaken: combatPreview!.damageToTarget } : undefined}
                 />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export const MinionRow = React.memo(MinionRowComponent);
