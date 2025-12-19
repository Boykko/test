import { BATTLE_ACTIONS }           from "./model/constants";
import { BattleAction, BattleState, PlayerState } from "./model/types";

const EMPTY_PLAYER_STATE: PlayerState = {
  heroHealth: 30,
  heroArmor: 0,
  maxHealth: 30,
  mana: 0,
  maxMana: 0,
  deck: [],
  hand: [],
  board: [],
  graveyard: []
};

export const INITIAL_BATTLE_STATE: BattleState = {
  player: EMPTY_PLAYER_STATE,
  enemy: EMPTY_PLAYER_STATE,
  turn: 'PLAYER',
  battlePhase: 'MATCHMAKING',
  matchStatus: 'LOBBY',
  opponentInfo: null,
  lobbies: [],
  mulliganSelected: [],
  selectedCardId: null,
  message: '',
  isCombatResolving: false,
  registry: {},
  logs: [],
  turnEndTime: 0,
  pendingChoice: null,
  isDrawingPlayer: false,
  isDrawingEnemy: false,
  deckPreview: null,
  devEditorCard: null
};

export const battleReducer = (state: BattleState, action: BattleAction): BattleState => {
  switch (action.type) {
    case BATTLE_ACTIONS.SYNC_WITH_SERVER:
      return {
        ...state,
        ...action.payload,
        selectedCardId: state.selectedCardId, 
        message: action.payload.message ?? state.message
      };
    case BATTLE_ACTIONS.SET_MATCH_STATUS:
        return {
            ...state,
            matchStatus: action.status,
            opponentInfo: action.opponent || state.opponentInfo,
            battlePhase: action.status === 'READY' ? 'MULLIGAN' : 'MATCHMAKING'
        };
    case BATTLE_ACTIONS.SET_LOBBIES:
        return {
            ...state,
            lobbies: action.lobbies
        };
    case BATTLE_ACTIONS.SET_DRAWING:
        return {
            ...state,
            isDrawingPlayer: action.side === 'PLAYER' ? action.value : state.isDrawingPlayer,
            isDrawingEnemy: action.side === 'ENEMY' ? action.value : state.isDrawingEnemy
        };
    case BATTLE_ACTIONS.SET_DECK_PREVIEW:
        return {
            ...state,
            deckPreview: action.cards
        };
    case BATTLE_ACTIONS.OPEN_DEV_EDITOR:
        return {
            ...state,
            devEditorCard: action.card
        };
    case BATTLE_ACTIONS.CLOSE_DEV_EDITOR:
        return {
            ...state,
            devEditorCard: null
        };
    case BATTLE_ACTIONS.SET_REGISTRY:
      return { ...state, registry: action.registry };
    case BATTLE_ACTIONS.SET_SELECTED_CARD:
      return { ...state, selectedCardId: action.id };
    case BATTLE_ACTIONS.SET_MESSAGE:
      return { ...state, message: action.message };
    case BATTLE_ACTIONS.SET_PENDING_CHOICE:
      return { ...state, pendingChoice: action.choice };
    case BATTLE_ACTIONS.TOGGLE_MULLIGAN_LOCAL: {
      const isSelected = state.mulliganSelected.includes(action.cardId);
      return {
        ...state,
        mulliganSelected: isSelected 
          ? state.mulliganSelected.filter(id => id !== action.cardId)
          : [...state.mulliganSelected, action.cardId]
      };
    }
    case BATTLE_ACTIONS.RESET_UI:
        return { ...state, selectedCardId: null, message: '', deckPreview: null };
    default:
      return state;
  }
};
