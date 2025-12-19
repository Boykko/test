import React            from "react";
import { cn }           from "@/shared/utils";
import { FloatingText } from "../useBattleVisuals";

interface BattleVfxOverlayProps {
  floatingTexts: FloatingText[];
  message?: string;
}

export const BattleVfxOverlay: React.FC<BattleVfxOverlayProps> = ({ floatingTexts, message }) => {
  return (
    <>
      {/* Floating Damage/Heal Numbers */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingTexts.map(ft => (
          <div 
            key={ft.id}
            className={cn(
              "absolute text-3xl md:text-5xl font-black tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,1)] animate-float-damage z-50",
              ft.color
            )}
            style={{ left: `${ft.x}%`, top: `${ft.y}%` }}
          >
            {ft.text}
          </div>
        ))}
      </div>

      {/* Game System Messages (Errors/Notifications) */}
      {message && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[80] pointer-events-none w-full max-w-md px-4">
           <div className="bg-slate-950/90 text-amber-300 text-sm md:text-lg font-black text-center px-8 py-4 rounded-3xl border border-amber-500/50 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-bounce-short backdrop-blur-xl uppercase tracking-widest">
               {message}
           </div>
        </div>
      )}
    </>
  );
};
