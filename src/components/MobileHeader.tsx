import React from 'react';
import { ActiveTab, AppState } from '../types';
import { Menu } from 'lucide-react';
import { getThemeConfig } from '../utils/theme';

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
  const theme = getThemeConfig(state.settings.layoutTheme);

  return (
    <header 
      className="lg:hidden fixed top-0 inset-x-0 z-40 no-print border-b shadow-md transition-colors duration-300"
      style={{
        backgroundColor: theme.primaryColor,
        borderBottomColor: theme.primaryDark,
      }}
    >
      <div className="px-3 py-2.5 flex items-center justify-between">
        {/* Left: Nav Drawer Button & EPL 2026 Logo */}
        <div className="flex items-center gap-3">
          {onOpenSidebar && (
            <button
              onClick={onOpenSidebar}
              className="p-1.5 text-white hover:text-white/80 rounded-lg active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-2xs border"
              style={{
                backgroundColor: theme.primaryDark,
                borderColor: theme.borderHex,
              }}
              title="Open Navigation"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          )}

          <div
            className="inline-flex flex-col items-stretch justify-center cursor-pointer select-none group py-0.5 leading-none shrink-0"
            onClick={() => setActiveTab('dashboard')}
            title="EPL 2026"
          >
            <span 
              className="text-xl font-black tracking-wider select-none transition-colors duration-300 leading-none whitespace-nowrap"
              style={{ color: theme.secondarySwatchHex || '#ffffff' }}
            >
              EPL 2026
            </span>
            <div className="w-full flex justify-between items-center text-[7.5px] font-black uppercase text-white select-none leading-none mt-0.5 opacity-95 tracking-normal">
              <span>P</span><span>R</span><span>E</span><span>M</span><span>I</span><span>E</span><span>R</span>
              <span className="w-1" />
              <span>L</span><span>E</span><span>A</span><span>G</span><span>U</span><span>E</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
