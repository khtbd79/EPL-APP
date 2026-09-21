import { AppState, AppSettings, MatchRecord, EPLMatchEvent } from '../types';
import { saveStateToIndexedDB, clearIndexedDBState } from './indexedDbStorage';
import { normalizeTeamName, sanitizeAndDeduplicateMatches } from './teamData';

const STORAGE_KEY = 'btts_app_state_v2';
const BACKUP_STORAGE_KEY = 'btts_app_backup_state_v2';

export const DEFAULT_SETTINGS: AppSettings = {
  currency: 'BDT',
  targetPercent: 0,
  stakePercent: 0,
  theme: 'dark',
  layoutTheme: 'white_red',
  autoFillMarket: 'BTTS YES',
  activeMatchweek: 1,
};

// Initial state must be completely clean and robust
export const INITIAL_STATE: AppState = {
  currentDay: 1,
  currentMatchweek: 1,
  matchHistory: [],
  eplMatches: [],
  marketRecords: [],
  preMatchNotes: {},
  categoryRankings: {},
  settings: DEFAULT_SETTINGS,
};

export const normalizeLoadedState = (parsed: any): AppState => {
  if (!parsed || typeof parsed !== 'object') return INITIAL_STATE;

  const rawSettings = parsed.settings || {};
  
  // Prefer device's actively chosen theme stored in localStorage, or fallback to rawSettings, then DEFAULT_SETTINGS
  let persistentTheme: any = null;
  if (typeof window !== 'undefined') {
    try {
      const storedTheme = localStorage.getItem('btts_layout_theme');
      if (storedTheme) {
        persistentTheme = storedTheme;
      }
    } catch (_) {}
  }
  if (!persistentTheme) {
    persistentTheme = rawSettings.layoutTheme;
  }

  const settings = { 
    ...DEFAULT_SETTINGS, 
    ...rawSettings,
    currency: (!rawSettings.currency || rawSettings.currency === '$') ? 'BDT' : rawSettings.currency,
    layoutTheme: persistentTheme || DEFAULT_SETTINGS.layoutTheme || 'white_red',
  };
  
  // Normalize match history to ensure profit, loss, and netPnL are correctly assigned
  const rawMatchHistory = Array.isArray(parsed.matchHistory) ? parsed.matchHistory : [];
  const normalizedHistory: MatchRecord[] = rawMatchHistory.map((m: any) => {
    const stake = Number(m.stake) || 0;
    const odds = Number(m.odds) || 1;
    const profit = m.result === 'WIN'
      ? (typeof m.profit === 'number' && m.profit > 0 ? m.profit : (odds > 1 && stake > 0 ? Number((stake * (odds - 1)).toFixed(2)) : 0))
      : 0;
    const loss = m.result === 'LOSS'
      ? (typeof m.loss === 'number' && m.loss > 0 ? m.loss : stake)
      : 0;
    const netPnL = m.result === 'WIN' ? profit : (m.result === 'LOSS' ? -loss : 0);

    return {
      ...m,
      odds,
      stake,
      profit,
      loss,
      netPnL,
    };
  });

  return {
    currentDay: typeof parsed.currentDay === 'number' && parsed.currentDay >= 1 ? parsed.currentDay : 1,
    currentMatchweek: typeof parsed.currentMatchweek === 'number' ? parsed.currentMatchweek : (settings.activeMatchweek || 1),
    matchHistory: normalizedHistory,
    eplMatches: sanitizeAndDeduplicateMatches(Array.isArray(parsed.eplMatches) ? parsed.eplMatches : []),
    marketRecords: Array.isArray(parsed.marketRecords) ? parsed.marketRecords : [],
    preMatchNotes: parsed.preMatchNotes && typeof parsed.preMatchNotes === 'object' ? parsed.preMatchNotes : {},
    categoryRankings: parsed.categoryRankings && typeof parsed.categoryRankings === 'object' ? parsed.categoryRankings : {},
    settings,
    lastSavedAt: typeof parsed.lastSavedAt === 'number' ? parsed.lastSavedAt : undefined,
    compoundingState: parsed.compoundingState && typeof parsed.compoundingState === 'object' ? parsed.compoundingState : undefined,
  };
};

