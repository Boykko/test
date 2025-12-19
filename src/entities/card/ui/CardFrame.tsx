import { RANK_RIBBON_COLORS, RANK_STYLES } from "@/shared/config/ranks.ts";
import { IMAGE_BASE_URL }                               from "@/shared/constants.ts";
import { CardData, CardRank }                                               from "@/shared/types";
import { cn }                                                               from "@/shared/utils.ts";
import { AnimatePresence, motion }                                          from "framer-motion";
import { Droplets, Heart, Info, Shield, Snowflake, Star, Sword, Wind, Zap } from "lucide-react";
import React, { useState }                                                  from "react";

export interface CardFrameProps {
    data: CardData;
    size: "xs" | "sm" | "md" | "lg";
    rankStyle?: { border: string, bg: string, glow: string, text: string };
    keywords: {
        isTaunt: boolean;
        isInstakill: boolean;
        hasLifesteal: boolean;
        hasCharge: boolean;
        hasWindfury: boolean;
        hasReflection: boolean;
        hasDivineShield: boolean;
        hasPoisonDot?: boolean;
        isFrozen?: boolean;
        poisonDuration?: number;
    };
    stats: { attack: number; health: number; cost: number; armor: number };
    isSpell: boolean;
    activeRank: CardRank;
    resolvedAbilities?: any[];
    containerRef?: React.RefObject<HTMLDivElement>;
    cardBodyRef?: React.RefObject<HTMLDivElement>;
    bgRef?: React.RefObject<HTMLDivElement>;
    glareRef?: React.RefObject<HTMLDivElement>;
    onMouseMove?: (e: React.MouseEvent) => void;
    onMouseLeave?: () => void;
    onClick?: (e: React.MouseEvent) => void;
    isSelected?: boolean;
    canAttack?: boolean;
    isInteractable?: boolean;
    tooltipDirection?: "top" | "bottom" | "left" | "right";
    className?: string;
    children?: React.ReactNode;
}

