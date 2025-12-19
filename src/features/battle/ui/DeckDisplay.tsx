import { AnimatePresence, motion } from "framer-motion";
import { Layers }                  from "lucide-react";
import React                       from "react";
import { IMAGE_BASE_URL }          from "@/shared/constants";
import { cn }                      from "@/shared/utils";

interface DeckDisplayProps {
  count: number;
  side: 'PLAYER' | 'ENEMY';
  isDrawing?: boolean;
  onClick?: () => void;
}

export const DeckDisplay: React.FC<DeckDisplayProps> = ({ count, side, isDrawing, onClick }) => {
  const isPlayer = side === 'PLAYER';
  
  return (
    <div 
        className={cn(
          "relative flex flex-col items-center gap-2 transition-all duration-500",
          count === 0 && "opacity-20 grayscale",
          onClick && "cursor-pointer"
        )}
        onClick={(e) => {
            e.stopPropagation();
            onClick?.();
        }}
    >
      {/* Visual Stack Effect */}
      <div className="relative w-12 h-16 md:w-20 md:h-28">
        {/* Decorative shadow cards for stack depth */}
        {[...Array(Math.min(3, Math.ceil(count / 10)))].map((_, i) => (
          <div 
            key={i}
            className="absolute inset-0 bg-slate-800 border border-slate-700/50 rounded-lg shadow-xl"
            style={{ 
              transform: `translate(${i * 2}px, ${-i * 2}px)`,
              zIndex: 5 - i 
            }}
          />
        ))}
        
        {/* Main Deck Card */}
        <div 
          className="absolute inset-0 bg-slate-800 border-2 border-slate-600/50 rounded-lg shadow-2xl z-10 overflow-hidden bg-cover bg-center transition-transform hover:scale-105 active:scale-95 cursor-help"
          style={{ 
            backgroundImage: `url('${IMAGE_BASE_URL}card_back.jpg')`,
            transform: `translate(${Math.min(3, Math.ceil(count / 10)) * 2}px, ${-Math.min(3, Math.ceil(count / 10)) * 2}px)`
          }}
          title={isPlayer ? `В вашей колоде осталось: ${count} (Нажмите, чтобы посмотреть)` : `В колоде врага осталось: ${count}`}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-50" />
        </div>

        {/* Draw Animation Placeholder (Visual only) */}
        <AnimatePresence>
            {isDrawing && (
                <motion.div 
                    initial={{ scale: 1, x: 0, y: 0, opacity: 1, rotate: 0 }}
                    animate={{ 
                        scale: 0.5, 
                        x: isPlayer ? -200 : -100, 
                        y: isPlayer ? 100 : -100, 
                        opacity: 0,
                        rotate: isPlayer ? -20 : 20
                    }}
                    transition={{ duration: 0.6, ease: "circOut" }}
                    className="absolute inset-0 bg-slate-700 border-2 border-blue-400 rounded-lg shadow-2xl z-50 bg-cover bg-center"
                    style={{ backgroundImage: `url('${IMAGE_BASE_URL}card_back.jpg')` }}
                />
            )}
        </AnimatePresence>
      </div>

      {/* Counter Badge */}
      <div className={cn(
        "px-3 py-1 rounded-full font-mono font-black text-[10px] md:text-sm border-2 shadow-lg backdrop-blur-md flex items-center gap-1.5",
        isPlayer ? "bg-blue-900/80 border-blue-400 text-blue-100" : "bg-rose-900/80 border-rose-400 text-rose-100",
        count <= 5 && "animate-pulse border-red-500 text-red-400"
      )}>
        <Layers size={12} className="opacity-70" />
        {count}
      </div>
    </div>
  );
};
