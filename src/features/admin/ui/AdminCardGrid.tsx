import { Edit, Lock, Unlock } from "lucide-react";
import React                  from "react";
import { CardData, CardRank } from "@/shared/types";
import { AdminCard }          from "./AdminCard";

interface AdminCardGridProps {
  cards: CardData[];
  rankFilter: CardRank;
  setRankFilter: (rank: CardRank) => void;
  onEditClick: (card: CardData) => void;
  onToggleUnlock: (id: string) => void;
  hideRankFilter?: boolean;
}

export const AdminCardGrid: React.FC<AdminCardGridProps> = ({ 
  cards, rankFilter, setRankFilter, onEditClick, onToggleUnlock, hideRankFilter = false
}) => {
  return (
    <>
      {!hideRankFilter && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {Object.values(CardRank).map(rank => (
            <button
              key={rank}
              onClick={() => setRankFilter(rank)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all border ${
                rankFilter === rank 
                  ? 'bg-slate-800 text-slate-200 border-slate-500 shadow-[0_0_10px_rgba(255,255,255,0.1)]' 
                  : 'bg-transparent text-slate-500 border-slate-800 hover:border-slate-600'
              }`}
            >
              {rank}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-600 italic">Нет карт для отображения</div>
        ) : (
          cards.map(card => (
            <div key={card.id} className="bg-slate-900/40 p-4 rounded-xl border border-white/5 relative hover:border-white/10 transition-colors">
              <div className="flex justify-center mb-4">
                <AdminCard data={card} size="sm" />
              </div>
              
              <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg mb-2 border border-white/5">
                <span className="text-xs font-medium text-slate-300 truncate max-w-[150px]">{card.title}</span>
                <button 
                  onClick={() => onToggleUnlock(card.id)}
                  className={`p-1 rounded hover:bg-white/5 ${card.isUnlocked ? 'text-green-400' : 'text-red-400'}`}
                  title={card.isUnlocked ? 'Доступна' : 'Заблокирована'}
                >
                  {card.isUnlocked ? <Unlock size={14} /> : <Lock size={14} />}
                </button>
              </div>

              <button
                onClick={() => onEditClick(card)}
                className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 py-1.5 rounded-lg flex items-center justify-center gap-2 text-xs transition-all"
              >
                <Edit size={12} /> Ред.
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
};