export const CardFrame: React.FC<CardFrameProps> = ({
                                                        data,
                                                        size,
                                                        keywords,
                                                        stats,
                                                        isSpell,
                                                        activeRank,
                                                        resolvedAbilities = [],
                                                        containerRef,
                                                        cardBodyRef,
                                                        bgRef,
                                                        glareRef,
                                                        onMouseMove,
                                                        onMouseLeave,
                                                        onClick,
                                                        isSelected,
                                                        canAttack,
                                                        isInteractable,
                                                        tooltipDirection = "right",
                                                        className,
                                                        children,
                                                    }) => {
    const [isHovered, setIsHovered] = useState(false);
    const style                     = RANK_STYLES[activeRank] || RANK_STYLES[CardRank.BRONZE];
    const ribbonColor               = RANK_RIBBON_COLORS[activeRank] || RANK_RIBBON_COLORS[CardRank.BRONZE];

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeaveLocal = () => {
        setIsHovered(false);
        onMouseLeave?.();
    };

    const StatBadge = React.memo(({ value, type, icon: Icon }: any) => {
        const positionClasses = {
            attack: "bottom-0 left-0",
            health: "bottom-0 right-0",
            cost: "top-0 left-0",
            armor:  "bottom-0 left-1/2",
        };

        const getTranslate = () => {
            const z = "translateZ(60px)";
            switch (type) {
                case "attack": return `${z} translate(-50%, 50%)`;
                case "health": return `${z} translate(50%, 50%)`;
                case "cost":   return `${z} translate(-50%, -50%)`;
                case "armor":  return `${z} translate(-50%, 50%)`;
                default:       return z;
            }
        };

        const colorClasses = {
            attack: "border-amber-500/50 text-amber-400",
            health: "border-rose-500/50 text-rose-400",
            cost: "border-sky-500/50 text-sky-400",
            armor: "border-slate-400/50 text-slate-100",
        };

        return (
            <div
                className={cn(
                    "absolute z-[100] flex items-center justify-center font-black shadow-[0_12px_24px_rgba(0,0,0,0.9)] backdrop-blur-2xl rounded-full bg-slate-950",
                    size === "xs" ? "w-5 h-5 text-[10px] border" :
                        size === "lg" ? "w-24 h-24 text-6xl border-[6px]" :
                            "w-10 h-10 md:w-8 md:h-8 text-xl md:text-xl border-2",
                    positionClasses[type as keyof typeof positionClasses],
                    colorClasses[type as keyof typeof colorClasses]
                )}
                style={{ transform: getTranslate() }}
            >
                {size !== "xs" && type !== "cost" && (
                    <Icon
                        className={cn(
                            "absolute z-[500] opacity-20 mix-blend-screen",
                            size === "lg" ? "w-16 h-16" : "w-2/3 h-2/3",
                        )}
                    />
                )}
                <span className="z-10 relative drop-shadow-[0_4px_4px_rgba(0,0,0,1)] text-white">
                    {value}
                </span>
            </div>
        );
    });

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative group flex-shrink-0 select-none perspective-1000",
                size === "xs" ? "w-14 h-20" : (size === "sm" ? "w-24 h-36" : (size === "md" ? "w-32 h-44" : "w-64 h-96")),
                isInteractable && "cursor-pointer hover:z-50 transition-all duration-200",
                isSelected && "z-40 scale-105 ring-4 ring-green-500 rounded-xl",
                keywords.isFrozen && "animate-shiver",
                className,
            )}
            onClick={isInteractable ? onClick : undefined}
            onMouseMove={onMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeaveLocal}
            style={{ transformStyle: "preserve-3d" }}
        >
            {/* Tooltip Overlay */}
            <AnimatePresence>
                {isHovered && size !== "xs" && size !== "lg" && resolvedAbilities.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, x: "-50%" }} // Важно: x: "-50%" должен быть и тут
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 10, x: "-50%" }}
                        className={cn(
                            "absolute z-[1] flex flex-col gap-2 w-56 pointer-events-none",
                            "left-1/2 bottom-full", // left-1/2 ставит начало блока по центру карты
                            "transform", // Включает работу трансформаций
                        )}
                        style={{ left: "50%", transform: "translateX(-50%)" }} // Дублируем в style для гарантии
                    >
                        {resolvedAbilities.map((ab, i) => (
                            <div key={i}
                                 className="bg-slate-900/98 border border-amber-500/40 p-3 rounded-xl shadow-2xl backdrop-blur-xl ring-1 ring-white/5">
                                <div
                                    className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                    <Info size={10} /> {ab.def.name}
                                </div>
                                <div className="text-slate-100 text-xs leading-relaxed font-medium">
                                    {ab.description}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                ref={cardBodyRef}
                className={cn(
                    "w-full h-full flex flex-col items-center overflow-hidden relative shadow-2xl transition-all duration-500",
                    keywords.isTaunt ? "taunt-frame border-[6px] border-slate-500 bg-slate-900" : (isSpell ? "rounded-full border-4 border-purple-500/80" : "rounded-2xl border-2"),
                    !keywords.isTaunt && !isSpell && style.border,
                    style.glow,
                    keywords.isInstakill && "animate-toxic border-green-500/70",
                    canAttack && !isSelected && "ring-2 ring-green-500/80  animate-pulse",
                )}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Dynamic Stat Badges */}
                <StatBadge
                    value={stats.cost}
                    type="cost"
                    icon={Star}
                    borderColor={isInteractable ? "border-green-400" : (keywords.hasCharge ? "border-yellow-400" : "border-blue-500")}
                    textColor={isInteractable ? "text-green-300" : "text-blue-200"}
                />

                {!isSpell && (
                    <>
                        <StatBadge
                            value={stats.attack}
                            type="attack"
                            icon={Sword}
                            borderColor={keywords.isInstakill ? "border-green-600" : "border-amber-600"}
                            textColor={stats.attack > data.baseAttack ? "text-green-400" : "text-amber-100"}
                        />
                        <StatBadge
                            value={stats.health}
                            type="health"
                            icon={Heart}
                            borderColor={stats.health < data.baseHealth ? "border-red-600" : "border-red-500"}
                            textColor={stats.health < data.baseHealth ? "text-red-400" : (stats.health > data.baseHealth ? "text-green-400" : "text-red-100")}
                        />
                        {stats.armor > 0 &&
				            <StatBadge value={stats.armor} type="armor" icon={Shield} borderColor="border-slate-500"
				                       textColor="text-slate-200" />}
                    </>
                )}
                {/* Taunt Visual Reinforcement */}
                {keywords.isTaunt && (
                    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                        <div
                            className="absolute top-0 left-0 w-full h-full border-[15px] border-slate-600/30 mix-blend-overlay"></div>
                        <Shield
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 text-slate-400" />
                    </div>
                )}

                {/* Ribbon */}
                {!isSpell && (
                    <div className={cn(
                        "absolute top-0 right-0 z-20 w-12 h-12 md:w-20 md:h-20 overflow-hidden",
                        size === "xs" ? "scale-75 origin-top-right" : (size === "lg" ? "scale-150 origin-top-right" : ""),
                    )}>
                        <div className={cn(
                            "absolute top-1 -right-4 md:top-0 md:-right-8 w-24 md:w-132 py-4 bg-gradient-to-r rotate-45 text-center text-[8px] md:text-[8px] font-black tracking-[0.2em] text-white flex items-center justify-center uppercase",
                            ribbonColor,
                        )}>
                        </div>
                    </div>
                )}

                {/* Special Effect Icons (Top Right Overlay) */}
                <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
                    {keywords.isInstakill && <div
						className="p-1.5 bg-green-950/90 rounded-full border border-green-400/50 shadow-[0_0_10px_rgba(34,197,94,0.5)] poison-aura"
						title="Мгновенное убийство"><Droplets size={size === "lg" ? 24 : 14}
					                         className="text-green-400 fill-green-400/20" /></div>}
                    {keywords.hasPoisonDot && <div
                        className="p-1.5 bg-lime-950/90 rounded-full border border-lime-400/50 shadow-[0_0_10px_rgba(163,230,53,0.5)]"
                        title="Способность яда (отравляет цель)"><Droplets size={size === "lg" ? 24 : 14}
                                             className="text-lime-400 fill-lime-400/20" /></div>}
                    {(keywords.poisonDuration || 0) > 0 && <div
                        className="p-1.5 bg-emerald-950/90 rounded-full border border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.7)] animate-toxic"
                        title={`Отравлен (еще ${keywords.poisonDuration} хода)`}><Droplets size={size === "lg" ? 24 : 14}
                                             className="text-emerald-300 fill-emerald-300/40" />
                        <span className="absolute -top-1 -right-1 bg-emerald-600 text-[8px] px-1 rounded-full text-white font-bold">{keywords.poisonDuration}</span>
                    </div>}
                    {keywords.hasLifesteal && <div
						className="p-1.5 bg-pink-950/90 rounded-full border border-pink-400/50 shadow-[0_0_10px_rgba(244,114,182,0.5)]"
						title="Вампиризм"><Heart size={size === "lg" ? 24 : 14}
					                             className="text-pink-400 fill-pink-400/20" /></div>}
                    {keywords.hasCharge && <div
						className="p-1.5 bg-yellow-950/90 rounded-full border border-yellow-400/50 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
						title="Рывок"><Zap size={size === "lg" ? 24 : 14}
					                       className="text-yellow-400 fill-yellow-400/20" /></div>}
                    {keywords.hasWindfury && <div
						className="p-1.5 bg-cyan-950/90 rounded-full border border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
						title="Неистовство"><Wind size={size === "lg" ? 24 : 14} className="text-cyan-400" /></div>}
                    {keywords.isTaunt &&
						<div className="p-1.5 bg-slate-900/90 rounded-full border border-slate-400/50 shadow-lg"
						     title="Провокация"><Shield size={size === "lg" ? 24 : 14} className="text-slate-200" />
						</div>}
                </div>

                {/* Card Artwork */}
                <div className="absolute inset-0 z-0 bg-slate-950">
                    <div ref={bgRef} className="w-full h-full absolute inset-0">
                        <img
                            src={data.src.startsWith("http") ? data.src : `${IMAGE_BASE_URL}${data.src}`}
                            alt={data.title}
                            className={cn(
                                "w-full h-full object-cover transition-transform duration-700 group-hover:scale-100 ",
                                isSpell && "scale-150",
                                keywords.isFrozen && "saturate-[0.3] contrast-125 brightness-110",
                            )}
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                    </div>
                </div>

                {/* Frozen Visual Layer */}
                {keywords.isFrozen && (
                    <div className="absolute inset-0 z-30 pointer-events-none freeze-layer animate-frost">
                        <div
                            className="absolute inset-0 border-[6px] border-cyan-300/40 rounded-2xl shadow-[inset_0_0_40px_rgba(165,243,252,0.5)]"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <Snowflake className={cn("text-cyan-100/50", size === "lg" ? "w-64 h-64" : "w-24 h-24")}
                                       strokeWidth={1} />
                        </div>
                        {/* Ice shards overlay */}
                        <div
                            className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay"></div>
                    </div>
                )}

                {/* Divine Shield Visual Layer */}
                {keywords.hasDivineShield && (
                    <div className="absolute inset-0 z-[45] pointer-events-none flex items-center justify-center p-1">
                        <div
                            className="w-full h-full rounded-2xl border-[4px] animate-divine shadow-[0_0_25px_rgba(253,224,71,0.5),inset_0_0_15px_rgba(253,224,71,0.3)] bg-gradient-to-tr from-yellow-400/5 to-transparent"></div>
                        <div
                            className="absolute top-0 left-0 w-full h-full bg-yellow-400/5 animate-pulse rounded-2xl"></div>
                    </div>
                )}

                {/* Ability Description Box */}
                {size !== "xs" && (
                    <div className={cn(
                        "absolute z-20 flex flex-col items-center text-center pointer-events-none px-3",
                        size === "lg" ? "bottom-28 left-8 right-8" : "bottom-10 left-0 right-0",
                    )}>
                        <div className={cn(
                            "w-full bg-slate-950/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden py-1 px-2",
                            size === "lg" ? "p-6" : "p-1.5",
                            keywords.isTaunt && "border-slate-500/40",
                        )}>
                            {resolvedAbilities.length > 0 ? (
                                <div className={cn(
                                    "text-slate-50 font-black leading-snug drop-shadow-[0_2px_3px_rgba(0,0,0,1)]",
                                    size === "lg" ? "text-xl md:text-2xl gap-5 flex flex-col" : "text-[9px] md:text-[11px]",
                                )}>
                                    {resolvedAbilities.map((ab, i) => (
                                        <div key={i} className="mb-1 last:mb-0">
                                            {ab.description}
                                        </div>
                                    ))}
                                </div> 
                            ) : (
                                <div
                                    className={cn("text-slate-400 italic font-bold", size === "lg" ? "text-xl py-4" : "text-[10px]")}>
                                    {isSpell ? "Магический свиток" : "Обычный воин"}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Glare/Shine Effect */}
                <div ref={glareRef}
                     className="absolute inset-0 pointer-events-none z-40 mix-blend-overlay rounded-2xl opacity-1" />

                {/* Title/Name Plate */}
                <div className={cn(
                    "absolute left-0 right-0 px-3 z-10 flex flex-col items-center",
                    size === "lg" ? "bottom-10" : "bottom-2.5",
                )}>
                    {size !== "xs" && (
                        <div className="relative w-full group-hover:scale-105 transition-transform">
                            <div className={cn(
                                "absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-full border border-white/20 shadow-2xl",
                                keywords.isTaunt && "border-slate-500/50",
                            )}></div>
                            <div className={cn(
                                "relative text-center font-fantasy font-black tracking-[0.05em] truncate w-full py-1.5 px-5 drop-shadow-lg",
                                size === "lg" ? "text-2xl md:text-3xl" : "text-[10px] md:text-[8px]", style.text,
                            )}>
                                {data.title}
                            </div>
                        </div>
                    )}
                </div>
            </div>



            {children}
        </div>
    );
};
