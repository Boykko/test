import { AnimatePresence, motion } from "framer-motion";
import { Lock }                    from "lucide-react";
import React                       from "react";
import { GameCard }                          from "@/entities/card/model/types.ts";
import { BattleCard }              from "./BattleCard";

interface BattleHandProps {
  hand: GameCard[];
  mana: number;
  isMyTurn: boolean;
  onCardClick: (e: React.MouseEvent, card: GameCard) => void;
  onCardContextMenu?: (e: React.MouseEvent, card: GameCard) => void;
  cardSize?: 'xs' | 'sm' | 'md';
}

const BattleHandComponent: React.FC<BattleHandProps> = ({ hand, mana, isMyTurn, onCardClick, onCardContextMenu, cardSize = 'md' }) => {
  // Calculate dynamic spacing and rotation based on hand size
  const cardCount = hand.length;
  const maxSpread = cardSize === 'xs' ? 40 : 60;
  const spreadPerCard = Math.min(maxSpread, 400 / Math.max(1, cardCount));
  
  return (
    <div className="flex items-end justify-center w-full h-full pointer-events-none perspective-1000">
      <div 
        className="flex items-end justify-center pointer-events-auto relative h-full"
        style={{ width: `${cardCount * spreadPerCard + (cardSize === 'xs' ? 60 : 120)}px` }}
      >
        <AnimatePresence mode="popLayout">
          {hand.map((card, idx) => {
            const canAfford = mana >= card.currentCost;
            const isPlayable = isMyTurn && canAfford;
            
            // Hearthstone-like arc math
            const centerIndex = (cardCount - 1) / 2;
            const relativeIndex = idx - centerIndex;
            const rotation = relativeIndex * (20 / Math.max(1, centerIndex || 1));
            const translateY = Math.abs(relativeIndex) * (cardCount > 5 ? 8 : 4);
            const translateX = relativeIndex * spreadPerCard;

            return (
              <motion.div 
                key={card.uniqueId} 
                layout
                layoutId={card.uniqueId}
                // Animates from the right-middle (deck position)
                // y is negative to move UP from the bottom-centered hand origin
                initial={{ x: 600, y: -400, opacity: 0, scale: 0.3, rotate: 45 }}
                animate={{
                  x: translateX,
                  y: translateY,
                  rotate: rotation,
                  opacity: 1,
                  zIndex: 10 + idx,
                  scale: 1,
                  filter: canAfford ? 'none' : 'grayscale(0.8) brightness(0.6)'
                }}
                exit={{ 
                  y: 300, 
                  opacity: 0, 
                  scale: 0.5,
                  transition: { duration: 0.2 } 
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 180, 
                  damping: 20,
                  mass: 1.2 // Heavier mass for "weighted" draw feel
                }}
                whileHover={{ 
                  y: -50, // Lift high to see stats
                  scale: 1.1,
                  rotate: 0,
                  zIndex: 100,
                  filter: 'brightness(1.1) drop-shadow(0 0 30px rgba(59,130,246,0.5))',
                  // transition: { duration: 0.2, type: 'spring', stiffness: 400 }
                }}
                className="absolute bottom-4 will-change-transform"
                style={{ transformOrigin: 'bottom center' }}
              >
                <div className="relative">
                  <BattleCard 
                    data={card} 
                    size={cardSize}
                    isInteractable={isPlayable}
                    onClick={(e) => onCardClick(e, card)}
                    onContextMenu={(e) => onCardContextMenu?.(e, card)}
                    tooltipDirection="top"
                  />
                  
                  {!canAfford && (
                    <div className="absolute inset-0 bg-slate-950/40 rounded-xl backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-50">
                      <Lock className="text-slate-400/80 w-6 h-6" />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const BattleHand = React.memo(BattleHandComponent);
