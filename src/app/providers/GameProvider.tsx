import React, { ReactNode } from "react";
import { useShallow }       from "zustand/shallow";
import { useGameStore }     from "@/app/model/gameStore";

// Adapter Hook:
// Uses useShallow to ensure that components only re-render if the 
// specific properties returned from the store actually change.
export const useGame = () => {
  return useGameStore(useShallow((state) => ({
    allCards: state.allCards,
    decks: state.decks,
    activeDeckId: state.activeDeckId,
    currentPhase: state.currentPhase,
    gameMode: state.gameMode,
    abilitiesRegistry: state.abilitiesRegistry,
    crystals: state.crystals,
    inventory: state.inventory,
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    
    // Actions
    setPhase: state.setPhase,
    setGameMode: state.setGameMode,
    selectDeck: state.selectDeck,
    createDeck: state.createDeck,
    deleteDeck: state.deleteDeck,
    renameDeck: state.renameDeck,
    saveCurrentDeck: state.saveCurrentDeck,
    addToDeck: state.addToDeck,
    removeFromDeck: state.removeFromDeck,
    resetDeck: state.resetDeck,
    craftCard: state.craftCard,
    disenchantCard: state.disenchantCard,
    upgradeCard: state.upgradeCard,
    updateCard: state.updateCard,
    toggleCardUnlock: state.toggleCardUnlock,
    createAbility: state.createAbility,
    updateAbility: state.updateAbility,
    deleteAbility: state.deleteAbility,

    // Computed
    activeDeck: state.getActiveDeck(),
    userDeckIds: state.getUserDeckIds(),
  })));
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
