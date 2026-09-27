import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppState, ActiveTab } from '../types';
import { formatMoney, getStoredDraft, setStoredDraft } from '../utils/storage';
import { ConfirmActionModal, ConfirmModalConfig } from './ConfirmActionModal';
import { EPL_2026_27_FIXTURES, EPLFixture } from '../data/eplFixtures2026_27';
import {
  TrendingUp,
  RotateCcw,
  Zap,
  Check,
  X,
  Search,
  ChevronRight,
  DollarSign,
  Calendar,
  Percent,
  Trophy,
} from 'lucide-react';

interface CompoundingViewProps {
  state: AppState;
  setActiveTab?: (tab: ActiveTab) => void;
}

export type CompoundingTaskStatus = 'PENDING' | 'WIN' | 'LOSS';

export interface CompoundingTaskData {
  day: number;
  matchName?: string;
  matchId?: string;
  matchDate?: string;
  market?: string;
  customOdds?: number;
  customStakePercent?: number;
  customStakeAmount?: number;
  stakeMode?: 'fixed' | 'percent';
  status: CompoundingTaskStatus;
  notes?: string;
}

export interface DayCompoundingCalculation {
  day: number;
  startBalance: number;
  odds: number;
  stakePercent: number;
  stakeAmount: number;
  potentialProfit: number;
  realizedProfit: number;
  realizedLoss: number;
  endBalance: number;
  cumulativeProfit: number;
  growthPercent: number;
  status: CompoundingTaskStatus;
  isSettled: boolean;
  matchName?: string;
  market?: string;
  notes?: string;
  hasCustomOdds?: boolean;
  hasCustomStake?: boolean;
  customStakeAmount?: number;
  customStakePercent?: number;
}

const COMPOUNDING_STORAGE_KEY = 'btts_compounding_plan_v5';

interface StoredCompoundingState {
  initialDepositStr: string;
  totalDays: number;
  dailyRateStr: string;
  defaultOddsStr: string;
  stakePercentStr: string;
  tasks: Record<number, CompoundingTaskData>;
  currency?: string;
}

const POPULAR_MARKETS = [
  'BTTS YES',
  'Over 1.5 Goals',
  'Over 2.5 Goals',
  'Home Win',
  'Away Win',
  '1X (Home/Draw)',
  'Under 3.5 Goals',
];

