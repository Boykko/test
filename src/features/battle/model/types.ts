import { GameCard } from "@/entities/card/model/types";
import { AbilityBehavior, CardData } from "@/shared/types";
import { BATTLE_ACTIONS } from "./model/constants";

export type BattlePhaseState = 'MATCHMAKING' | 'MULLIGAN' | 'PLAY' | 'GAME_OVER';

export interface OpponentInfo {
  id: string;
  name: string;
  level: number;
  rank: string;
  avatar: string;
}

export interface BattleLogEntry {
  id: string;
  message: string;
  type: 'INFO' | 'ATTACK' | 'DAMAGE' | 'DEATH' | 'PLAY' | 'FATIGUE' | 'SPELL' | 'WARNING';
  turn: 'PLAYER' | 'ENEMY';
  cardSrc?: string;
  cardTitle?: string;
  targetSrc?: string;
  targetTitle?: string;
  value?: number;
}

export interface PlayerState {
  heroHealth: number;
  heroArmor: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  deck: GameCard[];
  hand: GameCard[];
  board: GameCard[];
  graveyard: GameCard[];
}

export interface BattleState {
  player: PlayerState;
  enemy: PlayerState;
  turn: 'PLAYER' | 'ENEMY';
  battlePhase: BattlePhaseState;
  matchStatus: 'LOBBY' | 'WAITING_FOR_OPPONENT' | 'FOUND' | 'READY';
  opponentInfo: OpponentInfo | null;
  lobbies: OpponentInfo[];
  mulliganSelected: string[];
  selectedCardId: string | null;
  message: string;
  isCombatResolving: boolean;
  registry: Record<string, AbilityBehavior>;
  logs: BattleLogEntry[];
  turnEndTime: number;
  pendingChoice: { options: CardData[], side: 'PLAYER' | 'ENEMY' } | null;
  isDrawingPlayer: boolean;
  isDrawingEnemy: boolean;
  deckPreview: GameCard[] | null;
  devEditorCard: GameCard | null;
}

export type BattleAction =
  | { type: typeof BATTLE_ACTIONS.SYNC_WITH_SERVER; payload: Partial<BattleState> }
  | { type: typeof BATTLE_ACTIONS.SET_REGISTRY; registry: Record<string, AbilityBehavior> }
  | { type: typeof BATTLE_ACTIONS.SET_SELECTED_CARD; id: string | null }
  | { type: typeof BATTLE_ACTIONS.SET_MESSAGE; message: string }
  | { type: typeof BATTLE_ACTIONS.TOGGLE_MULLIGAN_LOCAL; cardId: string }
  | { type: typeof BATTLE_ACTIONS.SET_PENDING_CHOICE; choice: BattleState['pendingChoice'] }
  | { type: typeof BATTLE_ACTIONS.SET_MATCH_STATUS; status: BattleState['matchStatus'], opponent?: OpponentInfo }
  | { type: typeof BATTLE_ACTIONS.SET_LOBBIES; lobbies: OpponentInfo[] }
  | { type: typeof BATTLE_ACTIONS.SET_DRAWING; side: 'PLAYER' | 'ENEMY', value: boolean }
  | { type: typeof BATTLE_ACTIONS.SET_DECK_PREVIEW; cards: GameCard[] | null }
  | { type: typeof BATTLE_ACTIONS.OPEN_DEV_EDITOR; card: GameCard }
  | { type: typeof BATTLE_ACTIONS.CLOSE_DEV_EDITOR }
  | { type: typeof BATTLE_ACTIONS.RESET_UI };
