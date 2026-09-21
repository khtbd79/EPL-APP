import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Monitor,
  FileCode,
  Package,
  CheckCircle2,
  X,
  Share2,
  HardDriveDownload,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { AppState } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  downloadStandaloneHtmlApp,
  downloadWebIntoAppZip,
  downloadWindowsDesktopZip,
  downloadWindowsBatLauncher
} from '../utils/htmlExporter';
import { exportBackupJson, copyTextToClipboard } from '../utils/mobileExportHelper';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({
  isOpen,
  onClose,
  state,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePwaInstall = async () => {
    const ok = await install();
    if (ok) {
      setSuccessMsg('Application installed successfully.');
      setTimeout(() => setSuccessMsg(null), 3500);
    }
  };

  const handleDownloadBat = async () => {
    try {
      setDownloadingFormat('bat');
      await downloadWindowsBatLauncher(state);
      setDownloadingFormat(null);
      setSuccessMsg('Launch_EPL_App.bat download complete. Double click to run!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e) {
      setDownloadingFormat(null);
    }
  };

  const handleDownloadHtml = async () => {
    try {
      setDownloadingFormat('html');
      await downloadStandaloneHtmlApp(state);
      setDownloadingFormat(null);
      setSuccessMsg('Standalone HTML download complete.');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (e) {
      setDownloadingFormat(null);
    }
  };

  const handleDownloadWebIntoApp = async () => {
    try {
      setDownloadingFormat('zip');
      await downloadWebIntoAppZip(state);
      setDownloadingFormat(null);
      setSuccessMsg('WebIntoApp bundle download complete.');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (e) {
      setDownloadingFormat(null);
    }
  };

  const handleDownloadWindows = async () => {
    try {
      setDownloadingFormat('pc');
      await downloadWindowsDesktopZip(state);
      setDownloadingFormat(null);
      setSuccessMsg('Windows bundle download complete.');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (e) {
      setDownloadingFormat(null);
    }
  };

  const handleDownloadJson = async () => {
    try {
      const res = await exportBackupJson(state);
      setSuccessMsg(res.message || 'JSON backup processed.');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/30 backdrop-blur-sm animate-fade-in"
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
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 leading-tight">Download & Install App</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Option 1: Progressive Web App Install */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-red-600" />
              <span className="text-sm font-bold text-slate-900">Home Screen App (PWA)</span>
            </div>
            {isInstalled ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Installed
              </span>
            ) : isInstallable ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                Ready
              </span>
            ) : isIOS ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Safari
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                Browser
              </span>
            )}
          </div>

          {isInstalled ? (
            <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>App is running in standalone mode</span>
            </div>
          ) : isInstallable ? (
            <button
              onClick={handlePwaInstall}
              className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Install to Home Screen</span>
            </button>
          ) : isIOS ? (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-amber-800 font-bold">
                <Share2 className="w-3.5 h-3.5" />
                <span>iOS Installation</span>
              </div>
              <div className="font-mono text-[11px] text-amber-900">
                1. Tap Share icon in Safari<br />
                2. Tap 'Add to Home Screen'
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-slate-100 text-[11px] text-slate-600 font-mono flex items-center space-x-2">
              <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Use browser menu to Add to Home Screen</span>
            </div>
          )}
        </div>

        {/* Option 2: Standalone HTML File Download */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-red-600" />
              <span className="text-sm font-bold text-slate-900">Standalone Offline HTML</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Single File</span>
          </div>

          <button
            onClick={handleDownloadHtml}
            disabled={downloadingFormat === 'html'}
            className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingFormat === 'html' ? 'Exporting...' : 'Download Standalone App (.html)'}</span>
          </button>
        </div>

        {/* Option 3: Android APK ZIP (WebIntoApp Offline) */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-red-600" />
              <span className="text-sm font-bold text-slate-900">Android APK (.ZIP)</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
              Offline
            </span>
          </div>

          <button
            onClick={handleDownloadWebIntoApp}
            disabled={downloadingFormat === 'zip'}
            className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingFormat === 'zip' ? 'Packaging...' : 'Download WebIntoApp Bundle (.zip)'}</span>
          </button>
        </div>

        {/* Option 4: Windows PC .BAT Launcher & Full Desktop Package */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Monitor className="w-4 h-4 text-red-600" />
              <span className="text-sm font-bold text-slate-900">Windows PC Launcher (.BAT)</span>
            </div>
            <span className="text-[10px] font-mono text-red-700 font-bold px-2 py-0.5 rounded-full bg-red-50 border border-red-200">
              Desktop Mode
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleDownloadBat}
              disabled={downloadingFormat === 'bat'}
              className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md flex items-center justify-center space-x-1.5 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{downloadingFormat === 'bat' ? 'Downloading...' : 'Download .BAT File'}</span>
            </button>

            <button
              onClick={handleDownloadWindows}
              disabled={downloadingFormat === 'pc'}
              className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{downloadingFormat === 'pc' ? 'Packaging...' : 'Download PC Bundle (.zip)'}</span>
            </button>
          </div>
        </div>

        {/* Option 5: JSON Data Backup */}
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-600 font-medium">Database Backup</span>
          <button
            onClick={handleDownloadJson}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <HardDriveDownload className="w-3.5 h-3.5 text-red-600" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
