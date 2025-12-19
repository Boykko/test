import { DEFAULT_ABILITIES }                                      from "@/shared/config/abilities.ts";
import { INITIAL_CARDS }                                          from "@/shared/config/raw-collection.ts";
import { create }                                                 from "zustand";
import { mockApi }                                                from "@/server/api/mockApi.ts";
import { AbilityDefinition, CardData, Deck, GameMode, GamePhase } from "@/shared/types.ts";
import { useToastStore }                                          from "./toastStore";

interface GameState {
  // --- State ---
  isLoading: boolean;
  error: string | null;
  isSaving: boolean; // Глобальный индикатор сохранения

  allCards: CardData[];
  decks: Deck[];
  activeDeckId: string;
  currentPhase: GamePhase;
  gameMode: GameMode;
  abilitiesRegistry: AbilityDefinition[];
  
  // Economy
  crystals: number;
  inventory: Record<string, number>; 

  // --- Actions ---

  // Initialization
  initializeGame: () => Promise<void>;

  setPhase: (phase: GamePhase) => void;
  setGameMode: (mode: GameMode) => void;
  
  // Deck Operations (Async)
  createDeck: (name: string) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
  renameDeck: (id: string, name: string) => Promise<void>;
  saveCurrentDeck: () => Promise<void>;
  selectDeck: (id: string) => void;
  
  // Local Deck Editing (Optimistic UI)
  addToDeck: (cardId: string) => void;
  removeFromDeck: (cardId: string) => void;
  resetDeck: () => void;
  
  // Economy Actions (Async)
  craftCard: (cardId: string) => Promise<boolean>;
  disenchantCard: (cardId: string) => Promise<void>;
  upgradeCard: (cardId: string) => Promise<void>;

  // Admin Actions
  updateCard: (updatedCard: CardData) => void;
  toggleCardUnlock: (id: string) => void;
  createAbility: (ability: AbilityDefinition) => void;
  updateAbility: (ability: AbilityDefinition) => void;
  deleteAbility: (id: string) => void;

  // Helpers
  getActiveDeck: () => Deck | undefined;
  getUserDeckIds: () => string[];
  getInventoryCount: (cardId: string) => number;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial Empty State
  isLoading: true,
  error: null,
  isSaving: false,
  allCards: INITIAL_CARDS, // Фолбэк до загрузки сервера
  decks: [],
  activeDeckId: '',
  currentPhase: GamePhase.MENU,
  gameMode: GameMode.STANDARD,
  abilitiesRegistry: DEFAULT_ABILITIES,
  crystals: 0, 
  inventory: {}, 

  // --- ACTIONS ---

  initializeGame: async () => {
    set({ isLoading: true });
    try {
        console.log("[Store] Connecting to game server...");
        // Параллельная загрузка данных профиля и метаданных игры
        const [profile, cards, abilities] = await Promise.all([
            mockApi.getProfile(),
            mockApi.getCards(),
            mockApi.getAbilities()
        ]);

        set({
            crystals: profile.crystals,
            inventory: profile.inventory,
            decks: profile.decks,
            activeDeckId: profile.decks[0]?.id || '',
            allCards: cards,
            abilitiesRegistry: abilities,
            isLoading: false
        });
        console.log("[Store] Game data synchronized.");
    } catch (err) {
        console.error("Failed to load game", err);
        set({ error: "Ошибка соединения с сервером", isLoading: false });
        useToastStore.getState().addToast('Ошибка', 'error', 'Не удалось загрузить данные игры');
    }
  },

  setPhase: (phase) => set({ currentPhase: phase }),
  setGameMode: (mode) => set({ gameMode: mode }),

  selectDeck: (id) => set({ activeDeckId: id }),

  // --- DECK ASYNC ---

  createDeck: async (name) => {
      set({ isSaving: true });
      try {
          const newDeck = await mockApi.createDeck(name);
          set(state => ({ 
              decks: [...state.decks, newDeck],
              activeDeckId: newDeck.id,
              isSaving: false 
          }));
          useToastStore.getState().addToast('Колода создана', 'success');
      } catch (e) {
          console.error(e);
          set({ isSaving: false });
          useToastStore.getState().addToast('Ошибка создания', 'error');
      }
  },

