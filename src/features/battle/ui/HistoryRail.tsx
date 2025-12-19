import { AnimatePresence, motion }                                       from "framer-motion";
import { AlertCircle, PlusCircle, ShieldAlert, Skull, Sparkles, Swords } from "lucide-react";
import React                                                             from "react";
import { IMAGE_BASE_URL }                                                from "@/shared/constants";
import { cn }                                                            from "@/shared/utils";
import { BattleLogEntry }                                                from "../battleReducer";

interface HistoryRailProps {
  logs: BattleLogEntry[];
}

export const HistoryRail: React.FC<HistoryRailProps> = ({ logs }) => {
  // We only show the last 8 entries visually
  const recentLogs = logs.slice(0, 8);

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3 pointer-events-auto">
      <AnimatePresence mode="popLayout">
        {recentLogs.map((log) => (
          <HistoryItem key={log.id} log={log} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const HistoryItem: React.FC<{ log: BattleLogEntry }> = ({ log }) => {
  const isPlayer = log.turn === 'PLAYER';
  const isAttack = log.type === 'ATTACK';
  const isDeath = log.type === 'DEATH';
  const isPlay = log.type === 'PLAY';
  const isSpell = log.type === 'SPELL';
  const isWarning = log.type === 'WARNING';

  return (
    <motion.div
      layout
      initial={{ x: -100, opacity: 0, scale: 0.5 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: -50, opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.1, x: 10, zIndex: 50 }}
      className={cn(
        "relative w-12 h-12 md:w-16 md:h-16 rounded-full border-2 shadow-2xl group cursor-help transition-all",
        isPlayer ? "border-emerald-500 bg-emerald-950" : "border-rose-500 bg-rose-950",
        isPlay && "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]",
        isSpell && "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]",
        isDeath && "border-slate-700 grayscale saturate-50",
        isWarning && "border-amber-500 bg-amber-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
      )}
    >
      {/* Background Images */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        {isAttack ? (
            // Special Duel View for Attacks
            <div className="flex w-full h-full relative">
                <img 
                    src={log.cardSrc?.startsWith('http') ? log.cardSrc : `${IMAGE_BASE_URL}${log.cardSrc}`} 
                    className="w-1/2 h-full object-cover border-r border-white/20"
                    alt={log.cardTitle}
                />
                <img 
                    src={log.targetSrc?.startsWith('http') ? log.targetSrc : `${IMAGE_BASE_URL}${log.targetSrc}`} 
                    className="w-1/2 h-full object-cover"
                    alt={log.targetTitle}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent"></div>
            </div>
        ) : (
            <div className="w-full h-full relative">
                {log.cardSrc ? (
                    <img 
                        src={log.cardSrc.startsWith('http') ? log.cardSrc : `${IMAGE_BASE_URL}${log.cardSrc}`} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        alt={log.cardTitle}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
                        {log.type === 'FATIGUE' && <ShieldAlert className="text-purple-400 w-1/2 h-1/2" />}
                        {log.type === 'WARNING' && <AlertCircle className="text-amber-400 w-1/2 h-1/2 animate-pulse" />}
                    </div>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
            </div>
        )}
      </div>

      {/* Overlay Icons (Bottom Right) */}
      <div className={cn(
          "absolute -bottom-1 -right-1 p-1 rounded-full shadow-lg border border-white/20",
          isPlay ? "bg-blue-600" : (isSpell ? "bg-purple-600" : (isDeath ? "bg-slate-800" : (isWarning ? "bg-amber-600" : "bg-black/60")))
      )}>
          {isPlay && <PlusCircle size={12} className="text-white" />}
          {isSpell && <Sparkles size={12} className="text-white" />}
          {isAttack && <Swords size={12} className="text-white" />}
          {isDeath && <Skull size={12} className="text-red-500" />}
          {isWarning && <AlertCircle size={12} className="text-white" />}
          {log.type === 'FATIGUE' && <ShieldAlert size={12} className="text-purple-300" />}
      </div>

      {/* Tooltip on Hover */}
      <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div className="bg-slate-900/95 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-xl w-64 border-l-4" style={{ borderColor: isWarning ? '#f59e0b' : (isPlayer ? '#10b981' : '#f43f5e') }}>
            <div className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">
                {isWarning ? 'ОШИБКА МЕХАНИКИ' : (isPlayer ? 'ВАШ ХОД' : 'ХОД ВРАГА')}
            </div>
            
            <div className="flex flex-col gap-1">
                <span className={cn(
                    "text-xs font-bold uppercase tracking-tight",
                    isDeath ? "text-red-400" : (isPlay ? "text-blue-400" : (isWarning ? "text-amber-400" : "text-slate-100"))
                )}>
                    {isDeath ? "ГИБЕЛЬ" : (isPlay ? "ПРИЗЫВ" : (isSpell ? "ЗАКЛИНАНИЕ" : (isWarning ? "ВНИМАНИЕ" : "БОЙ")))}
                </span>
                <div className="text-sm font-bold text-slate-100 leading-tight">
                    {log.message}
                </div>
            </div>
        </div>
      </div>
    </motion.div>
  );
};
