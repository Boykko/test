import { socketService } from "@/server/api/socket";
import { GameCard } from "@/entities/card/model/types";
import { GameMode } from "@/shared/types";

export const battleApi = {
  getDeckContents: () => {
    socketService.emit('GET_DECK_CONTENTS', {});
  },
  
  devUpdateCard: (updatedCard: GameCard) => {
    socketService.emit('DEV_UPDATE_CARD', { updatedCard });
  },

  createLobby: (deckIds: string[], mode: GameMode) => {
    socketService.emit('CREATE_LOBBY', { deckIds, mode });
  },

  joinLobby: (lobbyId: string, deckIds: string[], mode: GameMode) => {
    socketService.emit('JOIN_LOBBY', { lobbyId, deckIds, mode });
  },

  playCard: (cardId: string, targetId?: string) => {
    socketService.emit('PLAY_CARD', { cardId, targetId });
  },

  useHeroPower: (targetId?: string) => {
    socketService.emit('USE_HERO_POWER', { targetId });
  },

  attackTarget: (attackerId: string, targetId: string) => {
    socketService.emit('ATTACK_TARGET', { attackerId, targetId });
  },

  sendEmote: (emoji: string) => {
    socketService.emit('SEND_EMOTE', { emoji });
  },

  endTurn: () => {
    socketService.emit('END_TURN', {});
  },

  chooseCard: (cardId: string) => {
    socketService.emit('CHOOSE_CARD', { cardId });
  },

  acceptMatch: (deckIds: string[], mode: GameMode) => {
    socketService.emit('ACCEPT_MATCH', { deckIds, mode });
  },

  cancelSearch: () => {
    socketService.emit('CANCEL_SEARCH', {});
  },

  toggleMulligan: (cardId: string) => {
    socketService.emit('TOGGLE_MULLIGAN', { cardId });
  },

  confirmMulligan: () => {
    socketService.emit('CONFIRM_MULLIGAN', {});
  }
};