  deleteDeck: async (id) => {
      set({ isSaving: true });
      try {
          await mockApi.deleteDeck(id);
          set(state => {
              const newDecks = state.decks.filter(d => d.id !== id);
              return { 
                  decks: newDecks,
                  activeDeckId: newDecks[0]?.id || '',
                  isSaving: false 
              };
          });
          useToastStore.getState().addToast('Колода удалена', 'info');
      } catch (e) {
          console.error(e);
          set({ isSaving: false });
          useToastStore.getState().addToast('Ошибка удаления', 'error');
      }
  },

  renameDeck: async (id, name) => {
      try {
          // Оптимистичное обновление
          set(state => ({ decks: state.decks.map(d => d.id === id ? { ...d, name } : d) }));
          // Запрос на сервер в фоне
          await mockApi.renameDeck(id, name);
      } catch (e) {
          console.error(e);
          useToastStore.getState().addToast('Ошибка переименования', 'error');
      }
  },

  saveCurrentDeck: async () => {
      const state = get();
      const deck = state.getActiveDeck();
      if (!deck) return;

      set({ isSaving: true });
      try {
          console.log(`[Store] Uploading deck ${deck.id}...`);
          const savedDeck = await mockApi.saveDeck(deck);
          
          set(s => ({
              isSaving: false,
              decks: s.decks.map(d => d.id === savedDeck.id ? savedDeck : d)
          }));
          console.log("[Store] Deck saved.");
          useToastStore.getState().addToast('Сохранено', 'success', 'Ваша колода успешно обновлена на сервере');
      } catch (e) {
          console.error("Save failed", e);
          set({ isSaving: false, error: "Save failed" });
          useToastStore.getState().addToast('Ошибка сохранения', 'error', 'Проверьте соединение с интернетом');
      }
  },

  // --- LOCAL DECK EDITING (Optimistic) ---

  addToDeck: (cardId) => {
    const state = get();
    const deck = state.getActiveDeck();
    if (!deck) return;
    
    const currentCountInDeck = deck.cardIds.filter(id => id === cardId).length;
    const owned = state.inventory[cardId] || 0;

    if (currentCountInDeck >= 2) {
       useToastStore.getState().addToast('Максимум копий', 'warning', 'В колоде не может быть больше 2 одинаковых карт');
       return;
    }
    if (currentCountInDeck >= owned) {
        useToastStore.getState().addToast('Недостаточно карт', 'warning', 'У вас нет свободных копий этой карты');
        return;
    } 
    if (deck.cardIds.length >= 30) {
        useToastStore.getState().addToast('Колода полна', 'warning', 'Максимум 30 карт');
        return;
    }

    set((state) => ({
        decks: state.decks.map(d => {
            if (d.id === state.activeDeckId) {
                return { ...d, cardIds: [...d.cardIds, cardId] };
            }
            return d;
        })
    }));

    // Success feedback (especially for mobile where sidebar might be hidden)
    // To prevent spam, we can make this subtle or only if sidebar is hidden, but simple toast is good.
    // Removed to avoid spam on desktop? No, feedback is good.
    useToastStore.getState().addToast('Карта добавлена', 'success'); 
  },

  removeFromDeck: (cardId) => set((state) => ({
    decks: state.decks.map(d => {
      if (d.id === state.activeDeckId) {
        const index = d.cardIds.indexOf(cardId);
        if (index > -1) {
          const newIds = [...d.cardIds];
          newIds.splice(index, 1);
          return { ...d, cardIds: newIds };
        }
      }
      return d;
    })
  })),

  resetDeck: () => {
      set((state) => ({
        decks: state.decks.map(d => 
          d.id === state.activeDeckId ? { ...d, cardIds: [] } : d
        )
      }));
      useToastStore.getState().addToast('Колода очищена', 'info');
  },

  // --- ECONOMY (Async) ---

