import { useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { CardAnimationType, DeathVfx, DURATIONS } from "@/entities/card/model/animations";

export const useCardAnimations = (
  sleep: (ms: number) => Promise<void>,
  setScreenShake: (shake: boolean) => void
) => {
  const [animatingCards, setAnimatingCards] = useState<Record<string, Exclude<CardAnimationType, 'idle' | null>>>({});
  const [deathVfxQueue, setDeathVfxQueue] = useState<DeathVfx[]>([]);

  const triggerAnimation = useCallback(async (id: string, type: keyof typeof animatingCards[string] | any): Promise<void> => {
    setAnimatingCards(prev => ({ ...prev, [id]: type }));
    
    if (type === 'die') {
        const el = document.querySelector(`[data-card-id="${id}"]`);
        if (el) {
            const rect = el.getBoundingClientRect();
            const deathId = uuidv4();
            setDeathVfxQueue(prev => [...prev, { 
                id: deathId, 
                x: rect.left + rect.width / 2, 
                y: rect.top + rect.height / 2 
            }]);
            
            // Добавляем небольшую тряску экрана при смерти
            setScreenShake(true);
            setTimeout(() => setScreenShake(false), 300);

            setTimeout(() => {
                setDeathVfxQueue(prev => prev.filter(v => v.id !== deathId));
            }, 1500);
        }
    }
    
    let duration = DURATIONS.ATTACK;
    if (type === 'damage') duration = DURATIONS.DAMAGE;
    if (type === 'buff') duration = DURATIONS.BUFF;
    if (type === 'die') duration = DURATIONS.DIE;
    if (type === 'freeze') duration = DURATIONS.FREEZE;

    await sleep(duration);
    
    setAnimatingCards(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, [sleep, setScreenShake]);

  return { animatingCards, deathVfxQueue, triggerAnimation };
};
