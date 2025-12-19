import { AnimatePresence, motion }                           from "framer-motion";
import { Plus, Search, Swords, Trophy, User, Users, X, Zap } from "lucide-react";
import React                                                 from "react";
import { OpponentInfo }                                      from "../battleReducer";

interface MatchmakingOverlayProps {
  status: 'LOBBY' | 'WAITING_FOR_OPPONENT' | 'FOUND' | 'READY';
  opponent: OpponentInfo | null;
  lobbies: OpponentInfo[];
  onAccept: () => void;
  onCancel: () => void;
  onCreateLobby: () => void;
  onJoinLobby: (id: string) => void;
}

export const MatchmakingOverlay: React.FC<MatchmakingOverlayProps> = ({ 
  status, opponent, lobbies, onAccept, onCancel, onCreateLobby, onJoinLobby 
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://chaosage.ru/images/background.jpg')] bg-cover opacity-5 blur-sm"></div>
        
        <AnimatePresence mode="wait">
            {status === 'LOBBY' && (
                <motion.div 
                    key="lobby"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="w-full max-w-4xl h-[80vh] flex flex-col items-center gap-8 relative z-10 p-6"
                >
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-3 text-amber-500 mb-2">
                            <Users size={32} />
                            <h2 className="text-4xl md:text-5xl font-fantasy tracking-widest uppercase">Зал Сражений</h2>
                        </div>
                        <p className="text-slate-500 uppercase tracking-[0.2em] text-xs">Выберите оппонента или разместите свою заявку</p>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 w-full bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Список заявок ({lobbies.length})</span>
                            <button 
                                onClick={onCreateLobby}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95"
                            >
                                <Plus size={16} /> Разместить заявку
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {lobbies.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center animate-pulse">
                                        <Search size={24} />
                                    </div>
                                    <p className="italic text-sm">В данный момент заявок нет...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {lobbies.map((lobby, idx) => (
                                        <motion.div 
                                            key={lobby.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.05 } }}
                                            className="group relative bg-slate-800/40 hover:bg-slate-700/60 border border-white/5 p-4 rounded-2xl flex items-center justify-between transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-3xl bg-slate-900 w-12 h-12 flex items-center justify-center rounded-full border border-white/10">
                                                    {lobby.avatar}
                                                </div>
                                                <div>
                                                    <div className="text-slate-100 font-bold text-sm">{lobby.name}</div>
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                        <span className="text-amber-400 font-bold">{lobby.rank}</span>
                                                        <span>•</span>
                                                        <span>LVL {lobby.level}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => onJoinLobby(lobby.id)}
                                                className="bg-emerald-600/20 hover:bg-emerald-500 text-emerald-400 hover:text-white px-4 py-2 rounded-xl border border-emerald-500/30 text-xs font-black transition-all"
                                            >
                                                В БОЙ
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <button 
                        onClick={onCancel}
                        className="text-slate-500 hover:text-slate-300 text-xs uppercase font-bold tracking-widest transition-colors flex items-center gap-2"
                    >
                        <X size={14} /> Назад в меню
                    </button>
                </motion.div>
            )}

            {status === 'WAITING_FOR_OPPONENT' && (
                <motion.div 
                    key="waiting"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="flex flex-col items-center gap-8 relative z-10"
                >
                    <div className="relative">
                        <div className="absolute -inset-8 bg-blue-500/20 blur-3xl rounded-full animate-pulse"></div>
                        <div className="w-32 h-32 md:w-48 md:h-48 border-4 border-slate-800 rounded-full flex items-center justify-center relative overflow-hidden">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                                className="absolute inset-0 border-t-4 border-blue-400 rounded-full"
                            />
                            <User className="w-12 h-12 md:w-20 md:h-20 text-blue-400/50" />
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className="text-3xl md:text-5xl font-fantasy text-slate-100 tracking-widest uppercase">Ваша заявка размещена</h2>
                        <p className="text-blue-400 font-mono text-sm animate-pulse">Ожидание оппонента...</p>
                    </div>

                    <button 
                        onClick={onCancel}
                        className="group flex items-center gap-2 px-6 py-2 bg-slate-900/50 hover:bg-red-900/40 text-slate-500 hover:text-red-300 border border-slate-800 hover:border-red-500/30 rounded-xl transition-all"
                    >
                        <X size={16} /> Снять заявку
                    </button>
                </motion.div>
            )}

            {status === 'FOUND' && opponent && (
                <motion.div 
                    key="found"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-12 relative z-10 w-full max-w-lg px-6"
                >
                    <div className="text-center">
                        <h2 className="text-4xl md:text-6xl font-fantasy text-amber-500 tracking-tighter animate-bounce-short">БОЙ НАЙДЕН!</h2>
                        <p className="text-slate-400 uppercase tracking-[0.3em] text-sm mt-2">Приготовьтесь к сражению</p>
                    </div>

                    <div className="w-full glass-panel p-8 rounded-3xl border border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.1)] flex flex-col items-center gap-6">
                        <div className="text-6xl md:text-8xl bg-slate-800 w-24 h-24 md:w-32 md:h-32 flex items-center justify-center rounded-full border-4 border-slate-700 shadow-2xl">
                            {opponent.avatar}
                        </div>
                        
                        <div className="text-center">
                            <div className="text-3xl font-black text-white">{opponent.name}</div>
                            <div className="flex items-center justify-center gap-4 mt-2">
                                <span className="flex items-center gap-1 text-amber-400 text-sm font-bold bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/20">
                                    <Trophy size={14} /> {opponent.rank}
                                </span>
                                <span className="text-slate-500 font-mono text-sm">LVL {opponent.level}</span>
                            </div>
                        </div>

                        <button 
                            onClick={onAccept}
                            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-4 rounded-2xl text-xl tracking-widest shadow-2xl shadow-amber-900/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-amber-800"
                        >
                            <Zap className="fill-current" /> ПРИНЯТЬ
                        </button>
                    </div>
                </motion.div>
            )}

            {status === 'READY' && (
                 <motion.div 
                    key="ready"
                    initial={{ opacity: 0, scale: 2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-6 relative z-10"
                >
                    <div className="text-amber-500 drop-shadow-[0_0_40px_rgba(245,158,11,0.8)]">
                        <Swords size={120} strokeWidth={1} />
                    </div>
                    <h2 className="text-7xl font-fantasy text-white tracking-[0.2em]">В БОЙ!</h2>
                    <motion.div 
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                        className="text-slate-400 tracking-widest uppercase"
                    >
                        Синхронизация...
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};
