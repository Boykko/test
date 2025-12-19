import {
    ArrowLeft,
    Check,
    Diamond,
    Edit2,
    Grid,
    Layers,
    LayoutList,
    Plus,
    Search,
    Shuffle,
    Sparkles,
    Sword,
}                                              from "lucide-react";
import React                                   from "react";
import { useGameStore }                        from "@/app/model/gameStore.ts";
import { CardRank, CardType, Deck, GamePhase } from "@/shared/types";
import { FilterBar }                           from "./FilterBar";

interface DeckHeaderProps {
  decks: Deck[];
  activeDeckId: string;
  activeDeckName?: string;
  userDeckCount: number;
  mobileView: 'GRID' | 'LIST';
  rankFilter: CardRank | 'ALL';
  typeFilter: 'ALL' | CardType;
  searchQuery: string;
  isRenaming: boolean;
  tempName: string;
  onSetPhase: (phase: GamePhase) => void;
  onSelectDeck: (id: string) => void;
  onCreateDeck: () => void;
  onDeleteDeck: () => void;
  onStartRename: () => void;
  onFinishRename: () => void;
  onSetTempName: (name: string) => void;
  onSetMobileView: (view: 'GRID' | 'LIST') => void;
  onSetRankFilter: (filter: CardRank | 'ALL') => void;
  onSetTypeFilter: (filter: 'ALL' | CardType) => void;
  onSetSearchQuery: (query: string) => void;
  onBalancedFill: () => void;
}