  craftCard: async (cardId) => {
      set({ isSaving: true });
      try {
          const result = await mockApi.craftCard(cardId);
          if (result.success) {
              set(s => ({
                  crystals: result.newCrystals,
                  inventory: { ...s.inventory, [cardId]: result.newInventoryCount },
                  isSaving: false
              }));
              useToastStore.getState().addToast('Карта создана!', 'success', `Остаток кристаллов: ${result.newCrystals}`);
              return true;
          } else {
             useToastStore.getState().addToast('Ошибка крафта', 'error', 'Недостаточно кристаллов');
          }
          set({ isSaving: false });
          return false;
      } catch (e) {
          console.error(e);
          set({ isSaving: false });
          useToastStore.getState().addToast('Сбой сервера', 'error');
          return false;
      }
  },

  disenchantCard: async (cardId) => {
      set({ isSaving: true });
      try {
          const result = await mockApi.disenchantCard(cardId);
          if (result.success) {
               set(s => {
                   // Clean up decks locally if needed (sync with server rules)
                   const newDecks = s.decks.map(d => {
                        const inDeck = d.cardIds.filter(id => id === cardId).length;
                        if (inDeck > result.newInventoryCount) {
                            const idx = d.cardIds.indexOf(cardId);
                            const newIds = [...d.cardIds];
                            newIds.splice(idx, 1);
                            return { ...d, cardIds: newIds };
                        }
                        return d;
                   });

                   return {
                       crystals: result.newCrystals,
                       inventory: { ...s.inventory, [cardId]: result.newInventoryCount },
                       decks: newDecks,
                       isSaving: false
                   };
               });
               useToastStore.getState().addToast('Карта распылена', 'info', `Всего кристаллов: ${result.newCrystals}`);
          }
      } catch (e) {
          console.error(e);
          set({ isSaving: false });
          useToastStore.getState().addToast('Ошибка', 'error');
      }
  },

  upgradeCard: async (cardId) => {
      set({ isSaving: true });
      try {
          const result = await mockApi.upgradeCard(cardId);
          if (result.success) {
              set({ inventory: result.newInventory, isSaving: false });
              useToastStore.getState().addToast('УЛУЧШЕНИЕ!', 'success', 'Ранг карты повышен!');
          }
      } catch (e) {
          console.error(e);
          set({ isSaving: false });
          useToastStore.getState().addToast('Ошибка улучшения', 'error');
      }
  },

  // --- ADMIN (Optimistic + Async Background) ---

  updateCard: (updatedCard) => {
      // Optimistic update locally
      set(s => ({ allCards: s.allCards.map(c => c.id === updatedCard.id ? updatedCard : c) }));
      // Background sync
      mockApi.updateCardData(updatedCard);
      useToastStore.getState().addToast('Карта обновлена', 'success');
  },

  toggleCardUnlock: (id) => set((state) => ({
    allCards: state.allCards.map(c => c.id === id ? { ...c, isUnlocked: !c.isUnlocked } : c)
  })),

  createAbility: (ability) => {
      set((state) => ({
        abilitiesRegistry: [...state.abilitiesRegistry, ability]
      }));
      useToastStore.getState().addToast('Способность создана', 'success');
  },

  updateAbility: (ability) => {
      set((state) => ({
        abilitiesRegistry: state.abilitiesRegistry.map(a => a.id === ability.id ? ability : a)
      }));
      useToastStore.getState().addToast('Способность обновлена', 'success');
  },

  deleteAbility: (id) => set((state) => ({
    abilitiesRegistry: state.abilitiesRegistry.filter(a => a.id !== id)
  })),

  // --- Helpers ---
  getActiveDeck: () => {
    const state = get();
    return state.decks.find(d => d.id === state.activeDeckId);
  },
  getUserDeckIds: () => {
    const state = get();
    const deck = state.decks.find(d => d.id === state.activeDeckId);
    return deck ? deck.cardIds : [];
  },
  getInventoryCount: (cardId) => {
      return get().inventory[cardId] || 0;
  }
}));
