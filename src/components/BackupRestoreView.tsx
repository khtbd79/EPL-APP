import React, { useState } from 'react';
import { AppState } from '../types';
import { loadState, saveState, DEFAULT_SETTINGS } from '../utils/storage';
import { normalizeTeamName } from '../utils/teamData';
import { saveStateToIndexedDB } from '../utils/indexedDbStorage';
import { getThemeConfig } from '../utils/theme';
import { downloadWebIntoAppZip, downloadWindowsDesktopZip, downloadStandaloneHtmlApp, downloadWindowsBatLauncher } from '../utils/htmlExporter';
import { exportBackupJson, copyTextToClipboard, validateBackupJson } from '../utils/mobileExportHelper';
import { BackupExportModal } from './BackupExportModal';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  HardDriveDownload,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  RefreshCw,
  Info,
  Smartphone,
  Package,
  Monitor,
  FileCode,
  Share2,
  Copy,
  Check,
  ClipboardPaste,
  FileText,
  Palette
} from 'lucide-react';

interface BackupRestoreViewProps {
  state: AppState;
  onRestoreState: (newState: AppState) => void;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({
  state,
  onRestoreState,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [isExportingPcZip, setIsExportingPcZip] = useState(false);
  const [isExportingHtml, setIsExportingHtml] = useState(false);
  const [isExportingBat, setIsExportingBat] = useState(false);

  // Mobile-compatible Export Modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [copiedQuick, setCopiedQuick] = useState(false);

  // Import tabs: file vs direct text paste
  const [importTab, setImportTab] = useState<'file' | 'paste'>('file');
  const [pastedJson, setPastedJson] = useState('');
  const [preserveCurrentTheme, setPreserveCurrentTheme] = useState(true);

  const currentTheme = state.settings?.layoutTheme || 'white_red';
  const currentThemeConfig = getThemeConfig(currentTheme);

  // Export JSON file download / share
  const handleExportJSON = async () => {
    setIsExportModalOpen(true);
    // Also try background download attempt
    try {
      await exportBackupJson(state);
    } catch (e) {}
  };

  // Quick 1-click clipboard copy
  const handleQuickCopy = async () => {
    const jsonStr = JSON.stringify(state, null, 2);
    const ok = await copyTextToClipboard(jsonStr);
    if (ok) {
      setCopiedQuick(true);
      setStatusMsg({ type: 'success', text: 'All data JSON copied to clipboard! You can paste into Google Keep, Notes, or WhatsApp.' });
      setTimeout(() => setCopiedQuick(false), 3000);
    } else {
      setIsExportModalOpen(true);
    }
  };

  // Restore from pasted JSON text
  const handleRestoreFromPastedJson = async () => {
    setStatusMsg(null);
    if (!pastedJson.trim()) {
      setStatusMsg({ type: 'error', text: 'Please paste your backup JSON code into the box first.' });
      return;
    }

    const validation = validateBackupJson(pastedJson);
    if (!validation.valid || !validation.state) {
      setStatusMsg({ type: 'error', text: validation.error || 'Invalid backup JSON structure.' });
      return;
    }

    const parsed = validation.state;
    const targetTheme = preserveCurrentTheme ? currentTheme : (parsed.settings?.layoutTheme || currentTheme);

    const restoredState: AppState = {
      currentDay: typeof parsed.currentDay === 'number' ? parsed.currentDay : 1,
      currentMatchweek: typeof parsed.currentMatchweek === 'number' ? parsed.currentMatchweek : 1,
      matchHistory: parsed.matchHistory,
      eplMatches: (Array.isArray(parsed.eplMatches) ? parsed.eplMatches : []).map((m: any) => ({
        ...m,
        homeTeam: normalizeTeamName(m.homeTeam) || m.homeTeam,
        awayTeam: normalizeTeamName(m.awayTeam) || m.awayTeam,
      })),
      preMatchNotes: parsed.preMatchNotes && typeof parsed.preMatchNotes === 'object' ? parsed.preMatchNotes : (state.preMatchNotes || {}),
      categoryRankings: parsed.categoryRankings && typeof parsed.categoryRankings === 'object' ? parsed.categoryRankings : (state.categoryRankings || {}),
      marketRecords: Array.isArray(parsed.marketRecords) ? parsed.marketRecords : (state.marketRecords || []),
      settings: {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings || state.settings),
        layoutTheme: targetTheme,
      },
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('btts_layout_theme', targetTheme);
      } catch (_) {}
    }

    saveState(restoredState);
    await saveStateToIndexedDB(restoredState);
    onRestoreState(restoredState);
    setPastedJson('');
    setStatusMsg({ type: 'success', text: 'Data restored successfully from pasted JSON backup.' });
  };

