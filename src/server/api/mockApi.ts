import { DEFAULT_ABILITIES }                           from "@/shared/config/abilities.ts";
import { CRAFT_VALUES, DISENCHANT_VALUES }             from "@/shared/config/ranks.ts";
import { INITIAL_CARDS }                               from "@/shared/config/raw-collection.ts";
import { UPGRADE_REQ_COUNT }            from "@/shared/constants";
import { AbilityDefinition, CardData, CardRank, Deck } from "@/shared/types";

const DB_KEY = 'chaos_age_server_db_v3'; // Bumped version for fresh data

interface ServerDbSchema {
  crystals: number;
  inventory: Record<string, number>;
  decks: Deck[];
  abilities: AbilityDefinition[];
  customCards: CardData[]; 
}

const getDb = (): ServerDbSchema => {
  const stored = localStorage.getItem(DB_KEY);
  if (stored) return JSON.parse(stored);
  
  const initialInventory: Record<string, number> = {};
  INITIAL_CARDS.forEach(c => {
      if (c.rank === CardRank.BRONZE) initialInventory[c.id] = 2;
  });

  const defaultDb: ServerDbSchema = {
    crystals: 5000,
    inventory: initialInventory,
    decks: [{ id: 'deck_1', name: 'Стартовая колода', cardIds: INITIAL_CARDS.filter(c => c.rank === CardRank.BRONZE).slice(0, 30).map(c => c.id) }],
    abilities: DEFAULT_ABILITIES,
    customCards: [] 
  };
  saveDb(defaultDb);
  return defaultDb;
};

const saveDb = (db: ServerDbSchema) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  async getProfile() {
    await delay(400);
    const db = getDb();
    return { crystals: db.crystals, inventory: db.inventory, decks: db.decks };
  },
  async getCards() {
    await delay(200);
    const db = getDb();
    let cards = [...INITIAL_CARDS];
    if (db.customCards.length > 0) {
        cards = cards.map(c => db.customCards.find(cc => cc.id === c.id) || c);
    }
    return cards;
  },
  async getAbilities() {
    await delay(100);
    return getDb().abilities;
  },
  async saveDeck(deck: Deck) {
    await delay(500);
    const db = getDb();
    const idx = db.decks.findIndex(d => d.id === deck.id);
    if (idx >= 0) db.decks[idx] = deck; else db.decks.push(deck);
    saveDb(db);
    return deck;
  },
  async createDeck(name: string) {
    const db = getDb();
    const newDeck = { id: `deck_${Date.now()}`, name, cardIds: [] };
    db.decks.push(newDeck);
    saveDb(db);
    return newDeck;
  },
  // Added missing renameDeck method to satisfy gameStore usage
  async renameDeck(deckId: string, name: string) {
    await delay(200);
    const db = getDb();
    const idx = db.decks.findIndex(d => d.id === deckId);
    if (idx >= 0) {
      db.decks[idx].name = name;
      saveDb(db);
    }
    return true;
  },
  async deleteDeck(deckId: string) {
    const db = getDb();
    db.decks = db.decks.filter(d => d.id !== deckId);
    saveDb(db);
    return true;
  },
  async craftCard(cardId: string) {
    const db = getDb();
    const card = INITIAL_CARDS.find(c => c.id === cardId);
    if (!card) throw new Error("Card error");
    const cost = CRAFT_VALUES[card.rank];
    if (db.crystals < cost) return { success: false, newCrystals: db.crystals, newInventoryCount: db.inventory[cardId] || 0 };
    db.crystals -= cost;
    db.inventory[cardId] = (db.inventory[cardId] || 0) + 1;
    saveDb(db);
    return { success: true, newCrystals: db.crystals, newInventoryCount: db.inventory[cardId] };
  },
  async disenchantCard(cardId: string) {
    const db = getDb();
    const card = INITIAL_CARDS.find(c => c.id === cardId);
    if (!card) throw new Error("Card error");
    db.crystals += DISENCHANT_VALUES[card.rank];
    db.inventory[cardId] = Math.max(0, (db.inventory[cardId] || 0) - 1);
    saveDb(db);
    return { success: true, newCrystals: db.crystals, newInventoryCount: db.inventory[cardId] };
  },
  async upgradeCard(cardId: string) {
    const db = getDb();
    const count = db.inventory[cardId] || 0;
    if (count < UPGRADE_REQ_COUNT) throw new Error("Not enough cards");
    const parts = cardId.split('_');
    const rank = parts[parts.length - 1] as CardRank;
    const ranks = Object.values(CardRank);
    const nextRank = ranks[ranks.indexOf(rank) + 1];
    if (!nextRank) throw new Error("Max rank");
    const nextId = cardId.replace(rank, nextRank);
    db.inventory[cardId] -= UPGRADE_REQ_COUNT;
    db.inventory[nextId] = (db.inventory[nextId] || 0) + 1;
    saveDb(db);
    return { success: true, newInventory: db.inventory };
  },
  async updateCardData(card: CardData) {
      const db = getDb();
      const idx = db.customCards.findIndex(c => c.id === card.id);
      if (idx >= 0) db.customCards[idx] = card; else db.customCards.push(card);
      saveDb(db);
  }
};
