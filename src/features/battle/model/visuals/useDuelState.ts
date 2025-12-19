import { useCallback, useEffect, useState } from "react";
import { DuelState, DURATIONS } from "@/entities/card/model/animations";

export const useDuelState = (sleep: (ms: number) => Promise<void>) => {
  const [duelState, setDuelState] = useState<DuelState | null>(null);

  useEffect(() => {
    console.log('duelState changed:', duelState);
  }, [duelState]);

  const triggerDuel = useCallback(async (attackerId: string, targetId: string): Promise<void> => {
    console.log('triggerDuel called', { attackerId, targetId });
    setDuelState({ attackerId, targetId });
    await sleep(DURATIONS.DUEL);
    setDuelState(null);
    await sleep(200); // Small cooldown after impact
  }, [sleep]);

  return { duelState, triggerDuel };
};
