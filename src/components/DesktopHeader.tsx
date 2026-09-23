import React from 'react';
import { ActiveTab, AppState } from '../types';
import { getThemeConfig } from '../utils/theme';
import {
  LayoutDashboard,
  Trophy,
  Database,
  TrendingUp,
  Target,
  FileText,
  Settings as SettingsIcon,
  Wallet,
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
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'standings', label: 'Standing', icon: Trophy },
  { id: 'team_data', label: 'Team Data', icon: Database },
  { id: 'all_markets', label: 'All Markets', icon: TrendingUp },
  { id: 'demo_match', label: 'Match Comparison', icon: Target },
  { id: 'select_match', label: 'Select Match', icon: Trophy },
  { id: 'money_management', label: 'Money Management', icon: Wallet },
  { id: 'report', label: 'Report', icon: FileText },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

/**
 * Top Navbar component for PC / Desktop.
 * Dynamically themed horizontal top navbar with EPL 2026 brand
 * and all navigation options cleanly laid out.
 */
export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  activeTab,
  setActiveTab,
  state,
}) => {
  const themeConfig = getThemeConfig(state.settings.layoutTheme);
  const headerBg = themeConfig.isDark ? '#0d1322' : themeConfig.primaryColor;
  const underlineBg = themeConfig.isDark ? '#38bdf8' : themeConfig.primaryDark;

  return (
    <header className="hidden lg:block sticky top-0 z-40 w-full no-print shadow-md">
      {/* Top Navbar - Single unified horizontal bar */}
      <div 
        className="w-full px-4 sm:px-6 transition-colors duration-300"
        style={{ backgroundColor: headerBg }}
      >
        <div className="w-full max-w-[1850px] mx-auto flex items-center justify-between h-16">
          {/* Brand Title (EPL 2026) - Left aligned, pure white text */}
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
                (item.id === 'money_management' && (activeTab === 'money_management' || activeTab === 'bankroll')) ||
                (item.id === 'report' && (activeTab === 'reports' || activeTab === 'history' || activeTab === 'saved_ledger')) ||
                (item.id === 'settings' && activeTab === 'backup');

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'shadow-md font-black'
                      : 'text-white hover:bg-white/15 text-white/95'
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: themeConfig.isDark ? '#38bdf8' : '#ffffff',
                          color: themeConfig.isDark ? '#090d16' : themeConfig.primaryColor,
                        }
                      : undefined
                  }
                >
                  <Icon
                    className="w-3.5 h-3.5"
                    style={
                      isActive
                        ? { color: themeConfig.isDark ? '#090d16' : themeConfig.primaryColor }
                        : { color: '#ffffff' }
                    }
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Prominent Long Underline Directly Beneath Top Navbar */}
      <div 
        className="w-full h-1 shadow-xs transition-colors duration-300" 
        style={{ backgroundColor: underlineBg }} 
      />
    </header>
  );
};


