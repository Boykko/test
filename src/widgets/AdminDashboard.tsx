import { useGame }                                 from "@/app/providers/GameProvider.tsx";
import { AbilityManager }                          from "@/features/admin/ui/AbilityManager.tsx";
import { AdminCardGrid }                           from "@/features/admin/ui/AdminCardGrid.tsx";
import { AdminEditForm }                           from "@/features/admin/ui/AdminEditForm.tsx";
import { CardData, CardRank, CardType, GamePhase } from "@/shared/types.ts";
import { ArrowLeft, Book, User, Wand2 }            from "lucide-react";
import React, { useMemo, useState }                from "react";

export const AdminDashboard: React.FC = () => {
  const { 
    allCards, abilitiesRegistry, setPhase, updateCard, 
    toggleCardUnlock, createAbility, updateAbility, deleteAbility 
  } = useGame();
  
  const [activeTab, setActiveTab] = useState<'MINIONS' | 'SPELLS' | 'ABILITIES'>('MINIONS');
  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  const [rankFilter, setRankFilter] = useState<CardRank>(CardRank.BRONZE);

  const filteredCards = useMemo(() => {
    return allCards.filter(c => {
      const typeMatch = activeTab === 'MINIONS' ? c.type === CardType.MINION : c.type === CardType.SPELL;
      return typeMatch && (activeTab === 'SPELLS' ? true : c.rank === rankFilter);
    });
  }, [allCards, rankFilter, activeTab]);

  // const handleSave = () => {
  //   if (editingCard) {
  //     updateCard(editingCard);
  //     setEditingCard(null);
  //   }
  // };
    const handleSave = (updatedData: CardData) => {
        updateCard(updatedData);
        setEditingCard(null);
    };
  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6 overflow-y-auto selection:bg-amber-500/30">
      {/* Sticky Navigation Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-8 sticky top-0 glass-panel p-4 rounded-2xl z-20 gap-4 border border-white/5 shadow-2xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setPhase(GamePhase.MENU)}
            className="p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-700/60 text-slate-400 border border-white/5 transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl md:text-2xl font-fantasy font-bold tracking-[0.1em] text-amber-500/90 uppercase">Кузня Хаоса</h1>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-900/80 p-1.5 rounded-xl border border-white/10 shadow-inner flex-wrap justify-center">
          <button 
             onClick={() => setActiveTab('MINIONS')}
             className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2.5 transition-all ${activeTab === 'MINIONS' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
             <User size={16} /> Существа
          </button>
          <button 
             onClick={() => setActiveTab('SPELLS')}
             className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2.5 transition-all ${activeTab === 'SPELLS' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
             <Wand2 size={16} /> Заклинания
          </button>
          <button 
             onClick={() => setActiveTab('ABILITIES')}
             className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2.5 transition-all ${activeTab === 'ABILITIES' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
             <Book size={16} /> Механики
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
           <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Статус</span>
           <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
           <span className="text-xs font-bold text-slate-300 uppercase">Синхронизировано</span>
        </div>
      </div>

      {/* Content Area */}
      <main className="max-w-7xl mx-auto pb-24">
        {activeTab === 'ABILITIES' ? (
           <AbilityManager 
              abilities={abilitiesRegistry}
              onCreate={createAbility}
              onUpdate={updateAbility}
              onDelete={deleteAbility}
           />
        ) : (
          <AdminCardGrid 
            cards={filteredCards}
            rankFilter={rankFilter}
            setRankFilter={setRankFilter}
            onEditClick={setEditingCard}
            onToggleUnlock={toggleCardUnlock}
            hideRankFilter={activeTab === 'SPELLS'}
          />
        )}
      </main>

      {/* Editor Modal Overlay */}
      {editingCard && (
        <AdminEditForm 
          editForm={editingCard}
          abilitiesRegistry={abilitiesRegistry}
          setEditForm={setEditingCard}
          onSave={handleSave}
          onCancel={() => setEditingCard(null)}
        />
      )}
    </div>
  );
};
