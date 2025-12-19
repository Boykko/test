import { EyeOff, History, Loader2, Volume2, VolumeX, Zap, ZapOff } from "lucide-react";
import React, { useEffect, useState }                              from "react";
import { useShallow }                                              from "zustand/shallow";
import { AdminPage }                                               from "@/pages/AdminPage";
import { BattlePage }                                              from "@/pages/BattlePage";
import { DeckPage }                                                from "@/pages/DeckPage";
import { IMAGE_BASE_URL }                                          from "@/shared/constants";
import { preloadImages }                                           from "@/shared/lib/assetPreloader";
import { useSoundSystem }                                          from "@/shared/lib/useSoundSystem";
import { GamePhase }                                               from "@/shared/types";
import { Toaster }                                                 from "@/shared/ui/Toaster";
import { MainMenu }                                                from "@/widgets//MainMenu";
import { useGameStore }                                            from "@/app/model/gameStore";
import { useUIStore }                                              from "@/app/model/uiStore";

export const SoundContext = React.createContext<ReturnType<typeof useSoundSystem> | null>(null);

const GameRouter: React.FC = () => {
  const currentPhase = useGameStore(state => state.currentPhase);
  const sounds = React.useContext(SoundContext);

  useEffect(() => {
    if (currentPhase === GamePhase.BATTLE) sounds?.playBgm('bgm_battle');
    else sounds?.playBgm('bgm_menu');
  }, [currentPhase, sounds]);

  switch (currentPhase) {
    case GamePhase.ADMIN: return <AdminPage />;
    case GamePhase.DECK_BUILDING: return <DeckPage />;
    case GamePhase.BATTLE: return <BattlePage />;
    default: return <MainMenu />;
  }
};

const App: React.FC = () => {
  const sounds = useSoundSystem();
  const { isLoading, allCards, initializeGame, currentPhase } = useGameStore(useShallow(state => ({
    isLoading: state.isLoading,
    allCards: state.allCards,
    initializeGame: state.initializeGame,
    currentPhase: state.currentPhase
  })));
  
  const { showHistory, toggleHistory, isAnimationsEnabled, toggleAnimations, isMuted, toggleMute } = useUIStore();
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
        await initializeGame();
        // Предзагрузка ключевых спрайтов для плавности
        const cardsToPreload = allCards.slice(0, 15).map(c => `${IMAGE_BASE_URL}${c.src}`);
        await preloadImages(cardsToPreload);
        setAssetsLoaded(true);
    };
    init();
  }, []);

  if (isLoading || !assetsLoaded) {
      return (
          <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-amber-500 gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/20 blur-2xl animate-pulse rounded-full"></div>
                <Loader2 size={64} className="animate-spin relative z-10" />
              </div>
              <div className="text-sm uppercase tracking-[0.3em] font-light animate-pulse">Синхронизация Хаоса...</div>
          </div>
      );
  }

  return (
    <SoundContext.Provider value={sounds}>
        <Toaster />
        <GameRouter />
        
        {/* Global UI Controls Overlay */}
        <div className="fixed top-4 right-4 z-[100] flex flex-col items-end gap-3">
            <div className="flex gap-2">
                <button 
                    onClick={() => { toggleAnimations(); sounds.playSfx('click'); }} 
                    className={`p-3 rounded-full border shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 ${!isAnimationsEnabled ? 'bg-slate-900/60 border-slate-700/40 text-slate-500' : 'bg-slate-800/60 border-slate-600/40 text-cyan-400'}`}
                    title={isAnimationsEnabled ? "Отключить анимации" : "Включить анимации"}
                >
                    {isAnimationsEnabled ? <Zap size={18} /> : <ZapOff size={18} />}
                </button>

                {currentPhase === GamePhase.BATTLE && (
                    <button 
                        onClick={() => { toggleHistory(); sounds.playSfx('click'); }} 
                        className={`p-3 rounded-full border shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 ${!showHistory ? 'bg-slate-900/60 border-slate-700/40 text-slate-500' : 'bg-slate-800/60 border-slate-600/40 text-amber-400'}`}
                        title={showHistory ? "Скрыть историю боя" : "Показать историю боя"}
                    >
                        {showHistory ? <History size={18} /> : <EyeOff size={18} />}
                    </button>
                )}

                <button 
                    onClick={() => toggleMute()} 
                    className={`p-3 rounded-full border shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 ${isMuted ? 'bg-red-900/60 border-red-500/40 text-red-200' : 'bg-slate-800/60 border-slate-600/40 text-blue-200'}`}
                    title={isMuted ? "Включить звук" : "Выключить звук"}
                >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
            </div>
        </div>
    </SoundContext.Provider>
  );
};

export default App;
