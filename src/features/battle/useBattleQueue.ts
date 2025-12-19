import { useEffect, useRef, useState } from "react";
import { socketService } from "@/server/api/socket";
import { AbilityBehavior } from "@/shared/types";
import { BATTLE_ACTIONS } from "./model/constants";
import { BattleAction, BattleState, OpponentInfo } from "./model/types";

export type QueueItem = 
  | { kind: 'GAME_UPDATE'; payload: Partial<BattleState> }
  | { kind: 'BATTLE_EVENT'; payload: any }
  | { kind: 'GAME_OVER'; payload: { winner: 'PLAYER' | 'ENEMY' } }
  | { kind: 'ERROR'; payload: { message: string } }
  | { kind: 'MATCH_FOUND'; payload: { opponent: OpponentInfo } }
  | { kind: 'MATCH_STATUS'; payload: { status: BattleState['matchStatus'] } }
  | { kind: 'DECK_CONTENTS'; payload: { cards: any[] } }
  | { kind: 'LOBBY_LIST'; payload: { lobbies: OpponentInfo[] } }
  | { kind: 'EMOTE'; payload: { side: 'PLAYER' | 'ENEMY', emoji: string } };

export const useBattleQueue = (
  allCards: any[],
  abilitiesRegistry: any[],
  registryMap: Record<string, AbilityBehavior>,
  dispatch: React.Dispatch<BattleAction>
) => {
  const [eventQueue, setEventQueue] = useState<QueueItem[]>([]);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    dispatch({ type: BATTLE_ACTIONS.SET_REGISTRY, registry: registryMap });
    socketService.connect(allCards, abilitiesRegistry);
    
    const addToQueue = (item: QueueItem) => {
      console.log(`[Queue] Adding ${item.kind}`, (item.payload as any)?.type || '');
      if (isMounted.current) {
        if (item.kind === 'GAME_OVER') {
            setEventQueue(prev => [item, ...prev.filter(i => i.kind !== 'GAME_OVER')]);
        } else {
            setEventQueue(prev => [...prev, item]);
        }
      }
    };

    const handlers = {
        LOBBY_LIST_UPDATED: (payload: any) => addToQueue({ kind: 'LOBBY_LIST', payload }),
        MATCH_FOUND: (payload: any) => addToQueue({ kind: 'MATCH_FOUND', payload }),
        MATCH_STATUS_UPDATE: (payload: any) => addToQueue({ kind: 'MATCH_STATUS', payload }),
        GAME_UPDATE: (payload: any) => addToQueue({ kind: 'GAME_UPDATE', payload }),
        ERROR: (payload: any) => addToQueue({ kind: 'ERROR', payload }),
        GAME_OVER: (payload: any) => addToQueue({ kind: 'GAME_OVER', payload }),
        BATTLE_EVENT: (payload: any) => addToQueue({ kind: 'BATTLE_EVENT', payload }),
        EMOTE_RECEIVED: (payload: any) => addToQueue({ kind: 'EMOTE', payload }),
        DECK_CONTENTS_RESPONSE: (payload: any) => addToQueue({ kind: 'DECK_CONTENTS', payload })
    };

    Object.entries(handlers).forEach(([evt, handler]) => {
        socketService.on(evt, handler);
    });

    return () => {
        Object.entries(handlers).forEach(([evt, handler]) => {
            socketService.off(evt, handler);
        });
    };
  }, [allCards, abilitiesRegistry, registryMap, dispatch]);

  return { eventQueue, setEventQueue, isMounted };
};
