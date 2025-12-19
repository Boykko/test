import { CRAFT_VALUES }       from "@/shared/config/ranks.ts";
import React, { useContext }  from "react";
import { useShallow }         from "zustand/shallow";
import { SoundContext }       from "@/app/App.tsx";
import { useGameStore }       from "@/app/model/gameStore.ts";
import { useToastStore }      from "@/app/model/toastStore.ts";
import { UPGRADE_REQ_COUNT }  from "@/shared/constants";
import { CardData, CardRank } from "@/shared/types";
import { CollectionCard }     from "./CollectionCard";

interface CollectionGridProps {
  cards: CardData[];
  deckCounts: Record<string, number>;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  isDeckFull: boolean;
}

export const CollectionGrid: React.FC<CollectionGridProps> = ({ cards, deckCounts, onAdd, onRemove, isDeckFull }) => {
  const { inventory, craftCard, disenchantCard, upgradeCard, crystals } = useGameStore(useShallow(state => ({
    inventory: state.inventory,
    craftCard: state.craftCard,
    disenchantCard: state.disenchantCard,
    upgradeCard: state.upgradeCard,
    crystals: state.crystals
  })));
  
  const sounds = useContext(SoundContext);
  const addToast = useToastStore(state => state.addToast);

  const handleCraft = (card: CardData) => {
      const cost = CRAFT_VALUES[card.rank] || 1000;
      
      if (crystals < cost) {
          addToast(
              'Недостаточно кристаллов', 
              'error', 
              `Нужно: ${cost}, У вас: ${crystals}`
          );
          sounds?.playSfx('click'); 
          return;
      }

      craftCard(card.id).then(success => {
          if (success) {
              sounds?.playSfx('play_card'); 
          }
      });
  };

  const handleDisenchant = (card: CardData) => {
      disenchantCard(card.id);
      sounds?.playSfx('click');
  };

  const handleUpgrade = (card: CardData) => {
      upgradeCard(card.id);
      sounds?.playSfx('buff');
  };

  const checkCanUpgrade = (card: CardData, count: number) => {
      if (count < UPGRADE_REQ_COUNT) return false;
      if (card.rank === CardRank.DIAMOND) return false;
      return true; 
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-10 pb-32 pr-2">
      {cards.map(card => {
        const inDeckCount = deckCounts[card.id] || 0;
        const ownedCount = inventory[card.id] || 0;
        
        return (
          <CollectionCard 
              key={card.id}
              data={card} 
              inventoryCount={ownedCount}
              countInDeck={inDeckCount}
              onClick={() => onAdd(card.id)}
              onRemove={() => onRemove(card.id)}
              isDeckFull={isDeckFull}
              onCraft={() => handleCraft(card)}
              onDisenchant={() => handleDisenchant(card)}
              onUpgrade={() => handleUpgrade(card)}
              canUpgrade={checkCanUpgrade(card, ownedCount)}
              craftCost={CRAFT_VALUES[card.rank] || 1200}
          />
        );
      })}
    </div>
  );
};
