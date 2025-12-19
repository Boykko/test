import { GameCard }                    from "@/entities/card/model/types.ts";
import { PlayerState }                 from "@/entities/hero/model/types.ts";
import { DEFAULT_HERO_POWERS }         from "@/shared/config/powers.ts";
import { createGameCard, shuffleDeck } from "@/shared/utils";

export const STARTING_HAND = 5;

export const initializePlayer = (deckIds: string[], allCards: any[]): PlayerState => {
  const deckCards = deckIds.map(id => {
    const data = allCards.find(c => c.id === id);
    if (!data) return null;
    return createGameCard(data);
  }).filter(Boolean) as GameCard[];

  const shuffled = shuffleDeck(deckCards);
  
  const heroPower = JSON.parse(JSON.stringify(DEFAULT_HERO_POWERS[Math.floor(Math.random() * DEFAULT_HERO_POWERS.length)]));

  return {
    heroHealth: 30,
    heroArmor: 0,
    maxHealth: 30,
    mana: 1,
    maxMana: 1,
    deck: shuffled.slice(STARTING_HAND),
    hand: shuffled.slice(0, STARTING_HAND),
    board: [],
    graveyard: [],
    heroPower
  };
};
