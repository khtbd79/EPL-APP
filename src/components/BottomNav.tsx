import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ActiveTab, AppState } from '../types';
import { getThemeConfig } from '../utils/theme';
import {
  LayoutDashboard,
  Trophy,
  Plus,
  Target,
  Menu,
  X,
  TrendingUp,
  Database,
  Layers,
  FileText,
  Settings as SettingsIcon,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  state: AppState;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, state }) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const theme = getThemeConfig(state?.settings?.layoutTheme);

  useEffect(() => {
    if (isMoreMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isMoreMenuOpen]);

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMoreMenuOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const moreMenuItems = [
    { id: 'compounding' as ActiveTab, label: 'Compounding', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'standings' as ActiveTab, label: 'Standing', icon: <Trophy className="w-5 h-5" /> },
    { id: 'team_data' as ActiveTab, label: 'Team Data', icon: <Database className="w-5 h-5" /> },
    { id: 'all_markets' as ActiveTab, label: 'All Markets', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'demo_match' as ActiveTab, label: 'Match Comparison', icon: <Target className="w-5 h-5" /> },
    { id: 'select_match' as ActiveTab, label: 'In-Play Matches', icon: <Trophy className="w-5 h-5" /> },
    { id: 'overview' as ActiveTab, label: 'Overview', icon: <Layers className="w-5 h-5" /> },
    { id: 'report' as ActiveTab, label: 'Ledger', icon: <FileText className="w-5 h-5" /> },
    { id: 'settings' as ActiveTab, label: 'Settings & Themes', icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  const activeColor = theme.secondarySwatchHex || theme.primaryColor;

  return (
    <>
      {/* Expanded Menu Modal */}
      {isMoreMenuOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="lg:hidden fixed inset-0 z-[99999] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div
            className="w-full max-w-sm border p-5 rounded-3xl space-y-4 shadow-2xl relative animate-scaleUp my-auto text-white transition-colors duration-300"
            style={{
              backgroundColor: theme.cardBgHex,
              borderColor: theme.borderHex,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="flex items-center justify-between border-b pb-3"
              style={{ borderBottomColor: theme.borderHex }}
            >
              <div className="inline-flex flex-col items-stretch">
                <span 
                  className="text-lg font-black italic tracking-tighter leading-none whitespace-nowrap"
                  style={{ color: activeColor }}
                >
                  EPL 2026
                </span>
                <div className="w-full flex justify-between items-center text-[7.5px] font-black uppercase text-slate-200 select-none leading-none mt-1 opacity-95 tracking-normal">
                  <span>P</span><span>R</span><span>E</span><span>M</span><span>I</span><span>E</span><span>R</span>
                  <span className="w-1" />
                  <span>L</span><span>E</span><span>A</span><span>G</span><span>U</span><span>E</span>
                </div>
              </div>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1 max-h-[60vh] overflow-y-auto pr-1">
              {moreMenuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className="p-3 rounded-2xl border flex flex-col items-center justify-center text-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs"
                    style={
                      isActive
                        ? {
                            backgroundColor: theme.primaryColor,
                            color: activeColor,
                            borderColor: theme.borderHex,
                            fontWeight: 900,
                          }
                        : {
                            backgroundColor: theme.surfaceBgHex,
                            borderColor: theme.borderHex,
                            color: '#cbd5e1',
                          }
                    }
                  >
                    <div 
                      className="p-2 rounded-xl border shadow-2xs transition-colors"
                      style={{
                        backgroundColor: isActive ? theme.primaryDark : 'rgba(0, 0, 0, 0.25)',
                        borderColor: theme.borderHex,
                        color: isActive ? activeColor : '#94a3b8',
                      }}
                    >
                      {item.icon}
                    </div>
                    <span className="truncate w-full">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Main Bottom Dock (Adapts dynamically to selected bookmaker) */}
      <nav 
        className="lg:hidden fixed bottom-0 inset-x-0 w-full z-40 border-t px-3 pt-2 pb-5 sm:pb-6 no-print backdrop-blur-md shadow-2xl transition-colors duration-300"
        style={{
          backgroundColor: theme.sidebarBg ? `${theme.sidebarBg}f2` : `${theme.surfaceBgHex}f2`,
          borderTopColor: theme.borderHex,
        }}
      >
        <div className="max-w-md mx-auto flex items-center justify-between relative min-h-[48px]">
          {/* Dashboard */}
          <button
            onClick={() => handleTabClick('dashboard')}
            className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 cursor-pointer"
            style={{
              color: activeTab === 'dashboard' ? activeColor : '#94a3b8',
              fontWeight: activeTab === 'dashboard' ? 900 : 700,
            }}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-1">Sports</span>
          </button>

          {/* Standing */}
          <button
            onClick={() => handleTabClick('standings')}
            className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 cursor-pointer"
            style={{
              color: (activeTab === 'standings' || activeTab === 'top_teams') ? activeColor : '#94a3b8',
              fontWeight: (activeTab === 'standings' || activeTab === 'top_teams') ? 900 : 700,
            }}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] mt-1">Standing</span>
          </button>

          {/* Floating Action Button (Dynamic Bookmaker Accent Button) */}
          <div className="flex-1 flex items-center justify-center -mt-6">
            <button
              onClick={() => handleTabClick('select_match')}
              className="w-12 h-12 rounded-2xl shadow-lg border-2 flex items-center justify-center transition-all transform active:scale-90 cursor-pointer"
              style={{
                backgroundColor: activeColor,
                color: theme.isDark ? '#090d16' : '#ffffff',
                borderColor: theme.borderHex,
                boxShadow: `0 4px 16px -2px ${activeColor}55`,
              }}
              title="In-Play Matches & Bet Slip"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
          </div>

          {/* Compounding */}
          <button
            onClick={() => handleTabClick('compounding')}
            className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 cursor-pointer"
            style={{
              color: activeTab === 'compounding' ? activeColor : '#94a3b8',
              fontWeight: activeTab === 'compounding' ? 900 : 700,
            }}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] mt-1">Compound</span>
          </button>

          {/* More Menu */}
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 cursor-pointer"
            style={{
              color: isMoreMenuOpen || ['report', 'reports', 'settings', 'all_markets', 'overview', 'demo_match'].includes(activeTab)
                ? activeColor
                : '#94a3b8',
              fontWeight: isMoreMenuOpen || ['report', 'reports', 'settings', 'all_markets', 'overview', 'demo_match'].includes(activeTab)
                ? 900
                : 700,
            }}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-1">Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
};
