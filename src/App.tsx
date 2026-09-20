import React, { useState, useEffect, useRef } from 'react';
import { ActiveTab, AppState, AppSettings, AppLayoutTheme, MatchRecord, EPLMatchEvent, MarketRecordEntry, MatchweekCategoryRanking } from './types';
import { loadState, saveState, clearAllData, getStoredDraft, setStoredDraft, normalizeLoadedState } from './utils/storage';
import { loadStateFromIndexedDB } from './utils/indexedDbStorage';
import { getThemeConfig } from './utils/theme';
import { Sidebar } from './components/Sidebar';
import { MobileHeader } from './components/MobileHeader';
import { DesktopHeader } from './components/DesktopHeader';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { DailyTaskView } from './components/DailyTaskView';
import { MatchHistoryView } from './components/MatchHistoryView';
import { CompoundingView } from './components/CompoundingView';
import { SummaryReportsView } from './components/SummaryReportsView';
import { SettingsView } from './components/SettingsView';
import { BackupRestoreView } from './components/BackupRestoreView';
import { EPLMatchCenterView } from './components/EPLMatchCenterView';
import { SavedDataLedgerView } from './components/SavedDataLedgerView';
import { MarketRecordView } from './components/MarketRecordView';
import { MatchSelectView } from './components/MatchSelectView';
import { DownloadAppModal } from './components/DownloadAppModal';
import { TopTeamsAnalyzerView } from './components/TopTeamsAnalyzerView';
import { MarketTrendsView } from './components/MarketTrendsView';
import { StandingsView } from './components/StandingsView';
import { TeamDataView } from './components/TeamDataView';
import { AllMarketsView } from './components/AllMarketsView';
import { ReportView } from './components/ReportView';

