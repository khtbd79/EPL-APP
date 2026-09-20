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
  onOpenSidebar,
}) => {
  return (
    <header className="lg:hidden fixed top-0 inset-x-0 z-40 no-print shadow-md">
      <div className="bg-red-600 px-3.5 py-2.5 flex items-center justify-between">
        {/* Left Section: Navigation Menu Button & Brand Title (EPL 2026) */}
        <div className="flex items-center space-x-3">
          {onOpenSidebar && (
            <button
              onClick={onOpenSidebar}
              className="p-1.5 bg-red-700/80 hover:bg-red-800 text-white rounded-lg border border-white/20 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
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
      <div className="w-full h-1 bg-red-800 shadow-xs" />
    </header>
  );
};

