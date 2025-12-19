import { Loader2, MinusCircle, Save } from "lucide-react";
import React                          from "react";
import { CardData }                   from "@/shared/types";

interface DeckSidebarProps {
  deckIds: string[];
  deckCounts: Record<string, number>;
  allCards: CardData[];
  onRemove: (id: string) => void;
  onSave: () => void;
  isSaving?: boolean;
}

export const DeckSidebar: React.FC<DeckSidebarProps> = ({ deckIds, deckCounts, allCards, onRemove, onSave, isSaving = false }) => (
  <div className="w-full md:w-80 h-full flex flex-col z-20 bg-slate-950 md:bg-slate-950/60 md:backdrop-blur-xl border-l border-white/5 shadow-2xl overflow-hidden">
     <div className="p-3 md:p-5 border-b border-white/5 flex items-center justify-between bg-slate-950/50 flex-shrink-0">
       <h3 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Состав колоды</h3>
       <span className={`text-xs font-mono font-bold ${deckIds.length === 30 ? 'text-green-400' : 'text-slate-500'}`}>
          {deckIds.length}/30
       </span>
     </div>
     
     <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-1 custom-scrollbar overflow-x-hidden">
       {Object.entries(deckCounts).map(([id, count]) => {
         const card = allCards.find(c => c.id === id);
         if (!card) return null;

         return (
           <div key={id} className="group relative flex items-center bg-slate-900/30 hover:bg-slate-800/40 border border-white/5 hover:border-white/10 rounded-lg overflow-hidden transition-all h-9 md:h-12 w-full">
             <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-cover bg-center mask-image-linear-r opacity-40 group-hover:opacity-60 transition-opacity"
                style={{ backgroundImage: `url(${card.src.startsWith('http') ? card.src : 'https://chaosage.ru/images/' + card.src})` }}
             ></div>
             
             <div className="relative z-10 w-7 h-full flex items-center justify-center bg-slate-950/40 backdrop-blur-sm border-r border-white/5 text-blue-300 font-bold font-mono text-[10px] md:text-xs flex-shrink-0">
                {card.baseCost}
             </div>

             <div className="relative z-10 flex-1 px-2 md:px-3 truncate text-[10px] md:text-xs text-slate-300 font-medium group-hover:text-white transition-colors min-w-0">
                {card.title}
             </div>

             <div className="relative z-10 flex items-center pr-1 md:pr-2 gap-1 md:gap-2 flex-shrink-0">
               {count > 1 && <span className="text-amber-500 font-bold text-[9px] md:text-xs bg-black/40 px-1 md:px-1.5 rounded">x{count}</span>}
               <button onClick={() => onRemove(id)} className="text-slate-500 hover:text-red-400 transition-colors p-1.5 md:p-1"><MinusCircle size={16} /></button>
             </div>
           </div>
         );
       })}
     </div>

     <div className="p-3 md:p-4 border-t border-white/5 bg-slate-950/80 backdrop-blur-md flex-shrink-0">
       <button 
          onClick={onSave}
          disabled={deckIds.length < 30 || isSaving}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-700/20 to-amber-600/20 hover:from-amber-600/30 hover:to-amber-500/30 text-amber-500 hover:text-amber-200 font-bold py-2.5 md:py-3.5 rounded-lg border border-amber-600/30 hover:border-amber-400/50 transition-all disabled:opacity-30 disabled:grayscale text-[10px] md:text-xs tracking-[0.15em] uppercase shadow-lg backdrop-blur-sm"
       >
         {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} 
         {isSaving ? 'Сохранение...' : (deckIds.length < 30 ? 'Заполните колоду' : 'Сохранить и Выйти')}
       </button>
     </div>
  </div>
);
