import { useEffect, useMemo, useReducer, useState } from "react";
import { useGame } from "@/app/providers/GameProvider";
import { useSoundSystem } from "@/shared/lib/useSoundSystem";
import { AbilityBehavior, GameMode, GamePhase } from "@/shared/types";
import { battleReducer, INITIAL_BATTLE_STATE } from "./battleReducer";
import { useBattleVisuals } from "./useBattleVisuals";
import { useBattleQueue } from "./useBattleQueue";
import { useBattleEvents } from "./useBattleEvents";
import { useBattleActions } from "./useBattleActions";
import { BATTLE_ACTIONS } from "./model/constants";
import { BattleAction } from "./model/types";

export const useBattleSystem = (
  allCards: any[],
  userDeckIds: string[],
  setPhase: (phase: GamePhase) => void,
  visuals: ReturnType<typeof useBattleVisuals>,
  sounds: ReturnType<typeof useSoundSystem> | null,
  mode: GameMode
) => {
  const { abilitiesRegistry } = useGame();
  const [state, dispatch] = useReducer(battleReducer, INITIAL_BATTLE_STATE);
  const { sleep } = visuals;

  const [isProcessing, setIsProcessing] = useState(false);
  const [activeEmotes, setActiveEmotes] = useState<{PLAYER?: string, ENEMY?: string}>({});

  const registryMap = useMemo(() => {
    const map: Record<string, AbilityBehavior> = {};
    abilitiesRegistry.forEach(a => map[a.id] = a.behavior);
    return map;
  }, [abilitiesRegistry]);

  const { eventQueue, setEventQueue, isMounted } = useBattleQueue(allCards, abilitiesRegistry, registryMap, dispatch as React.Dispatch<BattleAction>);
  const { handleBattleEventVisuals } = useBattleEvents(visuals, sounds, dispatch);
  const actions = useBattleActions(state, dispatch, sounds, userDeckIds, mode, setPhase);

  // Strict Sequential Queue Processor
  useEffect(() => {
    if (eventQueue.length === 0 || isProcessing) return;

    const processNext = async () => {
      setIsProcessing(true);
      const item = eventQueue[0];

      try {
        switch (item.kind) {
          case 'LOBBY_LIST':
            dispatch({ type: BATTLE_ACTIONS.SET_LOBBIES, lobbies: item.payload.lobbies });
            break;
          case 'MATCH_FOUND':
            sounds?.playSfx('win');
            dispatch({ type: BATTLE_ACTIONS.SET_MATCH_STATUS, status: 'FOUND', opponent: item.payload.opponent });
            break;
          case 'MATCH_STATUS':
            dispatch({ type: BATTLE_ACTIONS.SET_MATCH_STATUS, status: item.payload.status });
            if (item.payload.status === 'READY') {
                sounds?.playSfx('buff');
                await sleep(1500); 
            }
            break;
          case 'EMOTE':
            setActiveEmotes(prev => ({ ...prev, [item.payload.side]: item.payload.emoji }));
            sounds?.playSfx('click');
            setTimeout(() => {
                if (isMounted.current) setActiveEmotes(prev => ({ ...prev, [item.payload.side]: undefined }));
            }, 2500);
            break;
          case 'DECK_CONTENTS':
            dispatch({ type: BATTLE_ACTIONS.SET_DECK_PREVIEW, cards: item.payload.cards });
            break;
          case 'BATTLE_EVENT':
            await handleBattleEventVisuals(item.payload);
            break;
          case 'GAME_UPDATE':
              const hasPendingVisuals = eventQueue.slice(1).some(i => i.kind === 'BATTLE_EVENT');
              if (hasPendingVisuals) {
                  setEventQueue(prev => [...prev.slice(1), item]);
                  setIsProcessing(false);
                  return;
              }
            const newHandSize = item.payload.player?.hand?.length ?? 0;
            const oldHandSize = state.player.hand.length;
            if (newHandSize > oldHandSize && state.battlePhase === 'PLAY') {
                dispatch({ type: BATTLE_ACTIONS.SET_DRAWING, side: 'PLAYER', value: true });
                setTimeout(() => dispatch({ type: BATTLE_ACTIONS.SET_DRAWING, side: 'PLAYER', value: false }), 800);
            }
            const newEnemyHandSize = item.payload.enemy?.hand?.length ?? 0;
            const oldEnemyHandSize = state.enemy.hand.length;
            if (newEnemyHandSize > oldEnemyHandSize && state.battlePhase === 'PLAY') {
                dispatch({ type: BATTLE_ACTIONS.SET_DRAWING, side: 'ENEMY', value: true });
                setTimeout(() => dispatch({ type: BATTLE_ACTIONS.SET_DRAWING, side: 'ENEMY', value: false }), 800);
            }

            dispatch({ type: BATTLE_ACTIONS.SYNC_WITH_SERVER, payload: item.payload });
              await sleep(50);
            break;
          case 'GAME_OVER':
            dispatch({ type: BATTLE_ACTIONS.SYNC_WITH_SERVER, payload: { battlePhase: 'GAME_OVER' } });
            dispatch({ type: BATTLE_ACTIONS.SET_MESSAGE, message: item.payload.winner === 'PLAYER' ? 'Победа!' : 'Поражение!' });
            sounds?.playSfx(item.payload.winner === 'PLAYER' ? 'win' : 'lose');
            await sleep(2000);
            break;
          case 'ERROR':
            dispatch({ type: BATTLE_ACTIONS.SET_MESSAGE, message: item.payload.message });
            sounds?.playSfx('click');
            await sleep(2000);
            dispatch({ type: BATTLE_ACTIONS.SET_MESSAGE, message: '' });
            break;
        }
      } catch (e) {
        console.error("Queue Processor Failure:", e);
      } finally {
        if (isMounted.current) {
          setEventQueue(prev => prev.slice(1));
          setIsProcessing(false);
        }
      }
    };

    processNext();
  }, [eventQueue, isProcessing, sleep, sounds, state.player.hand.length, state.enemy.hand.length, state.battlePhase, handleBattleEventVisuals, isMounted, setEventQueue]);

  return {
    ...state,
    activeEmotes,
    ...actions
  };
};
