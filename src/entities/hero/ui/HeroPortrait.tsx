import { PlayerState }                from "@/shared/types";
import { cn }                         from "@/shared/utils.ts";
import { AnimatePresence, motion }    from "framer-motion";
import { Shield, Skull }              from "lucide-react";
import React, { useEffect, useState } from "react";
import { ManaDisplay }                from "./ManaDisplay";

interface HeroPortraitProps {
    player: PlayerState;
    isEnemy?: boolean;
    isActive?: boolean;
    isTargetable?: boolean;
    onClick?: (e?: React.MouseEvent) => void;
    onHeroPowerClick?: (e: React.MouseEvent) => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    emoji: string;
    id?: string;
    turnEndTime?: number;
    combatPreview?: {
        willDie: boolean;
        damageTaken: number;
    };
    emote?: string;
    isSelected?: boolean;
}

export const HeroPortrait: React.FC<HeroPortraitProps> = ({
                                                              player,
                                                              isEnemy = false,
                                                              isActive = false,
                                                              isTargetable = false,
                                                              onClick,
                                                              onHeroPowerClick,
                                                              onMouseEnter,
                                                              onMouseLeave,
                                                              emoji,
                                                              id,
                                                              turnEndTime,
                                                              combatPreview,
                                                              emote,
                                                              isSelected,
                                                          }) => {
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        if (!isActive || !turnEndTime) {
            setTimeLeft(30);
            return;
        }

        const updateTimer = () => {
            const remaining = Math.max(0, Math.ceil((turnEndTime - Date.now()) / 1000));
            setTimeLeft(remaining);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 500);
        return () => clearInterval(interval);
    }, [isActive, turnEndTime]);

    const radius        = 38;
    const circumference = 2 * Math.PI * radius;
    const progress      = Math.min(1, Math.max(0, timeLeft / 30));
    const dashOffset    = circumference - progress * circumference;

    const isCriticalTime = timeLeft <= 8 && isActive;
    const displayHealth  = Math.max(0, player.heroHealth);

    return (
        <motion.div
            layoutId={id}
            className={cn(
                "flex items-center gap-2 md:gap-5 transition-all duration-500 relative",
                isActive ? "scale-105" : "scale-90 opacity-80",
            )}
            data-target-id={id}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="relative group">

                {isActive && (
                    <div className={cn(
                        "absolute -inset-2 md:-inset-4 rounded-full blur-xl opacity-30 animate-pulse-slow",
                        isEnemy ? "bg-rose-500" : "bg-emerald-500",
                    )} />
                )}

                {isActive && displayHealth > 0 && (
                    <svg
                        className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] z-10 -rotate-90 pointer-events-none overflow-visible">
                        <circle
                            cx="50%" cy="50%" r={radius}
                            fill="none"
                            stroke={isCriticalTime ? "#ef4444" : (isEnemy ? "#fb7185" : "#10b981")}
                            strokeWidth="6"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            strokeLinecap="round"
                            className="transition-[stroke-dashoffset] duration-500 ease-linear"
                        />
                    </svg>
                )}

                <div
                    onClick={onClick}
                    className={cn(
                        "relative w-14 h-14 md:w-20 md:h-20 rounded-full border-2 md:border-4 flex items-center justify-center cursor-pointer transition-all duration-300 z-20 overflow-hidden bg-slate-900",
                        isEnemy ? "border-rose-900/40" : "border-emerald-900/40",
                        isActive && !isEnemy && displayHealth > 0 && "border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]",
                        isActive && isEnemy && displayHealth > 0 && "border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)]",
                        isTargetable && "ring-4 ring-rose-500 animate-pulse shadow-[0_0_30px_rgba(244,63,94,0.6)]",
                        displayHealth <= 0 && "grayscale brightness-50",
                    )}
                >
                    <div
                        className={cn("text-2xl md:text-4xl select-none", displayHealth <= 0 && "opacity-50")}>{emoji}</div>

                    {player.heroArmor > 0 && (
                        <div
                            className="absolute top-0 right-0 w-6 h-6 md:w-8 md:h-8 bg-slate-500 border-2 border-slate-300 rounded-full flex items-center justify-center text-[10px] md:text-xs font-black text-white shadow-lg z-40">
                            <Shield size={12} className="absolute opacity-20" />
                            <span className="relative">{player.heroArmor}</span>
                        </div>
                    )}

                    <div className={cn(
                        "absolute bottom-0 right-0 w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center text-[10px] md:text-base font-black border-2 shadow-xl z-30",
                        isEnemy ? "bg-rose-700 border-rose-400 text-rose-50" : "bg-emerald-700 border-emerald-400 text-emerald-50",
                        displayHealth <= 0 && "bg-slate-800 border-slate-600",
                    )}>
                        {displayHealth <= 0 ? <Skull size={14} className="text-white" /> : displayHealth}
                    </div>

                    <AnimatePresence>
                        {combatPreview && displayHealth > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-[2px] pointer-events-none"
                            >
                                {combatPreview.willDie ? (
                                    <Skull className="text-rose-500 w-8 h-8 md:w-12 md:h-12" />
                                ) : (
                                    <span
                                        className="text-lg md:text-2xl font-black text-rose-500 drop-shadow-lg">-{combatPreview.damageTaken}</span>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex flex-col gap-0.5 md:gap-1">
                <div className="hidden md:block">
                    <ManaDisplay current={player.mana} max={player.maxMana} align="left" />
                </div>
                <div
                    className="text-[8px] md:text-xs text-blue-300 font-black font-mono tracking-widest bg-blue-900/30 px-2 py-0.5 rounded-full border border-blue-500/10">
                    {player.mana} / {player.maxMana}
                </div>
            </div>

            <AnimatePresence>
                {emote && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0, y: 0 }}
                        animate={{ scale: 1, opacity: 1, y: -35 }}
                        exit={{ scale: 0, opacity: 0, y: -50 }}
                        className={cn(
                            "absolute top-0 z-[60] bg-white text-black px-3 py-1.5 rounded-xl shadow-2xl font-bold border-2 border-slate-200 text-xl",
                            isEnemy ? "left-0" : "right-0",
                        )}
                    >
                        {emote}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
