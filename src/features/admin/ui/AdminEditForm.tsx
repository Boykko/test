import { zodResolver }                        from "@hookform/resolvers/zod";
import { AlertCircle, Plus, Save, Trash2, X } from "lucide-react";
import React, { useEffect, useMemo }          from "react";
import { useFieldArray, useForm }    from "react-hook-form";
import { z }                                                                from "zod";
import { AbilityBehavior, AbilityDefinition, CardData, CardRank, CardType } from "@/shared/types";
import { cn }                                                               from "@/shared/utils";
import { AdminCard }                                                        from "./AdminCard";
interface AdminEditFormProps {
    editForm: CardData;
    abilitiesRegistry: AbilityDefinition[];
    setEditForm: (data: CardData) => void;
    onSave: (data: CardData) => void;
    onCancel: () => void;
}

const abilitySchema = z.object({
    abilityId: z.string(),
    value: z.number(),
});

const cardSchema = z.object({
    id: z.string(),
    monsterId: z.string(),
    title: z.string().min(1, "Название обязательно"),
    src: z.string(),
    type: z.nativeEnum(CardType),
    baseCost: z.number().min(0, "Минимум 0").max(20, "Максимум 20"),
    baseAttack: z.number().min(0, "Минимум 0").max(99, "Максимум 99"),
    baseHealth: z.number().min(0, "Минимум 0").max(99, "Максимум 99"),
    baseArmor: z.number().min(0, "Минимум 0").max(99, "Максимум 99"),
    rank: z.nativeEnum(CardRank),
    isUnlocked: z.boolean(),
    abilities: z.array(abilitySchema)
});

type CardFormValues = z.infer<typeof cardSchema>;

