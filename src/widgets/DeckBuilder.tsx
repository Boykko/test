import { useDeckBuilderModel } from "@/features/deck/model/useDeckBuilderModel.ts";
import { CollectionGrid }      from "@/features/deck/ui/CollectionGrid.tsx";
import { DeckHeader }          from "@/features/deck/ui/DeckHeader.tsx";
import { DeckSidebar }         from "@/features/deck/ui/DeckSidebar.tsx";
import React                   from "react";

export const DeckBuilder: React.FC = () => {
  const model = useDeckBuilderModel();

  return (
    <div className="h-screen w-full flex flex-col relative bg-slate-950 overflow-hidden max-w-[100vw]">
      <DeckHeader 
        decks={model.decks}
        activeDeckId={model.activeDeckId}
        activeDeckName={model.activeDeck?.name}
        userDeckCount={model.userDeckIds.length}
        mobileView={model.mobileView}
        rankFilter={model.rankFilter}
        typeFilter={model.typeFilter}
        searchQuery={model.searchQuery}
        isRenaming={model.isRenaming}
        tempName={model.tempName}
        onSetPhase={model.setPhase}
        onSelectDeck={model.selectDeck}
        onCreateDeck={model.handleCreateDeck}
        onDeleteDeck={model.handleDeleteDeck}
        onStartRename={model.handleStartRename}
        onFinishRename={model.handleFinishRename}
        onSetTempName={model.setTempName}
        onSetMobileView={model.setMobileView}
        onBalancedFill={model.handleBalancedFill}
        onSetRankFilter={model.setRankFilter}
        onSetTypeFilter={model.setTypeFilter}
        onSetSearchQuery={model.setSearchQuery}
      />

      <div className="flex-1 flex overflow-hidden relative w-full">
        {/* Cards Grid */}
        <div className={`flex-1 overflow-y-auto p-2 md:p-8 ${model.mobileView === 'LIST' ? 'hidden md:block' : 'block'} scroll-smooth overflow-x-hidden`}>
           <CollectionGrid 
             cards={model.visibleCards} 
             deckCounts={model.deckCounts} 
             onAdd={model.addToDeck} 
             onRemove={model.removeFromDeck}
             isDeckFull={model.userDeckIds.length >= 30} 
           />
        </div>

        {/* Sidebar Overlay on Mobile / Side Panel on Desktop */}
        <div className={`
                ${model.mobileView === 'GRID' ? 'hidden md:flex' : 'flex'} 
                w-full md:w-80 
                absolute md:static inset-0 md:inset-auto z-30
                bg-slate-950 md:bg-transparent 
            `}>
          <DeckSidebar 
            deckIds={model.userDeckIds}
            deckCounts={model.deckCounts}
            allCards={model.allCards}
            onRemove={model.removeFromDeck}
            onSave={model.handleSaveDeck}
            isSaving={model.isSaving}
          />
        </div>
      </div>
    </div>
  );
};
