import { motion, AnimatePresence } from 'framer-motion';

interface KeyboardHelpProps {
  show: boolean;
  onClose: () => void;
}

const shortcuts = [
  { keys: ['1', '2', '...', '9'], action: 'Select card by position' },
  { keys: ['Enter'], action: 'Play selected cards' },
  { keys: ['Space'], action: 'Pick up pile' },
  { keys: ['D'], action: 'Select all same rank' },
  { keys: ['Esc'], action: 'Deselect all' },
  { keys: ['?'], action: 'Toggle this help' },
];

export function KeyboardHelp({ show, onClose }: KeyboardHelpProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            className="relative bg-bg-card border border-border rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h3 className="text-xl font-bold mb-6">Keyboard Shortcuts</h3>
            <div className="space-y-3">
              {shortcuts.map(({ keys, action }) => (
                <div key={action} className="flex items-center justify-between">
                  <span className="text-text-secondary text-sm">{action}</span>
                  <div className="flex gap-1">
                    {keys.map((key) => (
                      <kbd
                        key={key}
                        className="inline-flex items-center justify-center min-w-[28px] h-7 px-2
                          bg-bg-primary border border-border rounded-md
                          text-xs font-semibold text-text-primary"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="mt-6 w-full py-2.5 rounded-lg text-sm font-medium
                bg-white/[0.03] border border-border hover:border-border-hover
                transition-colors"
              onClick={onClose}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
