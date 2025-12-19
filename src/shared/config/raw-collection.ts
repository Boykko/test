// Список доступных артов и названий для генерации существ
import { RANK_MULTIPLIERS }                                           from "@/shared/config/ranks.ts";
import { AbilityBehavior, CardAbility, CardData, CardRank, CardType } from "@/shared/types.ts";

const rawImages                       = [
    { id: "m001", src: "spider.jpg", title: "Паук" },
    { id: "m002", src: "skeleton.jpg", title: "Скелет" },
    { id: "m003", src: "wolf.jpg", title: "Волк" },
    { id: "m004", src: "beast.jpg", title: "Вепрь" },
    { id: "m005", src: "vampire.jpg", title: "Вампир" },
    { id: "m006", src: "skeletMage.jpg", title: "Скелет-маг" },
    { id: "m007", src: "ancientZomby.jpg", title: "Древний зомби" },
    { id: "m008", src: "zomby.jpg", title: "Зомби" },
    { id: "m009", src: "skeletGuard.jpg", title: "Скелет-страж" },
    { id: "m010", src: "skeletArcher.jpg", title: "Скелет-лучник" },
    { id: "m011", src: "wraith.jpg", title: "Вестник смерти" },
    { id: "m012", src: "grownWolf.jpg", title: "Матерый волк" },
    { id: "m013", src: "giantTurtle.jpg", title: "Черепаха" },
    { id: "m014", src: "bloodsucker.jpg", title: "Кровопийца" },
    { id: "m015", src: "blackSpider.jpg", title: "Черный паук" },
    { id: "m016", src: "mineImp.jpg", title: "Бес" },
    { id: "m017", src: "bear.jpg", title: "Медведь" },
    { id: "m018", src: "griffin.jpg", title: "Грифон" },
    { id: "m019", src: "cobra.jpg", title: "Кобра" },
    { id: "m020", src: "spiderSpinner.jpg", title: "Паук-прядильщик" },
    { id: "m021", src: "sandHound.jpg", title: "Гончая" },
    { id: "m022", src: "royalScorpion.jpg", title: "Скорпион" },
    { id: "m023", src: "ratKing.jpg", title: "Король крыс" },
    { id: "m024", src: "raptor.jpg", title: "Раптор" },
    { id: "m025", src: "razorleaf.jpg", title: "Ядострел" },
    { id: "m026", src: "ferriteSalamander.jpg", title: "Саламандра" },
    { id: "m027", src: "minotaur.jpg", title: "Минотавр" },
    { id: "m028", src: "darkKnight.jpg", title: "Рыцарь тьмы" },
    { id: "m029", src: "dungeonKeeper.jpg", title: "Хранитель" },
    { id: "m030", src: "elderVampire.gif", title: "Патриарх" },
    { id: "m031", src: "deepsHorror.jpg", title: "Ужас глубин" },
    { id: "m032", src: "deepEye.jpg", title: "Око бездны" },
    { id: "m033", src: "koboldDigger.jpg", title: "Кобольд" },
    { id: "m034", src: "shadowAdept.jpg", title: "Адепт тени" },
    { id: "m035", src: "phantomHorror.jpg", title: "Призрак" },
    { id: "m036", src: "GearOGolemCopper.jpg", title: "Медный голем" },
    { id: "m037", src: "GearOGolemIron.jpg", title: "Железный голем" },
    { id: "m038", src: "GearOGolemGold.jpg", title: "Золотой голем" },
    { id: "m039", src: "yeti.jpg", title: "Йети" },
    { id: "m040", src: "iceWall.jpg", title: "Ледяная стена" },
];
// Список доступных заклинаний
const rawSpells                       = [
    {
        id:       "s001",
        src:      "witchcraft.jpg",
        title:    "Наваждение",
        behavior: AbilityBehavior.SPELL_DAMAGE,
        cost:     2,
        value:    3,
    },
    {
        id:       "s002",
        src:      "deepFire.jpg",
        title:    "Огонь глубин",
        behavior: AbilityBehavior.SPELL_AOE_ENEMY,
        cost:     7,
        value:    4,
    },
    {
        id:       "s003",
        src:      "abyssFlame.jpg",
        title:    "Пламя бездны",
        behavior: AbilityBehavior.SPELL_DAMAGE,
        cost:     4,
        value:    6,
    },
    { id: "s004", src: "curse.jpg", title: "Проклятье", behavior: AbilityBehavior.SPELL_DAMAGE, cost: 1, value: 2 },
    {
        id:       "s005",
        src:      "shadowPriest.jpg",
        title:    "Сила тьмы",
        behavior: AbilityBehavior.SPELL_BUFF,
        cost:     2,
        value:    2,
    },
];
/**
 * Генерирует полный список карт игры на основе сырых данных.
 * Для каждого существа создает 5 вариаций (по одной на каждый ранг).
 * Статы и способности скейлятся в зависимости от ранга.
 */
