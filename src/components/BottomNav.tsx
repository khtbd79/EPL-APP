import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ActiveTab, AppState } from '../types';
import { getThemeConfig } from '../utils/theme';
import {
  LayoutDashboard,
  Calculator,
  History,
  Wallet,
  Settings as SettingsIcon,
  Plus,
  BarChart3,
  HardDriveDownload,
  X,
  Menu,
  FileText,
  Layers,
  Trophy,
  Target,
  TrendingUp,
  Database
} from 'lucide-react';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  state: AppState;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, state }) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const themeConfig = getThemeConfig(state.settings.layoutTheme);

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
    { id: 'standings' as ActiveTab, label: 'Standing', icon: <Trophy className="w-5 h-5" />, color: 'amber' },
    { id: 'team_data' as ActiveTab, label: 'Team Data', icon: <Database className="w-5 h-5" />, color: 'red' },
    { id: 'all_markets' as ActiveTab, label: 'All Markets', icon: <TrendingUp className="w-5 h-5" />, color: 'emerald' },
    { id: 'demo_match' as ActiveTab, label: 'Match Comparison', icon: <Target className="w-5 h-5" />, color: 'emerald' },
    { id: 'select_match' as ActiveTab, label: 'Select Match', icon: <Trophy className="w-5 h-5" />, color: 'red' },
    { id: 'report' as ActiveTab, label: 'Report & Records', icon: <FileText className="w-5 h-5" />, color: 'cyan' },
    { id: 'settings' as ActiveTab, label: 'Settings & Backup', icon: <SettingsIcon className="w-5 h-5" />, color: 'purple' },
  ];

  return (
    <>
      {/* Expanded "More Menu" Modal for mobile & tablet */}
      {isMoreMenuOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="lg:hidden fixed inset-0 z-[99999] bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div 
            className="w-full max-w-sm bg-white border border-red-200 p-5 rounded-3xl space-y-4 shadow-2xl relative animate-scaleUp my-auto text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-red-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-200">
                  <Menu className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Navigation Menu</h3>
              </div>
              <button 
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
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
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-red-50 border-red-300 text-red-700 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                    }`}
                  >
                    <div className="p-2 bg-white text-red-600 rounded-xl border border-red-100 shadow-xs">
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

      {/* Main Bottom Navigation Bar */}
      <nav 
        className="lg:hidden fixed bottom-0 inset-x-0 w-full z-40 bg-white border-t border-red-200 px-3 pt-2.5 pb-5 sm:pb-6 no-print shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      >
        <div className="max-w-md mx-auto flex items-center justify-between relative min-h-[48px]">
          
          {/* Left 1: Dashboard */}
          <button
            onClick={() => handleTabClick('dashboard')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all active:scale-95 cursor-pointer ${
              activeTab === 'dashboard' ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-1">Dashboard</span>
          </button>

          {/* Left 2: Standing */}
          <button
            onClick={() => handleTabClick('standings')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all active:scale-95 cursor-pointer ${
              activeTab === 'standings' || activeTab === 'top_teams' ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-1">Standing</span>
          </button>

          {/* CENTER: Floating Action Button (Select Match) */}
          <div className="flex-1 flex items-center justify-center -mt-7">
            <button
              onClick={() => handleTabClick('select_match')}
              className={`w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 border-2 border-white flex items-center justify-center transition-all transform active:scale-90 cursor-pointer ${
                activeTab === 'select_match' || activeTab === 'daily_task' ? 'ring-2 ring-red-400 scale-105 shadow-red-600/50' : 'hover:scale-105'
              }`}
              title="Select Match"
            >
              <Plus className="w-6 h-6 font-black stroke-[3]" />
            </button>
          </div>

          {/* Right 1: Match Comparison */}
          <button
            onClick={() => handleTabClick('demo_match')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all active:scale-95 cursor-pointer ${
              activeTab === 'demo_match' || activeTab === 'match_select' ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Target className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-1">Comparison</span>
          </button>

          {/* Right 2: More */}
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all active:scale-95 cursor-pointer ${
              isMoreMenuOpen || ['report', 'reports', 'settings', 'all_markets'].includes(activeTab)
                ? 'text-red-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-1">Menu</span>
          </button>

        </div>
      </nav>
    </>
  );
};