  // Import JSON file upload & restore
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const validation = validateBackupJson(content);
        if (validation.valid && validation.state) {
          const parsed = validation.state;
          const targetTheme = preserveCurrentTheme ? currentTheme : (parsed.settings?.layoutTheme || currentTheme);

          const restoredState: AppState = {
            currentDay: typeof parsed.currentDay === 'number' ? parsed.currentDay : 1,
            currentMatchweek: typeof parsed.currentMatchweek === 'number' ? parsed.currentMatchweek : 1,
            matchHistory: parsed.matchHistory,
            eplMatches: (Array.isArray(parsed.eplMatches) ? parsed.eplMatches : []).map((m: any) => ({
              ...m,
              homeTeam: normalizeTeamName(m.homeTeam) || m.homeTeam,
              awayTeam: normalizeTeamName(m.awayTeam) || m.awayTeam,
            })),
            preMatchNotes: parsed.preMatchNotes && typeof parsed.preMatchNotes === 'object' ? parsed.preMatchNotes : (state.preMatchNotes || {}),
            categoryRankings: parsed.categoryRankings && typeof parsed.categoryRankings === 'object' ? parsed.categoryRankings : (state.categoryRankings || {}),
            marketRecords: Array.isArray(parsed.marketRecords) ? parsed.marketRecords : (state.marketRecords || []),
            settings: {
              ...DEFAULT_SETTINGS,
              ...(parsed.settings || state.settings),
              layoutTheme: targetTheme,
            },
          };

          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('btts_layout_theme', targetTheme);
            } catch (_) {}
          }

          saveState(restoredState);
          await saveStateToIndexedDB(restoredState);
          onRestoreState(restoredState);
          setStatusMsg({ type: 'success', text: 'Data restored successfully from backup file.' });
        } else {
          setStatusMsg({ type: 'error', text: validation.error || 'Invalid EPL backup file structure.' });
        }
      } catch (err) {
        setStatusMsg({ type: 'error', text: 'Failed to parse JSON backup file.' });
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="w-full max-w-5xl 2xl:max-w-6xl mx-auto space-y-6 animate-fadeIn pb-36 sm:pb-40">
      {/* Header */}
      <div className="solid-card p-6 bg-white border border-red-200 shadow-sm rounded-2xl relative overflow-hidden">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-red-600 text-white rounded-xl shadow-md shrink-0">
            <HardDriveDownload className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Backup & Restore Data</h1>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl border text-sm font-semibold flex items-center space-x-2.5 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-red-50 border-red-300 text-red-800'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Progressive Web App Install Section */}
      <div className="solid-card p-6 bg-white border border-red-200 shadow-sm rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-200 shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Direct App Installation (PWA)</h2>
            </div>
          </div>
          {isInstalled && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Installed
            </span>
          )}
        </div>

        {isInstalled ? (
          <div className="py-2.5 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>App is installed and running in standalone mode</span>
          </div>
        ) : isInstallable ? (
          <button
            onClick={async () => {
              const ok = await install();
              if (ok) setStatusMsg({ type: 'success', text: 'App installed successfully.' });
            }}
            className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Install App on Device</span>
          </button>
        ) : isIOS ? (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="text-amber-800 font-bold flex items-center space-x-1.5">
              <Share2 className="w-3.5 h-3.5" />
              <span>iOS Installation</span>
            </div>
            <div className="font-mono text-[11px] text-amber-900">Tap Share icon in Safari and select 'Add to Home Screen'</div>
          </div>
        ) : (
          <div className="py-2.5 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium flex items-center space-x-2">
            <Info className="w-4 h-4 text-red-600 shrink-0" />
            <span>Install via browser menu 'Install App' or 'Add to Home Screen'</span>
          </div>
        )}
      </div>

      {/* Standalone HTML File Export Section */}
      <div className="solid-card p-6 bg-white border border-red-200 shadow-sm rounded-2xl space-y-4">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-200 shrink-0">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Standalone Offline App (.html)</h2>
          </div>
        </div>

        <button
          onClick={async () => {
            try {
              setIsExportingHtml(true);
              await downloadStandaloneHtmlApp(state);
              setIsExportingHtml(false);
              setStatusMsg({ type: 'success', text: 'Standalone Offline HTML app download complete.' });
            } catch (e) {
              setIsExportingHtml(false);
              setStatusMsg({ type: 'error', text: 'Failed to export standalone HTML.' });
            }
          }}
          disabled={isExportingHtml}
          className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
        >
          <FileCode className="w-4 h-4 stroke-[2.5]" />
          <span>{isExportingHtml ? 'Generating HTML...' : 'Download Standalone App (.html)'}</span>
        </button>
      </div>

      {/* WebIntoApp APK Builder ZIP Export Section */}
      <div className="solid-card p-6 bg-white border border-red-200 shadow-sm rounded-2xl space-y-4">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-200 shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Mobile APK ZIP Package (WebIntoApp)</h2>
          </div>
        </div>

        <button
          onClick={async () => {
            try {
              setIsExportingZip(true);
              await downloadWebIntoAppZip(state);
              setIsExportingZip(false);
              setStatusMsg({ type: 'success', text: 'WebIntoApp APK bundle ZIP download complete.' });
            } catch (e) {
              setIsExportingZip(false);
              setStatusMsg({ type: 'error', text: 'Failed to create ZIP package.' });
            }
          }}
          disabled={isExportingZip}
          className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
        >
          <Package className="w-4 h-4 stroke-[2.5]" />
          <span>{isExportingZip ? 'Generating ZIP...' : 'Download WebIntoApp ZIP (.zip)'}</span>
        </button>
      </div>

      {/* Windows PC Desktop / .BAT Launcher & Package Export Section */}
      <div className="solid-card p-6 bg-white border border-red-200 shadow-sm rounded-2xl space-y-4">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-200 shrink-0">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900">Windows PC Desktop Launcher (.BAT)</h2>
              <span className="text-[10px] font-mono text-red-700 font-bold px-2 py-0.5 rounded-full bg-red-50 border border-red-200">
                Desktop Mode
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={async () => {
              try {
                setIsExportingBat(true);
                await downloadWindowsBatLauncher(state);
                setIsExportingBat(false);
                setStatusMsg({ type: 'success', text: 'Launch_EPL_App.bat downloaded successfully. Double click to run!' });
              } catch (e) {
                setIsExportingBat(false);
                setStatusMsg({ type: 'error', text: 'Failed to download BAT launcher.' });
              }
            }}
            disabled={isExportingBat}
            className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>{isExportingBat ? 'Downloading...' : 'Download .BAT Launcher'}</span>
          </button>

          <button
            onClick={async () => {
              try {
                setIsExportingPcZip(true);
                await downloadWindowsDesktopZip(state);
                setIsExportingPcZip(false);
                setStatusMsg({ type: 'success', text: 'Windows PC bundle ZIP download complete.' });
              } catch (e) {
                setIsExportingPcZip(false);
                setStatusMsg({ type: 'error', text: 'Failed to create PC bundle ZIP.' });
              }
            }}
            disabled={isExportingPcZip}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Monitor className="w-4 h-4 stroke-[2.5]" />
            <span>{isExportingPcZip ? 'Generating Package...' : 'Download Windows PC Package (.zip)'}</span>
          </button>
        </div>
      </div>

      {/* Export Section */}
      <div className="solid-card p-6 bg-white border border-red-200 shadow-sm rounded-2xl space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-200">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Export Data Backup (JSON)</h2>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 hidden sm:inline-block">
            Universal Mobile & PC
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Export / Share Modal Button */}
          <button
            onClick={handleExportJSON}
            className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup (JSON)</span>
          </button>

          {/* 1-Click Copy All JSON */}
          <button
            onClick={handleQuickCopy}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            {copiedQuick ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
            <span>{copiedQuick ? 'Copied to Clipboard!' : '1-Click Copy Full JSON'}</span>
          </button>
        </div>
      </div>

      {/* Import / Restore Section */}
      <div className="solid-card p-6 bg-white border border-red-200 shadow-sm rounded-2xl space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-200">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Import & Restore Backup</h2>
            </div>
          </div>

          {/* Import Method Toggle */}
          <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs">
            <button
              onClick={() => setImportTab('file')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                importTab === 'file'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upload File
            </button>
            <button
              onClick={() => setImportTab('paste')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                importTab === 'paste'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Paste JSON
            </button>
          </div>
        </div>

        {/* Theme preservation toggle */}
        <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <input
            type="checkbox"
            id="preserveThemeToggle"
            checked={preserveCurrentTheme}
            onChange={(e) => setPreserveCurrentTheme(e.target.checked)}
            className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
          />
          <label htmlFor="preserveThemeToggle" className="text-xs font-semibold text-slate-700 cursor-pointer select-none flex items-center space-x-1.5">
            <Palette className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>Keep Current Theme: <strong className="text-slate-900">{currentThemeConfig.name}</strong></span>
          </label>
        </div>

        {importTab === 'file' ? (
          <label className="block w-full py-3.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs text-center cursor-pointer transition-all active:scale-[0.98]">
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleImportJSON}
              className="hidden"
            />
            <span className="flex items-center justify-center space-x-2">
              <Upload className="w-4 h-4 text-red-600" />
              <span>Select JSON File to Restore</span>
            </span>
          </label>
        ) : (
          <div className="space-y-2.5 animate-fadeIn">
            <textarea
              value={pastedJson}
              onChange={(e) => setPastedJson(e.target.value)}
              placeholder="Paste your backup JSON text here..."
              rows={4}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:border-red-500 placeholder-slate-400"
            />
            <button
              onClick={handleRestoreFromPastedJson}
              disabled={!pastedJson.trim()}
              className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer shadow-md"
            >
              <ClipboardPaste className="w-4 h-4" />
              <span>Validate & Restore from Pasted Code</span>
            </button>
          </div>
        )}
      </div>

      {/* Universal Mobile & Desktop Backup Export Modal */}
      <BackupExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        state={state}
      />
    </div>
  );
};
