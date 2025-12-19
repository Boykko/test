import { useUIStore }                     from "@/app/model/uiStore";
import { SOUND_FILES, SoundType }         from "@/shared/types.ts";
import { Howl, Howler }                   from "howler";
import { useCallback, useEffect, useRef } from "react";

export const useSoundSystem = () => {
  const soundsRef = useRef<Record<string, Howl>>({});
  const loadedSounds = useRef<Set<string>>(new Set());
  const currentBgmRef = useRef<string | null>(null);
  
  const isMuted = useUIStore(state => state.isMuted);
  const toggleMute = useUIStore(state => state.toggleMute);

  useEffect(() => {
    Howler.mute(isMuted);
  }, [isMuted]);

  useEffect(() => {
    Object.entries(SOUND_FILES).forEach(([key, file]) => {
      const sound = new Howl({
        src: [file],
        volume: key.startsWith('bgm') ? 0.2 : 0.5,
        loop: key.startsWith('bgm'),
        preload: true,
        html5: key.startsWith('bgm'),
        onload: () => loadedSounds.current.add(key),
      });
      soundsRef.current[key] = sound;
    });

    return () => {
      Object.values(soundsRef.current).forEach(howl => howl.unload());
    };
  }, []);

  const playSfx = useCallback((type: SoundType) => {
    if (isMuted) return;
    if (loadedSounds.current.has(type)) {
      soundsRef.current[type].play();
    }
  }, [isMuted]);

  const playBgm = useCallback((type: SoundType) => {
    if (currentBgmRef.current === type) return;
    
    if (currentBgmRef.current && soundsRef.current[currentBgmRef.current]) {
      const prev = soundsRef.current[currentBgmRef.current];
      prev.fade(prev.volume(), 0, 1500);
      setTimeout(() => prev.stop(), 1500);
    }

    if (!loadedSounds.current.has(type)) return;

    const next = soundsRef.current[type];
    if (next) {
      next.volume(0); 
      next.play();
      if (!isMuted) {
        next.fade(0, 0.2, 2000);
      }
      currentBgmRef.current = type;
    }
  }, [isMuted]);

  const stopBgm = useCallback(() => {
     if (currentBgmRef.current && soundsRef.current[currentBgmRef.current]) {
        const prev = soundsRef.current[currentBgmRef.current];
        prev.fade(prev.volume(), 0, 1000);
        setTimeout(() => {
            prev.stop();
            currentBgmRef.current = null;
        }, 1000);
     }
  }, []);

  return { playSfx, playBgm, stopBgm, toggleMute, isMuted };
};
