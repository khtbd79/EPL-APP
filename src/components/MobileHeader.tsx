import React from 'react';
import { ActiveTab, AppState } from '../types';
import { getThemeConfig } from '../utils/theme';
import { Menu } from 'lucide-react';

interface MobileHeaderProps {
  setActiveTab: (tab: ActiveTab) => void;
  state: AppState;
  onOpenSidebar?: () => void;
  onOpenDownloadModal?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  setActiveTab,
  state,
  onOpenSidebar,
}) => {
  const themeConfig = getThemeConfig(state.settings.layoutTheme);
  const headerBg = themeConfig.isDark ? '#0d1322' : themeConfig.primaryColor;
  const underlineBg = themeConfig.isDark ? '#38bdf8' : themeConfig.primaryDark;

  return (
    <header className="lg:hidden fixed top-0 inset-x-0 z-40 no-print shadow-md">
      <div 
        className="px-3.5 py-2.5 flex items-center justify-between transition-colors duration-300"
        style={{ backgroundColor: headerBg }}
      >
        {/* Left Section: Navigation Menu Button & Brand Title (EPL 2026) */}
        <div className="flex items-center space-x-3">
          {onOpenSidebar && (
            <button
              onClick={onOpenSidebar}
              className="p-1.5 text-white rounded-lg border border-white/20 active:scale-95 transition-all flex items-center justify-center cursor-pointer hover:bg-white/20"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
              title="Open Navigation"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          )}

          <div 
            className="flex items-center cursor-pointer select-none"
            onClick={() => setActiveTab('dashboard')}
          >
            <span
              id="mobile-epl-title"
              className="text-white font-black text-xl tracking-tight"
              style={{ color: '#ffffff' }}
            >
              EPL 2026
            </span>
          </div>
        </div>

        {/* Right Section: Empty / Clean */}
        <div className="flex items-center space-x-2" />
      </div>

      {/* Long Underline Beneath Top Navbar */}
      <div 
        className="w-full h-1 shadow-xs transition-colors duration-300" 
        style={{ backgroundColor: underlineBg }}
      />
    </header>
  );
};

