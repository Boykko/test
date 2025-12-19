import { SoundContext }                from "@/app/App.tsx";
import { useUIStore }                  from "@/app/model/uiStore.ts";
import { useGame }                     from "@/app/providers/GameProvider.tsx";
import { useTargeting }                from "@/features/battle/model/useTargeting.ts";
import {
    BattleBoard,
    BattleEnemyZone,
    BattlePlayerZone,
    BattleSidebar,
    BattleVfxOverlay,
    ChoiceOverlay,
    DeckContentsOverlay,
    DeckDisplay,
    DuelLayer,
    EmoteMenu,
    MulliganOverlay,
    TargetingArrow,
    DevCardEditor,
}                                      from "@/features/battle/ui";
import { BattleVFXLayer }              from "@/features/battle/ui/BattleVFXLayer.tsx";
import { CardDeathParticles }          from "@/features/battle/ui/particles/CardDeathParticles.tsx";
import { MatchmakingOverlay }          from "@/features/battle/ui/MatchmakingOverlay.tsx";
import { useBattleSystem }             from "@/features/battle/useBattleSystem.ts";
import { useBattleVisuals }            from "@/features/battle/useBattleVisuals.ts";
import { AnimatePresence }             from "framer-motion";
import React, { useContext, useState } from "react";
import { useMediaQuery }               from "@/shared/lib/useMediaQuery.ts";
import { GamePhase }                   from "@/shared/types.ts";

