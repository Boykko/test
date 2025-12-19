import { Variants } from "framer-motion";
import { useMemo }  from "react";
import { CardAnimationType } from "@/entities/card/model/animations";

export const useCardEffects = (animation: CardAnimationType, isSelected: boolean) => {
  
  const variants: Variants = useMemo(() => ({
    idle: { 
        y: 0, 
        scale: 1, 
        x: 0,
        zIndex: isSelected ? 50 : 0,
        filter: 'brightness(1)',
        transition: { type: 'spring', stiffness: 300, damping: 20 }
    },
    'attack-up': {
        y: -150, // Move significantly towards center (Player attacking)
        scale: 1.25,
        zIndex: 100,
        transition: { 
            type: "spring", 
            stiffness: 200, 
            damping: 15,
            duration: 0.4
        }
    },
    'attack-down': {
        y: 150, // Move significantly towards center (Enemy attacking)
        scale: 1.25,
        zIndex: 100,
        transition: { 
            type: "spring", 
            stiffness: 200, 
            damping: 15,
            duration: 0.4
        }
    },
    damage: {
        x: [0, -10, 10, -10, 10, 0],
        scale: 1,
        color: '#ef4444', // Red tint hint
        transition: { duration: 0.4 }
    },
    buff: {
        scale: [1, 1.2, 1],
        filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'],
        transition: { duration: 0.5 }
    },
    die: {
        opacity: [1, 1, 0],
        scale: [1, 1.3, 0.8],
        filter: [
            'blur(0px) brightness(1) contrast(1)', 
            'blur(2px) brightness(3) contrast(1.5)', 
            'blur(20px) brightness(0) contrast(2)'
        ],
        transition: { duration: 0.8, times: [0, 0.2, 1], ease: "easeOut" }
    },
    freeze: {
        x: [0, -5, 5, -5, 5, 0],
        filter: ['brightness(1)', 'brightness(1.5) hue-rotate(180deg) saturate(1.5)', 'brightness(1)'],
        transition: { duration: 0.5 }
    }
  }), [isSelected]);

  const isAttacking = animation === 'attack-up' || animation === 'attack-down';
  const isBuffing = animation === 'buff';
  
  return {
    variants,
    isAttacking,
    isBuffing
  };
};
