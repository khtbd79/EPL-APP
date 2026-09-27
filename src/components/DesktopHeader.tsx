import React from 'react';
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
} from 'lucide-react';

interface DesktopHeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  state: AppState;
  onOpenDownloadModal?: () => void;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  isHot?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Sports', icon: LayoutDashboard },
  { id: 'select_match', label: 'In-Play', icon: Trophy, isHot: true },
  { id: 'compounding', label: 'Compounding', icon: TrendingUp },
  { id: 'all_markets', label: 'All Markets', icon: TrendingUp },
  { id: 'standings', label: 'Standings', icon: Trophy },
  { id: 'team_data', label: 'Team Data', icon: Database },
  { id: 'demo_match', label: 'Comparison', icon: Target },
  { id: 'overview', label: 'Overview', icon: Layers },
  { id: 'report', label: 'Ledger', icon: FileText },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenDownloadModal,
}) => {
  return (
    <header className="hidden lg:block sticky top-0 z-40 w-full no-print shadow-md">
      {/* Primary Bet365 Green Header Bar */}
      <div className="w-full bg-[#126e51] border-b border-[#0c4936]">
        <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-13">
            {/* Zone 1: EPL 2026 Logo */}
            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex flex-col items-center justify-center cursor-pointer select-none group py-1"
              title="EPL 2026 Sports Home"
            >
              <span className="text-2xl font-black italic tracking-wider bg-gradient-to-r from-white via-[#fffde6] to-[#ffdf1b] bg-clip-text text-transparent epl-brand-glow">
                EPL 2026
              </span>
              {/* Elegant glowing accent line underneath */}
              <div className="w-full flex items-center justify-center -mt-0.5">
                <div className="w-full h-[2.5px] rounded-full bg-gradient-to-r from-transparent via-[#ffdf1b] to-transparent epl-glow-underline" />
              </div>
            </div>

            {/* Zone 2: Navigation Links with bet365 active underlines */}
            <nav className="overflow-x-auto no-scrollbar flex items-center gap-0.5 shrink py-1 px-2 h-full">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
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
                    onClick={() => setActiveTab(item.id)}
                    className={`h-11 px-3 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer shrink-0 relative ${
                      isActive
                        ? 'text-[#ffdf1b] bg-[#0c4936] font-black shadow-2xs'
                        : 'text-white hover:text-[#ffdf1b] hover:bg-[#15805e]'
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        isActive ? 'text-[#ffdf1b]' : 'text-emerald-200 group-hover:text-[#ffdf1b]'
                      }`}
                    />
                    <span>{item.label}</span>
                    {item.isHot && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ffdf1b] animate-pulse" />
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#ffdf1b] rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Sub-ribbon with dark forest green */}
      <div className="w-full bg-[#0c4936] border-b border-[#1b382e] py-1 px-4 sm:px-6">
        <div className="w-full max-w-[1850px] mx-auto flex items-center justify-between text-[11px] text-emerald-100 font-bold">
          <div className="flex items-center gap-3">
            <span className="text-[#ffdf1b] font-black uppercase tracking-wider">
              Premier League
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-300">
            <span>ODDS: DECIMAL</span>
            <span className="text-emerald-400 font-black bg-[#126e51] px-1.5 py-0.2 rounded text-[#ffdf1b]">
              LIVE
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
