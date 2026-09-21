import React, { useEffect } from 'react';
import { ActiveTab, AppState } from '../types';
import { calculateFinancials, formatMoney } from '../utils/storage';
import { getThemeConfig } from '../utils/theme';
import {
  LayoutDashboard,
  Calculator,
  History,
  Wallet,
  BarChart3,
  Settings as SettingsIcon,
  HardDriveDownload,
  FileText,
  Layers,
  ChevronRight,
  Trophy,
  Target,
  Download,
  TrendingUp,
  Database
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  state: AppState;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenDownloadModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  state,
  isMobileOpen,
  onCloseMobile,
  onOpenDownloadModal,
}) => {
  const fin = calculateFinancials(state);
  const currency = state.settings.currency || '$';
  const currentThemeConfig = getThemeConfig(state.settings.layoutTheme);

  useEffect(() => {
    if (isMobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isMobileOpen]);

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const mainNavGroup: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'standings', label: 'Standing', icon: <Trophy className="w-4 h-4 text-amber-500" /> },
    { id: 'team_data', label: 'Team Data', icon: <Database className="w-4 h-4 text-red-600" /> },
    { id: 'all_markets', label: 'All Markets', icon: <TrendingUp className="w-4 h-4 text-emerald-500" /> },
    { id: 'demo_match', label: 'Match Comparison', icon: <Target className="w-4 h-4" /> },
    { id: 'select_match', label: 'Select Match', icon: <Trophy className="w-4 h-4 text-red-600" /> },
    { id: 'report', label: 'Report', icon: <FileText className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  const renderNavSection = (_title: string, items: typeof mainNavGroup) => (
    <div className="space-y-1 pt-2 first:pt-0">
      {items.map((item) => {
        const isActive =
          activeTab === item.id ||
          (item.id === 'standings' && activeTab === 'top_teams') ||
          (item.id === 'all_markets' && activeTab === 'market_trends') ||
          (item.id === 'demo_match' && activeTab === 'match_select') ||
          (item.id === 'select_match' && activeTab === 'daily_task') ||
          (item.id === 'report' && (activeTab === 'reports' || activeTab === 'history' || activeTab === 'saved_ledger')) ||
          (item.id === 'settings' && activeTab === 'backup');
        return (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer group relative ${
              isActive
                ? 'shadow-md'
                : currentThemeConfig.isDark
                ? 'text-slate-200 hover:bg-slate-800'
                : 'text-slate-800 hover:bg-slate-100'
            }`}
            style={
              isActive
                ? {
                    backgroundColor: currentThemeConfig.primaryColor,
                    color: currentThemeConfig.isDark ? '#090d16' : '#ffffff',
                  }
                : undefined
            }
          >
            <div className="flex items-center space-x-2.5 truncate">
              <div 
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : currentThemeConfig.isDark
                    ? 'bg-slate-800 text-sky-400'
                    : 'bg-slate-100 text-slate-700'
                }`}
                style={isActive && currentThemeConfig.isDark ? { color: '#090d16' } : undefined}
              >
                {item.icon}
              </div>
              <span className="truncate tracking-tight font-bold">{item.label}</span>
            </div>
            <div className="flex items-center space-x-1.5 shrink-0">
              {item.badge && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md font-mono ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-800'
                }`}>
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs transition-opacity animate-fadeIn"
        />
      )}

      {/* Sidebar Navigation - Hidden on PC / Desktop as options are moved to Top Navbar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-50 h-screen w-72 shrink-0 border-r flex flex-col justify-between p-4 transform transition-transform duration-300 ease-in-out select-none shadow-xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          backgroundColor: currentThemeConfig.isDark ? '#0b0f19' : '#ffffff',
          borderColor: currentThemeConfig.borderHex,
        }}
      >
        {/* Top Branding */}
        <div className="pb-3 border-b" style={{ borderColor: currentThemeConfig.borderHex }}>
          <div className="px-1">
            <div
              onClick={() => handleNavClick('dashboard')}
              className="flex flex-col cursor-pointer group py-1"
            >
              <div className="flex items-center">
                <div className="flex items-center space-x-1.5">
                  <span className={`text-2xl font-black tracking-tight ${currentThemeConfig.isDark ? 'text-white' : 'text-slate-900'}`}>
                    EPL
                  </span>
                  <span 
                    className="text-2xl font-black tracking-tight"
                    style={{ color: currentThemeConfig.primaryColor }}
                  >
                    2026
                  </span>
                </div>
              </div>
              {/* Long distinct line underneath EPL26 to separate it */}
              <div 
                className="w-full h-1 mt-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: currentThemeConfig.primaryColor }}
              />
            </div>
          </div>
        </div>

        {/* Scrollable Nav Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 my-3 space-y-1">
          {renderNavSection('Navigation', mainNavGroup)}
        </div>

        {/* Bottom Actions: Download App */}
        <div className="pt-3 border-t space-y-2" style={{ borderColor: currentThemeConfig.borderHex }}>
          <button
            type="button"
            onClick={() => {
              if (onOpenDownloadModal) {
                if (onCloseMobile) onCloseMobile();
                onOpenDownloadModal();
              }
            }}
            className="w-full p-2.5 rounded-xl border transition-all flex items-center justify-between group shadow-sm cursor-pointer"
            style={{
              backgroundColor: currentThemeConfig.isDark ? '#111827' : currentThemeConfig.primaryLight,
              borderColor: currentThemeConfig.borderHex,
              color: currentThemeConfig.isDark ? '#f1f5f9' : currentThemeConfig.primaryColor,
            }}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <Download 
                className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" 
                style={{ color: currentThemeConfig.primaryColor }}
              />
              <div className="text-left truncate">
                <div className={`text-xs font-black ${currentThemeConfig.isDark ? 'text-white' : 'text-slate-900'}`}>
                  Download App
                </div>
              </div>
            </div>
            <span 
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg shadow-sm"
              style={{
                backgroundColor: currentThemeConfig.primaryColor,
                color: currentThemeConfig.isDark ? '#090d16' : '#ffffff',
              }}
            >
              PWA
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};