export const hasSavedStateData = (state: AppState | null | undefined): boolean => {
  if (!state) return false;
  return (
    (Array.isArray(state.matchHistory) && state.matchHistory.length > 0) ||
    (Array.isArray(state.eplMatches) && state.eplMatches.length > 0) ||
    (Array.isArray(state.marketRecords) && state.marketRecords.length > 0) ||
    (typeof state.currentDay === 'number' && state.currentDay > 1) ||
    (state.preMatchNotes && Object.keys(state.preMatchNotes).length > 0) ||
    (state.categoryRankings && Object.keys(state.categoryRankings).length > 0) ||
    (state.compoundingState && Object.keys(state.compoundingState).length > 0)
  );
};

export const loadState = (): AppState => {
  let parsed: any = null;

  // 1. Try Primary LocalStorage FIRST (user saved data takes top priority)
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      parsed = JSON.parse(data);
    }
  } catch (err) {
    console.warn('LocalStorage read error:', err);
  }

  // 2. Try Backup LocalStorage Key SECOND if primary failed or empty
  if (!parsed) {
    try {
      const backupData = localStorage.getItem(BACKUP_STORAGE_KEY);
      if (backupData) {
        parsed = JSON.parse(backupData);
      }
    } catch (err) {
      console.warn('Backup LocalStorage read error:', err);
    }
  }

  // 3. Try legacy storage key
  if (!parsed) {
    try {
      const legacyData = localStorage.getItem('btts_app_state_v1');
      if (legacyData) {
        parsed = JSON.parse(legacyData);
      }
    } catch (err) {
      // ignore
    }
  }

  // 4. Try SessionStorage as fallback
  if (!parsed) {
    try {
      const data = sessionStorage.getItem(STORAGE_KEY);
      if (data) {
        parsed = JSON.parse(data);
      }
    } catch (e) {
      // ignore
    }
  }

  // 5. Try window preloaded state ONLY if LocalStorage and SessionStorage are empty
  if (!parsed && typeof window !== 'undefined' && (window as any).__PRELOADED_APP_STATE__) {
    parsed = (window as any).__PRELOADED_APP_STATE__;
  }

  if (!parsed) return INITIAL_STATE;

  return normalizeLoadedState(parsed);
};

export const saveState = (state: AppState): AppState => {
  if (!state) return state;

  const stateToSave: AppState = {
    ...state,
    lastSavedAt: Date.now(),
  };

  // Store in memory for immediate access
  if (typeof window !== 'undefined') {
    (window as any).__PRELOADED_APP_STATE__ = stateToSave;
  }

  const serialized = JSON.stringify(stateToSave);

  // 1. Primary LocalStorage
  try {
    localStorage.setItem(STORAGE_KEY, serialized);
    if (stateToSave.settings?.layoutTheme) {
      localStorage.setItem('btts_layout_theme', stateToSave.settings.layoutTheme);
    }
  } catch (err) {
    console.warn('Failed to save to LocalStorage:', err);
  }

  // 2. Backup LocalStorage (mirror snapshot)
  try {
    localStorage.setItem(BACKUP_STORAGE_KEY, serialized);
  } catch (err) {
    // ignore
  }

  // 3. SessionStorage fallback
  try {
    sessionStorage.setItem(STORAGE_KEY, serialized);
  } catch (e) {
    // ignore
  }

  // 4. Durable IndexedDB asynchronous persistence (survives WebView/offline refreshes)
  saveStateToIndexedDB(stateToSave).catch(() => {});

  return stateToSave;
};

