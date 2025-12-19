import React, { useCallback } from "react";
import { GameCard }           from "@/entities/card/model/types.ts";
import { useSoundSystem } from "@/shared/lib/useSoundSystem";
import { GameMode, GamePhase } from "@/shared/types";
import { BATTLE_ACTIONS } from "./model/constants";
import { BattleState } from "./battleReducer";
import { battleApi } from "./model/battleApi";

export const useBattleActions = (
  state: BattleState,
  dispatch: React.Dispatch<any>,
  sounds: ReturnType<typeof useSoundSystem> | null,
  userDeckIds: string[],
  mode: GameMode,
  setPhase: (phase: GamePhase) => void
) => {
  const peekDeck = useCallback(() => {
    battleApi.getDeckContents();
    sounds?.playSfx('click');
  }, [sounds]);

  const closeDeckPreview = useCallback(() => {
    dispatch({ type: BATTLE_ACTIONS.SET_DECK_PREVIEW, cards: null });
  }, [dispatch]);

  const openDevEditor = useCallback((card: GameCard) => {
    dispatch({ type: BATTLE_ACTIONS.OPEN_DEV_EDITOR, card });
  }, [dispatch]);

  const closeDevEditor = useCallback(() => {
    dispatch({ type: BATTLE_ACTIONS.CLOSE_DEV_EDITOR });
  }, [dispatch]);

  const updateCardDev = useCallback((updatedCard: GameCard) => {
    battleApi.devUpdateCard(updatedCard);
    dispatch({ type: BATTLE_ACTIONS.CLOSE_DEV_EDITOR });
    sounds?.playSfx('buff');
  }, [dispatch, sounds]);

  const createLobby = useCallback(() => {
    battleApi.createLobby(userDeckIds, mode);
    sounds?.playSfx('click');
  }, [userDeckIds, mode, sounds]);

  const joinLobby = useCallback((lobbyId: string) => {
    battleApi.joinLobby(lobbyId, userDeckIds, mode);
    sounds?.playSfx('click');
  }, [userDeckIds, mode, sounds]);

  const playCard = useCallback((card: GameCard, targetId?: string) => {
    if (state.turn !== 'PLAYER' || state.battlePhase !== 'PLAY') return;
    battleApi.playCard(card.uniqueId, targetId);
    dispatch({ type: BATTLE_ACTIONS.SET_SELECTED_CARD, id: null });
  }, [state.turn, state.battlePhase, dispatch]);

  const useHeroPower = useCallback((targetId?: string) => {
    if (state.turn !== 'PLAYER' || state.battlePhase !== 'PLAY') return;
    battleApi.useHeroPower(targetId);
  }, [state.turn, state.battlePhase]);

  const runCombatSequence = useCallback((attackerId: string, targetId: string) => {
    if (state.battlePhase !== 'PLAY') return;
    battleApi.attackTarget(attackerId, targetId);
    dispatch({ type: BATTLE_ACTIONS.SET_SELECTED_CARD, id: null });
  }, [state.battlePhase, dispatch]);

  const sendEmote = useCallback((emoji: string) => {
    battleApi.sendEmote(emoji);
  }, []);

  const endTurn = useCallback(() => {
    if (state.turn === 'PLAYER' && !state.pendingChoice && state.battlePhase === 'PLAY') {
        battleApi.endTurn();
    }
  }, [state.turn, state.pendingChoice, state.battlePhase]);

  const handleChoice = useCallback((cardId: string) => {
      battleApi.chooseCard(cardId);
      dispatch({ type: BATTLE_ACTIONS.SET_PENDING_CHOICE, choice: null });
      sounds?.playSfx('play_card');
  }, [sounds, dispatch]);

  const setSelectedCardId = useCallback((id: string | null) => {
    dispatch({ type: BATTLE_ACTIONS.SET_SELECTED_CARD, id });
  }, [dispatch]);

  const setMessage = useCallback((message: string) => {
    dispatch({ type: BATTLE_ACTIONS.SET_MESSAGE, message });
  }, [dispatch]);

  const acceptMatch = useCallback(() => {
      battleApi.acceptMatch(userDeckIds, mode);
      sounds?.playSfx('click');
  }, [userDeckIds, mode, sounds]);

  const cancelSearch = useCallback(() => {
      battleApi.cancelSearch();
      if (state.matchStatus === 'LOBBY') {
        setPhase(GamePhase.MENU);
      } else {
        dispatch({ type: BATTLE_ACTIONS.SET_MATCH_STATUS, status: 'LOBBY' });
      }
  }, [setPhase, state.matchStatus, dispatch]);

  const toggleMulliganCard = useCallback((cardId: string) => {
      dispatch({ type: BATTLE_ACTIONS.TOGGLE_MULLIGAN_LOCAL, cardId });
      battleApi.toggleMulligan(cardId);
      sounds?.playSfx('click');
  }, [sounds, dispatch]);

  const confirmMulligan = useCallback(() => {
      battleApi.confirmMulligan();
      sounds?.playSfx('draw');
  }, [sounds]);

  return {
    endTurn, 
    playCard, 
    useHeroPower,
    runCombatSequence, 
    sendEmote,
    handleChoice,
    acceptMatch,
    cancelSearch,
    createLobby,
    joinLobby,
    toggleMulliganCard,
    confirmMulligan,
    setSelectedCardId,
    setMessage,
    peekDeck,
    closeDeckPreview,
    openDevEditor,
    closeDevEditor,
    updateCardDev
  };
};
