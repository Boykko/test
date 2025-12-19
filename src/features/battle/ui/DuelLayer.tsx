import { GameCard }                from "@/entities/card/model/types.ts";
import { PlayerState }             from "@/entities/hero/model/types.ts";
import { AnimatePresence, motion } from "framer-motion";
import { Swords }                  from "lucide-react";
import React                       from "react";
import { cn }                      from "@/shared/utils";
import { DuelState }               from "../useBattleVisuals";
import { BattleCard }              from "./BattleCard";

interface DuelLayerProps {
  duelState: DuelState | null;
  player: PlayerState;
  enemy: PlayerState;
}

export const DuelLayer = React.memo(({ duelState, player, enemy }: DuelLayerProps) => {
  return (
    <AnimatePresence>
        {duelState && (
            <DuelContent 
                key={`duel-${duelState.attackerId}-${duelState.targetId}`}
                duelState={duelState} 
                player={player} 
                enemy={enemy} 
            />
        )}
    </AnimatePresence>
  );
});

interface DuelParticipant {
    id: string;
    card?: GameCard;
    isHero?: boolean;
    playerData?: PlayerState;
}

const DuelContent: React.FC<DuelLayerProps & { duelState: DuelState }> = ({ duelState, player, enemy }) => {
  const [impacted, setImpacted] = React.useState(false);

  console.log('DuelContent Mounting', { duelState });

  const getParticipant = (id: string): DuelParticipant | undefined => {
      if (id === 'HERO_PLAYER') return { id, isHero: true, playerData: player };
      if (id === 'HERO_ENEMY') return { id, isHero: true, playerData: enemy };

      const card = player.board.find(c => c.uniqueId === id) ||
                   enemy.board.find(c => c.uniqueId === id) ||
                   player.hand.find(c => c.uniqueId === id) ||
                   enemy.hand.find(c => c.uniqueId === id) ||
                   player.graveyard.find(c => c.uniqueId === id) ||
                   enemy.graveyard.find(c => c.uniqueId === id);

      if (!card) {
          console.warn(`Participant not found: ${id}`, {
              playerBoard: player.board.map(c => c.uniqueId),
              enemyBoard: enemy.board.map(c => c.uniqueId)
          });
      }

      return card ? { id, card } : undefined;
  };

  const attacker = getParticipant(duelState.attackerId);
  const target = getParticipant(duelState.targetId);

  console.log('Duel Participants:', { attacker: !!attacker, target: !!target });

  React.useEffect(() => {
    // Timing for impact effect (matches the spring motion anticipation)
    const timer = setTimeout(() => setImpacted(true), 400);
    return () => clearTimeout(timer);
  }, []);

  if (!attacker) return null;

  const renderParticipant = (p: DuelParticipant, isAttacker: boolean) => (
      <motion.div
          layoutId={p.id}
          className={cn("absolute z-30", !isAttacker && "z-20")}
          initial={{ scale: 1, opacity: 0, rotate: 0 }}
          animate={{ 
              x: impacted 
                ? (isAttacker ? [-180, -40, -60] : [180, 40, 60]) 
                : (isAttacker ? -180 : 180),
              scale: impacted 
                ? (isAttacker ? [1.4, 1.6, 1.45] : [1.3, 1.5, 1.35]) 
                : (isAttacker ? 1.4 : 1.3),
              rotate: impacted 
                ? (isAttacker ? [0, 25, 15] : [0, -25, -15]) 
                : 0,
              opacity: 1,
          }}
          transition={{ 
              duration: 0.8,
              times: [0, 0.2, 1],
              ease: "easeOut",
              type: 'spring', 
              stiffness: impacted ? 500 : 200, 
              damping: impacted ? 20 : 15
          }}
          exit={{ 
              scale: 1, 
              opacity: 0,
              transition: { duration: 0.2 } 
          }}
      >
          <div className={impacted ? "animate-pulse-white" : ""}>
              {p.isHero && p.playerData ? (
                  <div className="bg-slate-900 border-4 border-amber-500 rounded-full w-40 h-40 flex items-center justify-center text-7xl shadow-[0_0_50px_rgba(245,158,11,0.3)]">
                      {p.id === 'HERO_PLAYER' ? '🧙‍♂️' : '😈'}
                  </div>
              ) : p.card ? (
                  <BattleCard 
                      data={p.card} 
                      size="md" 
                      isInteractable={false}
                  />
              ) : null}
          </div>
      </motion.div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Darken the background slightly to focus on the battle */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
      />

      <div className="relative w-full h-full flex items-center justify-center">
        
        {/* Attacker */}
        {renderParticipant(attacker, true)}

        {/* Impact Visuals */}
        <div className="absolute z-50 flex items-center justify-center">
            <AnimatePresence>
                {impacted && (
                    <>
                        {/* Swords Icon */}
                        <motion.div 
                            initial={{ scale: 0, opacity: 0, rotate: -45 }}
                            animate={{ 
                                scale: [0, 3.5, 2.8], 
                                opacity: [0, 1, 1],
                                rotate: [0, 15, 0] 
                            }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.5, type: 'spring' }}
                            className="text-white drop-shadow-[0_0_50px_rgba(255,255,255,1)]"
                        >
                            <div className="bg-gradient-to-br from-amber-500 via-red-600 to-red-900 p-6 rounded-full border-4 border-white shadow-[0_0_60px_rgba(239,68,68,0.8)]">
                               <Swords size={80} fill="currentColor" strokeWidth={1} />
                            </div>
                        </motion.div>
                        
                        {/* Shockwave circle */}
                        <motion.div
                            initial={{ scale: 0.5, opacity: 1 }}
                            animate={{ scale: 15, opacity: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="absolute w-20 h-20 border-[20px] border-white rounded-full blur-[4px]"
                        />

                        {/* Flash Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0.8, 0] }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-white pointer-events-none mix-blend-overlay"
                        />
                    </>
                )}
            </AnimatePresence>
        </div>

        {/* Target */}
        {target && renderParticipant(target, false)}
      </div>
    </div>
  );
};