// Draft storage helper to preserve in-progress user inputs across reloads and tab closures
export const getStoredDraft = <T>(key: string, defaultValue: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // fallback
  }
  return defaultValue;
};

export const setStoredDraft = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    // ignore
  }
};

export const removeStoredDraft = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    // ignore
  }
};

export const clearAllData = (): AppState => {
  if (typeof window !== 'undefined') {
    delete (window as any).__PRELOADED_APP_STATE__;
  }
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BACKUP_STORAGE_KEY);
    localStorage.removeItem('btts_app_state_v1');
    localStorage.removeItem('btts_epl_teams_v2');
    localStorage.removeItem('btts_daily_bet_draft');
    localStorage.removeItem('btts_epl_form_draft');
    localStorage.removeItem('btts_epl_match_center_prefs');
    localStorage.removeItem('btts_compounding_draft');
    localStorage.removeItem('btts_active_tab');
  } catch (err) {
    console.warn('Failed to clear LocalStorage:', err);
  }
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
  clearIndexedDBState().catch(() => {});
  return INITIAL_STATE;
};

// Financial Calculations
export const calculateFinancials = (state: AppState) => {
  let totalProfit = 0;
  let totalLoss = 0;
  let totalPendingStakes = 0;
  let winningBets = 0;
  let losingBets = 0;
  let pendingBets = 0;
  let voidBets = 0;

  state.matchHistory.forEach((match) => {
    const stake = Number(match.stake) || 0;
    const odds = Number(match.odds) || 1;
    const expectedProfit = match.profit > 0
      ? match.profit
      : (odds > 1 && stake > 0 ? Number((stake * (odds - 1)).toFixed(2)) : 0);
    const expectedLoss = match.loss > 0 ? match.loss : stake;

    if (match.result === 'WIN') {
      winningBets++;
      totalProfit += expectedProfit;
    } else if (match.result === 'LOSS') {
      losingBets++;
      totalLoss += expectedLoss;
    } else if (match.result === 'PENDING') {
      pendingBets++;
      totalPendingStakes += stake;
    } else if (match.result === 'VOID') {
      voidBets++;
    }
  });

  const netBettingPnL = totalProfit - totalLoss;
  const settledBankroll = netBettingPnL;
  const currentBankroll = netBettingPnL;
  const totalBets = state.matchHistory.length;
  const resolvedBets = winningBets + losingBets;
  const winRate = resolvedBets > 0 ? (winningBets / resolvedBets) * 100 : 0;

  // Recommended Stake & Target for Today
  const stakePercent = state.settings.stakePercent || 5;
  const targetPercent = state.settings.targetPercent || 5;
  
  const recommendedStake = Math.max(0, Number((Math.max(0, currentBankroll) * (stakePercent / 100)).toFixed(2)));
  const recommendedTarget = Math.max(0, Number((Math.max(0, currentBankroll) * (targetPercent / 100)).toFixed(2)));

  const completedDaysCount = state.matchHistory.filter((m) => m.result !== 'PENDING').length;
  const remainingDaysCount = Math.max(0, 30 - completedDaysCount);

  const statusText = totalBets > 0 ? 'Active Season Ready' : 'Match Ready';

  return {
    totalProfit,
    totalLoss,
    totalPendingStakes,
    settledBankroll,
    netBettingPnL,
    currentBankroll,
    totalBets,
    winningBets,
    losingBets,
    pendingBets,
    voidBets,
    winRate,
    recommendedStake,
    recommendedTarget,
    completedDaysCount,
    remainingDaysCount,
    statusText,
  };
};

export const formatMoney = (amount: number, currency: string = 'BDT'): string => {
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const curr = (!currency || currency === '$') ? 'BDT' : currency;
  const spacing = curr.length > 1 ? ' ' : '';
  return amount < 0 ? `-${curr}${spacing}${formatted}` : `${curr}${spacing}${formatted}`;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
};
