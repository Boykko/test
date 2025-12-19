import React        from "react";
import { CardRank } from "@/shared/types";

interface FilterBarProps {
  currentFilter: CardRank | 'ALL';
  setFilter: (r: CardRank | 'ALL') => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ currentFilter, setFilter }) => (
  <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar mask-image-linear-r">
    <button
       onClick={() => setFilter('ALL')}
       className={`flex-shrink-0 px-4 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all border ${
         currentFilter === 'ALL' ? 'bg-slate-100 text-slate-900 border-white' : 'bg-transparent text-slate-500 border-slate-700 hover:border-slate-500'
       }`}
    >
      ВСЕ
    </button>
    {Object.values(CardRank).map(rank => (
      <button
        key={rank}
        onClick={() => setFilter(rank)}
        className={`flex-shrink-0 px-4 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all border ${
          currentFilter === rank 
            ? 'bg-slate-800 text-slate-200 border-slate-500 shadow-[0_0_10px_rgba(255,255,255,0.1)]' 
            : 'bg-transparent text-slate-500 border-slate-800 hover:border-slate-600'
        }`}
      >
        {rank}
      </button>
    ))}
  </div>
);