import { AnimatePresence, motion } from "framer-motion";
import React                       from "react";
import { cn }                      from "@/shared/utils";

interface EmoteMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  className?: string;
}

const EMOTES = ['👍', '😢', '🔥', '🤔', '😡', '🧙‍♂️'];

export const EmoteMenu: React.FC<EmoteMenuProps> = ({ isOpen, onClose, onSelect, className }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 20 }}
          className={cn(
            "absolute bottom-24 left-10 z-[70] bg-slate-900/95 backdrop-blur-2xl border border-white/10 p-2 rounded-2xl grid grid-cols-3 gap-2 shadow-2xl ring-1 ring-white/5",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {EMOTES.map(emoji => (
            <button 
              key={emoji}
              onClick={() => {
                onSelect(emoji);
                onClose();
              }}
              className="text-2xl hover:scale-125 hover:bg-white/10 transition-all p-3 rounded-xl active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
