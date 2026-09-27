import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ActiveTab, AppState } from '../types';
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

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

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
    { id: 'compounding' as ActiveTab, label: 'Compounding', icon: <TrendingUp className="w-5 h-5 text-[#ffdf1b]" /> },
    { id: 'standings' as ActiveTab, label: 'Standing', icon: <Trophy className="w-5 h-5 text-emerald-400" /> },
    { id: 'team_data' as ActiveTab, label: 'Team Data', icon: <Database className="w-5 h-5 text-sky-400" /> },
    { id: 'all_markets' as ActiveTab, label: 'All Markets', icon: <TrendingUp className="w-5 h-5 text-teal-400" /> },
    { id: 'demo_match' as ActiveTab, label: 'Match Comparison', icon: <Target className="w-5 h-5 text-indigo-400" /> },
    { id: 'select_match' as ActiveTab, label: 'In-Play Matches', icon: <Trophy className="w-5 h-5 text-rose-400" /> },
    { id: 'overview' as ActiveTab, label: 'Overview', icon: <Layers className="w-5 h-5 text-blue-400" /> },
    { id: 'report' as ActiveTab, label: 'Ledger', icon: <FileText className="w-5 h-5 text-purple-400" /> },
    { id: 'settings' as ActiveTab, label: 'Settings & Themes', icon: <SettingsIcon className="w-5 h-5 text-slate-400" /> },
  ];

  return (
    <>
      {/* Expanded Menu Modal */}
      {isMoreMenuOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="lg:hidden fixed inset-0 z-[99999] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-[#22252c] border border-[#383d47] p-5 rounded-3xl space-y-4 shadow-2xl relative animate-scaleUp my-auto text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#313640] pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black text-white italic tracking-tighter">
                  EPL 2026
                </span>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1.5">Sports Menu</h3>
              </div>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#2c3038] transition-colors cursor-pointer"
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
                        ? 'bg-[#126e51] text-[#ffdf1b] border-[#15805e] shadow-xs font-black'
                        : 'bg-[#1b1d22] hover:bg-[#282b32] border-[#2c3038] text-slate-200'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-[#282b32] border border-[#383d47] shadow-2xs">
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

      {/* Main Bottom Dock (bet365 Sportsbook Dock) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 w-full z-40 border-t border-[#292c34] px-3 pt-2 pb-5 sm:pb-6 no-print bg-[#181a1f]/95 backdrop-blur-md shadow-2xl transition-colors duration-300">
        <div className="max-w-md mx-auto flex items-center justify-between relative min-h-[48px]">
          {/* Dashboard */}
          <button
            onClick={() => handleTabClick('dashboard')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-[#ffdf1b] font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">Sports</span>
          </button>

          {/* Standing */}
          <button
            onClick={() => handleTabClick('standings')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 cursor-pointer ${
              activeTab === 'standings' || activeTab === 'top_teams'
                ? 'text-[#ffdf1b] font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">Standing</span>
          </button>

          {/* Floating Action Button (bet365 In-Play / Bet Slip Action) */}
          <div className="flex-1 flex items-center justify-center -mt-6">
            <button
              onClick={() => handleTabClick('select_match')}
              className={`w-12 h-12 rounded-2xl bg-[#ffdf1b] hover:bg-[#ffe543] text-slate-950 shadow-lg shadow-black/40 border-2 border-[#181a1f] flex items-center justify-center transition-all transform active:scale-90 cursor-pointer ${
                activeTab === 'select_match' || activeTab === 'daily_task' ? 'scale-105 ring-2 ring-[#ffdf1b]' : 'hover:scale-105'
              }`}
              title="In-Play Matches & Bet Slip"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
          </div>

          {/* Compounding */}
          <button
            onClick={() => handleTabClick('compounding')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 cursor-pointer ${
              activeTab === 'compounding'
                ? 'text-[#ffdf1b] font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">Compound</span>
          </button>

          {/* More Menu */}
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 cursor-pointer ${
              isMoreMenuOpen || ['report', 'reports', 'settings', 'all_markets', 'overview', 'demo_match'].includes(activeTab)
                ? 'text-[#ffdf1b] font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
};
