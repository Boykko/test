import { GameCard }                          from "@/entities/card/model/types.ts";
import { motion }                            from "framer-motion";
import { Skull, Swords }                     from "lucide-react";
import React, { memo, useEffect }            from "react";
import { CardFrame }                         from "@/entities/card/ui/CardFrame.tsx";
import { CardAnimationType } from "@/entities/card/model/animations";
import { useCardEffects } from "@/shared/hooks/useCardEffects";
import { useCardVisuals }                    from "@/shared/hooks/useCardVisuals";
import { domRegistry }                       from "@/shared/lib/domRegistry";
import { cn }                                from "@/shared/utils";

interface BattleCardProps {
  data: GameCard;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isInteractable?: boolean;
  isTargetable?: boolean;
  isSelected?: boolean;
  tooltipDirection?: 'top' | 'bottom' | 'left' | 'right';
  onClick?: (e: React.MouseEvent) => void;
  animation?: CardAnimationType;
  combatPreview?: { willDie: boolean; damageTaken: number; };
  onContextMenu?: (e: React.MouseEvent) => void;
}

const BattleCardComponent: React.FC<BattleCardProps> = ({
  data, size = 'md', isInteractable = false, isTargetable = false, isSelected = false, tooltipDirection = 'right', onClick, animation = null, combatPreview, onContextMenu
}) => {
  const visuals = useCardVisuals(data, size);
  const effects = useCardEffects(animation, isSelected);
  
  useEffect(() => {
    if (data.uniqueId && visuals.containerRef.current) {
      domRegistry.register(data.uniqueId, visuals.containerRef.current);
    }
    return () => { if (data.uniqueId) domRegistry.unregister(data.uniqueId); };
  }, [data.uniqueId, visuals.containerRef]);

  const isDead = data.currentHealth <= 0;

  return (
    <motion.div
        variants={effects.variants}
        initial="idle"
        animate={animation || (isSelected ? 'idle' : undefined)}
        className={cn(
            "relative transition-opacity duration-200 transform-gpu",
            isDead && animation !== 'die' && "opacity-0 pointer-events-none scale-0"
        )}
        style={{ transformStyle: 'preserve-3d' }}
        data-card-id={data.uniqueId}
        onContextMenu={onContextMenu}
    >
        <CardFrame
            data={data}
            size={size}
            keywords={{ 
                ...visuals.keywords, 
                hasDivineShield: data.hasDivineShield || visuals.keywords.hasDivineShield,
                isFrozen: data.isFrozen || visuals.keywords.isFrozen 
            }}
            stats={{ 
                attack: data.currentAttack, 
                health: data.currentHealth, 
                cost: data.currentCost, 
                armor: data.currentArmor 
            }}
            isSpell={visuals.isSpell}
            activeRank={visuals.activeRank}
            resolvedAbilities={visuals.resolvedAbilities}
            containerRef={visuals.containerRef}
            cardBodyRef={visuals.cardBodyRef}
            bgRef={visuals.bgRef}
            glareRef={visuals.glareRef}
            onMouseMove={visuals.handleMouseMove}
            onMouseLeave={visuals.handleMouseLeave}
            onClick={onClick}
            isInteractable={isInteractable && !isDead}
            isSelected={isSelected}
            canAttack={data.canAttack && !isDead}
            tooltipDirection={tooltipDirection}
            className={isTargetable ? "animate-pulse-red ring-4 ring-rose-500 rounded-xl" : ""}
        >
            {combatPreview && !isDead && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-xl animate-fade-in">
                    {combatPreview.willDie ? (
                        <div className="bg-red-950/80 border-2 border-red-500 p-2 rounded-full animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.6)]">
                             <Skull className="text-red-200 w-8 h-8 md:w-10 md:h-10" />
                        </div>
                    ) : (
                        <div className="text-3xl font-black text-red-500 drop-shadow-[0_2px_2px_rgba(0,0,0,1)] stroke-white">-{combatPreview.damageTaken}</div>
                    )}
                </div>
            )}
            {effects.isAttacking && (
                <div className="absolute inset-0 z-50 flex items-center justify-center animate-in fade-in zoom-in duration-300">
                     <div className="bg-black/60 p-3 rounded-full border-2 border-white/20 backdrop-blur-sm shadow-[0_0_30px_rgba(0,0,0,0.8)]"><Swords size={48} className="text-slate-100 fill-slate-800" /></div>
                </div>
            )}
        </CardFrame>
    </motion.div>
  );
};

export const BattleCard = memo(BattleCardComponent);
