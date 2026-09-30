import React, { useEffect } from 'react';
import { ActiveTab, AppState } from '../types';
import {
  LayoutDashboard,
  Trophy,
  Database,
  TrendingUp,
  Target,
  Layers,
  FileText,
  Settings as SettingsIcon,
  Download,
  ChevronRight,
} from 'lucide-react';
import { getThemeConfig } from '../utils/theme';

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
  const theme = getThemeConfig(state.settings.layoutTheme);

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

  const mainNavGroup: { id: ActiveTab; label: string; icon: React.ReactNode; isHot?: boolean }[] = [
    { id: 'dashboard', label: 'Sports Home', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'select_match', label: 'In-Play & Matches', icon: <Trophy className="w-4 h-4 text-emerald-400" />, isHot: true },
    { id: 'compounding', label: 'Compounding Plan', icon: <TrendingUp className="w-4 h-4 text-[#ffdf1b]" /> },
    { id: 'all_markets', label: 'All Betting Markets', icon: <TrendingUp className="w-4 h-4 text-teal-400" /> },
    { id: 'standings', label: 'EPL Standings', icon: <Trophy className="w-4 h-4 text-amber-400" /> },
    { id: 'team_data', label: 'Team Data & Fixtures', icon: <Database className="w-4 h-4 text-sky-400" /> },
    { id: 'demo_match', label: 'Match Comparison', icon: <Target className="w-4 h-4 text-indigo-400" /> },
    { id: 'overview', label: 'Overview & Analysis', icon: <Layers className="w-4 h-4 text-blue-400" /> },
    { id: 'report', label: 'Ledger', icon: <FileText className="w-4 h-4 text-purple-400" /> },
    { id: 'settings', label: 'App Settings & Themes', icon: <SettingsIcon className="w-4 h-4 text-slate-400" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="lg:hidden fixed inset-0 z-40 bg-black/75 backdrop-blur-xs transition-opacity animate-fadeIn"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-50 h-screen w-72 shrink-0 border-r flex flex-col justify-between p-4 transform transition-transform duration-300 ease-in-out select-none shadow-2xl text-white ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          backgroundColor: theme.sidebarBg || theme.surfaceBgHex,
          borderRightColor: theme.borderHex,
        }}
      >
        {/* Top Branding */}
        <div 
          className="pb-3 border-b flex items-center justify-between"
          style={{ borderBottomColor: theme.borderHex }}
        >
          <div
            onClick={() => handleNavClick('dashboard')}
            className="inline-flex flex-col items-stretch cursor-pointer py-1 group leading-none"
          >
            <span 
              className="text-2xl font-black italic tracking-wider select-none transition-colors duration-300 leading-none whitespace-nowrap"
              style={{ color: theme.secondarySwatchHex || '#ffffff' }}
            >
              EPL 2026
            </span>
            <div 
              className="w-full flex justify-between items-center text-[9px] font-black uppercase select-none leading-none mt-1 opacity-95 tracking-normal"
              style={{ color: theme.isDark ? '#f8fafc' : '#1e293b' }}
            >
              <span>P</span><span>R</span><span>E</span><span>M</span><span>I</span><span>E</span><span>R</span>
              <span className="w-1" />
              <span>L</span><span>E</span><span>A</span><span>G</span><span>U</span><span>E</span>
            </div>
          </div>
        </div>

        {/* Scrollable Nav Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 my-3 space-y-1">
          {mainNavGroup.map((item) => {
            const isActive =
              activeTab === item.id ||
              (item.id === 'standings' && activeTab === 'top_teams') ||
              (item.id === 'all_markets' && activeTab === 'market_trends') ||
              (item.id === 'demo_match' && activeTab === 'match_select') ||
              (item.id === 'select_match' && activeTab === 'daily_task') ||
              (item.id === 'overview' && (activeTab === 'overview' || activeTab === 'over_view')) ||
              (item.id === 'report' && (activeTab === 'reports' || activeTab === 'history' || activeTab === 'saved_ledger')) ||
              (item.id === 'settings' && activeTab === 'backup');

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                style={
                  isActive
                    ? {
                        backgroundColor: theme.primaryColor,
                        color: theme.secondarySwatchHex || '#ffffff',
                        fontWeight: 900,
                        border: `1px solid ${theme.borderHex}`,
                      }
                    : {
                        color: '#cbd5e1',
                      }
                }
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: isActive ? theme.primaryDark : 'rgba(0, 0, 0, 0.25)',
                      color: isActive ? (theme.secondarySwatchHex || '#ffffff') : '#94a3b8',
                    }}
                  >
                    {item.icon}
                  </div>
                  <span className="truncate tracking-tight">{item.label}</span>
                </div>
                {item.isHot && !isActive && (
                  <span 
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: theme.secondarySwatchHex || theme.primaryColor }}
                  />
                )}
                {isActive && (
                  <ChevronRight 
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: theme.secondarySwatchHex || '#ffffff' }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Actions: Download App */}
        <div 
          className="pt-3 border-t"
          style={{ borderTopColor: theme.borderHex }}
        >
          <button
            type="button"
            onClick={() => {
              if (onOpenDownloadModal) {
                if (onCloseMobile) onCloseMobile();
                onOpenDownloadModal();
              }
            }}
            className="w-full p-2.5 rounded-xl font-black transition-all flex items-center justify-between group shadow-sm cursor-pointer"
            style={{
              backgroundColor: theme.secondarySwatchHex || theme.primaryColor,
              color: theme.isDark ? '#090d16' : '#ffffff',
            }}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <Download className="w-4 h-4 shrink-0 stroke-[2.5]" />
              <div className="text-left truncate">
                <div className="text-xs font-black">
                  Download EPL2026 App
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/15">
              APK
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};
