import { useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { FloatingText } from "@/entities/card/model/animations";

export const useFloatingTexts = () => {
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  const addFloatingText = useCallback((text: string, x: number, y: number, color: string = 'text-red-500') => {
    const id = uuidv4();
    setFloatingTexts(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    }, 1500);
  }, []);

  return { floatingTexts, addFloatingText };
};
