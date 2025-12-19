// Added missing motion import from framer-motion
import { GameCard }      from "@/entities/card/model/types.ts";
import { PlayerState }   from "@/entities/hero/model/types.ts";
import { CombatPreview } from "@/features/battle/model/useTargeting.ts";
import { BattleHand }    from "@/features/battle/ui/BattleHand.tsx";
import { motion }        from "framer-motion";
import React             from "react";
import { HeroPortrait }  from "@/entities/hero/ui/HeroPortrait";
import { cn }            from "@/shared/utils";
import { DuelState }     from "../useBattleVisuals";

interface BattlePlayerZoneProps {
  player: PlayerState;
  turn: 'PLAYER' | 'ENEMY';
  battlePhase: string;
  validTargetIds: Set<string>;
  targetingSourceId: string | null;
  message: string;
  isMobile: boolean;
  onHandClick: (e: React.MouseEvent, card: GameCard) => void;
  onHeroPowerClick?: (e: React.MouseEvent) => void;
  onTargetClick: (id: string, isHero?: boolean) => void;
  onEndTurn: () => void;
  turnEndTime?: number;
  onHoverTarget: (id: string) => void;
  onLeaveTarget: () => void;
  onCardContextMenu?: (e: React.MouseEvent, card: GameCard) => void;
  combatPreview?: CombatPreview | null;
  emote?: string;
  onHeroClick?: (e: React.MouseEvent) => void;
  duelState?: DuelState | null;
}

export const BattlePlayerZone: React.FC<BattlePlayerZoneProps> = ({
  player, turn, battlePhase, validTargetIds, targetingSourceId, message, isMobile,
  onHandClick, onHeroPowerClick, onTargetClick, onEndTurn, turnEndTime, onHoverTarget, onLeaveTarget, onCardContextMenu, combatPreview, emote, onHeroClick, duelState
}) => {
  const showHeroPreview = combatPreview && combatPreview.targetId === 'HERO_PLAYER';
  const isPlayerTurn = turn === 'PLAYER';
  const isDueling = duelState && (duelState.attackerId === 'HERO_PLAYER' || duelState.targetId === 'HERO_PLAYER');

  return (
    <div 
      className={cn(
        "flex-shrink-0 relative z-40 w-full transition-all duration-500",
        isPlayerTurn ? 'bg-gradient-to-t from-slate-900/90 to-transparent' : 'bg-slate-950/40 grayscale-[0.2]',
        isDueling && "pointer-events-none"
      )}
      onClick={(e) => e.stopPropagation()} 
    >
      {/* Visual separation line */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-px",
        isPlayerTurn ? "bg-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "bg-white/5"
      )} />

      {message && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
           <div className="bg-slate-900/95 text-amber-300 text-[10px] md:text-sm font-black px-6 py-2 rounded-full border border-amber-500/50 shadow-2xl animate-bounce-short backdrop-blur-md">
               {message}
           </div>
        </div>
      )}

      <div className="flex items-center justify-between w-full px-4 md:px-12 h-[100px] md:h-[150px] relative">
          
          {/* Left: Hero & Resources */}
          <motion.div 
            animate={{ opacity: isDueling ? 0 : 1 }}
            className="w-1/4 flex justify-start items-center"
          >
              <HeroPortrait 
                  player={player} 
                  isActive={isPlayerTurn}
                  emoji="🧙‍♂️"
                  id="HERO_PLAYER"
                  isTargetable={validTargetIds.has('HERO_PLAYER')}
                  turnEndTime={isPlayerTurn ? turnEndTime : undefined}
                  onClick={onHeroClick}
                  onHeroPowerClick={onHeroPowerClick}
                  onMouseEnter={() => validTargetIds.has('HERO_PLAYER') && onHoverTarget('HERO_PLAYER')}
                  onMouseLeave={onLeaveTarget}
                  combatPreview={showHeroPreview ? { willDie: combatPreview.isTargetLethal, damageTaken: combatPreview.damageToTarget } : undefined}
                  emote={emote}
                  isSelected={targetingSourceId === 'HERO_POWER_PLAYER'}
              />
          </motion.div>

          {/* Center: Hand - Takes as much space as needed while staying centered */}
          <div className="flex-1 flex justify-center items-end h-full relative overflow-visible">
            {battlePhase === 'PLAY' && (
              <BattleHand 
                hand={player.hand}
                mana={player.mana}
                isMyTurn={isPlayerTurn && !targetingSourceId}
                onCardClick={onHandClick}
                onCardContextMenu={onCardContextMenu}
                cardSize={isMobile ? 'xs' : 'sm'}
              />
            )}
          </div>

          {/* Right: Actions & End Turn */}
          <div className="w-1/4 flex justify-end items-center">
              <button 
                onClick={() => isPlayerTurn && onEndTurn()}
                disabled={!isPlayerTurn || battlePhase !== 'PLAY'}
                className={cn(
                  "relative px-4 py-3 md:px-10 md:py-6 rounded-2xl text-[10px] md:text-base font-black tracking-widest uppercase transition-all duration-300 border-2 overflow-hidden",
                  isPlayerTurn && battlePhase === 'PLAY'
                    ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95' 
                    : 'bg-slate-800/60 text-slate-500 border-slate-700/50 cursor-not-allowed'
                )}
              >
                <span className="relative z-10">
                  {isPlayerTurn ? (isMobile ? 'ХОД' : 'ЗАВЕРШИТЬ') : '...'}
                </span>
                {isPlayerTurn && (
                  <motion.div 
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" 
                  />
                )}
              </button>
          </div>
      </div>
    </div>
  );
};