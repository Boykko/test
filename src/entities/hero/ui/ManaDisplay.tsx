import { Diamond } from "lucide-react";
import React       from "react";

interface ManaDisplayProps { 
    current: number; 
    max: number; 
    align?: 'left' | 'right'; 
}

export const ManaDisplay: React.FC<ManaDisplayProps> = ({ current, max, align = 'left' }) => {
  return (
    <div className={`flex gap-0.5 md:gap-1 flex-wrap max-w-[160px] ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
      {Array.from({ length: 10 }).map((_, i) => {
        if (i >= max) return null;
        const isFilled = i < current;
        return (
          <div 
            key={i} 
            className="relative w-4 h-4 md:w-5 md:h-5 flex items-center justify-center transition-all duration-300"
          >
             <Diamond 
                size={18} 
                strokeWidth={1.5}
                className={`absolute inset-0 ${isFilled ? 'text-blue-500/50' : 'text-slate-700/50'}`}
             />
             <div className={`
                transition-all duration-500 ease-out transform
                ${isFilled 
                    ? 'opacity-100 scale-100 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]' 
                    : 'opacity-0 scale-50'
                }
             `}>
                <Diamond size={18} className="fill-blue-400 text-blue-200" />
             </div>
             {isFilled && <div className="absolute inset-0 bg-blue-400/20 blur-[2px] rounded-full animate-pulse"></div>}
          </div>
        );
      })}
    </div>
  );
};
