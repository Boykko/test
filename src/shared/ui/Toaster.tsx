import { AnimatePresence, motion }                      from "framer-motion";
import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react";
import React                                            from "react";
import { Toast, useToastStore }                         from "@/app/model/toastStore";

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const icons = {
    success: <CheckCircle className="text-green-400" size={20} />,
    error: <XCircle className="text-red-400" size={20} />,
    warning: <AlertTriangle className="text-amber-400" size={20} />,
    info: <Info className="text-blue-400" size={20} />,
  };

  const styles = {
    success: 'border-green-500/30 bg-green-950/80 shadow-green-900/20',
    error: 'border-red-500/30 bg-red-950/80 shadow-red-900/20',
    warning: 'border-amber-500/30 bg-amber-950/80 shadow-amber-900/20',
    info: 'border-blue-500/30 bg-slate-900/80 shadow-blue-900/20',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`
        pointer-events-auto w-80 md:w-96 p-4 rounded-xl border backdrop-blur-md shadow-2xl flex gap-3 relative overflow-hidden
        ${styles[toast.type]}
      `}
    >
      {/* Glossy Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

      <div className="flex-shrink-0 mt-0.5 relative z-10">
        {icons[toast.type]}
      </div>
      
      <div className="flex-1 relative z-10">
        <h4 className="text-sm font-bold text-slate-100">{toast.title}</h4>
        {toast.message && (
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{toast.message}</p>
        )}
      </div>

      <button 
        onClick={() => onRemove(toast.id)}
        className="text-slate-500 hover:text-white transition-colors relative z-10"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

export const Toaster: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none p-4">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};
