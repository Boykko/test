import { PlayerState }   from "@/entities/hero/model/types.ts";
import { CombatPreview } from "@/features/battle/model/useTargeting.ts";
import React             from "react";
import { HeroPortrait }  from "@/entities/hero/ui/HeroPortrait";
import { DuelState }     from "../useBattleVisuals";
import { cn }            from "@/shared/utils";
import { motion }        from "framer-motion";

interface BattleEnemyZoneProps {
  enemy: PlayerState;
  turn: 'PLAYER' | 'ENEMY';
  validTargetIds: Set<string>;
  onTargetClick: (id: string, isHero?: boolean) => void;
  turnEndTime?: number;
  onHoverTarget: (id: string) => void;
  onLeaveTarget: () => void;
  combatPreview?: CombatPreview | null;
  emote?: string;
  duelState?: DuelState | null;
}

export const BattleEnemyZone: React.FC<BattleEnemyZoneProps> = ({
  enemy, turn, validTargetIds, onTargetClick, turnEndTime, onHoverTarget, onLeaveTarget, combatPreview, emote, duelState
}) => {
  const showHeroPreview = combatPreview && combatPreview.targetId === 'HERO_ENEMY';
  const isDueling = duelState && (duelState.attackerId === 'HERO_ENEMY' || duelState.targetId === 'HERO_ENEMY');

  return (
    <div 
      className={cn(
        `flex-shrink-0 p-1 md:p-2 flex flex-col items-center justify-start relative z-20 mx-2 md:mx-4 transition-all duration-700
         bg-slate-900/30 backdrop-blur-xl border-b border-x border-white/5 rounded-b-3xl`,
        turn === 'ENEMY' ? 'shadow-[0_5px_40px_-10px_rgba(220,38,38,0.2)]' : 'shadow-none opacity-80',
        isDueling && "pointer-events-none"
      )}
    >
      <div className="flex -space-x-2 md:-space-x-3 mb-2 opacity-90 h-10 md:h-16 items-start mt-2">
         {enemy.hand.map((c, i) => (
           <div key={i} className="animate-draw w-8 h-10 md:w-12 md:h-16 bg-slate-800 border border-slate-700/50 rounded shadow-md bg-[url('https://chaosage.ru/images/card_back.jpg')] bg-cover"></div>
         ))}
      </div>
      <motion.div 
        animate={{ opacity: isDueling ? 0 : 1 }}
        className="flex items-center justify-center w-full relative -mb-6 md:-mb-8 z-20"
      >
          <HeroPortrait 
            player={enemy} 
            isEnemy={true} 
            isActive={turn === 'ENEMY'}
            isTargetable={validTargetIds.has('HERO_ENEMY')}
            turnEndTime={turn === 'ENEMY' ? turnEndTime : undefined}
            onClick={(e) => {
                e?.stopPropagation();
                onTargetClick('HERO_ENEMY', true);
            }}
            onMouseEnter={() => validTargetIds.has('HERO_ENEMY') && onHoverTarget('HERO_ENEMY')}
            onMouseLeave={onLeaveTarget}
            combatPreview={showHeroPreview ? { willDie: combatPreview.isTargetLethal, damageTaken: combatPreview.damageToTarget } : undefined}
            emoji="😈"
            id="HERO_ENEMY"
            emote={emote}
          />
      </motion.div>
    </div>
  );
};
