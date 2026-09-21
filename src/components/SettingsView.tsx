import React, { useState, useEffect } from 'react';
import { AppState, AppSettings } from '../types';
import { ResetDataModal } from './ResetDataModal';
import { ConfirmActionModal, ConfirmModalConfig } from './ConfirmActionModal';
import { exportBackupJson, copyTextToClipboard, validateBackupJson } from '../utils/mobileExportHelper';
import { BackupExportModal } from './BackupExportModal';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  downloadStandaloneHtmlApp,
  downloadWebIntoAppZip,
  downloadWindowsDesktopZip,
  downloadWindowsBatLauncher,
  downloadAppIconPng,
} from '../utils/htmlExporter';
import {
  Settings as SettingsIcon,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Coins,
  HardDriveDownload,
  Download,
  Upload,
  FileJson,
  Copy,
  Check,
  AlertTriangle,
  Monitor,
  Smartphone,
  Package,
  ExternalLink,
  FileCode,
  Image as ImageIcon,
  Sparkles,
  Layers,
  HelpCircle,
  Laptop,
  Palette,
  Moon,
  Sun,
} from 'lucide-react';
import { AppLayoutTheme } from '../types';
import { THEME_LIST, getThemeConfig } from '../utils/theme';

interface SettingsViewProps {
  state: AppState;
  onUpdateSettings: (settings: AppSettings) => void;
  onUpdateTheme?: (theme: AppLayoutTheme) => void;
  onResetCycle: () => void;
  onClearAll: () => void;
  onRestoreState?: (newState: AppState) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  state,
  onUpdateSettings,
  onUpdateTheme,
  onResetCycle,
  onClearAll,
  onRestoreState,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const [savedMsg, setSavedMsg] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmModalConfig | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<AppLayoutTheme>(
    state.settings.layoutTheme || 'white_red'
  );

  useEffect(() => {
    if (state.settings.layoutTheme) {
      setSelectedTheme(state.settings.layoutTheme);
    }
  }, [state.settings.layoutTheme]);

  const activeThemeConfig = getThemeConfig(selectedTheme);

