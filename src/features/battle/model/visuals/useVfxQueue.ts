import { useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { VfxItem, VfxType, DURATIONS } from "@/entities/card/model/animations";

export const useVfxQueue = (sleep: (ms: number) => Promise<void>) => {
  const [vfxQueue, setVfxQueue] = useState<VfxItem[]>([]);

  const triggerVfx = useCallback(async (type: VfxType, sourceId?: string, targetId?: string): Promise<void> => {
    const id = uuidv4();
    setVfxQueue(prev => [...prev, { id, type, sourceId, targetId }]);
    
    const duration = ['FIREBALL', 'LIFESTEAL'].includes(type) 
        ? DURATIONS.VFX_PROJECTILE 
        : DURATIONS.VFX_STATIC;

    await sleep(duration);
    
    setVfxQueue(prev => prev.filter(item => item.id !== id));
  }, [sleep]);

  return { vfxQueue, triggerVfx };
};
