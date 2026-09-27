import React from 'react';
import { ActiveTab, AppState } from '../types';
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
    <header className="lg:hidden fixed top-0 inset-x-0 z-40 no-print bg-[#126e51] border-b border-[#0c4936] shadow-md transition-colors duration-300">
      <div className="px-3 py-2.5 flex items-center justify-between">
        {/* Left: Nav Drawer Button & EPL 2026 Logo */}
        <div className="flex items-center gap-3">
          {onOpenSidebar && (
            <button
              onClick={onOpenSidebar}
              className="p-1.5 text-white hover:text-emerald-100 rounded-lg bg-[#0c4936]/60 border border-[#165b45] active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          )}

          <div
            className="flex flex-col items-center justify-center cursor-pointer select-none group py-0.5"
            onClick={() => setActiveTab('dashboard')}
            title="EPL 2026"
          >
            <span className="text-xl font-black italic tracking-wider bg-gradient-to-r from-white via-[#fffde6] to-[#ffdf1b] bg-clip-text text-transparent epl-brand-glow">
              EPL 2026
            </span>
            {/* Elegant glowing accent line underneath */}
            <div className="w-full flex items-center justify-center -mt-0.5">
              <div className="w-full h-[2.5px] rounded-full bg-gradient-to-r from-transparent via-[#ffdf1b] to-transparent epl-glow-underline" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
