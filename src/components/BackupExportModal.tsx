import React, { useState } from 'react';
import { AppState } from '../types';
import { exportBackupJson, copyTextToClipboard } from '../utils/mobileExportHelper';
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Eye,
  EyeOff,
} from 'lucide-react';

interface BackupExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
}

export const BackupExportModal: React.FC<BackupExportModalProps> = ({
  isOpen,
  onClose,
  state,
}) => {
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(state, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `epl_pro_backup_${dateStr}.json`;

  const handleCopyClipboard = async () => {
    const ok = await copyTextToClipboard(jsonString);
    if (ok) {
      setCopied(true);
      setExportNotice('✓ Backup JSON copied to clipboard! You can paste and save it anywhere.');
      setTimeout(() => setCopied(false), 3000);
    } else {
      setExportNotice('Could not copy automatically. You can copy the text below.');
      setShowRawJson(true);
    }
  };

  const handleNativeShare = async () => {
    setIsSharing(true);
    setExportNotice(null);
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        // Try file sharing first
        if (navigator.canShare) {
          try {
            const file = new File([jsonString], filename, { type: 'application/json' });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: 'EPL Pro Match Center Backup',
                text: `EPL 26 Data Backup (${dateStr})`,
                files: [file],
              });
              setExportNotice('✓ Backup shared/saved successfully via Android system dialog.');
              setIsSharing(false);
              return;
            }
          } catch (e: any) {
            if (e?.name === 'AbortError') {
              setIsSharing(false);
              return;
            }
          }
        }

        // Fallback to sharing text
        await navigator.share({
          title: 'EPL Pro Backup JSON',
          text: jsonString,
        });
        setExportNotice('✓ Backup text shared successfully.');
      } else {
        await handleCopyClipboard();
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        await handleCopyClipboard();
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleDirectDownload = async () => {
    setExportNotice(null);
    const res = await exportBackupJson(state);
    if (res.success) {
      setExportNotice(`✓ ${res.message}`);
    } else {
      setExportNotice('Direct download restricted on this device. Please use "Copy JSON" or "Share via Mobile" below.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/30 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white border-2 border-red-200 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Export Backup (Mobile & PC)</h2>
              <p className="text-xs text-slate-500">Save, share, or copy your app data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice Alert */}
        {exportNotice && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-start space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{exportNotice}</span>
          </div>
        )}

        {/* Mobile Recommended Info */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
          <div className="flex items-center space-x-1.5 font-bold text-red-600">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile APK / WebView Compatibility</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            If your Android app blocks standard browser downloads, use <strong>"Share via Android / Save to Drive"</strong> or <strong>"Copy Full JSON"</strong>. Both work 100% reliably inside WebIntoApp and APKs.
          </p>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 gap-2.5 pt-1">
          {/* Option 1: Mobile Share / Save via System Dialog */}
          <button
            onClick={handleNativeShare}
            disabled={isSharing}
            className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{isSharing ? 'Opening Android System...' : 'Share / Save to Device (Android Share)'}</span>
          </button>

          {/* Option 2: 1-Click Copy to Clipboard */}
          <button
            onClick={handleCopyClipboard}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : '1-Click Copy Full JSON Backup'}</span>
          </button>

          {/* Option 3: Direct File Download */}
          <button
            onClick={handleDirectDownload}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Download className="w-4 h-4 text-red-600" />
            <span>Direct File Download (.json)</span>
          </button>
        </div>

        {/* Raw JSON Preview Toggle */}
        <div className="pt-2 border-t border-slate-200 space-y-2">
          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-800 py-1 cursor-pointer"
          >
            <span className="flex items-center space-x-1.5 font-medium">
              {showRawJson ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showRawJson ? 'Hide JSON Code Preview' : 'View / Manually Select JSON Code'}</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">({jsonString.length} chars)</span>
          </button>

          {showRawJson && (
            <div className="space-y-2 animate-fadeIn">
              <textarea
                readOnly
                value={jsonString}
                rows={7}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-mono text-[11px] text-slate-800 select-all focus:outline-none focus:border-red-500 resize-y"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
              <button
                onClick={handleCopyClipboard}
                className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-red-600" />
                <span>Select & Copy All Code</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