export const generateInitialCards     = (): CardData[] => {
    const cards: CardData[] = [];
    const ranks             = Object.values(CardRank);

    rawImages.forEach((img, idx) => {
        ranks.forEach((rank, rIdx) => {
            // Вычисляем множитель статов для ранга
            const mult = RANK_MULTIPLIERS[rank];

            // Базовая стоимость растет с индексом существа
            const baseCost = Math.max(1, Math.floor((idx % 7) + 1 + rIdx));

            const abilities: CardAbility[] = [];

            // Алгоритм распределения способностей:
            // Чем выше ранг, тем больше вероятность получения сильных абилок
            if (rIdx >= 1 && idx % 3 === 0) abilities.push({ abilityId: "TAUNT", value: 0 }); // Провокация с Silver
            if (rIdx >= 2 && idx % 5 === 0) abilities.push({ abilityId: "DIVINE_SHIELD", value: 0 }); // Щит с Gold
            if (rIdx >= 3) abilities.push({ abilityId: "BUFF_SELF", value: rIdx }); // Бафф с Platinum
            if (idx % 8 === 0 && rIdx === 0) abilities.push({ abilityId: "DISCOVER", value: 0 }); // Раскопки

            cards.push({
                id:        `minion_${idx}_${rank}`,
                monsterId: img.id,
                src:       img.src,
                title:     `${img.title} ${"I".repeat(rIdx + 1)}`, // Добавляем римские цифры к имени (Волк I, Волк II...)
                type:      CardType.MINION,
                baseCost,
                // Атака и Здоровье рассчитываются формулой баланса
                baseAttack: Math.max(1, Math.floor(baseCost * 1.2 * mult)),
                baseHealth: Math.max(1, Math.floor(baseCost * 1.4 * mult)),
                baseArmor:  rIdx > 2 ? rIdx : 0, // Броня только у высоких рангов
                rank,
                isUnlocked: true, // По умолчанию открыты (для демки)
                abilities,
            });
        });
    });

    // Добавление заклинаний в пул карт
    rawSpells.forEach((spell, idx) => {
        const isDiscover = spell.title === "Наваждение";
        cards.push({
            id:         `spell_${idx}`,
            monsterId:  spell.id,
            src:        spell.src,
            title:      spell.title,
            type:       CardType.SPELL,
            baseCost:   spell.cost,
            baseAttack: 0,
            baseHealth: 0,
            baseArmor:  0,
            rank:       CardRank.BRONZE, // У заклинаний пока нет рангов
            isUnlocked: true,
            abilities:  [{
                abilityId: isDiscover ? "DISCOVER" : spell.behavior,
                value:     spell.value,
            }],
        });
    });

    return cards;
};
// Экспортируемая коллекция всех карт
export const INITIAL_CARDS            = generateInitialCards();
// Токен (существо, призываемое другими картами, нельзя положить в колоду)
export const SKELETON_TOKEN: CardData = {
    id:         "token_skeleton",
    monsterId:  "m002",
    src:        "skeleton.jpg",
    title:      "Скелет",
    type:       CardType.MINION,
    baseCost:   1,
    baseAttack: 1,
    baseHealth: 1,
    baseArmor:  0,
    rank:       CardRank.BRONZE,
    isUnlocked: true,
    abilities:  [],
};