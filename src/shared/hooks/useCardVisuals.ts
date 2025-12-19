import { RANK_STYLES }                                                      from "@/shared/config/ranks.ts";
import { useMemo, useRef }                                                  from "react";
import { useGame }                                                          from "@/app/providers/GameProvider";
import { AbilityBehavior, AbilityDefinition, CardData, CardRank, CardType } from "../types";
import { getDescription }                                                   from "../utils";

export const useCardVisuals = (data: CardData, size: 'xs' | 'sm' | 'md' | 'lg') => {
  const { abilitiesRegistry } = useGame();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const cardBodyRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const resolvedAbilities = useMemo(() => {
     return data.abilities.map(ab => {
         const def = abilitiesRegistry.find(d => d.id === ab.abilityId);
         if (!def) return null;
         return {
             ...ab,
             def,
             description: getDescription(def.descriptionTemplate, ab.value)
         };
     }).filter(Boolean) as Array<{ abilityId: string, value: number, def: AbilityDefinition, description: string }>;
  }, [data.abilities, abilitiesRegistry]);

  const hasAbilityType = (type: AbilityBehavior) => resolvedAbilities.some(r => r.def.behavior === type);
  
  const keywords = {
      isTaunt: hasAbilityType(AbilityBehavior.TAUNT) || (data as any).isTaunt,
      hasCharge: hasAbilityType(AbilityBehavior.CHARGE),
      hasWindfury: hasAbilityType(AbilityBehavior.WINDFURY),
      hasDivineShield: hasAbilityType(AbilityBehavior.DIVINE_SHIELD),
      isInstakill: hasAbilityType(AbilityBehavior.INSTAKILL),
      hasPoison: hasAbilityType(AbilityBehavior.POISON),
      hasReflection: hasAbilityType(AbilityBehavior.REFLECTION),
      hasLifesteal: hasAbilityType(AbilityBehavior.LIFESTEAL),
      isFrozen: (data as any).isFrozen || false,
      poisonDuration: (data as any).poisonDuration || 0,
  };

  const isSpell = data.type === CardType.SPELL;
  const activeRank = data.rank ?? CardRank.BRONZE;
  
  const rankStyle = isSpell 
    ? { border: 'border-purple-500/60', bg: 'bg-purple-950', glow: 'shadow-[0_0_15px_-3px_rgba(168,85,247,0.4)]', text: 'text-purple-300' }
    : RANK_STYLES[activeRank];

  const sizeClasses = {
    xs: 'w-14 h-20 text-[7px]', // Adjusted for better mobile balance
    sm: 'w-24 h-36 text-[10px]', 
    md: 'w-28 h-40 md:w-32 md:h-44 text-xs', 
    lg: 'w-64 h-96 text-sm'
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (size === 'sm' || size === 'xs') return;
    if (!cardBodyRef.current || !bgRef.current || !glareRef.current) return;

    const rect = cardBodyRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    
    cardBodyRef.current.style.transform = `perspective(1000px) rotateX(${-yPct * 50}deg) rotateY(${xPct * 50}deg)`;
    cardBodyRef.current.style.transition = 'none';

    bgRef.current.style.transform = `translateX(${-xPct * 20}px) translateY(${-yPct * 20}px) scale(1.1)`;
    bgRef.current.style.transition = 'none';

    const glareX = e.clientX - rect.left;
    const glareY = e.clientY - rect.top;
    glareRef.current.style.background = `radial-gradient(circle at ${glareX}px ${glareY}px, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)`;
    glareRef.current.style.opacity = '1';
    glareRef.current.style.transition = 'none';
  };

  const handleMouseLeave = () => {
    if (size === 'sm' || size === 'xs') return;
    if (!cardBodyRef.current || !bgRef.current || !glareRef.current) return;

    cardBodyRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    cardBodyRef.current.style.transition = 'transform 0.4s ease-out';
    
    bgRef.current.style.transform = 'translateX(0) translateY(0) scale(1)';
    bgRef.current.style.transition = 'transform 0.4s ease-out';

    glareRef.current.style.opacity = '0';
    glareRef.current.style.transition = 'opacity 0.4s ease-out';
  };

  return {
      containerRef,
      cardBodyRef,
      bgRef,
      glareRef,
      resolvedAbilities,
      keywords,
      rankStyle,
      sizeClass: sizeClasses[size],
      isSpell,
      activeRank,
      handleMouseMove,
      handleMouseLeave
  };
};