  const handleSelectTheme = (themeId: AppLayoutTheme) => {
    setSelectedTheme(themeId);
    try {
      localStorage.setItem('btts_layout_theme', themeId);
    } catch (_) {}
    if (onUpdateTheme) {
      onUpdateTheme(themeId);
    }
    onUpdateSettings({
      ...state.settings,
      layoutTheme: themeId,
    });
    const foundTheme = THEME_LIST.find((t) => t.id === themeId);
    setActionSuccessMsg(`Theme "${foundTheme?.name || themeId}" applied successfully!`);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  // Backup & Restore states
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [copiedQuick, setCopiedQuick] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const getCleanAppUrl = () => {
    if (typeof window === 'undefined') return '';
    return window.location.href;
  };

  const handleCopyText = async (text: string, fieldId: string) => {
    try {
      await copyTextToClipboard(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePwaInstall = async () => {
    try {
      const ok = await install();
      if (ok) {
        setActionSuccessMsg('Application successfully installed on your computer!');
        setTimeout(() => setActionSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error('PWA install error:', err);
    }
  };

  const handleOpenInNewWindow = () => {
    if (typeof window !== 'undefined') {
      window.open(window.location.href, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownloadWebIntoApp = async () => {
    try {
      setDownloadingFormat('webintoapp');
      await downloadWebIntoAppZip(state);
      setDownloadingFormat(null);
      setActionSuccessMsg('WebIntoApp Ready Bundle (.zip) downloaded successfully!');
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (e) {
      setDownloadingFormat(null);
    }
  };

  const handleDownloadStandaloneHtml = async () => {
    try {
      setDownloadingFormat('html');
      await downloadStandaloneHtmlApp(state);
      setDownloadingFormat(null);
      setActionSuccessMsg('Standalone Offline App (.html) downloaded successfully!');
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (e) {
      setDownloadingFormat(null);
    }
  };

  const handleDownloadIcon = async () => {
    try {
      setDownloadingFormat('icon');
      await downloadAppIconPng();
      setDownloadingFormat(null);
      setActionSuccessMsg('App Icon (512x512 PNG) downloaded successfully!');
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (e) {
      setDownloadingFormat(null);
    }
  };

  const handleDownloadBat = async () => {
    try {
      setDownloadingFormat('bat');
      await downloadWindowsBatLauncher(state);
      setDownloadingFormat(null);
      setActionSuccessMsg('Windows 1-Click Launcher (.bat) downloaded successfully!');
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (e) {
      setDownloadingFormat(null);
    }
  };

  const handleDownloadWindowsZip = async () => {
    try {
      setDownloadingFormat('pc');
      await downloadWindowsDesktopZip(state);
      setDownloadingFormat(null);
      setActionSuccessMsg('Windows Desktop Bundle (.zip) downloaded successfully!');
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (e) {
      setDownloadingFormat(null);
    }
  };

  const handlePromptResetCycle = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Reset Match Counter',
      message: 'Are you sure you want to reset the match sequence counter? (All match history and calculation data will remain intact)',
      confirmLabel: 'Yes, Reset Counter',
      cancelLabel: 'Cancel',
      variant: 'warning',
      onConfirm: onResetCycle,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...state.settings,
      currency: 'BDT',
      layoutTheme: selectedTheme,
    });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  // Export JSON Backup
  const handleExportJSON = async () => {
    setIsExportModalOpen(true);
    try {
      await exportBackupJson(state);
    } catch (e) {}
  };

  // Copy Quick JSON
  const handleCopyQuickJson = async () => {
    try {
      const jsonStr = JSON.stringify(state, null, 2);
      await copyTextToClipboard(jsonStr);
      setCopiedQuick(true);
      setTimeout(() => setCopiedQuick(false), 2500);
    } catch (err) {
      setImportStatus({ type: 'error', text: 'Failed to copy to clipboard' });
    }
  };

  // File Upload Restore
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const validation = validateBackupJson(content);
        if (!validation.valid || !validation.state) {
          setImportStatus({ type: 'error', text: validation.error || 'Invalid backup file format' });
          return;
        }

        if (onRestoreState) {
          onRestoreState(validation.state);
          setImportStatus({ type: 'success', text: 'Backup restored successfully!' });
          setTimeout(() => setImportStatus(null), 4000);
        }
      } catch (err) {
        setImportStatus({ type: 'error', text: 'Failed to parse JSON backup file.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="w-full max-w-5xl 2xl:max-w-6xl mx-auto space-y-6 animate-fadeIn pb-36 sm:pb-40">
      {/* Header */}
      <div className="solid-card p-6 bg-white border border-red-100 rounded-2xl relative overflow-hidden shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-200">
            <SettingsIcon className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Application Settings</h1>
          </div>
        </div>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-bold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-bold flex items-center space-x-2 animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {importStatus && (
        <div
          className={`p-4 rounded-xl text-sm font-bold flex items-center space-x-2 animate-fadeIn ${
            importStatus.type === 'success'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border border-rose-300 text-rose-800'
          }`}
        >
          {importStatus.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{importStatus.text}</span>
        </div>
      )}

      {/* ========================================================
          THEME SELECTION SECTION: 10 DISTINCT BEAUTIFUL THEMES
      ======================================================== */}
      <div className="solid-card p-6 space-y-6 bg-white border-2 border-red-200 rounded-2xl shadow-sm">
        <div className="flex items-start sm:items-center justify-between gap-3 border-b border-red-100 pb-3 flex-wrap">
          <div className="flex items-center space-x-2.5">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{
                backgroundColor: activeThemeConfig.primaryLight,
                color: activeThemeConfig.primaryColor,
              }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Color Themes
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-mono">
                  10 Themes
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Select from 10 distinct color themes including Dark Mode. Click any theme to apply instantly.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500">Active Theme:</span>
            <span 
              className="text-xs font-black px-3 py-1 rounded-lg border flex items-center space-x-1.5 shadow-xs"
              style={{
                backgroundColor: activeThemeConfig.primaryLight,
                borderColor: activeThemeConfig.borderHex,
                color: activeThemeConfig.primaryColor,
              }}
            >
              {activeThemeConfig.isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              <span>{activeThemeConfig.name}</span>
            </span>
          </div>
        </div>

        {/* 10 Themes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {THEME_LIST.map((theme) => {
            const isCurrent = selectedTheme === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                className={`relative rounded-2xl border-2 p-3.5 flex flex-col justify-between transition-all duration-200 cursor-pointer group text-left ${
                  isCurrent
                    ? 'shadow-md scale-[1.02]'
                    : 'hover:shadow-md hover:scale-[1.01] bg-white border-slate-200 hover:border-slate-300'
                }`}
                style={
                  isCurrent
                    ? {
                        borderColor: theme.primaryColor,
                        backgroundColor: theme.isDark ? '#0f172a' : '#ffffff',
                      }
                    : {
                        backgroundColor: theme.isDark ? '#0f172a' : '#ffffff',
                      }
                }
              >
                {/* Active Check Badge */}
                {isCurrent && (
                  <div 
                    className="absolute -top-2.5 -right-2 px-2 py-0.5 rounded-full text-[10px] font-black text-white shadow-md flex items-center space-x-1 animate-scaleUp z-10"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Active</span>
                  </div>
                )}

                {/* Dark Mode Ribbon Badge */}
                {theme.isDark && !isCurrent && (
                  <div className="absolute -top-2 -right-1.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-slate-900 text-sky-300 border border-slate-700 shadow-sm flex items-center space-x-1 z-10">
                    <Moon className="w-2.5 h-2.5" />
                    <span>Dark Theme</span>
                  </div>
                )}

                <div>
                  {/* Visual Mini Mockup Bar */}
                  <div 
                    className="w-full h-10 rounded-xl overflow-hidden mb-3 border shadow-xs flex flex-col justify-between p-1.5 relative transition-transform group-hover:scale-[1.02]"
                    style={{
                      backgroundColor: theme.isDark ? '#090d16' : theme.primaryLight,
                      borderColor: theme.borderHex,
                    }}
                  >
                    {/* Mockup Header */}
                    <div 
                      className="w-full h-4 rounded-md px-2 flex items-center justify-between"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      <span className="text-[8px] font-black text-white tracking-wider">EPL 26</span>
                      <div className="flex space-x-0.5">
                        <div className="w-1 h-1 rounded-full bg-white/70" />
                        <div className="w-1 h-1 rounded-full bg-white/70" />
                      </div>
                    </div>
                    {/* Mockup Body Elements */}
                    <div className="flex items-center space-x-1 px-1">
                      <div 
                        className="w-3 h-1.5 rounded-xs"
                        style={{ backgroundColor: theme.primaryColor, opacity: 0.8 }}
                      />
                      <div 
                        className="w-5 h-1.5 rounded-xs"
                        style={{ backgroundColor: theme.isDark ? '#334155' : '#cbd5e1' }}
                      />
                    </div>
                  </div>

                  {/* Theme Header: Swatch + Title */}
                  <div className="flex items-start space-x-2.5 mb-1.5">
                    {/* Color Swatch Circle */}
                    <div 
                      className="w-6 h-6 rounded-full shrink-0 shadow-xs border-2 flex items-center justify-center mt-0.5"
                      style={{ 
                        backgroundColor: theme.primaryColor,
                        borderColor: theme.secondarySwatchHex || '#ffffff',
                      }}
                    >
                      {theme.isDark && <Moon className="w-3 h-3 text-sky-200" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className={`text-xs font-black truncate ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>
                        {theme.name}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[10px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                    {theme.description}
                  </p>
                </div>

                {/* Bottom Action Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectTheme(theme.id);
                  }}
                  className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                    isCurrent
                      ? 'shadow-xs'
                      : 'hover:opacity-90'
                  }`}
                  style={
                    isCurrent
                      ? {
                          backgroundColor: theme.primaryColor,
                          color: theme.isDark ? '#090d16' : '#ffffff',
                        }
                      : {
                          backgroundColor: theme.primaryLight,
                          color: theme.primaryColor,
                          border: `1px solid ${theme.borderHex}`,
                        }
                  }
                >
                  {isCurrent ? (
                    <>
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Active Theme</span>
                    </>
                  ) : (
                    <span>Apply Theme</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          SECTION 1: DIRECT COMPUTER / PC INSTALLATION
      ======================================================== */}
      <div className="solid-card p-6 space-y-5 bg-white border-2 border-red-200 rounded-2xl shadow-sm">
        <div className="flex items-start sm:items-center justify-between gap-3 border-b border-red-100 pb-3 flex-wrap">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                PC & Desktop App
              </h2>
            </div>
          </div>

          {isInstalled ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Installed on this PC</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              <span>PWA Ready</span>
            </span>
          )}
        </div>

        {/* PWA 1-Click Action */}
        <div className="flex flex-wrap items-center gap-3">
          {isInstalled ? (
            <div className="py-2.5 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Installed as standalone app</span>
            </div>
          ) : isInstallable ? (
            <button
              type="button"
              onClick={handlePwaInstall}
              className="py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Install on PC (Desktop App)</span>
              <span className="sm:hidden">Install Desktop App</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenInNewWindow}
              className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Open in New Tab to Install</span>
              <span className="sm:hidden">Open in New Tab</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadBat}
            disabled={downloadingFormat === 'bat'}
            className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-red-600" />
            <span>{downloadingFormat === 'bat' ? 'Downloading...' : 'Download .BAT'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadWindowsZip}
            disabled={downloadingFormat === 'pc'}
            className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-slate-700" />
            <span>{downloadingFormat === 'pc' ? 'Packaging...' : 'Download PC Bundle'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          SECTION 2: WEB INTO APP (MOBILE APK BUILDER)
      ======================================================== */}
      <div className="solid-card p-6 space-y-5 bg-white border-2 border-red-200 rounded-2xl shadow-sm">
        <div className="flex items-start sm:items-center justify-between gap-3 border-b border-red-100 pb-3 flex-wrap">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                <span className="hidden sm:inline">Android APK Packages (WebIntoApp)</span>
                <span className="sm:hidden">Android APK Packages</span>
              </h2>
            </div>
          </div>

          <a
            href="https://www.webintoapp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 flex items-center gap-1.5 transition-all shadow-xs whitespace-nowrap"
          >
            <ExternalLink className="w-3.5 h-3.5 text-red-600" />
            <span>WebIntoApp.com</span>
          </a>
        </div>

        {/* Download Ready Packages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={handleDownloadWebIntoApp}
            disabled={downloadingFormat === 'webintoapp'}
            className="p-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-left transition-all cursor-pointer flex items-center justify-between gap-2 shadow-md"
          >
            <div>
              <div className="font-black text-xs flex items-center gap-1.5 whitespace-nowrap">
                <Package className="w-4 h-4 text-white" />
                <span>WebIntoApp (.ZIP)</span>
              </div>
              <div className="text-[11px] text-red-100 mt-0.5 font-medium">100% Offline Package</div>
            </div>
            <Download className="w-5 h-5 text-white shrink-0" />
          </button>

          <button
            type="button"
            onClick={handleDownloadStandaloneHtml}
            disabled={downloadingFormat === 'html'}
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all cursor-pointer flex items-center justify-between gap-2"
          >
            <div>
              <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5 whitespace-nowrap">
                <FileCode className="w-4 h-4 text-slate-700" />
                <span>Standalone (.HTML)</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Offline single file</div>
            </div>
            <Download className="w-4 h-4 text-slate-700 shrink-0" />
          </button>

          <button
            type="button"
            onClick={handleDownloadIcon}
            disabled={downloadingFormat === 'icon'}
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all cursor-pointer flex items-center justify-between gap-2"
          >
            <div>
              <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5 whitespace-nowrap">
                <ImageIcon className="w-4 h-4 text-slate-700" />
                <span>App Icon (.PNG)</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Icon Asset</div>
            </div>
            <Download className="w-4 h-4 text-slate-700 shrink-0" />
          </button>
        </div>

        {/* Pre-Configured App Values for WebIntoApp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">App Name</div>
              <div className="text-xs font-black text-slate-900">EPL Pro Match Center</div>
            </div>
            <button
              type="button"
              onClick={() => handleCopyText('EPL Pro Match Center', 'name')}
              className="p-1 rounded text-slate-400 hover:text-slate-700"
              title="Copy Name"
            >
              {copiedField === 'name' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Package Name</div>
              <div className="text-xs font-mono font-bold text-slate-800">com.eplpro.matchcenter</div>
            </div>
            <button
              type="button"
              onClick={() => handleCopyText('com.eplpro.matchcenter', 'pkg')}
              className="p-1 rounded text-slate-400 hover:text-slate-700"
              title="Copy Package"
            >
              {copiedField === 'pkg' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Display Mode</div>
            <div className="text-xs font-bold text-slate-900">Standalone (No URL Bar)</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Theme / Splash</div>
            <div className="text-xs font-mono font-bold text-red-600">#dc2626 (Red)</div>
          </div>
        </div>
      </div>

      {/* Main Currency Settings Form */}
      <form onSubmit={handleSave} className="solid-card p-6 space-y-6 bg-white border border-red-100 rounded-2xl shadow-sm">
        {/* Currency Display (Default BDT) */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider flex items-center space-x-2">
            <Coins className="w-4 h-4 text-red-600" />
            <span>Default Currency Symbol</span>
          </label>
          <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 flex items-center justify-between">
            <div>
              <div className="text-sm font-black text-slate-900">Bangladeshi Taka (BDT)</div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white border border-red-200 shadow-sm flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500">Active:</span>
              <span className="text-base font-black font-mono text-red-600">BDT</span>
            </div>
          </div>
        </div>

        {/* Save Settings Button */}
        <button
          type="submit"
          className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          Save Settings
        </button>
      </form>

      {/* ========================================================
          BACKUP & RESTORE DATA SECTION (Moved inside Settings)
      ======================================================== */}
      <div className="solid-card p-6 space-y-6 bg-white border border-red-100 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-3 border-b border-red-100 pb-3">
          <HardDriveDownload className="w-5 h-5 text-red-600" />
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            Backup & Restore Data
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export JSON Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-sm">
              <FileJson className="w-4 h-4 text-red-600" />
              <span>Export JSON Backup</span>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex-1 py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Backup</span>
              </button>
              <button
                type="button"
                onClick={handleCopyQuickJson}
                className="py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer"
                title="Copy JSON to Clipboard"
              >
                {copiedQuick ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              </button>
            </div>
          </div>

          {/* Import / Restore Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-sm">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Restore from Backup</span>
            </div>

            <div className="pt-2">
              <label className="w-full py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs transition-all">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Select Backup File (.json)</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Cycle Reset & Danger Zone */}
      <div className="solid-card p-6 space-y-4 bg-white border border-red-100 rounded-2xl shadow-sm">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-red-100 pb-3">
          <RotateCcw className="w-5 h-5 text-amber-500" />
          <span>Maintenance & Data Reset</span>
        </h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <div>
            <div className="text-xs font-bold text-amber-900">Reset Match Sequence Counter</div>
          </div>
          <button
            type="button"
            onClick={handlePromptResetCycle}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shrink-0 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
          >
            Reset Counter
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-rose-50 border border-rose-200">
          <div>
            <div className="text-xs font-bold text-rose-900 flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Reset All Data</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
          >
            Reset All Data
          </button>
        </div>
      </div>

      {/* Reset Data Confirmation Modal */}
      <ResetDataModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirmReset={() => {
          onClearAll();
        }}
      />

      {/* Counter Reset Confirmation Modal */}
      <ConfirmActionModal
        config={confirmConfig}
        onClose={() => setConfirmConfig(null)}
      />

      {/* Export JSON Modal Helper */}
      <BackupExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        state={state}
      />
    </div>
  );
};
