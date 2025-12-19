import { SoundContext }                   from "@/app/App.tsx";
import { useGame }                        from "@/app/providers/GameProvider.tsx";
import { BookOpen, Play, Swords, Wrench } from "lucide-react";
import React, { useContext, useEffect }   from "react";
import { GameMode, GamePhase }            from "@/shared/types.ts";

export const MainMenu: React.FC = () => {
  const { setPhase, userDeckIds, setGameMode } = useGame();
  const sounds = useContext(SoundContext);

  useEffect(() => {
    sounds?.playBgm('bgm_menu');
  }, [sounds]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[url('https://chaosage.ru/images/background.jpg')] bg-cover bg-center opacity-10 blur-sm"></div>
      
      <div className="z-10 text-center space-y-8 md:space-y-10 p-6 md:p-12 glass-panel rounded-3xl shadow-2xl max-w-lg w-[90%] md:w-full">
        <div className="mb-4 md:mb-8 relative">
          <div className="absolute -inset-4 bg-amber-500/10 blur-xl rounded-full"></div>
          <h1 className="relative text-4xl md:text-6xl font-fantasy font-bold text-transparent bg-clip-text bg-gradient-to-b from-slate-100 to-slate-400 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] mb-2 tracking-widest">
            CHAOS AGE
          </h1>
          <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mx-auto mt-4"></div>
        </div>

        <div className="flex flex-col gap-3 md:gap-5">
          <button 
            onClick={() => { sounds?.playSfx('click'); setGameMode(GameMode.STANDARD); setPhase(GamePhase.BATTLE); }}
            disabled={userDeckIds.length < 30}
            className={`w-full flex items-center justify-center gap-4 py-3 md:py-4 rounded-xl font-medium text-base md:text-lg tracking-wider transition-all border-b-4 ${userDeckIds.length >= 30 ? 'bg-red-900/40 hover:bg-red-800/60 border-red-500/30 text-red-100 border-red-900 hover:scale-[1.02]' : 'bg-slate-800/30 text-slate-500 cursor-not-allowed opacity-50 border-slate-900'}`}
          >
            <Play className="fill-current w-5 h-5" /> Играть
          </button>

          <button 
            onClick={() => { sounds?.playSfx('click'); setGameMode(GameMode.ARENA); setPhase(GamePhase.BATTLE); }}
            className="flex items-center justify-center gap-3 bg-purple-900/40 hover:bg-purple-800/60 text-purple-100 border-b-4 border-purple-900 border-purple-500/30 py-3 md:py-3.5 rounded-xl font-medium tracking-wider transition-all hover:scale-[1.02]"
          >
            <Swords className="fill-current w-5 h-5" /> Арена Хаоса
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { sounds?.playSfx('click'); setPhase(GamePhase.DECK_BUILDING); }} className="flex items-center justify-center gap-2 bg-slate-800/40 hover:bg-slate-700/50 text-slate-300 border border-slate-600/30 py-3 rounded-xl text-sm transition-all hover:scale-[1.02]"><BookOpen size={16} /> Колода</button>
            <button onClick={() => { sounds?.playSfx('click'); setPhase(GamePhase.ADMIN); }} className="flex items-center justify-center gap-2 bg-slate-800/20 hover:bg-slate-700/30 text-slate-400 border border-slate-700/20 py-3 rounded-xl text-sm transition-all hover:scale-[1.02]"><Wrench size={16} /> Админ</button>
          </div>
        </div>

        {userDeckIds.length < 30 && (
          <p className="text-[10px] text-slate-500 uppercase tracking-widest animate-pulse">
            Соберите колоду из 30 карт для игры
          </p>
        )}
      </div>
    </div>
  );
};