export const CompoundingView: React.FC<CompoundingViewProps> = ({ state }) => {
  const currency = state.settings?.currency || 'BDT';

  // Load stored compounding state or initialize defaults (100 deposit, 90 days, 1.10 odds / 10%)
  const initialData = getStoredDraft<StoredCompoundingState>(COMPOUNDING_STORAGE_KEY, {
    initialDepositStr: '100',
    totalDays: 90,
    dailyRateStr: '10',
    defaultOddsStr: '1.10',
    stakePercentStr: '100',
    tasks: {},
    currency,
  });

  const [initialDepositStr, setInitialDepositStr] = useState<string>(initialData.initialDepositStr || '100');
  const [totalDays, setTotalDays] = useState<number>(initialData.totalDays || 90);
  const [dailyRateStr, setDailyRateStr] = useState<string>(initialData.dailyRateStr || '10');
  const [defaultOddsStr, setDefaultOddsStr] = useState<string>(initialData.defaultOddsStr || '1.10');
  const [stakePercentStr, setStakePercentStr] = useState<string>(initialData.stakePercentStr || '100');
  const [tasks, setTasks] = useState<Record<number, CompoundingTaskData>>(initialData.tasks || {});

  // UI States
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'WIN' | 'LOSS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [activePageChunk, setActivePageChunk] = useState<number>(1);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalConfig | null>(null);

  // Match Assignment & Custom Odds/Stake Modal State
  const [assignModalDay, setAssignModalDay] = useState<number | null>(null);
  const [fixtureSearch, setFixtureSearch] = useState('');
  const [customMatchInput, setCustomMatchInput] = useState('');
  const [selectedMarketInput, setSelectedMarketInput] = useState('');
  const [customOddsInput, setCustomOddsInput] = useState('');
  const [customStakeInput, setCustomStakeInput] = useState('');
  const [stakeInputMode, setStakeInputMode] = useState<'fixed' | 'percent'>('fixed');

  // Fast typing drafts for inline inputs
  const [inlineOddsDrafts, setInlineOddsDrafts] = useState<Record<number, string>>({});
  const [inlineStakeDrafts, setInlineStakeDrafts] = useState<Record<number, string>>({});

  const activeTaskEl = useRef<HTMLElement | null>(null);
  const setActiveTaskRef = (el: HTMLElement | null) => {
    activeTaskEl.current = el;
  };

  // Sync Daily Rate % and Target Odds
  const handleDailyRateChange = (newRateStr: string) => {
    setDailyRateStr(newRateStr);
    const rate = parseFloat(newRateStr);
    if (!isNaN(rate) && rate > 0) {
      const calculatedOdds = (1 + rate / 100).toFixed(2);
      setDefaultOddsStr(calculatedOdds);
    }
  };

  const handleDefaultOddsChange = (newOddsStr: string) => {
    setDefaultOddsStr(newOddsStr);
    const odds = parseFloat(newOddsStr);
    if (!isNaN(odds) && odds >= 1.01) {
      const calculatedRate = ((odds - 1) * 100).toFixed(1);
      setDailyRateStr(calculatedRate);
    }
  };

  // Save compounding state
  useEffect(() => {
    setStoredDraft(COMPOUNDING_STORAGE_KEY, {
      initialDepositStr,
      totalDays,
      dailyRateStr,
      defaultOddsStr,
      stakePercentStr,
      tasks,
      currency,
    });
  }, [initialDepositStr, totalDays, dailyRateStr, defaultOddsStr, stakePercentStr, tasks, currency]);

  // Numerical parameters
  const initialDeposit = Math.max(0, parseFloat(initialDepositStr) || 0);
  const defaultOdds = Math.max(1.01, parseFloat(defaultOddsStr) || 1.10);
  const stakePercent = Math.min(100, Math.max(1, parseFloat(stakePercentStr) || 100));

  // Flatten fixtures for match picker
  const allEplFixtures = useMemo(() => {
    const list: (EPLFixture & { label: string })[] = [];
    EPL_2026_27_FIXTURES.forEach((mw) => {
      mw.matches.forEach((m) => {
        list.push({
          ...m,
          label: `${m.homeTeam} vs ${m.awayTeam} (MW ${m.matchweek})`,
        });
      });
    });
    return list;
  }, []);

  /**
   * CORE COMPOUNDING & CASCADE ENGINE:
   * Dynamic day-by-day compounding.
   * Modifying odds or stake on any day instantly updates all subsequent days'
   * starting balances, profit, stake amounts, and projections!
   */
  const scheduleCalculations = useMemo<DayCompoundingCalculation[]>(() => {
    const list: DayCompoundingCalculation[] = [];
    const daysLimit = Math.max(1, Math.min(365, totalDays || 90));

    let currentBalance = initialDeposit;

    for (let day = 1; day <= daysLimit; day++) {
      const task = tasks[day] || { day, status: 'PENDING' };
      const hasCustomOdds = task.customOdds !== undefined && task.customOdds >= 1.01;
      const dayOdds = hasCustomOdds ? task.customOdds! : defaultOdds;

      const startBalance = Number(currentBalance.toFixed(2));

      // Calculate Stake: Fixed Custom Stake Amount > Custom Stake Percent > Default Stake Percent
      let stakeAmount: number;
      let dayStakePercent: number;
      const hasCustomStake =
        (task.customStakeAmount !== undefined && task.customStakeAmount > 0) ||
        (task.customStakePercent !== undefined && task.customStakePercent > 0);

      if (task.customStakeAmount !== undefined && task.customStakeAmount > 0) {
        stakeAmount = Number(task.customStakeAmount.toFixed(2));
        dayStakePercent = startBalance > 0 ? Number(((stakeAmount / startBalance) * 100).toFixed(1)) : 0;
      } else if (task.customStakePercent !== undefined && task.customStakePercent > 0) {
        dayStakePercent = task.customStakePercent;
        stakeAmount = Number((startBalance * (dayStakePercent / 100)).toFixed(2));
      } else {
        dayStakePercent = stakePercent;
        stakeAmount = Number((startBalance * (dayStakePercent / 100)).toFixed(2));
      }

      const potentialProfit = Number((stakeAmount * (dayOdds - 1)).toFixed(2));

      let endBalance = startBalance;
      let realizedProfit = 0;
      let realizedLoss = 0;

      if (task.status === 'WIN') {
        realizedProfit = potentialProfit;
        endBalance = Number((startBalance + realizedProfit).toFixed(2));
      } else if (task.status === 'LOSS') {
        realizedLoss = stakeAmount;
        endBalance = Number(Math.max(0, startBalance - realizedLoss).toFixed(2));
      } else {
        // PENDING: Forward projection reaches target profit
        endBalance = Number((startBalance + potentialProfit).toFixed(2));
      }

      const cumulativeProfit = Number((endBalance - initialDeposit).toFixed(2));
      const growthPercent =
        initialDeposit > 0 ? Number((((endBalance - initialDeposit) / initialDeposit) * 100).toFixed(1)) : 0;

      list.push({
        day,
        startBalance,
        odds: dayOdds,
        stakePercent: dayStakePercent,
        stakeAmount,
        potentialProfit,
        realizedProfit,
        realizedLoss,
        endBalance,
        cumulativeProfit,
        growthPercent,
        status: task.status,
        isSettled: task.status === 'WIN' || task.status === 'LOSS',
        matchName: task.matchName,
        market: task.market,
        notes: task.notes,
        hasCustomOdds,
        hasCustomStake,
        customStakeAmount: task.customStakeAmount,
        customStakePercent: task.customStakePercent,
      });

      // Pass resulting balance to next day
      currentBalance = endBalance;
    }

    return list;
  }, [initialDeposit, totalDays, defaultOdds, stakePercent, tasks]);

  // Overall Statistics & Real-Time Tracking
  const stats = useMemo(() => {
    const total = scheduleCalculations.length;
    const wonCount = scheduleCalculations.filter((c) => c.status === 'WIN').length;
    const lostCount = scheduleCalculations.filter((c) => c.status === 'LOSS').length;
    const pendingCount = scheduleCalculations.filter((c) => c.status === 'PENDING').length;
    const settledCount = wonCount + lostCount;
    const winRate = settledCount > 0 ? Number(((wonCount / settledCount) * 100).toFixed(1)) : 0;

    let liveBalance = initialDeposit;
    for (let i = 0; i < scheduleCalculations.length; i++) {
      if (scheduleCalculations[i].isSettled) {
        liveBalance = scheduleCalculations[i].endBalance;
      }
    }

    const realizedNetPnL = liveBalance - initialDeposit;
    const finalProjectedBalance =
      scheduleCalculations.length > 0
        ? scheduleCalculations[scheduleCalculations.length - 1].endBalance
        : initialDeposit;
    const projectedProfit = finalProjectedBalance - initialDeposit;
    const projectedMultiplier = initialDeposit > 0 ? (finalProjectedBalance / initialDeposit).toFixed(1) : '0.0';

    const firstPendingDay = scheduleCalculations.find((c) => c.status === 'PENDING')?.day || 1;

    return {
      totalDays: total,
      wonCount,
      lostCount,
      pendingCount,
      settledCount,
      winRate,
      liveBalance,
      realizedNetPnL,
      finalProjectedBalance,
      projectedProfit,
      projectedMultiplier,
      firstPendingDay,
      progressPercent: total > 0 ? Math.round((settledCount / total) * 100) : 0,
    };
  }, [scheduleCalculations, initialDeposit]);

  // Task Status Toggle
  const handleSetTaskStatus = (day: number, newStatus: CompoundingTaskStatus) => {
    setTasks((prev) => {
      const existing = prev[day] || { day, status: 'PENDING' };
      return {
        ...prev,
        [day]: {
          ...existing,
          status: newStatus,
        },
      };
    });
  };

  // Inline Odds update
  const handleInlineChangeOdds = (day: number, val: string) => {
    setInlineOddsDrafts((prev) => ({ ...prev, [day]: val }));
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 1.01) {
      setTasks((prev) => {
        const existing = prev[day] || { day, status: 'PENDING' };
        return {
          ...prev,
          [day]: {
            ...existing,
            customOdds: Number(num.toFixed(2)),
          },
        };
      });
    } else if (val === '') {
      setTasks((prev) => {
        const existing = prev[day];
        if (!existing) return prev;
        const copy = { ...existing };
        delete copy.customOdds;
        return { ...prev, [day]: copy };
      });
    }
  };

  const handleInlineBlurOdds = (day: number) => {
    setInlineOddsDrafts((prev) => {
      const copy = { ...prev };
      delete copy[day];
      return copy;
    });
  };

  // Inline Stake update
  const handleInlineChangeStake = (day: number, val: string) => {
    setInlineStakeDrafts((prev) => ({ ...prev, [day]: val }));
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setTasks((prev) => {
        const existing = prev[day] || { day, status: 'PENDING' };
        const updated = {
          ...existing,
          customStakeAmount: Number(num.toFixed(2)),
        };
        delete updated.customStakePercent;
        return {
          ...prev,
          [day]: updated,
        };
      });
    } else if (val === '') {
      setTasks((prev) => {
        const existing = prev[day];
        if (!existing) return prev;
        const copy = { ...existing };
        delete copy.customStakeAmount;
        delete copy.customStakePercent;
        return { ...prev, [day]: copy };
      });
    }
  };

  const handleInlineBlurStake = (day: number) => {
    setInlineStakeDrafts((prev) => {
      const copy = { ...prev };
      delete copy[day];
      return copy;
    });
  };

  // Reset custom odds and stake for a task back to defaults
  const handleResetTaskCustomValues = (day: number) => {
    setInlineOddsDrafts((prev) => {
      const copy = { ...prev };
      delete copy[day];
      return copy;
    });
    setInlineStakeDrafts((prev) => {
      const copy = { ...prev };
      delete copy[day];
      return copy;
    });
    setTasks((prev) => {
      const existing = prev[day];
      if (!existing) return prev;
      const copy = { ...existing };
      delete copy.customOdds;
      delete copy.customStakeAmount;
      delete copy.customStakePercent;
      return { ...prev, [day]: copy };
    });
  };

  // Open Assign Match Modal
  const handleOpenAssignModal = (day: number) => {
    const existing = tasks[day];
    setAssignModalDay(day);
    setFixtureSearch('');
    setCustomMatchInput(existing?.matchName || '');
    setSelectedMarketInput(existing?.market || 'BTTS YES');
    setCustomOddsInput(existing?.customOdds !== undefined ? String(existing.customOdds) : '');
    if (existing?.customStakeAmount !== undefined) {
      setCustomStakeInput(String(existing.customStakeAmount));
      setStakeInputMode('fixed');
    } else if (existing?.customStakePercent !== undefined) {
      setCustomStakeInput(String(existing.customStakePercent));
      setStakeInputMode('percent');
    } else {
      setCustomStakeInput('');
      setStakeInputMode('fixed');
    }
  };

  // Save Assigned Match & Custom Odds/Stake
  const handleSaveAssignedMatch = () => {
    if (assignModalDay === null) return;
    const parsedOdds = parseFloat(customOddsInput);
    const validOdds = !isNaN(parsedOdds) && parsedOdds >= 1.01 ? parsedOdds : undefined;

    const parsedStake = parseFloat(customStakeInput);
    const validStake = !isNaN(parsedStake) && parsedStake > 0 ? parsedStake : undefined;

    setTasks((prev) => {
      const existing = prev[assignModalDay] || { day: assignModalDay, status: 'PENDING' };
      const updated: CompoundingTaskData = {
        ...existing,
        matchName: customMatchInput.trim() || undefined,
        market: selectedMarketInput.trim() || undefined,
        customOdds: validOdds,
      };

      if (validStake !== undefined) {
        if (stakeInputMode === 'fixed') {
          updated.customStakeAmount = Number(validStake.toFixed(2));
          delete updated.customStakePercent;
        } else {
          updated.customStakePercent = Math.min(100, Math.max(1, validStake));
          delete updated.customStakeAmount;
        }
      } else {
        delete updated.customStakeAmount;
        delete updated.customStakePercent;
      }

      return {
        ...prev,
        [assignModalDay]: updated,
      };
    });

    setAssignModalDay(null);
  };

  // Reset Compounding Plan
  const handleResetPlan = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset Plan',
      message: 'This will reset all task statuses to PENDING and clear custom values. Continue?',
      confirmLabel: 'Reset',
      variant: 'danger',
      onConfirm: () => {
        setTasks({});
      },
    });
  };

  // Filter tasks
  const filteredSchedule = useMemo(() => {
    return scheduleCalculations.filter((item) => {
      if (filterStatus === 'PENDING' && item.status !== 'PENDING') return false;
      if (filterStatus === 'WIN' && item.status !== 'WIN') return false;
      if (filterStatus === 'LOSS' && item.status !== 'LOSS') return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchString = (item.matchName || '').toLowerCase();
        const marketString = (item.market || '').toLowerCase();
        const dayString = `day ${item.day}`;
        return matchString.includes(query) || marketString.includes(query) || dayString.includes(query);
      }

      return true;
    });
  }, [scheduleCalculations, filterStatus, searchQuery]);

  // Pagination chunks (30 days per chunk)
  const chunkSize = 30;
  const totalChunks = Math.max(1, Math.ceil(totalDays / chunkSize));
  const chunkedSchedule = useMemo(() => {
    const startIdx = (activePageChunk - 1) * chunkSize;
    const endIdx = startIdx + chunkSize;
    return filteredSchedule.filter((item) => item.day > startIdx && item.day <= endIdx);
  }, [filteredSchedule, activePageChunk, chunkSize]);

  const scrollToActiveTask = () => {
    if (activeTaskEl.current) {
      activeTaskEl.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-24 max-w-[1600px] mx-auto">
      {/* Top Clean Executive Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 tracking-tight">COMPOUNDING</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black font-mono uppercase bg-slate-100 text-slate-700 border border-slate-200">
                  {totalDays}D
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Day {stats.firstPendingDay}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={scrollToActiveTask}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Day {stats.firstPendingDay}</span>
            </button>

            <button
              type="button"
              onClick={handleResetPlan}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
              title="Reset Plan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Clean Parameters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
          {/* Initial Capital */}
          <div className="p-3 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-all">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
              <span>Capital</span>
              <span className="text-slate-400 font-mono text-[10px]">{currency}</span>
            </div>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="1"
                value={initialDepositStr}
                onChange={(e) => setInitialDepositStr(e.target.value)}
                placeholder="100"
                className="w-full bg-white border border-slate-200 focus:border-slate-900 rounded-lg py-1.5 px-2.5 text-sm font-mono font-black text-slate-900 focus:outline-none transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Plan Duration */}
          <div className="p-3 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-all">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
              <span>Target Days</span>
              <div className="flex items-center gap-1">
                {[30, 60, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setTotalDays(d);
                      setActivePageChunk(1);
                    }}
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold transition-all cursor-pointer ${
                      totalDays === d ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              min="1"
              max="365"
              step="1"
              value={totalDays}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) setTotalDays(Math.max(1, Math.min(365, val)));
              }}
              placeholder="90"
              className="w-full bg-white border border-slate-200 focus:border-slate-900 rounded-lg py-1.5 px-2.5 text-sm font-mono font-black text-slate-900 focus:outline-none transition-all shadow-2xs"
            />
          </div>

          {/* Target Odds */}
          <div className="p-3 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-all">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
              <span>Target Odds</span>
              <span className="text-emerald-600 font-mono text-[10px] font-bold">+{dailyRateStr}%</span>
            </div>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs font-bold">@</span>
              <input
                type="number"
                min="1.01"
                step="0.01"
                value={defaultOddsStr}
                onChange={(e) => handleDefaultOddsChange(e.target.value)}
                placeholder="1.10"
                className="w-full bg-white border border-slate-200 focus:border-slate-900 rounded-lg py-1.5 pr-2 pl-7 text-sm font-mono font-black text-slate-900 focus:outline-none transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Stake % */}
          <div className="p-3 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-all">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
              <span>Stake Ratio</span>
              <span className="text-slate-400 font-mono text-[10px]">Reinvest</span>
            </div>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="100"
                step="5"
                value={stakePercentStr}
                onChange={(e) => setStakePercentStr(e.target.value)}
                placeholder="100"
                className="w-full bg-white border border-slate-200 focus:border-slate-900 rounded-lg py-1.5 pr-6 pl-2.5 text-sm font-mono font-black text-slate-900 focus:outline-none transition-all shadow-2xs"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs font-bold">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Performance Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Initial Capital */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Initial Capital</div>
          <div className="text-base sm:text-lg font-black font-mono text-slate-900 mt-1">
            {formatMoney(initialDeposit, currency)}
          </div>
          <div className="text-[11px] font-medium text-slate-400 mt-0.5">Base Deposit</div>
        </div>

        {/* Live Balance */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Live Balance</span>
            <span className={`text-[10px] font-mono font-bold ${stats.realizedNetPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {stats.realizedNetPnL >= 0 ? '+' : ''}{formatMoney(stats.realizedNetPnL, currency)}
            </span>
          </div>
          <div className={`text-base sm:text-lg font-black font-mono mt-1 ${stats.liveBalance >= initialDeposit ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatMoney(stats.liveBalance, currency)}
          </div>
          <div className="text-[11px] font-medium text-slate-400 mt-0.5">Realized Net</div>
        </div>

        {/* Target Balance */}
        <div className="bg-slate-900 text-white rounded-2xl p-3.5 shadow-xs border border-slate-800">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Day {totalDays} Target</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 font-mono">
              {stats.projectedMultiplier}x
            </span>
          </div>
          <div className="text-base sm:text-lg font-black font-mono text-emerald-400 mt-1">
            {formatMoney(stats.finalProjectedBalance, currency)}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
            +{formatMoney(stats.projectedProfit, currency)}
          </div>
        </div>

        {/* Performance Record */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Performance</span>
            <span className="text-[10px] font-mono font-bold text-slate-700">{stats.winRate}% WR</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-black font-mono mt-1">
            <span className="text-emerald-600">{stats.wonCount}W</span>
            <span className="text-slate-300">•</span>
            <span className="text-rose-600">{stats.lostCount}L</span>
            <span className="text-slate-300">•</span>
            <span className="text-amber-500">{stats.pendingCount}P</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Control Strip */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-2.5 sm:p-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {(['ALL', 'PENDING', 'WIN', 'LOSS'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === st
                  ? st === 'WIN'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : st === 'LOSS'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : st === 'PENDING'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {st}
              {st === 'WIN' && ` (${stats.wonCount})`}
              {st === 'LOSS' && ` (${stats.lostCount})`}
              {st === 'PENDING' && ` (${stats.pendingCount})`}
            </button>
          ))}
        </div>

        {/* Chunks Switcher (if > 30 days) */}
        {totalChunks > 1 && (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {Array.from({ length: totalChunks }).map((_, idx) => {
              const chunkNum = idx + 1;
              const startDay = (chunkNum - 1) * chunkSize + 1;
              const endDay = Math.min(totalDays, chunkNum * chunkSize);
              const isActive = activePageChunk === chunkNum;

              return (
                <button
                  key={chunkNum}
                  type="button"
                  onClick={() => setActivePageChunk(chunkNum)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {startDay}-{endDay}
                </button>
              );
            })}
          </div>
        )}

        {/* Search & View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-44">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search day or match..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-2.5 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all"
            />
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* Main View: Table or Cards */}
      {viewMode === 'cards' ? (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {chunkedSchedule.map((row) => {
            const isFirstPending = row.day === stats.firstPendingDay;
            const isWon = row.status === 'WIN';
            const isLost = row.status === 'LOSS';
            const isPending = row.status === 'PENDING';

            return (
              <div
                key={row.day}
                ref={isFirstPending ? setActiveTaskRef : undefined}
                className={`bg-white p-4 rounded-2xl border transition-all shadow-2xs space-y-3 ${
                  isWon
                    ? 'border-emerald-300/80 bg-emerald-50/20'
                    : isLost
                    ? 'border-rose-300/80 bg-rose-50/20'
                    : isFirstPending
                    ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-black font-mono text-xs ${
                        isWon
                          ? 'bg-emerald-600 text-white'
                          : isLost
                          ? 'bg-rose-600 text-white'
                          : isFirstPending
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      D{String(row.day).padStart(2, '0')}
                    </span>
                    <div>
                      <div className="text-xs font-black text-slate-900">Day {row.day}</div>
                      <div className="text-[10px] font-mono text-slate-500">
                        Start: {formatMoney(row.startBalance, currency)}
                      </div>
                    </div>
                  </div>

                  {/* Status 3-Way Buttons */}
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleSetTaskStatus(row.day, 'PENDING')}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                        isPending ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      P
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetTaskStatus(row.day, 'WIN')}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                        isWon ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-emerald-700'
                      }`}
                    >
                      W
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetTaskStatus(row.day, 'LOSS')}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                        isLost ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:text-rose-700'
                      }`}
                    >
                      L
                    </button>
                  </div>
                </div>

                {/* Match Box */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0 flex-1">
                    {row.matchName ? (
                      <div className="truncate">
                        <div className="font-bold text-slate-900 truncate">{row.matchName}</div>
                        <div className="text-[10px] text-slate-500 truncate">{row.market || 'Target Market'}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">No fixture assigned</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenAssignModal(row.day)}
                    className="text-[11px] font-bold text-slate-700 hover:text-slate-900 px-2 py-1 bg-white border border-slate-200 rounded-lg cursor-pointer shrink-0 shadow-2xs"
                  >
                    {row.matchName ? 'Edit' : '+ Assign'}
                  </button>
                </div>

                {/* Inline Odds & Stake */}
                <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div>
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
                      <span>Odds</span>
                      {row.hasCustomOdds && (
                        <button
                          type="button"
                          onClick={() => handleResetTaskCustomValues(row.day)}
                          className="text-amber-600 hover:text-amber-800 cursor-pointer"
                          title="Reset"
                        >
                          ↺
                        </button>
                      )}
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="1.01"
                      value={
                        inlineOddsDrafts[row.day] !== undefined
                          ? inlineOddsDrafts[row.day]
                          : row.hasCustomOdds
                          ? String(row.odds)
                          : row.odds.toFixed(2)
                      }
                      onChange={(e) => handleInlineChangeOdds(row.day, e.target.value)}
                      onBlur={() => handleInlineBlurOdds(row.day)}
                      className={`w-full px-2 py-1 text-center font-mono font-black text-xs rounded-lg border transition-all ${
                        row.hasCustomOdds
                          ? 'bg-amber-50 text-amber-900 border-amber-400'
                          : 'bg-white text-slate-800 border-slate-200 focus:outline-none'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
                      <span>Stake</span>
                      {row.hasCustomStake && (
                        <button
                          type="button"
                          onClick={() => handleResetTaskCustomValues(row.day)}
                          className="text-amber-600 hover:text-amber-800 cursor-pointer"
                          title="Reset"
                        >
                          ↺
                        </button>
                      )}
                    </div>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={
                        inlineStakeDrafts[row.day] !== undefined
                          ? inlineStakeDrafts[row.day]
                          : row.hasCustomStake
                          ? String(row.stakeAmount)
                          : row.stakeAmount
                      }
                      onChange={(e) => handleInlineChangeStake(row.day, e.target.value)}
                      onBlur={() => handleInlineBlurStake(row.day)}
                      className={`w-full px-2 py-1 text-right font-mono font-black text-xs rounded-lg border transition-all ${
                        row.hasCustomStake
                          ? 'bg-amber-50 text-amber-900 border-amber-400'
                          : 'bg-white text-slate-800 border-slate-200 focus:outline-none'
                      }`}
                    />
                  </div>
                </div>

                {/* Balance Footer */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">P/L</span>
                    <span className={`font-mono font-black ${isLost ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {isLost ? `-${formatMoney(row.realizedLoss, currency)}` : `+${formatMoney(row.potentialProfit, currency)}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold">End Balance</span>
                    <span className="font-mono font-black text-slate-900">
                      {formatMoney(row.endBalance, currency)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80 text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">Day</th>
                  <th className="py-2.5 px-3">Start</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Fixture</th>
                  <th className="py-2.5 px-2 text-center min-w-[80px]">Odds</th>
                  <th className="py-2.5 px-3 min-w-[110px]">Stake</th>
                  <th className="py-2.5 px-3">Profit</th>
                  <th className="py-2.5 px-3">End Balance</th>
                  <th className="py-2.5 px-3 text-center min-w-[140px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {chunkedSchedule.map((row) => {
                  const isWon = row.status === 'WIN';
                  const isLost = row.status === 'LOSS';
                  const isPending = row.status === 'PENDING';
                  const isCurrent = row.day === stats.firstPendingDay;

                  return (
                    <tr
                      key={row.day}
                      ref={isCurrent ? setActiveTaskRef : undefined}
                      className={`transition-colors ${
                        isWon
                          ? 'bg-emerald-50/30 hover:bg-emerald-50/60'
                          : isLost
                          ? 'bg-rose-50/30 hover:bg-rose-50/60'
                          : isCurrent
                          ? 'bg-amber-50/50 hover:bg-amber-50/80'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Day */}
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`w-6 h-6 rounded-md inline-flex items-center justify-center font-black font-mono text-[11px] ${
                            isWon
                              ? 'bg-emerald-600 text-white'
                              : isLost
                              ? 'bg-rose-600 text-white'
                              : isCurrent
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {String(row.day).padStart(2, '0')}
                        </span>
                      </td>

                      {/* Start Balance */}
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">
                        {formatMoney(row.startBalance, currency)}
                      </td>

                      {/* Match Assignment */}
                      <td className="py-2 px-3">
                        {row.matchName ? (
                          <div className="flex items-center justify-between gap-2 max-w-xs">
                            <div className="truncate">
                              <span className="font-bold text-slate-900 truncate block">
                                {row.matchName}
                              </span>
                              <span className="text-[10px] text-slate-400 truncate block font-medium">
                                {row.market || 'Target Market'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenAssignModal(row.day)}
                              className="text-[10px] font-bold text-slate-500 hover:text-slate-900 px-1.5 py-0.5 rounded border border-slate-200 bg-white cursor-pointer shrink-0"
                            >
                              Edit
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenAssignModal(row.day)}
                            className="text-[11px] font-bold text-slate-400 hover:text-slate-800 cursor-pointer"
                          >
                            + Assign
                          </button>
                        )}
                      </td>

                      {/* Odds */}
                      <td className="py-2 px-2 text-center">
                        <div className="inline-flex items-center justify-center gap-1">
                          <input
                            type="number"
                            step="0.01"
                            min="1.01"
                            value={
                              inlineOddsDrafts[row.day] !== undefined
                                ? inlineOddsDrafts[row.day]
                                : row.hasCustomOdds
                                ? String(row.odds)
                                : row.odds.toFixed(2)
                            }
                            onChange={(e) => handleInlineChangeOdds(row.day, e.target.value)}
                            onBlur={() => handleInlineBlurOdds(row.day)}
                            className={`w-14 px-1 py-0.5 text-center font-mono font-bold text-xs rounded border transition-all ${
                              row.hasCustomOdds
                                ? 'bg-amber-50 text-amber-900 border-amber-400 font-black'
                                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 focus:outline-none'
                            }`}
                          />
                          {row.hasCustomOdds && (
                            <button
                              type="button"
                              onClick={() => handleResetTaskCustomValues(row.day)}
                              className="text-amber-600 hover:text-amber-800 p-0.5 cursor-pointer"
                              title="Reset to default"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Stake Amount */}
                      <td className="py-2 px-3">
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="number"
                            step="1"
                            min="1"
                            value={
                              inlineStakeDrafts[row.day] !== undefined
                                ? inlineStakeDrafts[row.day]
                                : row.hasCustomStake
                                ? String(row.stakeAmount)
                                : row.stakeAmount
                            }
                            onChange={(e) => handleInlineChangeStake(row.day, e.target.value)}
                            onBlur={() => handleInlineBlurStake(row.day)}
                            className={`w-16 px-1.5 py-0.5 text-right font-mono font-bold text-xs rounded border transition-all ${
                              row.hasCustomStake
                                ? 'bg-amber-50 text-amber-900 border-amber-400 font-black'
                                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 focus:outline-none'
                            }`}
                          />
                          {row.hasCustomStake ? (
                            <button
                              type="button"
                              onClick={() => handleResetTaskCustomValues(row.day)}
                              className="text-amber-600 hover:text-amber-800 text-[10px] cursor-pointer"
                              title="Reset"
                            >
                              ↺
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {row.stakePercent}%
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Profit / Loss */}
                      <td className={`py-2 px-3 font-mono font-black ${isLost ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {isLost
                          ? `-${formatMoney(row.realizedLoss, currency)}`
                          : isWon
                          ? `+${formatMoney(row.realizedProfit, currency)}`
                          : `+${formatMoney(row.potentialProfit, currency)}`}
                      </td>

                      {/* End Balance */}
                      <td className="py-2 px-3 font-mono font-black text-slate-900">
                        {formatMoney(row.endBalance, currency)}
                      </td>

                      {/* Status */}
                      <td className="py-2 px-3 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleSetTaskStatus(row.day, 'PENDING')}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                              isPending ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            P
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetTaskStatus(row.day, 'WIN')}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                              isWon ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-emerald-700'
                            }`}
                          >
                            Win
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetTaskStatus(row.day, 'LOSS')}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                              isLost ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:text-rose-700'
                            }`}
                          >
                            Loss
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MATCH ASSIGNMENT MODAL */}
      {assignModalDay !== null && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setAssignModalDay(null)}
        >
          <div
            className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black font-mono text-xs">
                  D{String(assignModalDay).padStart(2, '0')}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    Day {assignModalDay} Task
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Fixture & custom parameters</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalDay(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Match Name Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Fixture / Match</label>
              <input
                type="text"
                value={customMatchInput}
                onChange={(e) => setCustomMatchInput(e.target.value)}
                placeholder="e.g. Arsenal vs Chelsea"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900 transition-all"
              />
            </div>

            {/* Quick EPL Fixtures List */}
            <div className="space-y-1.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fixtureSearch}
                  onChange={(e) => setFixtureSearch(e.target.value)}
                  placeholder="Search EPL fixtures..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
                {allEplFixtures
                  .filter((m) => {
                    if (!fixtureSearch.trim()) return m.matchweek <= 2;
                    const q = fixtureSearch.toLowerCase();
                    return (
                      m.homeTeam.toLowerCase().includes(q) ||
                      m.awayTeam.toLowerCase().includes(q) ||
                      `mw ${m.matchweek}`.includes(q)
                    );
                  })
                  .slice(0, 10)
                  .map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setCustomMatchInput(`${m.homeTeam} vs ${m.awayTeam}`)}
                      className="w-full px-3 py-1.5 text-left hover:bg-slate-100 transition-colors flex items-center justify-between cursor-pointer group text-xs"
                    >
                      <span className="font-bold text-slate-800 group-hover:text-slate-900 truncate">
                        {m.homeTeam} vs {m.awayTeam}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">MW{m.matchweek}</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Target Market */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Target Market</label>
              <input
                type="text"
                value={selectedMarketInput}
                onChange={(e) => setSelectedMarketInput(e.target.value)}
                placeholder="e.g. BTTS YES"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900"
              />
              <div className="flex items-center gap-1 flex-wrap pt-0.5">
                {POPULAR_MARKETS.map((mkt) => (
                  <button
                    key={mkt}
                    type="button"
                    onClick={() => setSelectedMarketInput(mkt)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      selectedMarketInput === mkt
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {mkt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Odds & Stake Side-by-Side */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              {/* Odds */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Custom Odds</span>
                  <span className="text-[10px] text-slate-400 font-mono">@{defaultOddsStr}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs font-bold">@</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1.01"
                    value={customOddsInput}
                    onChange={(e) => setCustomOddsInput(e.target.value)}
                    placeholder={defaultOddsStr}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-2 py-1.5 text-xs font-mono font-black text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Stake */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Custom Stake</span>
                  <button
                    type="button"
                    onClick={() => setStakeInputMode(stakeInputMode === 'fixed' ? 'percent' : 'fixed')}
                    className="text-[10px] text-slate-500 hover:text-slate-900 font-mono font-bold cursor-pointer"
                  >
                    {stakeInputMode === 'fixed' ? currency : '%'}
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs font-bold">
                    {stakeInputMode === 'fixed' ? currency : '%'}
                  </span>
                  <input
                    type="number"
                    step={stakeInputMode === 'fixed' ? '1' : '5'}
                    min="1"
                    max={stakeInputMode === 'percent' ? '100' : undefined}
                    value={customStakeInput}
                    onChange={(e) => setCustomStakeInput(e.target.value)}
                    placeholder={
                      stakeInputMode === 'fixed'
                        ? `${formatMoney(
                            (scheduleCalculations.find((c) => c.day === assignModalDay)?.startBalance || 0) *
                              (stakePercent / 100),
                            currency
                          )}`
                        : `${stakePercent}%`
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-2 py-1.5 text-xs font-mono font-black text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAssignModalDay(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAssignedMatch}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmActionModal config={confirmModal} onClose={() => setConfirmModal(null)} />
    </div>
  );
};
