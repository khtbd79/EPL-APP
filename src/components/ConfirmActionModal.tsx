import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, RotateCcw, X, Check } from 'lucide-react';

export interface ConfirmModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ConfirmActionModalProps {
  config: ConfirmModalConfig | null;
  onClose: () => void;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({ config, onClose }) => {
  if (!config || !config.isOpen) return null;

  const {
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    onConfirm,
    onCancel,
  } = config;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn"
      onClick={handleCancel}
    >
      <div
        className="relative w-full max-w-md bg-white border border-red-200 rounded-2xl shadow-2xl p-6 space-y-4 animate-scaleUp overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Icon */}
        <div className="flex items-start space-x-3.5">
          <div
            className={`p-3 rounded-2xl shrink-0 border ${
              variant === 'danger'
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : variant === 'warning'
                ? 'bg-amber-50 text-amber-600 border-amber-200'
                : 'bg-red-50 text-red-600 border-red-200'
            }`}
          >
            {variant === 'danger' ? (
              <Trash2 className="w-6 h-6" />
            ) : variant === 'warning' ? (
              <RotateCcw className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <h3 className="text-base font-black text-slate-900 leading-snug">{title}</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">{message}</p>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCancel}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs transition-all border border-slate-200 cursor-pointer"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className={`w-full py-2.5 px-4 rounded-xl font-black text-xs transition-all active:scale-95 flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : variant === 'warning'
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
