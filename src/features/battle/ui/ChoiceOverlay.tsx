import { motion }         from "framer-motion";
import { Sparkles }       from "lucide-react";
import React              from "react";
import { CardFrame }      from "@/entities/card/ui/CardFrame";
import { useCardVisuals } from "@/shared/hooks/useCardVisuals";
import { CardData }       from "@/shared/types";
import { cn }             from "@/shared/utils";

interface ChoiceOverlayProps {
  options: CardData[];
  onChoose: (id: string) => void;
}

export const ChoiceOverlay: React.FC<ChoiceOverlayProps> = ({ options, onChoose }) => {
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 md:p-12 overflow-y-auto">
        <div className="max-w-7xl w-full flex flex-col items-center gap-12 md:gap-20 py-10">
            <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center space-y-4"
            >
                <div className="flex items-center justify-center gap-6 text-amber-400">
                    <Sparkles className="animate-pulse w-8 h-8 md:w-16 md:h-16" />
                    <h2 className="text-5xl md:text-2xl font-fantasy tracking-[0.2em] drop-shadow-[0_0_40px_rgba(251,191,36,0.6)] uppercase">Раскопки</h2>
                    <Sparkles className="animate-pulse w-8 h-8 md:w-16 md:h-16" />
                </div>
                <p className="text-slate-400 font-light tracking-[0.4em] uppercase text-sm md:text-md">Выберите новую карту</p>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-16 md:gap-28 lg:gap-40 px-16 md:px-1">
                {options.map((card, idx) => (
                    <ChoiceItem key={card.id} card={card} idx={idx} onChoose={onChoose} />
                ))}
            </div>
        </div>
    </div>
  );
};

const ChoiceItem: React.FC<{ card: CardData; idx: number; onChoose: (id: string) => void }> = ({ card, idx, onChoose }) => {
    const visuals = useCardVisuals(card, 'lg');

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0, rotateY: 90, y: 50 }}
            animate={{ 
                scale: 1, 
                opacity: 1, 
                rotateY: 0,
                y: 0,
                transition: { delay: idx * 0.15, duration: 0.7, type: 'spring', bounce: 0.4 }
            }}
            whileHover={{ scale: 1.1, y: -40 }}
            className="relative group cursor-pointer"
            onClick={() => onChoose(card.id)}
        >
            <div className={cn(
                "absolute -inset-10 blur-[120px] opacity-40 group-hover:opacity-70 transition-opacity rounded-full bg-gradient-to-t",
                visuals.rankStyle.bg
            )} />

            <CardFrame
                data={card}
                size="md"
                activeRank={card.rank}
                isSpell={visuals.isSpell}
                keywords={visuals.keywords}
                stats={{
                    attack: card.baseAttack,
                    health: card.baseHealth,
                    cost: card.baseCost,
                    armor: card.baseArmor
                }}
                resolvedAbilities={visuals.resolvedAbilities}
                isInteractable={false}
                tooltipDirection="top"
            />
            
            <div className="absolute -bottom-28 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="bg-amber-600 text-white text-md px-4 py-2 rounded-full font-black  tracking-[0.25em] shadow-[0_0_40px_rgba(245,158,11,0.6)] uppercase border border-amber-400/40">Выбрать</span>
            </div>
        </motion.div>
    );
};
