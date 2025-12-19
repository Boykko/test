import { useCallback, useState } from "react";
import { DURATIONS } from "@/entities/card/model/animations";

export const useScreenShake = (sleep: (ms: number) => Promise<void>) => {
  const [screenShake, setScreenShake] = useState(false);

  const triggerShake = useCallback(async (): Promise<void> => {
    setScreenShake(true);
    await sleep(DURATIONS.SHAKE);
    setScreenShake(false);
  }, [sleep]);

  return { screenShake, setScreenShake, triggerShake };
};
