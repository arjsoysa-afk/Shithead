import { motion, AnimatePresence } from 'framer-motion';

interface ToastItem {
  id: string;
  message: string;
  type: 'info' | 'burn' | 'error';
}

interface ToastContainerProps {
  toasts: ToastItem[];
}

const typeStyles = {
  info: 'border-border bg-bg-elevated',
  burn: 'border-burn/20 bg-burn/[0.08]',
  error: 'border-danger/20 bg-danger/[0.08]',
};

const typeIcons = {
  info: '\u2139\ufe0f',
  burn: '\ud83d\udd25',
  error: '\u26a0\ufe0f',
};

export function ToastContainer({ toasts }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={`px-4 py-3 rounded-xl border backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]
              text-sm text-text-primary flex items-center gap-2.5
              ${typeStyles[toast.type]}`}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <span>{typeIcons[toast.type]}</span>
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
