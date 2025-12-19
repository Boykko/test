import { useCallback } from "react";
import { useUIStore } from "@/app/model/uiStore";
import { 
  CardAnimationType, 
  DeathVfx, 
  DuelState, 
  FloatingText, 
  VfxItem, 
  VfxType 
} from "@/entities/card/model/animations";

import { useFloatingTexts } from "./model/visuals/useFloatingTexts";
import { useScreenShake } from "./model/visuals/useScreenShake";
import { useCardAnimations } from "./model/visuals/useCardAnimations";
import { useVfxQueue } from "./model/visuals/useVfxQueue";
import { useDuelState } from "./model/visuals/useDuelState";

export { type FloatingText, type VfxType, type VfxItem, type DuelState, type DeathVfx };

export const useBattleVisuals = () => {
  const isAnimationsEnabled = useUIStore(state => state.isAnimationsEnabled);

  const sleep = useCallback((ms: number) => {
    if (!isAnimationsEnabled) return Promise.resolve();
    return new Promise(resolve => setTimeout(resolve, ms));
  }, [isAnimationsEnabled]);

  const { floatingTexts, addFloatingText } = useFloatingTexts();
  const { screenShake, setScreenShake, triggerShake: rawTriggerShake } = useScreenShake(sleep);
  const { vfxQueue, triggerVfx: rawTriggerVfx } = useVfxQueue(sleep);
  const { duelState, triggerDuel: rawTriggerDuel } = useDuelState(sleep);
  const { 
    animatingCards, 
    deathVfxQueue, 
    triggerAnimation: rawTriggerAnimation 
  } = useCardAnimations(sleep, setScreenShake);

  const triggerAnimation = useCallback(async (id: string, type: keyof typeof animatingCards[string] | any): Promise<void> => {
    if (!isAnimationsEnabled) return;
    return rawTriggerAnimation(id, type);
  }, [isAnimationsEnabled, rawTriggerAnimation]);

  const triggerVfx = useCallback(async (type: VfxType, sourceId?: string, targetId?: string): Promise<void> => {
    if (!isAnimationsEnabled) return;
    return rawTriggerVfx(type, sourceId, targetId);
  }, [isAnimationsEnabled, rawTriggerVfx]);

  const triggerShake = useCallback(async (): Promise<void> => {
    if (!isAnimationsEnabled) return;
    return rawTriggerShake();
  }, [isAnimationsEnabled, rawTriggerShake]);

  const triggerDuel = useCallback(async (attackerId: string, targetId: string): Promise<void> => {
    if (!isAnimationsEnabled) return;
    return rawTriggerDuel(attackerId, targetId);
  }, [isAnimationsEnabled, rawTriggerDuel]);

  return {
    animatingCards,
    floatingTexts,
    deathVfxQueue,
    screenShake,
    vfxQueue,
    duelState,
    addFloatingText,
    triggerAnimation,
    triggerVfx,
    triggerShake,
    triggerDuel,
    sleep
  };
};