export const DeckHeader: React.FC<DeckHeaderProps> = ({
  decks, activeDeckId, mobileView, userDeckCount,
  rankFilter, typeFilter, searchQuery, isRenaming, tempName,
  onSetPhase, onSelectDeck, onCreateDeck, onDeleteDeck, 
  onStartRename, onFinishRename, onSetTempName, onSetMobileView, 
  onSetRankFilter, onSetTypeFilter, onSetSearchQuery, onBalancedFill
}) => {
  const crystals = useGameStore(state => state.crystals);

  return (
    <div className="bg-slate-950/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40 shadow-2xl flex-shrink-0 w-full overflow-hidden">
      <div className="max-w-full mx-auto flex flex-col w-full">
        {/* Top Row: Navigation and Main Actions */}
        <div className="flex items-center justify-between p-2 md:p-3 md:px-6 border-b border-white/5 gap-2 overflow-hidden">
            <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                <button onClick={() => onSetPhase(GamePhase.MENU)} className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-slate-800/40 hover:bg-slate-700/60 text-slate-400 border border-white/5"><ArrowLeft size={18} /></button>
                <div className="h-6 w-px bg-white/10 hidden md:block"></div>
                <div className="flex items-center gap-2 min-w-0">
                    {isRenaming ? (
                        <div className="flex items-center gap-1 bg-slate-900/80 rounded-lg border border-blue-500/50 p-1 min-w-0">
                            <input autoFocus value={tempName} onChange={(e) => onSetTempName(e.target.value)} className="bg-transparent border-none text-white text-xs md:text-sm px-2 py-1 outline-none w-20 md:w-48 font-medium min-w-0" onBlur={onFinishRename} onKeyDown={(e) => e.key === 'Enter' && onFinishRename()} />
                            <button onClick={onFinishRename} className="bg-green-500/20 text-green-400 p-1 rounded transition-colors flex-shrink-0"><Check size={14}/></button>
                        </div>
                    ) : (
                        <div className="relative group min-w-0">
                            <select value={activeDeckId} onChange={(e) => onSelectDeck(e.target.value)} className="appearance-none bg-slate-900/60 hover:bg-slate-800/80 text-slate-200 text-xs md:text-sm font-bold border border-white/10 rounded-lg pl-3 pr-8 py-2 outline-none w-24 md:w-64 truncate cursor-pointer">
                                {decks.map(d => <option key={d.id} value={d.id} className="bg-slate-900">{d.name}</option>)}
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[8px] md:text-[10px]">▼</div>
                        </div>
                    )}
                    <div className="flex gap-0.5 md:gap-1 flex-shrink-0">
                         <button onClick={onStartRename} className="p-2 text-slate-500 hover:text-blue-400 hidden md:block"><Edit2 size={16} /></button>
                         <button onClick={onCreateDeck} className="p-2 text-slate-500 hover:text-green-400"><Plus size={18} /></button>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1.5 md:gap-4 flex-shrink-0">
                <button onClick={onBalancedFill} className="hidden lg:flex items-center gap-2 text-xs font-bold text-purple-400 bg-purple-900/20 px-4 py-2 rounded-lg border border-purple-500/20"><Shuffle size={14} /> АВТО-СБОР</button>
                <div className="flex items-center gap-1 md:gap-3 bg-black/40 px-2 md:px-5 py-1 md:py-2 rounded-full border border-white/5">
                    <Diamond size={12} className="text-blue-400 fill-blue-500/20 md:w-4 md:h-4" /><span className="text-[10px] md:text-lg font-mono font-bold text-blue-100">{crystals}</span>
                </div>
                <div className="md:hidden flex items-center bg-slate-800/50 rounded-lg p-0.5">
                    <span className={`text-[8px] font-bold px-1 ${userDeckCount === 30 ? 'text-green-400' : 'text-slate-400'}`}>{userDeckCount}/30</span>
                    <div className="h-4 w-px bg-white/10 mx-0.5"></div>
                    <button onClick={() => onSetMobileView('GRID')} className={`p-1.5 rounded ${mobileView === 'GRID' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}><Grid size={14} /></button>
                    <button onClick={() => onSetMobileView('LIST')} className={`p-1.5 rounded ${mobileView === 'LIST' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}><LayoutList size={14} /></button>
                </div>
            </div>
        </div>

        {/* Bottom Row: Search and Filters */}
        <div className="px-2 md:px-6 py-2 md:py-3 flex flex-col md:flex-row items-center gap-2 md:gap-8 bg-black/20 w-full overflow-hidden">
            <div className="relative w-full md:w-64 group flex-shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input type="text" placeholder="Поиск карты..." value={searchQuery} onChange={(e) => onSetSearchQuery(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 md:py-2 text-xs md:text-sm text-slate-200 outline-none focus:border-blue-500/40" />
            </div>
            
            <div className="flex flex-1 items-center gap-2 md:gap-8 overflow-x-auto w-full no-scrollbar pb-1">
                <div className="flex bg-slate-900/50 p-0.5 rounded-lg border border-white/5 flex-shrink-0">
                    <button onClick={() => onSetTypeFilter('ALL')} className={`flex items-center gap-1 px-3 md:px-4 py-1 rounded-md text-[9px] md:text-xs font-bold transition-all ${typeFilter === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}><Layers size={10} /> ВСЕ</button>
                    <button onClick={() => onSetTypeFilter(CardType.MINION)} className={`flex items-center gap-1 px-3 md:px-4 py-1 rounded-md text-[9px] md:text-xs font-bold transition-all ${typeFilter === CardType.MINION ? 'bg-amber-900/60 text-amber-100 ring-1 ring-amber-700/50' : 'text-slate-500'}`}><Sword size={10} /> АРМИЯ</button>
                    <button onClick={() => onSetTypeFilter(CardType.SPELL)} className={`flex items-center gap-1 px-3 md:px-4 py-1 rounded-md text-[9px] md:text-xs font-bold transition-all ${typeFilter === CardType.SPELL ? 'bg-purple-900/60 text-purple-100 ring-1 ring-purple-700/50' : 'text-slate-500'}`}><Sparkles size={10} /> МАГИЯ</button>
                </div>
                {typeFilter !== CardType.SPELL && (
                    <div className="flex-1 min-w-0">
                        <FilterBar currentFilter={rankFilter} setFilter={onSetRankFilter} />
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