export const AdminEditForm: React.FC<AdminEditFormProps> = ({
                                                                editForm, abilitiesRegistry, setEditForm, onSave, onCancel
                                                            }) => {
    const { register, control, handleSubmit, watch, formState: { errors } } = useForm<CardFormValues>({
        resolver: zodResolver(cardSchema),
        defaultValues: editForm
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "abilities"
    });

    // Watch values for real-time preview without triggering parent state updates
    const watchedValues = watch();

    const previewData = useMemo(() => ({
        ...editForm,
        ...watchedValues
    }), [watchedValues, editForm]);

    const onSubmit = (data: CardFormValues) => {
        // Передаем данные напрямую, минуя возможные задержки обновления стейта
        onSave(data as CardData);
    };

    const hasErrors = Object.keys(errors).length > 0;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-2 md:p-4 overflow-y-auto">
            <div className="glass-panel rounded-2xl p-4 md:p-8 w-full max-w-3xl my-auto relative shadow-2xl border border-white/10 flex flex-col max-h-[95vh]">
                <div className="flex justify-between items-center mb-4 md:mb-6 border-b border-white/5 pb-2">
                    <h2 className="text-lg md:text-xl font-light text-slate-200 uppercase tracking-wider">
                        Редактирование <span className="text-amber-500 block md:inline text-sm md:text-lg">{watchedValues.title}</span>
                    </h2>
                    <button onClick={onCancel} className="text-slate-400 hover:text-white p-2 bg-white/5 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 overflow-y-auto custom-scrollbar pr-1 pb-2">
                    {/* Preview */}
                    <div className="flex flex-col items-center justify-center bg-black/20 p-4 rounded-xl border border-white/5 order-last md:order-first h-fit">
                        <h3 className="text-xs text-slate-500 mb-4 uppercase tracking-widest">Предпросмотр</h3>
                        <div className="scale-125">
                            <AdminCard data={previewData as CardData} size="sm" />
                        </div>
                        <p className="text-[10px] text-slate-600 mt-8 uppercase tracking-widest">{watchedValues.rank}</p>
                        {hasErrors && (
                            <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-950/30 p-2 rounded-lg border border-red-500/20">
                                <AlertCircle size={14} />
                                <span className="text-[10px] font-bold uppercase">Ошибка в данных</span>
                            </div>
                        )}
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4 md:space-y-5">
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1">Название</label>
                            <input
                                {...register('title')}
                                className={cn(
                                    "w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 transition-colors",
                                    errors.title && "border-red-500"
                                )}
                            />
                            {errors.title && <span className="text-red-500 text-[10px]">{errors.title.message}</span>}
                        </div>

                        <div className="grid grid-cols-4 gap-2 md:gap-3">
                            <div>
                                <label className="block text-[10px] text-blue-400 uppercase tracking-widest mb-1">Мана</label>
                                <input type="number" {...register('baseCost', { valueAsNumber: true })} className={cn("w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-sm text-slate-200 text-center", errors.baseCost && "border-red-500")} />
                            </div>
                            <div>
                                <label className="block text-[10px] text-red-400 uppercase tracking-widest mb-1">Атака</label>
                                <input type="number" {...register('baseAttack', { valueAsNumber: true })} className={cn("w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-sm text-slate-200 text-center", errors.baseAttack && "border-red-500")} />
                            </div>
                            <div>
                                <label className="block text-[10px] text-green-400 uppercase tracking-widest mb-1">HP</label>
                                <input type="number" {...register('baseHealth', { valueAsNumber: true })} className={cn("w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-sm text-slate-200 text-center", errors.baseHealth && "border-red-500")} />
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-1">Броня</label>
                                <input type="number" {...register('baseArmor', { valueAsNumber: true })} className={cn("w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-sm text-slate-200 text-center", errors.baseArmor && "border-red-500")} />
                            </div>
                        </div>

                        <div className="border-t border-white/5 pt-4">
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Способности</label>
                                <button
                                    type="button"
                                    onClick={() => append({ abilityId: abilitiesRegistry[0].id, value: 1 })}
                                    className="text-green-400 hover:text-green-300 transition-colors p-1 bg-white/5 rounded"
                                >
                                    <Plus size={16}/>
                                </button>
                            </div>

                            <div className="space-y-2 max-h-32 md:max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {fields.map((field, index) => {
                                    const currentAb = watchedValues.abilities?.[index];
                                    const def = abilitiesRegistry.find(d => d.id === currentAb?.abilityId);
                                    const isValueless = def && [AbilityBehavior.TAUNT, AbilityBehavior.CHARGE, AbilityBehavior.WINDFURY, AbilityBehavior.INSTAKILL, AbilityBehavior.DIVINE_SHIELD].includes(def.behavior);

                                    return (
                                        <div key={field.id} className="bg-slate-900/30 p-2 rounded-lg border border-white/5 flex flex-col gap-2 animate-fade-in">
                                            <div className="flex gap-2">
                                                <select
                                                    {...register(`abilities.${index}.abilityId`)}
                                                    className="bg-slate-950 text-xs rounded p-1 flex-1 border border-white/10 text-slate-300 max-w-[120px] md:max-w-none truncate"
                                                >
                                                    {abilitiesRegistry
                                                        .filter(def => {
                                                            const isSpellBehavior = def.behavior.startsWith('SPELL');
                                                            const isMinion = watchedValues.type === CardType.MINION;
                                                            if (isMinion) return !isSpellBehavior;
                                                            return isSpellBehavior;
                                                        })
                                                        .map(def => (
                                                            <option key={def.id} value={def.id}>{def.name}</option>
                                                        ))}
                                                </select>

                                                {!isValueless ? (
                                                    <input
                                                        type="number"
                                                        {...register(`abilities.${index}.value`, { valueAsNumber: true })}
                                                        className="w-12 bg-slate-950 text-xs rounded p-1 text-center border border-white/10 text-slate-300"
                                                    />
                                                ) : (
                                                    <div className="w-12"></div>
                                                )}

                                                <button type="button" onClick={() => remove(index)} className="text-red-500/70 hover:text-red-500"><Trash2 size={14}/></button>
                                            </div>
                                            <div className="text-[10px] text-slate-500 italic pl-1">
                                                {def?.descriptionTemplate.replace('{value}', currentAb?.value?.toString() || '1')}
                                            </div>
                                        </div>
                                    );
                                })}
                                {fields.length === 0 && <p className="text-xs text-slate-600 text-center italic py-2">Нет способностей</p>}
                            </div>
                        </div>


                        <div className="flex gap-3 mt-4 pt-4 border-t border-white/5 sticky bottom-0 bg-[#0f172a] md:static md:bg-transparent pb-2 md:pb-0">
                            <button
                                type="submit"
                                className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all active:scale-95"
                            >
                                <Save size={16} /> <span className="hidden md:inline">Сохранить</span>
                            </button>
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 bg-slate-700/30 hover:bg-slate-700/50 text-slate-400 border border-slate-600/30 py-3 rounded-lg text-sm transition-all"
                            >
                                Отмена
                            </button>
                    </div>
                    </div>
                </form>
            </div>
        </div>
    );
};