import { GameEngine } from "../logic/GameEngine";
import { CardData }   from "@/shared/types";

type EventCallback = (payload: any) => void;

const MOCK_PLAYERS = [
    { id: 'opp_1', name: 'Aldarion', level: 42, rank: 'Золото II', avatar: '🧙‍♂️' },
    { id: 'opp_2', name: 'ShadowStep', level: 15, rank: 'Серебро I', avatar: '🥷' },
    { id: 'opp_3', name: 'DragonBane', level: 88, rank: 'Алмаз IV', avatar: '🐲' },
    { id: 'opp_4', name: 'MysticRose', level: 29, rank: 'Платина III', avatar: '🌹' },
    { id: 'opp_5', name: 'IronClad', level: 54, rank: 'Золото IV', avatar: '🛡️' }
];

export class SimulatedSocketService {
  private listeners: Record<string, EventCallback[]> = {};
  private gameEngine: GameEngine | null = null;
  private lobbies: any[] = [];
  private updateInterval: any = null;
  
  constructor() {
    // Генерируем начальные лобби
    this.lobbies = MOCK_PLAYERS.slice(0, 3).map(p => ({ ...p, createdAt: Date.now() }));
  }

  connect(allCards: CardData[], registry: any) {
    this.gameEngine = new GameEngine(allCards, registry, (event, payload) => {
        this.emitClient(event, payload);
    });
    
    // Имитируем обновление списка игроков раз в несколько секунд
    if (this.updateInterval) clearInterval(this.updateInterval);
    this.updateInterval = setInterval(() => {
        this.refreshLobbies();
    }, 5000);

    setTimeout(() => {
        this.emitClient('connect', {});
        this.emitClient('LOBBY_LIST_UPDATED', { lobbies: this.lobbies });
    }, 100);
  }

  private refreshLobbies() {
    // Случайно добавляем/удаляем игроков из списка для живости
    const randomOpponent = MOCK_PLAYERS[Math.floor(Math.random() * MOCK_PLAYERS.length)];
    if (!this.lobbies.find(l => l.id === randomOpponent.id)) {
        this.lobbies = [ { ...randomOpponent, createdAt: Date.now() }, ...this.lobbies].slice(0, 5);
    } else {
        this.lobbies = this.lobbies.filter(l => l.id !== randomOpponent.id);
    }
    this.emitClient('LOBBY_LIST_UPDATED', { lobbies: this.lobbies });
  }

  on(event: string, callback: EventCallback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  off(event: string, callback: EventCallback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emitClient(event: string, payload: any) {
    if (this.listeners[event]) this.listeners[event].forEach(cb => cb(payload));
  }

  emit(event: string, payload: any) {
    const latency = Math.floor(Math.random() * 50) + 50;
    setTimeout(() => {
      this.handleServerEvent(event, payload);
    }, latency);
  }

  private handleServerEvent(event: string, payload: any) {
    if (!this.gameEngine) return;

    switch (event) {
      case 'GET_LOBBIES':
        this.emitClient('LOBBY_LIST_UPDATED', { lobbies: this.lobbies });
        break;
      case 'CREATE_LOBBY':
        // Игрок разместил свою заявку
        this.emitClient('MATCH_STATUS_UPDATE', { status: 'WAITING_FOR_OPPONENT' });
        // Имитируем, что через 3-7 секунд кто-то присоеденится
        setTimeout(() => {
            const opponent = MOCK_PLAYERS[Math.floor(Math.random() * MOCK_PLAYERS.length)];
            this.emitClient('MATCH_FOUND', { opponent });
        }, Math.random() * 4000 + 3000);
        break;
      case 'JOIN_LOBBY':
        // Игрок выбрал оппонента из списка
        const lobby = this.lobbies.find(l => l.id === payload.lobbyId);
        if (lobby) {
            this.emitClient('MATCH_FOUND', { opponent: lobby });
        }
        break;
      case 'ACCEPT_MATCH':
        this.emitClient('MATCH_STATUS_UPDATE', { status: 'READY' });
        setTimeout(() => {
            if (this.gameEngine) {
                this.gameEngine.initGame(payload.deckIds || [], payload.mode || 'STANDARD');
            }
        }, 1200);
        break;
      case 'CANCEL_SEARCH':
        this.emitClient('LOBBY_LIST_UPDATED', { lobbies: this.lobbies });
        break;
      case 'TOGGLE_MULLIGAN': this.gameEngine.handleMulliganToggle(payload.cardId); break;
      case 'CONFIRM_MULLIGAN': this.gameEngine.handleMulliganConfirm(); break;
      case 'PLAY_CARD': this.gameEngine.handlePlayCard(payload.cardId, 'PLAYER', payload.targetId); break;
      case 'ATTACK_TARGET': this.gameEngine.handleAttack(payload.attackerId, payload.targetId, 'PLAYER'); break;
      case 'USE_HERO_POWER': this.gameEngine.handleUseHeroPower('PLAYER', payload.targetId); break;
      case 'END_TURN': this.gameEngine.handleEndTurn('PLAYER'); break;
      case 'SEND_EMOTE': this.gameEngine.handleEmote(payload.emoji, 'PLAYER'); break;
      case 'CHOOSE_CARD': this.gameEngine.handleChooseCard(payload.cardId, 'PLAYER'); break;
      case 'DEV_UPDATE_CARD': 
        if (this.gameEngine && (this.gameEngine as any).handleDevUpdateCard) {
            (this.gameEngine as any).handleDevUpdateCard(payload.updatedCard);
        }
        break;
      case 'GET_DECK_CONTENTS': 
        if (this.gameEngine.state) {
            this.emitClient('DECK_CONTENTS_RESPONSE', { 
                cards: this.gameEngine.state.player.deck.map(c => ({ ...c }))
            });
        }
        break;
    }
  }
}

export const socketService = new SimulatedSocketService();
