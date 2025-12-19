import { GameCard }      from "@/entities/card/model/types.ts";
import { CombatPreview } from "@/features/battle/model/useTargeting.ts";
import { DuelState }     from "@/features/battle/useBattleVisuals.ts";
import { cn }            from "@/shared/utils";
import React             from "react";

import { MinionRow } from "./MinionRow";

interface BattleBoardProps {
    playerBoard: GameCard[];
    enemyBoard: GameCard[];
    turn: "PLAYER" | "ENEMY";
    validTargetIds: Set<string>;
    targetingSourceId: string | null;
    animatingCards: Record<string, string>;
    isMobile: boolean;
    onPlayerMinionClick: (e: React.MouseEvent, card: GameCard) => void;
    onTargetClick: (id: string) => void;
    onHoverTarget: (id: string) => void;
    onLeaveTarget: () => void;
    onCardContextMenu?: (e: React.MouseEvent, card: GameCard) => void;
    combatPreview: CombatPreview | null;
    duelState?: DuelState | null;
}

export const BattleBoard: React.FC<BattleBoardProps> = ({
                                                            playerBoard,
                                                            enemyBoard,
                                                            turn,
                                                            validTargetIds,
                                                            targetingSourceId,
                                                            animatingCards,
                                                            isMobile,
                                                            onPlayerMinionClick,
                                                            onTargetClick,
                                                            onHoverTarget,
                                                            onLeaveTarget,
                                                            onCardContextMenu,
                                                            combatPreview,
                                                            duelState,
                                                        }) => {
    const isPlayerTurn = turn === "PLAYER";

    return (
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full overflow-hidden px-4">
            {/* Background Ambience */}
            <div className={cn(
                "absolute inset-0 transition-opacity duration-1000 pointer-events-none z-0 opacity-40",
                isPlayerTurn ? "bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]" : "bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.05)_0%,transparent_70%)]",
            )} />

            <div className="w-full h-full max-w-7xl mx-auto flex flex-col justify-around items-center py-2 md:py-6">

                {/* Enemy Row */}
                <div className="w-full flex justify-center items-center z-20">
                    <MinionRow
                        cards={enemyBoard}
                        onCardMouseDown={(e, card) => {
                            e.stopPropagation();
                            onTargetClick(card.uniqueId);
                        }}
                        onCardContextMenu={onCardContextMenu}
                        onCardHover={onHoverTarget}
                        onCardLeave={onLeaveTarget}
                        combatPreview={combatPreview}
                        isInteractable={(card) => validTargetIds.has(card.uniqueId)}
                        isTargetable={(card) => targetingSourceId !== null && validTargetIds.has(card.uniqueId)}
                        isSelected={() => false}
                        animatingCards={animatingCards}
                        align="center"
                        cardSize={isMobile ? "xs" : "md"}
                        tooltipDirection="bottom"
                        duelState={duelState}
                    />
                </div>

                {/* Improved Center Divider */}
                <div
                    className="relative w-full h-12 flex items-center justify-center pointer-events-none overflow-visible">
                    <div className={cn(
                        "w-full max-w-4xl h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-colors duration-1000",
                        isPlayerTurn ? "via-emerald-500/20" : "via-rose-500/20",
                    )} />
                    <div className={cn(
                        "absolute w-16 h-16 md:w-32 md:h-32 border-2 rounded-full blur-[2px] transition-all duration-1000 flex items-center justify-center",
                        isPlayerTurn ? "border-emerald-500/10 bg-emerald-500/[0.02]" : "border-rose-500/10 bg-rose-500/[0.02]",
                    )}>
                        <div className={cn(
                            "w-1 h-1 rounded-full",
                            isPlayerTurn ? "bg-emerald-400 animate-ping" : "bg-rose-400 animate-ping",
                        )} />
                    </div>
                </div>

                {/* Player Row */}
                <div className="w-full flex justify-center items-center z-30">
                    <MinionRow
                        cards={playerBoard}
                        onCardMouseDown={onPlayerMinionClick}
                        onCardContextMenu={onCardContextMenu}
                        onCardHover={onHoverTarget}
                        onCardLeave={onLeaveTarget}
                        combatPreview={combatPreview}
                        isInteractable={(card) => {
                            if (targetingSourceId) return validTargetIds.has(card.uniqueId);
                            return isPlayerTurn && card.canAttack;
                        }}
                        isTargetable={(card) => targetingSourceId !== null && validTargetIds.has(card.uniqueId)}
                        isSelected={(c) => targetingSourceId === c.uniqueId}
                        animatingCards={animatingCards}
                        align="center"
                        cardSize={isMobile ? "xs" : "md"}
                        tooltipDirection="top"
                        duelState={duelState}
                    />
                </div>
            </div>
        </div>
    );
};