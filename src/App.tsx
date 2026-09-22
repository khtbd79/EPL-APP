import React, { useState, useEffect, useRef } from 'react';
import { ActiveTab, AppState, AppSettings, AppLayoutTheme, MatchRecord, EPLMatchEvent, MarketRecordEntry, MatchweekCategoryRanking } from './types';
import { loadState, saveState, clearAllData, getStoredDraft, setStoredDraft, normalizeLoadedState, hasSavedStateData } from './utils/storage';
import { normalizeTeamName, sanitizeAndDeduplicateMatches } from './utils/teamData';
import { loadStateFromIndexedDB, saveStateToIndexedDB } from './utils/indexedDbStorage';
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

  // Synchronous updater that ensures state and storage are ALWAYS in sync immediately
  const updateAndSaveState = (updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      const saved = saveState(next);
      stateRef.current = saved;
      return saved;
    });
  };

  // Keep LocalStorage and backup mirrors strictly updated whenever state changes
  useEffect(() => {
    if (state) {
      saveState(state);
      stateRef.current = state;
    }
  }, [state]);

  // Persist activeTab to LocalStorage whenever it changes
  useEffect(() => {
    setStoredDraft('btts_active_tab', activeTab);
  }, [activeTab]);

  // Ensure state is flushed to LocalStorage on beforeunload, pagehide, visibilitychange, and freeze
  useEffect(() => {
    const handleFlushState = () => {
      if (stateRef.current) {
        saveState(stateRef.current);
      }
    };

    window.addEventListener('beforeunload', handleFlushState);
    window.addEventListener('pagehide', handleFlushState);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleFlushState();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('freeze', handleFlushState);

    // Multi-tab sync: if data changes in another tab, reload state
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'btts_app_state_v2' && e.newValue) {
        try {
          const updated = loadState();
          setState(updated);
          stateRef.current = updated;
        } catch (_) {}
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    // Initial mount check: in WebView environments where localStorage is volatile,
    // verify if IndexedDB holds an imported/persisted user state and reconcile
    loadStateFromIndexedDB().then((idbState) => {
      if (idbState) {
        const normalized = normalizeLoadedState(idbState);
        const idbHasData = hasSavedStateData(normalized);

        if (idbHasData) {
          setState((current) => {
            const currentHasData = hasSavedStateData(current);

            // If current (LocalStorage) has no user data, but IndexedDB has data:
            // Restore from IndexedDB (e.g. mobile app restart where localStorage was purged)
            if (!currentHasData) {
              const preservedTheme = (typeof window !== 'undefined' ? (localStorage.getItem('btts_layout_theme') as AppLayoutTheme) : null) || normalized.settings?.layoutTheme || 'white_red';
              const restored: AppState = {
                ...normalized,
                settings: {
                  ...normalized.settings,
                  layoutTheme: preservedTheme,
                },
              };
              saveState(restored);
              stateRef.current = restored;
              return restored;
            }

            // If both have data: compare lastSavedAt timestamps
            const idbTime = normalized.lastSavedAt || 0;
            const currentTime = current.lastSavedAt || 0;

            if (idbTime > currentTime) {
              const preservedTheme = current.settings?.layoutTheme || (typeof window !== 'undefined' ? (localStorage.getItem('btts_layout_theme') as AppLayoutTheme) : null) || normalized.settings?.layoutTheme || 'white_red';
              const restored: AppState = {
                ...normalized,
                settings: {
                  ...normalized.settings,
                  layoutTheme: preservedTheme,
                },
              };
              saveState(restored);
              stateRef.current = restored;
              return restored;
            } else {
              // Current state is newer or equal; ensure IndexedDB gets the latest copy
              saveStateToIndexedDB(current).catch(() => {});
              return current;
            }
          });
        }
      }
    }).catch(() => {});

    return () => {
      window.removeEventListener('beforeunload', handleFlushState);
      window.removeEventListener('pagehide', handleFlushState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('freeze', handleFlushState);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  // Always scroll to top when changing active tab
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab]);

  // Sync theme CSS custom properties & dark mode class
  useEffect(() => {
    if (activeTheme) {
      document.documentElement.setAttribute('data-theme', activeTheme.id);
      document.documentElement.classList.toggle('dark', !!activeTheme.isDark);
      document.documentElement.style.setProperty('--theme-primary', activeTheme.primaryColor);
      document.documentElement.style.setProperty('--theme-primary-hover', activeTheme.primaryHover);
      document.documentElement.style.setProperty('--theme-primary-dark', activeTheme.primaryDark);
      document.documentElement.style.setProperty('--theme-primary-light', activeTheme.primaryLight);
      document.documentElement.style.setProperty('--theme-border', activeTheme.borderHex);
      document.documentElement.style.setProperty('--card-bg', activeTheme.cardBgHex);
      document.documentElement.style.setProperty('--card-border', activeTheme.borderHex);
      document.documentElement.style.setProperty('--card-text', activeTheme.isDark ? '#f1f5f9' : '#0f172a');
      document.documentElement.style.setProperty('--surface-bg', activeTheme.surfaceBgHex);
      document.documentElement.style.setProperty('--surface-text', activeTheme.isDark ? '#f1f5f9' : '#0f172a');
      document.body.style.backgroundColor = activeTheme.surfaceBgHex;
      document.documentElement.style.backgroundColor = activeTheme.surfaceBgHex;
    }
  }, [activeTheme]);

  // Handlers for Match Record Tasks
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

    updateAndSaveState((prev) => ({
      ...prev,
      matchHistory: [enrichedMatch, ...prev.matchHistory],
      currentDay: match.result === 'PENDING' ? prev.currentDay : prev.currentDay + 1,
    }));
  };

  const handleUpdateMatchStatus = (id: string, result: 'WIN' | 'LOSS' | 'VOID') => {
    updateAndSaveState((prev) => {
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
    updateAndSaveState((prev) => ({
      ...prev,
      matchHistory: prev.matchHistory.filter((m) => m.id !== id),
    }));
  };

  const handleUpdateMatchRecord = (updatedMatch: MatchRecord) => {
    updateAndSaveState((prev) => ({
      ...prev,
      matchHistory: prev.matchHistory.map((m) =>
        m.id === updatedMatch.id ? updatedMatch : m
      ),
    }));
  };

  const handleClearPendingMatches = () => {
    updateAndSaveState((prev) => ({
      ...prev,
      matchHistory: prev.matchHistory.filter((m) => m.result !== 'PENDING'),
    }));
  };

  // Handlers for EPL 20 Teams & Matchweek Match Center
  const handleAddEplMatch = (match: EPLMatchEvent) => {
    handleSaveEplMatch(match);
  };

  const handleSaveEplMatch = (match: EPLMatchEvent) => {
    updateAndSaveState((prev) => {
      const normalizedMatch: EPLMatchEvent = {
        ...match,
        homeTeam: normalizeTeamName(match.homeTeam),
        awayTeam: normalizeTeamName(match.awayTeam),
        createdAt: match.createdAt || new Date().toISOString(),
      };
      const matches = prev.eplMatches || [];
      const updatedMatches = sanitizeAndDeduplicateMatches([
        normalizedMatch,
        ...matches.filter((m) => m.id !== normalizedMatch.id),
      ]);

      return {
        ...prev,
        eplMatches: updatedMatches,
        currentMatchweek: normalizedMatch.matchweek || prev.currentMatchweek || 1,
      };
    });
  };

  const handleUpdateEplMatch = (updatedMatch: EPLMatchEvent) => {
    handleSaveEplMatch(updatedMatch);
  };

  const handleDeleteEplMatch = (
    id: string,
    matchweek?: number,
    homeTeam?: string,
    awayTeam?: string
  ) => {
    updateAndSaveState((prev) => {
      const matches = prev.eplMatches || [];
      return {
        ...prev,
        eplMatches: matches.filter((m) => {
          if (m.id === id) return false;
          if (matchweek && homeTeam && awayTeam) {
            const isMatchweek = Number(m.matchweek) === Number(matchweek);
            const isHome =
              normalizeTeamName(m.homeTeam).toLowerCase().trim() ===
              normalizeTeamName(homeTeam).toLowerCase().trim();
            const isAway =
              normalizeTeamName(m.awayTeam).toLowerCase().trim() ===
              normalizeTeamName(awayTeam).toLowerCase().trim();
            if (isMatchweek && isHome && isAway) {
              return false;
            }
          }
          return true;
        }),
      };
    });
  };

  const handleBatchSaveEplMatches = (matchesToSave: EPLMatchEvent[]) => {
    updateAndSaveState((prev) => {
      const existing = prev.eplMatches || [];
      const incomingIds = new Set(matchesToSave.map((m) => m.id));
      const remainingExisting = existing.filter((m) => !incomingIds.has(m.id));
      const updatedMatches = sanitizeAndDeduplicateMatches([
        ...matchesToSave,
        ...remainingExisting,
      ]);

      return {
        ...prev,
        eplMatches: updatedMatches,
      };
    });
  };

  const handleClearMatchweekMatches = (matchweek: number) => {
    updateAndSaveState((prev) => ({
      ...prev,
      eplMatches: (prev.eplMatches || []).filter((m) => m.matchweek !== matchweek),
    }));
  };

  const handleSetMatchweek = (matchweek: number) => {
    updateAndSaveState((prev) => ({
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
    updateAndSaveState((prev) => ({
      ...prev,
      marketRecords: [entry, ...(prev.marketRecords || [])],
    }));
  };

  const handleUpdateMarketRecordResult = (id: string, result: 'PENDING' | 'WIN' | 'LOSS' | 'VOID') => {
    updateAndSaveState((prev) => {
      const records = prev.marketRecords || [];
      return {
        ...prev,
        marketRecords: records.map((r) => (r.id === id ? { ...r, result } : r)),
      };
    });
  };

  const handleDeleteMarketRecord = (id: string) => {
    updateAndSaveState((prev) => {
      const records = prev.marketRecords || [];
      return {
        ...prev,
        marketRecords: records.filter((r) => r.id !== id),
      };
    });
  };

  const handleSaveCategoryRanking = (ranking: MatchweekCategoryRanking) => {
    updateAndSaveState((prev) => ({
      ...prev,
      categoryRankings: {
        ...(prev.categoryRankings || {}),
        [ranking.matchweek]: ranking,
      },
    }));
  };

  const handleUpdateSettings = (settings: AppSettings) => {
    if (settings?.layoutTheme && typeof window !== 'undefined') {
      try {
        localStorage.setItem('btts_layout_theme', settings.layoutTheme);
      } catch (_) {}
    }
    updateAndSaveState((prev) => ({
      ...prev,
      settings,
    }));
  };

  const handleUpdateTheme = (newTheme: AppLayoutTheme) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('btts_layout_theme', newTheme);
      } catch (_) {}
    }
    updateAndSaveState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        layoutTheme: newTheme,
      },
    }));
  };

  const handleResetCycle = () => {
    updateAndSaveState((prev) => ({
      ...prev,
      currentDay: 1,
      matchHistory: [],
    }));
  };

  const handleClearAll = () => {
    const fresh = clearAllData();
    stateRef.current = fresh;
    setState(fresh);
    saveState(fresh);
    setActiveTab('dashboard');
  };

  const handleRestoreState = (newState: AppState) => {
    const saved = saveState(newState);
    stateRef.current = saved;
    setState(saved);
  };

  return (
    <div 
      className={`min-h-screen ${activeTheme.textClass} flex flex-col font-sans transition-colors duration-300 w-full overflow-x-hidden relative`}
      style={{
        backgroundColor: activeTheme.surfaceBgHex,
      }}
    >
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
              onUpdateMatchStatus={handleUpdateMatchStatus}
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
              onBatchSaveEplMatches={handleBatchSaveEplMatches}
              onClearMatchweekMatches={handleClearMatchweekMatches}
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
              onDeleteMatch={handleDeleteMatch}
              onUpdateMatch={handleUpdateMatchRecord}
              onClearPendingMatches={handleClearPendingMatches}
              onNavigateTab={setActiveTab}
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
              onUpdateTheme={handleUpdateTheme}
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
