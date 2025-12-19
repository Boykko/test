import { GameCard }   from "@/entities/card/model/types.ts";
import { motion }     from "framer-motion";
import { Layers, X }  from "lucide-react";
import React          from "react";
import { BattleCard } from "./BattleCard";

interface DeckContentsOverlayProps {
  cards: GameCard[];
  onClose: () => void;
}

export const DeckContentsOverlay: React.FC<DeckContentsOverlayProps> = ({ cards, onClose }) => {
  // Sort cards by cost for better visual organization
  const sortedCards = [...cards].sort((a, b) => a.baseCost - b.baseCost);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 md:p-8"
      onClick={onClose}
    >
        <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-6xl h-full flex flex-col bg-slate-900/40 border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 text-amber-500">
                        <Layers size={24} />
                        <h2 className="text-2xl md:text-3xl font-fantasy uppercase tracking-widest">Оставшиеся в колоде</h2>
                    </div>
                    <p className="text-slate-500 text-xs md:text-sm uppercase tracking-widest">Карты отсортированы по стоимости маны</p>
                </div>
                <button 
                  onClick={onClose} 
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5 active:scale-95"
                >
                    <X size={28} />
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
                {sortedCards.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                        <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center border border-white/5">
                            <Layers size={40} className="opacity-20" />
                        </div>
                        <p className="italic text-lg">Колода пуста, готовьтесь к усталости!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-12 pb-10">
                        {sortedCards.map((card, idx) => (
                            <motion.div
                                key={`${card.uniqueId}_${idx}`}
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ 
                                    opacity: 1, 
                                    scale: 1, 
                                    y: 0,
                                    transition: { delay: idx * 0.03 }
                                }}
                                className="flex justify-center"
                            >
                                <div className="scale-90 md:scale-100 origin-center">
                                    <BattleCard 
                                        data={card} 
                                        size="sm" 
                                        isInteractable={false}
                                        tooltipDirection="bottom"
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Summary */}
            <div className="p-4 md:p-6 bg-slate-950/80 border-t border-white/5 flex justify-center items-center backdrop-blur-md">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-[10px] md:text-xs uppercase font-black tracking-widest">Всего осталось:</span>
                        <span className="text-amber-500 font-mono font-bold text-lg">{cards.length}</span>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-white text-[10px] md:text-xs uppercase font-black tracking-widest transition-colors"
                    >
                        Нажмите ESC или кнопку закрытия для выхода
                    </button>
                </div>
            </div>
        </motion.div>
    </motion.div>
  );
};
