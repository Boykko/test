import { GameCard }             from "@/entities/card/model/types.ts";
import { CheckCircle, XCircle } from "lucide-react";
import React                    from "react";
import { BattleCard }           from "./BattleCard";

interface MulliganOverlayProps {
  cards: GameCard[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onConfirm: () => void;
  onCardContextMenu?: (e: React.MouseEvent, card: GameCard) => void;
}

export const MulliganOverlay: React.FC<MulliganOverlayProps> = ({ cards, selectedIds, onToggle, onConfirm, onCardContextMenu }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-2 md:p-4">
       <div className="flex flex-col items-center gap-4 md:gap-8 p-4 md:p-8 max-w-5xl w-full bg-slate-900/40 rounded-3xl border border-white/10">
          <div className="text-center space-y-2">
             <h2 className="text-xl md:text-4xl font-fantasy text-amber-500 tracking-widest drop-shadow-lg">ФАЗА МУЛЛИГАНА</h2>
             <p className="text-slate-300 font-light text-xs md:text-base">Выберите карты для замены</p>
          </div>
          
          <div className="flex gap-2 md:gap-6 justify-center flex-wrap">
             {cards.map(card => {
                const isSelected = selectedIds.includes(card.uniqueId);
                return (
                   <div key={card.uniqueId} className="relative group cursor-pointer transition-transform hover:scale-105" onClick={() => onToggle(card.uniqueId)} onContextMenu={(e) => onCardContextMenu?.(e, card)}>
                      <div className={isSelected ? 'grayscale opacity-60 transition-all' : ''}>
                         <BattleCard data={card} size="sm" isInteractable={false} />
                      </div>
                      
                      {isSelected && (
                         <div className="absolute inset-0 flex items-center justify-center z-10 animate-bounce-short">
                            <XCircle className="text-red-500 w-16 h-16 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]" strokeWidth={1.5} />
                         </div>
                      )}
                   </div>
                );
             })}
          </div>

          <button 
             onClick={onConfirm}
             className="mt-4 px-8 md:px-12 py-2 md:py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-full text-sm md:text-lg tracking-wider shadow-[0_0_20px_rgba(22,163,74,0.4)] hover:shadow-[0_0_30px_rgba(22,163,74,0.6)] transition-all flex items-center gap-3 border border-green-400/30"
          >
             <CheckCircle /> Подтвердить
          </button>
       </div>
    </div>
  );
};