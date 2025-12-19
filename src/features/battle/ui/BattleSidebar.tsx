import { BattleLogEntry }  from "@/features/battle/battleReducer.ts";
import { AnimatePresence } from "framer-motion";
import { Menu, Swords }    from "lucide-react";
import React               from "react";
import { GameMode }        from "@/shared/types";
import { HistoryRail }     from "./HistoryRail";

interface BattleSidebarProps {
  logs: BattleLogEntry[];
  gameMode: GameMode;
  onMenuClick: () => void;
  showHistory: boolean;
}

export const BattleSidebar: React.FC<BattleSidebarProps> = ({
  logs, gameMode, onMenuClick, showHistory
}) => {
  return (
    <>
      {/* Visual Action History Rail */}
      <AnimatePresence>
        {showHistory && <HistoryRail logs={logs} />}
      </AnimatePresence>
      
      {/* Top Center: Mode Indicator */}
      {gameMode === GameMode.ARENA && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/40 border border-white/5 px-4 py-1.5 rounded-full flex items-center gap-2 z-10 pointer-events-none backdrop-blur-md">
           <Swords size={12} className="text-purple-400" />
           <span className="text-[10px] md:text-xs uppercase font-bold text-slate-300 tracking-[0.2em]">Арена Хаоса</span>
        </div>
      )}

      {/* Left Side: Menu Button */}
      <div className="absolute top-4 left-4 z-50">
        <button 
            onClick={onMenuClick}
            className="text-slate-400 hover:text-white transition-colors p-2.5 bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm border border-white/5 hover:border-white/10 shadow-lg group"
            title="Меню"
        >
            <Menu size={20} className="group-hover:scale-105 transition-transform" />
        </button>
      </div>
    </>
  );
};
