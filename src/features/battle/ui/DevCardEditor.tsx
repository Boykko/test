import React, { useState } from 'react';
import { GameCard } from '@/entities/card/model/types';
import { X, Save, Shield, Sword, Heart, Coins, Zap, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/app/providers/GameProvider';
import { CardAbility } from '@/shared/types';

interface DevCardEditorProps {
  card: GameCard;
  onClose: () => void;
  onSave: (updatedCard: GameCard) => void;
}

export const DevCardEditor: React.FC<DevCardEditorProps> = ({ card, onClose, onSave }) => {
  const { abilitiesRegistry } = useGame();
  const [formData, setFormData] = useState<GameCard>({ 
    ...card,
    abilities: [...(card.abilities || [])]
  });

  const handleChange = (field: keyof GameCard, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNumberChange = (field: keyof GameCard, value: string) => {
    const num = parseInt(value) || 0;
    setFormData(prev => ({ ...prev, [field]: num }));
  };

  const toggleEffect = (field: keyof GameCard) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const addAbility = () => {
    const firstAbility = abilitiesRegistry[0];
    if (!firstAbility) return;
    
    setFormData(prev => ({
      ...prev,
      abilities: [...prev.abilities, { abilityId: firstAbility.id, value: 1 }]
    }));
  };

  const updateAbility = (index: number, updates: Partial<CardAbility>) => {
    setFormData(prev => {
      const newAbilities = [...prev.abilities];
      newAbilities[index] = { ...newAbilities[index], ...updates };
      return { ...prev, abilities: newAbilities };
    });
  };

  const removeAbility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      abilities: prev.abilities.filter((_, i) => i !== index)
    }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.2)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-amber-500/10 px-6 py-4 border-b border-amber-500/20 flex justify-between items-center">
          <h3 className="text-xl font-bold text-amber-500 flex items-center gap-2">
            <Zap size={20} /> Dev Card Editor
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Header Info */}
          <div className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
            <img src={card.src} alt={card.title} className="w-16 h-16 rounded-lg object-cover border border-amber-500/30" />
            <div>
              <div className="font-bold text-lg">{card.title}</div>
              <div className="text-xs text-slate-400 font-mono">{card.uniqueId}</div>
            </div>
          </div>

          {/* Core Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                <Sword size={12} /> Attack
              </label>
              <input 
                type="number" 
                value={formData.currentAttack}
                onChange={e => handleNumberChange('currentAttack', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:border-amber-500 outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                <Heart size={12} /> Health
              </label>
              <input 
                type="number" 
                value={formData.currentHealth}
                onChange={e => handleNumberChange('currentHealth', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:border-amber-500 outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                <Coins size={12} /> Cost
              </label>
              <input 
                type="number" 
                value={formData.currentCost}
                onChange={e => handleNumberChange('currentCost', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:border-amber-500 outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                <Shield size={12} /> Armor
              </label>
              <input 
                type="number" 
                value={formData.currentArmor}
                onChange={e => handleNumberChange('currentArmor', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:border-amber-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Effects / Keywords */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase">Keywords & Effects</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { field: 'isTaunt', label: 'Taunt' },
                { field: 'hasDivineShield', label: 'Divine Shield' },
                { field: 'isFrozen', label: 'Frozen' },
                { field: 'isInstakill', label: 'Poisonous' },
                { field: 'hasReflection', label: 'Reflection' },
                { field: 'hasLifesteal', label: 'Lifesteal' },
                { field: 'canAttack', label: 'Can Attack' },
              ].map(effect => (
                <button
                  key={effect.field}
                  onClick={() => toggleEffect(effect.field as keyof GameCard)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-all ${
                    formData[effect.field as keyof GameCard] 
                      ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.1)]' 
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {effect.label}
                  <div className={`w-2 h-2 rounded-full ${formData[effect.field as keyof GameCard] ? 'bg-amber-500 animate-pulse' : 'bg-slate-600'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Abilities List */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase">Abilities & Powers</label>
              <button 
                onClick={addAbility}
                className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded flex items-center gap-1 transition-colors"
              >
                <Plus size={10} /> Add Ability
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.abilities.map((ab, idx) => (
                <div key={idx} className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 space-y-3">
                  <div className="flex gap-2">
                    <select 
                      value={ab.abilityId}
                      onChange={e => updateAbility(idx, { abilityId: e.target.value })}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-amber-500"
                    >
                      {abilitiesRegistry.map(def => (
                        <option key={def.id} value={def.id}>{def.name}</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => removeAbility(idx)}
                      className="text-slate-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Value:</label>
                    <input 
                      type="number"
                      value={ab.value}
                      onChange={e => updateAbility(idx, { value: parseInt(e.target.value) || 0 })}
                      className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs outline-none focus:border-amber-500"
                    />
                    <div className="flex-1 text-[10px] text-slate-400 italic truncate">
                      {abilitiesRegistry.find(d => d.id === ab.abilityId)?.descriptionTemplate.replace('{value}', ab.value.toString())}
                    </div>
                  </div>
                </div>
              ))}
              
              {formData.abilities.length === 0 && (
                <div className="text-center py-4 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                  No abilities assigned
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex gap-3">
          <button 
            onClick={() => onSave(formData)}
            className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-amber-900/20"
          >
            <Save size={18} /> Apply Changes
          </button>
          <button 
            onClick={onClose}
            className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-all"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
