import { Plus, Save, Trash2, X }                                 from "lucide-react";
import React, { useState }                                       from "react";
import { AbilityBehavior, AbilityDefinition, TargetRequirement } from "@/shared/types";

interface AbilityManagerProps {
  abilities: AbilityDefinition[];
  onCreate: (ab: AbilityDefinition) => void;
  onUpdate: (ab: AbilityDefinition) => void;
  onDelete: (id: string) => void;
}

export const AbilityManager: React.FC<AbilityManagerProps> = ({ abilities, onCreate, onUpdate, onDelete }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AbilityDefinition>({ 
      id: '', 
      name: '', 
      behavior: AbilityBehavior.HEAL_HERO, 
      targetRequirement: TargetRequirement.ANY,
      descriptionTemplate: '' 
  });

  const resetForm = () => {
    setForm({ 
        id: '', 
        name: '', 
        behavior: AbilityBehavior.HEAL_HERO, 
        targetRequirement: TargetRequirement.ANY,
        descriptionTemplate: '' 
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleEdit = (ab: AbilityDefinition) => {
    setForm({ ...ab });
    setEditingId(ab.id);
    setIsCreating(true);
  };

  const handleSubmit = () => {
    if (!form.id || !form.name) return;
    
    if (editingId) {
        onUpdate(form);
    } else {
        if (abilities.some(a => a.id === form.id)) {
            alert("ID уже существует!");
            return;
        }
        onCreate(form);
    }
    resetForm();
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg text-slate-300 font-light">Список способностей</h2>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-2 rounded-lg border border-green-500/30 flex items-center gap-2 text-xs"
        >
          <Plus size={14} /> Создать тип
        </button>
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-amber-500/30 p-6 rounded-xl w-full max-w-lg shadow-2xl relative">
                <button onClick={resetForm} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20}/></button>
                <h3 className="text-amber-500 text-base font-bold mb-6 uppercase border-b border-white/5 pb-2">{editingId ? 'Редактирование способности' : 'Новый тип способности'}</h3>
                
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Уникальный ID</label>
                        <input 
                        type="text" 
                        value={form.id} 
                        onChange={e => setForm({...form, id: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                        disabled={!!editingId}
                        className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm text-white disabled:opacity-50"
                        placeholder="пример: fire_blast"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Отображаемое имя</label>
                        <input 
                        type="text" 
                        value={form.name} 
                        onChange={e => setForm({...form, name: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm text-white"
                        placeholder="пример: Огненный шар"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Поведение</label>
                            <select 
                            value={form.behavior} 
                            onChange={e => setForm({...form, behavior: e.target.value as AbilityBehavior})}
                            className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm text-white"
                            >
                                {Object.values(AbilityBehavior).filter(b => b !== AbilityBehavior.NONE).map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Доступные цели</label>
                            <select 
                            value={form.targetRequirement || TargetRequirement.ANY} 
                            onChange={e => setForm({...form, targetRequirement: e.target.value as TargetRequirement})}
                            className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm text-white"
                            >
                                <option value={TargetRequirement.ANY}>Любые</option>
                                <option value={TargetRequirement.FRIENDLY}>Только Свои</option>
                                <option value={TargetRequirement.ENEMY}>Только Враги</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Шаблон описания</label>
                        <input 
                        type="text" 
                        value={form.descriptionTemplate} 
                        onChange={e => setForm({...form, descriptionTemplate: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm text-white"
                        placeholder="Используйте {value} для числа"
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={resetForm} className="text-slate-400 px-4 py-2">Отмена</button>
                    <button onClick={handleSubmit} className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors">
                        {editingId ? 'Обновить' : 'Создать'}
                    </button>
                </div>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {abilities.map(ab => (
            <div key={ab.id} className="bg-slate-900/30 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="font-bold text-slate-200 text-sm">{ab.name}</span>
                        <div className="text-[10px] text-slate-500 font-mono">{ab.id}</div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleEdit(ab)} className="text-blue-400 hover:text-blue-300 p-1"><Save size={14}/></button>
                        <button onClick={() => onDelete(ab.id)} className="text-red-500/60 hover:text-red-500 p-1"><Trash2 size={14}/></button>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="bg-black/20 p-2 rounded text-[10px] text-slate-400 flex justify-between items-center">
                        <span>{ab.behavior}</span>
                    </div>
                    <div className={`p-2 rounded text-[10px] font-bold border border-white/5 ${
                        ab.targetRequirement === TargetRequirement.FRIENDLY ? 'text-green-400 bg-green-900/20' :
                        ab.targetRequirement === TargetRequirement.ENEMY ? 'text-red-400 bg-red-900/20' :
                        'text-slate-400 bg-slate-900/20'
                    }`}>
                        {ab.targetRequirement === TargetRequirement.FRIENDLY ? 'СВОИ' : 
                         ab.targetRequirement === TargetRequirement.ENEMY ? 'ВРАГИ' : 'ВСЕ'}
                    </div>
                </div>
                <div className="text-xs text-amber-500/80 italic">
                    "{ab.descriptionTemplate}"
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};