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
import { getThemeConfig } from '../utils/theme';

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
  state,
}) => {
  const theme = getThemeConfig(state.settings.layoutTheme);

  return (
    <header className="hidden lg:block sticky top-0 z-40 w-full no-print shadow-md">
      {/* Primary Brand Header Bar */}
      <div 
        className="w-full border-b transition-colors duration-300"
        style={{
          backgroundColor: theme.primaryColor,
          borderBottomColor: theme.primaryDark,
        }}
      >
        <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-13">
            {/* Zone 1: EPL 2026 Logo */}
            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center justify-center cursor-pointer select-none group py-1"
              title="EPL 2026 Sports Home"
            >
              <span 
                className="text-2xl font-black italic tracking-wider select-none transition-colors duration-300"
                style={{ color: theme.secondarySwatchHex || '#ffffff' }}
              >
                EPL 2026
              </span>
            </div>

            {/* Zone 2: Navigation Links with active underlines */}
            <nav className="overflow-x-auto no-scrollbar flex items-center gap-1 shrink py-1 px-1 h-full">
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
                    className="px-2.5 py-1.5 rounded-md text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer shrink-0 hover:bg-black/10"
                    style={
                      isActive
                        ? {
                            backgroundColor: theme.primaryDark,
                            color: theme.secondarySwatchHex || '#ffdf1b',
                            fontWeight: 900,
                          }
                        : {
                            color: '#ffffff',
                          }
                    }
                  >
                    <Icon
                      className="w-3.5 h-3.5"
                      style={{
                        color: isActive ? (theme.secondarySwatchHex || '#ffdf1b') : 'rgba(255, 255, 255, 0.85)',
                      }}
                    />
                    <span>{item.label}</span>
                    {item.isHot && (
                      <span 
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ backgroundColor: theme.secondarySwatchHex || '#ffdf1b' }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Sub-ribbon with dark brand shade */}
      <div 
        className="w-full border-b py-1 px-4 sm:px-6 transition-colors duration-300"
        style={{
          backgroundColor: theme.primaryDark,
          borderBottomColor: theme.borderHex,
        }}
      >
        <div className="w-full max-w-[1850px] mx-auto flex items-center justify-between text-[11px] text-slate-200 font-bold">
          <div className="flex items-center gap-3">
            <span 
              className="font-black uppercase tracking-wider"
              style={{ color: theme.secondarySwatchHex || '#ffdf1b' }}
            >
              Premier League
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] text-slate-300">
            <span>ODDS: DECIMAL</span>
            <span 
              className="font-black px-1.5 py-0.5 rounded text-[9px] shadow-2xs"
              style={{ 
                backgroundColor: theme.primaryColor,
                color: theme.secondarySwatchHex || '#ffffff',
                border: `1px solid ${theme.borderHex}`
              }}
            >
              LIVE
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
