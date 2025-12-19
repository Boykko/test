import { useMemo, useState }                       from "react";
import { useShallow }                              from "zustand/shallow";
import { useGameStore }                            from "@/app/model/gameStore.ts";
import { CardData, CardRank, CardType, GamePhase } from "@/shared/types";

export const useDeckBuilderModel = () => {
    // Select only what we need for the deck builder logic
    const { 
        allCards, 
        decks,
        activeDeckId,
        inventory,
        isSaving,
        // Actions
        setPhase,
        selectDeck,
        createDeck,
        deleteDeck,
        renameDeck,
        saveCurrentDeck,
        addToDeck,
        removeFromDeck,
        resetDeck
    } = useGameStore(useShallow(state => ({
        allCards: state.allCards,
        decks: state.decks,
        activeDeckId: state.activeDeckId,
        inventory: state.inventory,
        isSaving: state.isSaving,
        setPhase: state.setPhase,
        selectDeck: state.selectDeck,
        createDeck: state.createDeck,
        deleteDeck: state.deleteDeck,
        renameDeck: state.renameDeck,
        saveCurrentDeck: state.saveCurrentDeck,
        addToDeck: state.addToDeck,
        removeFromDeck: state.removeFromDeck,
        resetDeck: state.resetDeck
    })));

    const activeDeck = useMemo(() => decks.find(d => d.id === activeDeckId), [decks, activeDeckId]);
    const userDeckIds = useMemo(() => activeDeck?.cardIds || [], [activeDeck]);

    const [rankFilter, setRankFilter] = useState<CardRank | 'ALL'>('ALL');
    const [typeFilter, setTypeFilter] = useState<'ALL' | CardType>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileView, setMobileView] = useState<'GRID' | 'LIST'>('GRID');
    const [isRenaming, setIsRenaming] = useState(false);
    const [tempName, setTempName] = useState('');

    const visibleCards = useMemo(() => {
        return allCards.filter(c => {
            if (!c.isUnlocked) return false;
            if (rankFilter !== 'ALL' && c.rank !== rankFilter) return false;
            if (typeFilter !== 'ALL' && c.type !== typeFilter) return false;
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                return c.title.toLowerCase().includes(query);
            }
            return true;
        });
    }, [allCards, rankFilter, typeFilter, searchQuery]);
    
    const deckCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        userDeckIds.forEach(id => {
            counts[id] = (counts[id] || 0) + 1;
        });
        return counts;
    }, [userDeckIds]);

    const handleStartRename = () => {
        setTempName(activeDeck?.name || '');
        setIsRenaming(true);
    };

    const handleFinishRename = () => {
        if (tempName.trim()) {
            renameDeck(activeDeckId, tempName.trim());
        }
        setIsRenaming(false);
    };

    const handleCreateDeck = () => {
        const name = `Колода ${decks.length + 1}`;
        createDeck(name);
    };

    const handleDeleteDeck = () => {
        if (decks.length > 1) { 
            deleteDeck(activeDeckId);
        }
    };
    
    const handleSaveDeck = async () => {
        await saveCurrentDeck();
        setPhase(GamePhase.MENU);
    };

    const handleBalancedFill = () => {
        resetDeck();
        const ownedCards = allCards.filter(c => c.isUnlocked && (inventory[c.id] || 0) > 0);
        if (ownedCards.length === 0) return;

        const curve = [
            { min: 0, max: 2, count: 6 },
            { min: 3, max: 4, count: 10 },
            { min: 5, max: 6, count: 8 },
            { min: 7, max: 99, count: 6 },
        ];

        const newDeckIds: string[] = [];
        const tempCounts: Record<string, number> = {};

        const addCard = (card: CardData) => {
            newDeckIds.push(card.id);
            tempCounts[card.id] = (tempCounts[card.id] || 0) + 1;
        };

        curve.forEach(bucket => {
            const bucketCards = ownedCards.filter(c => c.baseCost >= bucket.min && c.baseCost <= bucket.max);
            let addedInBucket = 0;
            let attempts = 0;
            
            while (addedInBucket < bucket.count && attempts < 100 && bucketCards.length > 0) {
                const card = bucketCards[Math.floor(Math.random() * bucketCards.length)];
                const currentDeckCount = tempCounts[card.id] || 0;
                const ownedCount = inventory[card.id] || 0;

                if (currentDeckCount < 2 && currentDeckCount < ownedCount) {
                    addCard(card);
                    addedInBucket++;
                }
                attempts++;
            }
        });

        while (newDeckIds.length < 30) {
            const card = ownedCards[Math.floor(Math.random() * ownedCards.length)];
            const currentDeckCount = tempCounts[card.id] || 0;
            const ownedCount = inventory[card.id] || 0;
            
            if (currentDeckCount < 2 && currentDeckCount < ownedCount) {
                addCard(card);
            } else {
                if (ownedCards.every(c => (tempCounts[c.id] || 0) >= Math.min(2, inventory[c.id] || 0))) break;
            }
        }
        newDeckIds.forEach(id => addToDeck(id));
    };

    const handleSetTypeFilter = (type: 'ALL' | CardType) => {
        setTypeFilter(type);
        if (type === CardType.SPELL) {
            setRankFilter('ALL');
        }
    };

    return {
        allCards, // Fix: Add allCards to the return object
        decks,
        activeDeck,
        activeDeckId,
        userDeckIds,
        inventory,
        isSaving,
        rankFilter, setRankFilter,
        typeFilter, setTypeFilter: handleSetTypeFilter,
        searchQuery, setSearchQuery,
        mobileView, setMobileView,
        isRenaming, tempName, setTempName,
        visibleCards, deckCounts,
        setPhase, selectDeck,
        addToDeck, removeFromDeck,
        handleStartRename, handleFinishRename,
        handleCreateDeck, handleDeleteDeck, handleBalancedFill, handleSaveDeck
    };
};