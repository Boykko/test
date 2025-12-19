// Стоимость создания карты в пыли/ресурсах
import { CardRank } from "@/shared/types.ts";

export const CRAFT_VALUES: Record<CardRank, number>      = {
    [CardRank.BRONZE]:   100,
    [CardRank.SILVER]:   400,
    [CardRank.GOLD]:     1600,
    [CardRank.PLATINUM]: 3200,
    [CardRank.DIAMOND]:  8000,
};
// Количество пыли, получаемое за уничтожение карты
export const DISENCHANT_VALUES: Record<CardRank, number> = {
    [CardRank.BRONZE]:   20,
    [CardRank.SILVER]:   100,
    [CardRank.GOLD]:     400,
    [CardRank.PLATINUM]: 800,
    [CardRank.DIAMOND]:  2000,
};
// Множители статов для разных рангов карт.
// Diamond карта будет в 2.8 раза сильнее базовой Bronze версии.
export const RANK_MULTIPLIERS: Record<CardRank, number>                                                = {
    [CardRank.BRONZE]:   1.0,
    [CardRank.SILVER]:   1.25,
    [CardRank.GOLD]:     1.6,
    [CardRank.PLATINUM]: 2.0,
    [CardRank.DIAMOND]:  2.8,
};
// Цвета ленточек (плашек) лоя карт и теней для каждого ранга
export const RANK_RIBBON_COLORS: Record<CardRank, string>                                              = {
    [CardRank.BRONZE]:   "from-amber-900 to-amber-700 shadow-amber-900/50",
    [CardRank.SILVER]:   "from-slate-500 to-slate-400 shadow-slate-500/50",
    [CardRank.GOLD]:     "from-yellow-600 to-yellow-400 shadow-yellow-500/50",
    [CardRank.PLATINUM]: "from-cyan-600 to-cyan-400 shadow-cyan-500/50",
    [CardRank.DIAMOND]:  "from-blue-700 to-blue-500 shadow-blue-600/50",
};
// Сложные стили бордеров, фонов и свечений для CSS-классов (Tailwind)
export const RANK_STYLES: Record<CardRank, { border: string, bg: string, glow: string, text: string }> = {
    [CardRank.BRONZE]:   {
        border: "border-amber-700/60",
        bg:     "bg-amber-950/20",
        glow:   "shadow-[0_0_30px_rgba(160,81,12,0.9)] ",
        text:   "text-amber-500",
    },
    [CardRank.SILVER]:   {
        border: "border-slate-400/60",
        bg:     "bg-slate-800/20",
        glow:   "shadow-[0_0_30px_rgba(148,163,184,0.9)]",
        text:   "text-slate-300",
    },
    [CardRank.GOLD]:     {
        border: "border-yellow-500/70",
        bg:     "bg-yellow-900/20",
        glow:   "shadow-[0_0_30px_rgba(234,179,8,0.9)]",
        text:   "text-yellow-400",
    },
    [CardRank.PLATINUM]: {
        border: "border-cyan-400/80",
        bg:     "bg-cyan-900/20",
        glow:   "shadow-[0_0_20px_rgba(34,211,238,0.9)]",
        text:   "text-cyan-300",
    },
    [CardRank.DIAMOND]:  {
        border: "border-blue-500",
        bg:     "bg-blue-900/30",
        glow:   "shadow-[0_0_30px_rgba(59,130,246,0.9)]",
        text:   "text-blue-400",
    },
};