const VALID_TABS: ActiveTab[] = [
  'dashboard',
  'standings',
  'team_data',
  'all_markets',
  'demo_match',
  'select_match',
  'report',
  'settings',
  'top_teams',
  'market_trends',
  'match_select',
  'daily_task',
  'saved_ledger',
  'history',
  'reports',
  'backup',
  'compounding',
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const saved = getStoredDraft<string>('btts_active_tab', 'dashboard');
    return VALID_TABS.includes(saved as ActiveTab) ? (saved as ActiveTab) : 'dashboard';
  });
  const [state, setState] = useState<AppState>(() => loadState());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const stateRef = useRef(state);
  stateRef.current = state;

  const activeTheme = getThemeConfig(state.settings.layoutTheme);

  // Save state to LocalStorage whenever state updates
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Persist activeTab to LocalStorage whenever it changes
  useEffect(() => {
    setStoredDraft('btts_active_tab', activeTab);
  }, [activeTab]);

  // Ensure state is flushed to LocalStorage on beforeunload, pagehide, and visibilitychange
  useEffect(() => {
    const handleFlushState = () => {
      if (stateRef.current) {
        saveState(stateRef.current);
      }
    };

    window.addEventListener('beforeunload', handleFlushState);
    window.addEventListener('pagehide', handleFlushState);
    document.addEventListener('visibilitychange', handleFlushState);

    // Multi-tab sync: if data changes in another tab, reload state
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'btts_app_state_v2' && e.newValue) {
        try {
          const updated = loadState();
          setState(updated);
        } catch (_) {}
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    // Initial mount check: in WebView environments where localStorage is volatile,
    // verify if IndexedDB holds an imported/persisted user state
    loadStateFromIndexedDB().then((idbState) => {
      if (idbState) {
        const normalized = normalizeLoadedState(idbState);
        setState((current) => {
          // If current state is empty (e.g. 0 matches) but IndexedDB has data, restore from IndexedDB
          const currentCount = (current.matchHistory?.length || 0) + (current.eplMatches?.length || 0) + (current.marketRecords?.length || 0);
          const idbCount = (normalized.matchHistory?.length || 0) + (normalized.eplMatches?.length || 0) + (normalized.marketRecords?.length || 0);
          if (idbCount > currentCount || (idbCount > 0 && currentCount === 0)) {
            return normalized;
          }
          return current;
        });
      }
    }).catch(() => {});

    return () => {
      window.removeEventListener('beforeunload', handleFlushState);
      window.removeEventListener('pagehide', handleFlushState);
      document.removeEventListener('visibilitychange', handleFlushState);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  // Always scroll to top when changing active tab
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab]);

  // Sync theme CSS custom properties
  useEffect(() => {
    if (activeTheme) {
      document.documentElement.style.setProperty('--card-bg', activeTheme.cardBgStyle);
      document.documentElement.style.setProperty('--card-border', activeTheme.cardBorderStyle);
    }
  }, [activeTheme]);

  // Handlers for Betting Tasks
  const handleRecordMatch = (match: MatchRecord) => {
    const stake = Number(match.stake) || 0;
    const odds = Number(match.odds) || 1;
    const profit = match.result === 'WIN'
      ? (match.profit > 0 ? match.profit : (odds > 1 && stake > 0 ? Number((stake * (odds - 1)).toFixed(2)) : 0))
      : 0;
    const loss = match.result === 'LOSS'
      ? (match.loss > 0 ? match.loss : stake)
      : 0;
    const netPnL = match.result === 'WIN' ? profit : (match.result === 'LOSS' ? -loss : 0);

    const enrichedMatch: MatchRecord = {
      ...match,
      stake,
      odds,
      profit,
      loss,
      netPnL,
    };

    setState((prev) => ({
      ...prev,
      matchHistory: [enrichedMatch, ...prev.matchHistory],
      currentDay: match.result === 'PENDING' ? prev.currentDay : prev.currentDay + 1,
    }));
  };

  const handleUpdateMatchStatus = (id: string, result: 'WIN' | 'LOSS' | 'VOID') => {
    setState((prev) => {
      const targetMatch = prev.matchHistory.find((m) => m.id === id);
      if (!targetMatch) return prev;

      const wasPending = targetMatch.result === 'PENDING';
      const stake = Number(targetMatch.stake) || 0;
      const odds = Number(targetMatch.odds) || 1;

      const profit = result === 'WIN'
        ? (targetMatch.profit > 0 ? targetMatch.profit : (odds > 1 && stake > 0 ? Number((stake * (odds - 1)).toFixed(2)) : 0))
        : 0;
      const loss = result === 'LOSS'
        ? (targetMatch.loss > 0 ? targetMatch.loss : stake)
        : 0;
      const netPnL = result === 'WIN' ? profit : (result === 'LOSS' ? -loss : 0);

      const updatedHistory = prev.matchHistory.map((m) =>
        m.id === id ? { ...m, result, profit, loss, netPnL } : m
      );

      const shouldAdvanceDay = wasPending && (result === 'WIN' || result === 'LOSS');

      return {
        ...prev,
        matchHistory: updatedHistory,
        currentDay: shouldAdvanceDay ? prev.currentDay + 1 : prev.currentDay,
      };
    });
  };

  const handleDeleteMatch = (id: string) => {
    setState((prev) => ({
      ...prev,
      matchHistory: prev.matchHistory.filter((m) => m.id !== id),
    }));
  };

  // Handlers for EPL 20 Teams & Matchweek Match Center
  const handleAddEplMatch = (match: EPLMatchEvent) => {
    handleSaveEplMatch(match);
  };

  const handleSaveEplMatch = (match: EPLMatchEvent) => {
    setState((prev) => {
      const matches = prev.eplMatches || [];
      const index = matches.findIndex(
        (m) =>
          m.id === match.id ||
          (m.matchweek === match.matchweek &&
            m.homeTeam.trim().toLowerCase() === match.homeTeam.trim().toLowerCase() &&
            m.awayTeam.trim().toLowerCase() === match.awayTeam.trim().toLowerCase())
      );

      const updatedMatches =
        index >= 0
          ? matches.map((m, i) => (i === index ? { ...m, ...match } : m))
          : [match, ...matches];

      return {
        ...prev,
        eplMatches: updatedMatches,
        currentMatchweek: match.matchweek || prev.currentMatchweek || 1,
      };
    });
  };

  const handleUpdateEplMatch = (updatedMatch: EPLMatchEvent) => {
    handleSaveEplMatch(updatedMatch);
  };

  const handleDeleteEplMatch = (id: string) => {
    setState((prev) => {
      const matches = prev.eplMatches || [];
      return {
        ...prev,
        eplMatches: matches.filter((m) => m.id !== id),
      };
    });
  };

  const handleSetMatchweek = (matchweek: number) => {
    setState((prev) => ({
      ...prev,
      currentMatchweek: matchweek,
      settings: {
        ...prev.settings,
        activeMatchweek: matchweek,
      },
    }));
  };

  // Market Record Handlers (Multi-Market Demo)
  const handleAddMarketRecord = (entry: MarketRecordEntry) => {
    setState((prev) => ({
      ...prev,
      marketRecords: [entry, ...(prev.marketRecords || [])],
    }));
  };

  const handleUpdateMarketRecordResult = (id: string, result: 'PENDING' | 'WIN' | 'LOSS' | 'VOID') => {
    setState((prev) => {
      const records = prev.marketRecords || [];
      return {
        ...prev,
        marketRecords: records.map((r) => (r.id === id ? { ...r, result } : r)),
      };
    });
  };

  const handleDeleteMarketRecord = (id: string) => {
    setState((prev) => {
      const records = prev.marketRecords || [];
      return {
        ...prev,
        marketRecords: records.filter((r) => r.id !== id),
      };
    });
  };

  const handleSaveCategoryRanking = (ranking: MatchweekCategoryRanking) => {
    setState((prev) => ({
      ...prev,
      categoryRankings: {
        ...(prev.categoryRankings || {}),
        [ranking.matchweek]: ranking,
      },
    }));
  };

  const handleUpdateSettings = (settings: AppSettings) => {
    setState((prev) => ({
      ...prev,
      settings,
    }));
  };

  const handleUpdateTheme = (newTheme: AppLayoutTheme) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        layoutTheme: newTheme,
      },
    }));
  };

  const handleResetCycle = () => {
    setState((prev) => ({
      ...prev,
      currentDay: 1,
      matchHistory: [],
    }));
  };

  const handleClearAll = () => {
    clearAllData();
    setState(loadState());
    setActiveTab('dashboard');
  };

  const handleRestoreState = (newState: AppState) => {
    saveState(newState);
    setState(newState);
  };

  return (
    <div className={`min-h-screen ${activeTheme.bgClass} ${activeTheme.textClass} flex flex-col font-sans transition-colors duration-300 w-full overflow-x-hidden relative`}>
      {/* Mobile Drawer (Hidden on PC) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        state={state}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        {/* Mobile Header Bar */}
        <MobileHeader
          setActiveTab={setActiveTab}
          state={state}
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        />

        {/* Desktop Topbar Header (PC / Desktop only) */}
        <DesktopHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          state={state}
          onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        />

        {/* Main View Content */}
        <main className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-16 sm:pt-16 lg:pt-6 pb-32 sm:pb-36 lg:pb-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              state={state}
              setActiveTab={setActiveTab}
              onRecordMatch={handleRecordMatch}
            />
          )}

          {(activeTab === 'standings' || activeTab === 'top_teams') && (
            <StandingsView
              state={state}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'team_data' && (
            <TeamDataView
              state={state}
              onSaveEplMatch={handleSaveEplMatch}
              onDeleteEplMatch={handleDeleteEplMatch}
              onNavigateTab={setActiveTab}
            />
          )}

          {(activeTab === 'all_markets' || activeTab === 'market_trends') && (
            <AllMarketsView
              state={state}
              onNavigateTab={setActiveTab}
            />
          )}

          {(activeTab === 'demo_match' || activeTab === 'match_select') && (
            <MatchSelectView
              state={state}
              onNavigateTab={setActiveTab}
              onAddMarketRecord={handleAddMarketRecord}
              onRecordMatch={handleRecordMatch}
            />
          )}

          {(activeTab === 'select_match' || activeTab === 'daily_task') && (
            <DailyTaskView
              state={state}
              onRecordMatch={handleRecordMatch}
              onUpdateMatchStatus={handleUpdateMatchStatus}
            />
          )}

          {(activeTab === 'report' || activeTab === 'reports' || activeTab === 'history' || activeTab === 'saved_ledger') && (
            <ReportView
              state={state}
              onDeleteMatch={handleDeleteMatch}
              onUpdateMatchStatus={handleUpdateMatchStatus}
              onNavigateTab={setActiveTab}
              initialSubTab={activeTab === 'history' ? 'history' : activeTab === 'saved_ledger' ? 'ledger' : 'analytics'}
            />
          )}

          {activeTab === 'compounding' && (
            <CompoundingView state={state} setActiveTab={setActiveTab} />
          )}

          {(activeTab === 'settings' || activeTab === 'backup') && (
            <SettingsView
              state={state}
              onUpdateSettings={handleUpdateSettings}
              onResetCycle={handleResetCycle}
              onClearAll={handleClearAll}
              onRestoreState={handleRestoreState}
            />
          )}
        </main>
      </div>

      {/* Mobile Floating Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} state={state} />

      {/* Download & Install PWA / Standalone App Modal */}
      <DownloadAppModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        state={state}
      />
    </div>
  );
}
