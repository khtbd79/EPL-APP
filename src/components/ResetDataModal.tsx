import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ResetDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
}

export const ResetDataModal: React.FC<ResetDataModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleReset = () => {
    onConfirmReset();
    setIsDone(true);
    setTimeout(() => {
      setIsDone(false);
      setConfirmText('');
      onClose();
    }, 1500);
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="max-w-md w-full p-6 border-2 border-red-300 bg-white shadow-2xl relative space-y-5 rounded-2xl animate-scaleUp my-auto text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl border-2 border-red-200">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Reset All Data</h3>
            <p className="text-xs text-red-600 font-bold">Permanent data deletion warning</p>
          </div>
        </div>

        {isDone ? (
          <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-sm font-black">All Data Successfully Reset</p>
            <p className="text-xs text-slate-600">All local data has been successfully cleared.</p>
          </div>
        ) : (
          <>
            {/* Warning Box */}
            <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200 text-xs text-red-900 space-y-2">
              <div className="font-black text-red-700 flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Warning:</span>
              </div>
              <p className="font-medium">
                This action will permanently purge recorded match history, profit statistics, and reset all app data.
              </p>
            </div>

            {/* Safety Confirmation Prompt */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                Type <span className="font-mono text-red-600 font-black">RESET</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type RESET to confirm"
                className="w-full bg-white border-2 border-red-300 focus:border-red-600 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-widest text-slate-900 uppercase placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 font-black"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmText.trim().toUpperCase() !== 'RESET'}
                onClick={handleReset}
                className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  confirmText.trim().toUpperCase() === 'RESET'
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-md'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset All Data</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};
