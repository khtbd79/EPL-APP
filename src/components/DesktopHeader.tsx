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
  Calculator,
  History,
  BarChart3,
  Settings as SettingsIcon,
  HardDriveDownload,
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
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'standings', label: 'Standing', icon: Trophy },
  { id: 'team_data', label: 'Team Data', icon: Database },
  { id: 'all_markets', label: 'All Markets', icon: TrendingUp },
  { id: 'demo_match', label: 'Match Comparison', icon: Target },
  { id: 'select_match', label: 'Select Match', icon: Trophy },
  { id: 'report', label: 'Report', icon: FileText },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

/**
 * Top Navbar component for PC / Desktop.
 * Red navbar with large EPL 2026 brand, no extra badges or clutter,
 * and all sidebar navigation options cleanly laid out.
 */
export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="hidden lg:block sticky top-0 z-40 w-full no-print shadow-md">
      {/* Red Top Navbar - Single unified horizontal bar */}
      <div className="w-full bg-red-600 px-4 sm:px-6">
        <div className="w-full max-w-[1850px] mx-auto flex items-center justify-between h-16">
          {/* Brand Title (EPL 2026) - Left aligned in original position, pure white text */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center cursor-pointer select-none shrink-0 pr-4"
            title="Go to Dashboard"
          >
            <span
              id="epl-brand-title"
              className="text-2xl xl:text-3xl font-black text-white tracking-tight leading-none drop-shadow-sm select-none"
              style={{ color: '#ffffff' }}
            >
              EPL 2026
            </span>
          </div>

          {/* All Navigation Options - Aligned horizontally in same row */}
          <div className="overflow-x-auto no-scrollbar flex items-center space-x-1 shrink py-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
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
                  onClick={() => setActiveTab(item.id)}
                  className={`px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-white text-red-600 shadow-md font-black'
                      : 'text-white hover:bg-red-700/80 text-white/95'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-600' : 'text-white'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Prominent Long Underline Directly Beneath Red Top Navbar */}
      <div className="w-full h-1 bg-red-800 shadow-xs" />
    </header>
  );
};


