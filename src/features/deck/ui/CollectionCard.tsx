import { DISENCHANT_VALUES }                                                               from "@/shared/config/ranks.ts";
import { ArrowUpCircle, Diamond, Hammer, Lock, MinusCircle, PlusCircle, Sparkles, Trash2 } from "lucide-react";
import React                                                                               from "react";
import {
    CardFrame,
}                                                                                          from "@/entities/card/ui/CardFrame";
import {
    useCardVisuals,
}                                                                                          from "@/shared/hooks/useCardVisuals";
import { CardData }                                                                        from "@/shared/types";

interface CollectionCardProps {
  data: CardData;
  inventoryCount: number;
  countInDeck: number;
  onClick?: () => void;
  onRemove?: () => void;
  isDeckFull?: boolean;
  onCraft?: () => void;
  onDisenchant?: () => void;
  onUpgrade?: () => void;
  canUpgrade?: boolean;
  craftCost: number;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({ 
  data, inventoryCount, countInDeck, onClick, onRemove, isDeckFull = false,
  onCraft, onDisenchant, onUpgrade, canUpgrade, craftCost
}) => {
  const visuals = useCardVisuals(data, 'md');
  const isOwned = inventoryCount > 0;
  const isDeckMaxed = countInDeck >= 2 || countInDeck >= inventoryCount;
  
  return (
    <div className="relative flex flex-col items-center group/card isolate h-full">
       <div 
         className={`
            relative transition-all duration-300 z-10 
            ${!isOwned ? 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0' : (isDeckMaxed ? 'opacity-60' : 'hover:scale-105 hover:-translate-y-2')}
            cursor-pointer transform-gpu
         `}
         onClick={(!isDeckMaxed && !isDeckFull && isOwned) ? onClick : undefined}
       >
         <CardFrame
            data={data}
            size="md"
            keywords={visuals.keywords}
            stats={{ attack: data.baseAttack, health: data.baseHealth, cost: data.baseCost, armor: data.baseArmor }}
            isSpell={visuals.isSpell}
            activeRank={visuals.activeRank}
            resolvedAbilities={visuals.resolvedAbilities}

            containerRef={visuals.containerRef}
            cardBodyRef={visuals.cardBodyRef}
            bgRef={visuals.bgRef}
            glareRef={visuals.glareRef}
            onMouseMove={visuals.handleMouseMove}
            onMouseLeave={visuals.handleMouseLeave}
            isInteractable={false}
            tooltipDirection="right"
         />
         
         {isOwned && (
             <div className="absolute -top-3 -right-3 bg-slate-900/90 text-amber-500 font-bold border border-amber-500/30 rounded-full w-8 h-8 flex items-center justify-center text-xs shadow-[0_0_10px_rgba(245,158,11,0.2)] z-20 pointer-events-none backdrop-blur-md">
                 x{inventoryCount}
             </div>
         )}

         {countInDeck > 0 && (
            <div className="absolute -top-3 -left-3 bg-blue-600 text-white font-bold border border-blue-400/50 rounded-full w-8 h-8 flex items-center justify-center text-xs shadow-[0_0_10px_rgba(37,99,235,0.4)] z-20 pointer-events-none">
                {countInDeck}/2
            </div>
         )}
         
         {/* Add/Remove Overlay on Hover */}
         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none z-10">
            {isOwned && !isDeckMaxed && !isDeckFull && (
                <div className="bg-slate-950/80 rounded-full p-2 backdrop-blur-sm border border-green-500/30 shadow-2xl pointer-events-auto active:scale-90 transition-transform">
                    <PlusCircle className="text-green-400 w-8 h-8" strokeWidth={1.5} />
                </div>
            )}
            
            {countInDeck > 0 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
                  className="absolute bottom-4 bg-red-950/90 rounded-full p-2 backdrop-blur-sm border border-red-500/50 shadow-2xl pointer-events-auto hover:bg-red-600 transition-colors"
                >
                    <MinusCircle className="text-white w-6 h-6" strokeWidth={2} />
                </button>
            )}
         </div>
         
         {!isOwned && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                 <Lock className="text-slate-500 w-10 h-10 opacity-70 drop-shadow-lg" />
             </div>
         )}
       </div>

       <div className="w-full mt-3 z-50 relative px-1 h-10 flex items-center justify-center">
           {!isOwned ? (
               <button 
                 onClick={(e) => { e.stopPropagation(); onCraft?.(); }}
                 className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-900 to-emerald-800 hover:from-emerald-600 hover:to-emerald-500 border border-emerald-500/50 text-emerald-100 text-[10px] font-bold py-2 rounded-lg"
               >
                  <Hammer size={12} /> <span>{craftCost}</span> <Diamond size={10} className="text-blue-300" />
               </button>
           ) : (
               <div className="flex gap-2 w-full justify-center">
                   <button 
                     onClick={(e) => { e.stopPropagation(); onDisenchant?.(); }}
                     className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-950/80 hover:bg-red-800 border border-red-500/40 text-red-300"
                     title={`Распылить (+${DISENCHANT_VALUES[data.rank]})`}
                   >
                       <Trash2 size={14} />
                       <span className="text-[10px] font-mono">+{DISENCHANT_VALUES[data.rank]}</span>
                   </button>
                   {canUpgrade && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onUpgrade?.(); }}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-amber-700/60 hover:bg-amber-500 border border-amber-500/40 text-amber-200 animate-pulse"
                        >
                            <ArrowUpCircle size={14} />
                            <Sparkles size={10} />
                        </button>
                   )}
               </div>
           )}
       </div>
    </div>
  );
};
