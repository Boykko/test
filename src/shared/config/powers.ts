// ==========================================
// СИЛЫ ГЕРОЯ (HERO POWERS)
// ==========================================
// Способности, доступные игроку каждый ход за ману.
import { AbilityBehavior, HeroPower } from "@/shared/types.ts";

export const DEFAULT_HERO_POWERS: HeroPower[] = [
    {
        id:          "hp_fireblast",
        name:        "Вспышка огня",
        cost:        2,
        description: "Наносит 1 ед. урона.",
        behavior:    AbilityBehavior.SPELL_DAMAGE,
        value:       1,
        isUsed:      false,
        src:         "abyssFlame.jpg",
    },
    {
        id:          "hp_heal",
        name:        "Малое исцеление",
        cost:        2,
        description: "Восстанавливает 2 ед. здоровья.",
        behavior:    AbilityBehavior.SPELL_HEAL,
        value:       2,
        isUsed:      false,
        src:         "witchcraft.jpg",
    },
];