export const BattleArena: React.FC = () => {
    const { allCards, userDeckIds, setPhase, abilitiesRegistry, gameMode } = useGame();
    const showHistory                                                      = useUIStore(state => state.showHistory);

    const visuals                                                             = useBattleVisuals();
    const { animatingCards, floatingTexts, deathVfxQueue, screenShake, vfxQueue, duelState } = visuals;


    const sounds   = useContext(SoundContext);
    const isMobile = useMediaQuery("(max-width: 768px)");

    const battle = useBattleSystem(allCards, userDeckIds, setPhase, visuals, sounds, gameMode);

    const {
              targetingSourceId, startPos, validTargetIds, combatPreview,
              handleHandClick, handleHeroPowerClick, handlePlayerMinionClick, handleTargetClick, cancelTargeting,
              onHoverTarget, onLeaveTarget,
          } = useTargeting({
        player:            battle.player,
        enemy:             battle.enemy,
        abilitiesRegistry,
        playCard:          battle.playCard,
        useHeroPower:      battle.useHeroPower,
        runCombatSequence: battle.runCombatSequence,
        turn:              battle.turn,
        sounds,
        setMessage:        battle.setMessage,
        setSelectedCardId: battle.setSelectedCardId,
        battlePhase:       battle.battlePhase,
    });

    const [isEmoteMenuOpen, setIsEmoteMenuOpen] = useState(false);

    const handleCardDevContextMenu = (e: React.MouseEvent, card: any) => {
        e.preventDefault();
        e.stopPropagation();
        battle.openDevEditor(card);
    };

    // Matchmaking phase has a separate screen
    if (battle.battlePhase === "MATCHMAKING") {
        return (
            <MatchmakingOverlay
                status={battle.matchStatus}
                opponent={battle.opponentInfo}
                lobbies={battle.lobbies}
                onAccept={battle.acceptMatch}
                onCancel={battle.cancelSearch}
                onCreateLobby={battle.createLobby}
                onJoinLobby={battle.joinLobby}
            />
        );
    }

    return (
        <div
            className={`h-screen w-full flex flex-col overflow-hidden relative selection:bg-none select-none transition-transform duration-100 bg-slate-950 text-slate-200 ${screenShake ? "translate-x-1 translate-y-1" : ""}`}
            onClick={() => {
                cancelTargeting();
                setIsEmoteMenuOpen(false);
            }}
        >
            {/* Table & Ambience Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0a0f1e] to-slate-950 z-0"></div>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            {/* Death Particles */}
            {deathVfxQueue.map(vfx => (
                <CardDeathParticles key={vfx.id} x={vfx.x} y={vfx.y} />
            ))}

            {/* Visual Effects Layers */}
            <BattleVFXLayer queue={vfxQueue} />
            <DuelLayer duelState={duelState} player={battle.player} enemy={battle.enemy} />
            {targetingSourceId && startPos && <TargetingArrow start={startPos} />}

            {/* Floating UI Overlays */}
            <BattleVfxOverlay floatingTexts={floatingTexts} message={battle.message} />
            <EmoteMenu isOpen={isEmoteMenuOpen} onClose={() => setIsEmoteMenuOpen(false)} onSelect={battle.sendEmote} />

            <AnimatePresence>
                {battle.devEditorCard && (
                    <DevCardEditor 
                        card={battle.devEditorCard} 
                        onClose={battle.closeDevEditor} 
                        onSave={battle.updateCardDev} 
                    />
                )}
            </AnimatePresence>

            {/* Game Phase Overlays */}
            {battle.battlePhase === "MULLIGAN" && (
                <MulliganOverlay
                    cards={battle.player.hand}
                    selectedIds={battle.mulliganSelected}
                    onToggle={battle.toggleMulliganCard}
                    onConfirm={battle.confirmMulligan}
                    onCardContextMenu={handleCardDevContextMenu}
                />
            )}

            {/* Discover Mechanic */}
            <AnimatePresence>
                {battle.pendingChoice && battle.pendingChoice.side === "PLAYER" && (
                    <ChoiceOverlay options={battle.pendingChoice.options} onChoose={battle.handleChoice} />
                )}
            </AnimatePresence>

            {/* Collection Exploration */}
            <AnimatePresence>
                {battle.deckPreview &&
					<DeckContentsOverlay cards={battle.deckPreview} onClose={battle.closeDeckPreview} />}
            </AnimatePresence>

            {/* Static Sidebar (Logs, History, Menu) */}
            <BattleSidebar logs={battle.logs} gameMode={gameMode} onMenuClick={() => setPhase(GamePhase.MENU)}
                           showHistory={showHistory} />

            {/* Interactive Deck Stacks */}
            <div
                className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-40 flex flex-col justify-between h-[40vh] pointer-events-none">
                <div className="origin-right scale-90 md:scale-100">
                    <DeckDisplay side="ENEMY" count={battle.enemy.deck.length} isDrawing={battle.isDrawingEnemy} />
                </div>
                <div className="pointer-events-auto origin-right scale-90 md:scale-100">
                    <DeckDisplay side="PLAYER" count={battle.player.deck.length} isDrawing={battle.isDrawingPlayer}
                                 onClick={battle.peekDeck} />
                </div>
            </div>

            {/* Main Battle Zones */}
            <BattleEnemyZone
                enemy={battle.enemy} turn={battle.turn} validTargetIds={validTargetIds}
                onTargetClick={handleTargetClick} turnEndTime={battle.turnEndTime}
                onHoverTarget={onHoverTarget} onLeaveTarget={onLeaveTarget}
                combatPreview={combatPreview} emote={battle.activeEmotes.ENEMY}
                duelState={duelState}
            />

            <BattleBoard
                playerBoard={battle.player.board} enemyBoard={battle.enemy.board}
                turn={battle.turn} validTargetIds={validTargetIds}
                targetingSourceId={targetingSourceId} animatingCards={animatingCards}
                isMobile={isMobile} onPlayerMinionClick={handlePlayerMinionClick}
                onTargetClick={handleTargetClick} onHoverTarget={onHoverTarget}
                onLeaveTarget={onLeaveTarget} combatPreview={combatPreview} duelState={duelState}
                onCardContextMenu={handleCardDevContextMenu}
            />

            <BattlePlayerZone
                player={battle.player} turn={battle.turn} battlePhase={battle.battlePhase}
                validTargetIds={validTargetIds} targetingSourceId={targetingSourceId}
                message="" /* Message handled by BattleVfxOverlay */ isMobile={isMobile}
                onHandClick={handleHandClick} onHeroPowerClick={handleHeroPowerClick}
                onTargetClick={handleTargetClick} onEndTurn={battle.endTurn}
                turnEndTime={battle.turnEndTime} onHoverTarget={onHoverTarget}
                onLeaveTarget={onLeaveTarget} combatPreview={combatPreview}
                onCardContextMenu={handleCardDevContextMenu}
                emote={battle.activeEmotes.PLAYER}
                duelState={duelState}
                onHeroClick={(e) => {
                    e.stopPropagation();
                    if (battle.turn === "PLAYER" && !targetingSourceId) setIsEmoteMenuOpen(!isEmoteMenuOpen);
                    else if (targetingSourceId) handleTargetClick("HERO_PLAYER", true);
                }}
            />
        </div>
    );
};
