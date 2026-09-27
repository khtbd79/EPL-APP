import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppState, ActiveTab } from '../types';
import { formatMoney, getStoredDraft, setStoredDraft } from '../utils/storage';
import { ConfirmActionModal, ConfirmModalConfig } from './ConfirmActionModal';
import { EPL_2026_27_FIXTURES, EPLFixture } from '../data/eplFixtures2026_27';
import {
  TrendingUp,
  RotateCcw,
  Zap,
  Layers,
  Flame,
  Check,
  X,
  Clock,
  Search,
  ChevronRight,
  Filter,
  DollarSign,
  Calendar,
  Percent,
  Trophy,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Sparkles
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

const COMMON_MARKETS = [
  'BTTS YES',
  'Over 1.5 Goals',
  'Over 2.5 Goals',
  'Home Win',
  'Away Win',
  'Draw',
  '1X (Home or Draw)',
  'X2 (Away or Draw)',
  'Under 3.5 Goals',
  'Under 2.5 Goals',
];

export const CompoundingView: React.FC<CompoundingViewProps> = ({ state }) => {
  const currency = state.settings?.currency || 'BDT';

  // Load stored compounding state or initialize defaults (100 deposit, 90 days, 10% daily rate / 1.10 odds)
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
  const [activePageChunk, setActivePageChunk] = useState<number>(1); // 1 = 1-30, 2 = 31-60, 3 = 61-90, etc.
  const [confirmModal, setConfirmModal] = useState<ConfirmModalConfig | null>(null);

  // Match Assignment Modal State
  const [assignModalDay, setAssignModalDay] = useState<number | null>(null);
  const [fixtureSearch, setFixtureSearch] = useState('');
  const [customMatchInput, setCustomMatchInput] = useState('');
  const [selectedMarketInput, setSelectedMarketInput] = useState('');
  const [customOddsInput, setCustomOddsInput] = useState('');

  const activeTaskEl = useRef<HTMLElement | null>(null);
  const setActiveTaskRef = (el: HTMLElement | null) => {
    activeTaskEl.current = el;
  };

  // Synchronize Daily Rate % and Target Odds when changed
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

  // Persist compounding state on change
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

  // Flatten EPL fixtures for quick selection
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
   * CORE COMPOUNDING ENGINE:
   * Dynamically compounds day-by-day.
   * If a day is WIN: Potential profit is added to balance.
   * If a day is LOSS: The stake amount is deducted from balance.
   * SUBSEQUENT DAYS AUTOMATICALLY RECALCULATE ON THE NEW REMAINING BALANCE!
   */
  const scheduleCalculations = useMemo<DayCompoundingCalculation[]>(() => {
    const list: DayCompoundingCalculation[] = [];
    const daysLimit = Math.max(1, Math.min(365, totalDays || 90));

    let currentBalance = initialDeposit;

    for (let day = 1; day <= daysLimit; day++) {
      const task = tasks[day] || { day, status: 'PENDING' };
      const dayOdds = task.customOdds !== undefined && task.customOdds >= 1.01 ? task.customOdds : defaultOdds;
      const dayStakePercent = task.customStakePercent !== undefined ? task.customStakePercent : stakePercent;

      const startBalance = Number(currentBalance.toFixed(2));
      const stakeAmount = Number((startBalance * (dayStakePercent / 100)).toFixed(2));
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
        // PENDING: For forward projection, assume target profit is reached
        endBalance = Number((startBalance + potentialProfit).toFixed(2));
      }

      const cumulativeProfit = Number((endBalance - initialDeposit).toFixed(2));
      const growthPercent = initialDeposit > 0
        ? Number((((endBalance - initialDeposit) / initialDeposit) * 100).toFixed(1))
        : 0;

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
      });

      // Pass the resulting balance forward to the next day!
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

    // Realized live balance: the end balance of the latest settled day, or initial deposit if none settled
    let liveBalance = initialDeposit;
    for (let i = 0; i < scheduleCalculations.length; i++) {
      if (scheduleCalculations[i].isSettled) {
        liveBalance = scheduleCalculations[i].endBalance;
      }
    }

    const realizedNetPnL = liveBalance - initialDeposit;
    const finalProjectedBalance = scheduleCalculations.length > 0 ? scheduleCalculations[scheduleCalculations.length - 1].endBalance : initialDeposit;
    const projectedProfit = finalProjectedBalance - initialDeposit;
    const projectedMultiplier = initialDeposit > 0 ? (finalProjectedBalance / initialDeposit).toFixed(2) : '0.00';

    // First pending day index (the current active challenge day)
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

  // Handlers for Day Task Status
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

  // Open Assign Match Modal for a specific day
  const handleOpenAssignModal = (day: number) => {
    const existing = tasks[day];
    setAssignModalDay(day);
    setFixtureSearch('');
    setCustomMatchInput(existing?.matchName || '');
    setSelectedMarketInput(existing?.market || 'BTTS YES');
    setCustomOddsInput(existing?.customOdds !== undefined ? String(existing.customOdds) : '');
  };

  // Save Assigned Match
  const handleSaveAssignedMatch = () => {
    if (assignModalDay === null) return;
    const parsedOdds = parseFloat(customOddsInput);
    const validOdds = !isNaN(parsedOdds) && parsedOdds >= 1.01 ? parsedOdds : undefined;

    setTasks((prev) => {
      const existing = prev[assignModalDay] || { day: assignModalDay, status: 'PENDING' };
      return {
        ...prev,
        [assignModalDay]: {
          ...existing,
          matchName: customMatchInput.trim() || undefined,
          market: selectedMarketInput.trim() || undefined,
          customOdds: validOdds,
        },
      };
    });

    setAssignModalDay(null);
  };

  // Clear Assigned Match for a day
  const handleClearAssignedMatch = (day: number) => {
    setTasks((prev) => {
      const existing = prev[day];
      if (!existing) return prev;
      const copy = { ...existing };
      delete copy.matchName;
      delete copy.matchId;
      delete copy.matchDate;
      delete copy.market;
      delete copy.customOdds;
      return {
        ...prev,
        [day]: copy,
      };
    });
  };

  // Reset Compounding Plan
  const handleResetPlan = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset Compounding Plan',
      message: 'This will reset all task statuses to PENDING and clear all match assignments. Do you want to proceed?',
      confirmLabel: 'Reset All',
      variant: 'danger',
      onConfirm: () => {
        setTasks({});
      },
    });
  };

  // Quick Preset Configurations
  const handleApplyPreset = (deposit: string, days: number, rate: string, odds: string) => {
    setInitialDepositStr(deposit);
    setTotalDays(days);
    setDailyRateStr(rate);
    setDefaultOddsStr(odds);
    setActivePageChunk(1);
  };

  // Filtered tasks for view
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

  // Pagination chunks for 90 days (30 days per chunk)
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
    <div className="space-y-5 animate-fadeIn pb-36 sm:pb-40 max-w-[1700px] mx-auto">
      {/* Top Banner / Header Bar */}
      <div className="solid-card p-5 sm:p-6 bg-white border border-red-100 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-xs">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  COMPAUNDING
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {totalDays}-Day Plan
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Dynamic daily compound projection with automatic balance recalculation on Win and Loss
              </p>
            </div>
          </div>

          {/* Quick Actions & Presets */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={scrollToActiveTask}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Current Task (Day {stats.firstPendingDay})</span>
            </button>

            <button
              type="button"
              onClick={handleResetPlan}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Reset All Tasks"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Quick Setup Presets Bar */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <span className="text-slate-500 font-bold whitespace-nowrap text-[11px] flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-red-500" /> Quick Presets:
          </span>
          <button
            type="button"
            onClick={() => handleApplyPreset('100', 90, '10', '1.10')}
            className={`px-3 py-1 rounded-lg border font-semibold whitespace-nowrap cursor-pointer transition-all ${
              initialDepositStr === '100' && totalDays === 90 && defaultOddsStr === '1.10'
                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-red-300 hover:text-red-700'
            }`}
          >
            {currency} 100 • 90 Days @ 10% (5,313x)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('100', 30, '10', '1.10')}
            className={`px-3 py-1 rounded-lg border font-semibold whitespace-nowrap cursor-pointer transition-all ${
              initialDepositStr === '100' && totalDays === 30 && defaultOddsStr === '1.10'
                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-red-300 hover:text-red-700'
            }`}
          >
            {currency} 100 • 30 Days @ 10% (17.4x)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('500', 60, '8', '1.08')}
            className={`px-3 py-1 rounded-lg border font-semibold whitespace-nowrap cursor-pointer transition-all ${
              initialDepositStr === '500' && totalDays === 60 && defaultOddsStr === '1.08'
                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-red-300 hover:text-red-700'
            }`}
          >
            {currency} 500 • 60 Days @ 8% (101x)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('1000', 100, '5', '1.05')}
            className={`px-3 py-1 rounded-lg border font-semibold whitespace-nowrap cursor-pointer transition-all ${
              initialDepositStr === '1000' && totalDays === 100 && defaultOddsStr === '1.05'
                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-red-300 hover:text-red-700'
            }`}
          >
            {currency} 1,000 • 100 Days @ 5% (131x)
          </button>
        </div>
      </div>

      {/* Main Parameters Configuration Card */}
      <div className="solid-card p-5 bg-white border border-red-100 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-red-600" />
            <span>Compounding Parameters</span>
          </h2>
          <span className="text-[11px] font-bold text-slate-500">
            Currency: <span className="text-slate-900 font-mono font-black">{currency}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          {/* Initial Deposit Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-slate-500" />
              <span>Initial Deposit</span>
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold font-mono">
                {currency}
              </span>
              <input
                type="number"
                min="1"
                step="1"
                value={initialDepositStr}
                onChange={(e) => setInitialDepositStr(e.target.value)}
                placeholder="100"
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 pl-11 text-xs font-mono font-black text-slate-900 focus:outline-none focus:border-red-500 shadow-xs"
              />
            </div>
          </div>

          {/* Total Days Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Target Days</span>
            </label>
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
              className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-mono font-black text-slate-900 focus:outline-none focus:border-red-500 shadow-xs"
            />
          </div>

          {/* Daily Compounding Rate % */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-slate-500" />
              <span>Daily Rate (%)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={dailyRateStr}
                onChange={(e) => handleDailyRateChange(e.target.value)}
                placeholder="10"
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 pr-6 text-xs font-mono font-black text-slate-900 focus:outline-none focus:border-red-500 shadow-xs"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
            </div>
          </div>

          {/* Target Odds */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
              <span>Target Odds</span>
            </label>
            <input
              type="number"
              min="1.01"
              step="0.01"
              value={defaultOddsStr}
              onChange={(e) => handleDefaultOddsChange(e.target.value)}
              placeholder="1.10"
              className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-mono font-black text-slate-900 focus:outline-none focus:border-red-500 shadow-xs"
            />
          </div>

          {/* Reinvest Stake % */}
          <div className="col-span-2 md:col-span-1 space-y-1">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Reinvest Stake (%)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="100"
                step="5"
                value={stakePercentStr}
                onChange={(e) => setStakePercentStr(e.target.value)}
                placeholder="100"
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 pr-6 text-xs font-mono font-black text-slate-900 focus:outline-none focus:border-red-500 shadow-xs"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
            </div>
          </div>
        </div>

        {/* Days Presets */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] font-bold text-slate-500 mr-1">Period Presets:</span>
          {[30, 60, 90, 100, 180].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setTotalDays(d);
                setActivePageChunk(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                totalDays === d
                  ? 'bg-red-600 text-white border-red-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-red-400'
              }`}
            >
              {d} Days
            </button>
          ))}
          <span className="text-[11px] font-bold text-slate-500 mx-1">| Odds:</span>
          {[1.05, 1.08, 1.10, 1.15, 1.20].map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => handleDefaultOddsChange(o.toFixed(2))}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                defaultOddsStr === o.toFixed(2)
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-400'
              }`}
            >
              @{o.toFixed(2)}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards: Live Real-Time & Projected Milestones */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Initial Deposit */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Initial Deposit</span>
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-slate-900">
            {formatMoney(initialDeposit, currency)}
          </div>
          <span className="text-[10px] text-slate-500 font-bold block">Starting Capital</span>
        </div>

        {/* Current Live Balance */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Balance</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className={`text-lg sm:text-xl font-black font-mono ${stats.liveBalance >= initialDeposit ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatMoney(stats.liveBalance, currency)}
          </div>
          <span className="text-[10px] font-bold text-slate-500 block">
            P&L: <span className={stats.realizedNetPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
              {stats.realizedNetPnL >= 0 ? '+' : ''}{formatMoney(stats.realizedNetPnL, currency)}
            </span>
          </span>
        </div>

        {/* Final Target Balance (Day N) */}
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">Day {totalDays} Target</span>
            <Trophy className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-emerald-700">
            {formatMoney(stats.finalProjectedBalance, currency)}
          </div>
          <span className="text-[10px] text-emerald-800 font-bold block">
            +{formatMoney(stats.projectedProfit, currency)} ({stats.projectedMultiplier}x)
          </span>
        </div>

        {/* Progress Tracker */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completed Tasks</span>
            <Check className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-slate-900 flex items-center gap-1.5">
            <span>{stats.settledCount}/{totalDays}</span>
            <span className="text-xs text-slate-500 font-bold">({stats.progressPercent}%)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Win / Loss Record */}
        <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Record & Win Rate</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">{stats.winRate}%</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold font-mono">
            <span className="text-emerald-600 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> {stats.wonCount} W
            </span>
            <span className="text-rose-600 flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> {stats.lostCount} L
            </span>
            <span className="text-amber-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {stats.pendingCount} P
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-bold block">
            Next: <span className="text-slate-900 font-black">Day {stats.firstPendingDay}</span>
          </span>
        </div>
      </div>

      {/* Control Toolbar: Filter, Search, Pagination Chunks, View Mode */}
      <div className="solid-card p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {(['ALL', 'PENDING', 'WIN', 'LOSS'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                filterStatus === st
                  ? st === 'WIN'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : st === 'LOSS'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : st === 'PENDING'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {st}
              {st === 'WIN' && ` (${stats.wonCount})`}
              {st === 'LOSS' && ` (${stats.lostCount})`}
              {st === 'PENDING' && ` (${stats.pendingCount})`}
            </button>
          ))}
        </div>

        {/* Search & View Toggle */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search day or match..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 shadow-xs"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Line by Line
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* Pagination Chunks Bar (e.g. Days 1-30, 31-60, 61-90) */}
      {totalChunks > 1 && (
        <div className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-xl shadow-xs">
          <span className="text-xs font-bold text-slate-500">
            Viewing Period:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
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
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Days {startDay} - {endDay}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* View: Task Cards View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {chunkedSchedule.map((row) => {
            const isFirstPending = row.day === stats.firstPendingDay;
            const isWon = row.status === 'WIN';
            const isLost = row.status === 'LOSS';
            const isPending = row.status === 'PENDING';

            return (
              <div
                key={row.day}
                ref={isFirstPending ? setActiveTaskRef : undefined}
                className={`solid-card p-4 rounded-2xl border transition-all shadow-sm space-y-3 relative ${
                  isWon
                    ? 'bg-emerald-50/40 border-emerald-300'
                    : isLost
                    ? 'bg-rose-50/40 border-rose-300'
                    : isFirstPending
                    ? 'bg-white border-amber-400 ring-2 ring-amber-400/40'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Task Header: Day Number, Assigned Match, Status Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-black font-mono text-xs shadow-xs ${
                        isWon
                          ? 'bg-emerald-600 text-white'
                          : isLost
                          ? 'bg-rose-600 text-white'
                          : isFirstPending
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 border border-slate-300 text-slate-800'
                      }`}
                    >
                      D{String(row.day).padStart(2, '0')}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900">
                          Day {row.day} Task
                        </span>
                        {isFirstPending && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">
                            Current
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono font-bold block">
                        Start: {formatMoney(row.startBalance, currency)}
                      </span>
                    </div>
                  </div>

                  {/* STATUS BUTTONS: PENDING, WIN, LOSS in front of each task */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-xs">
                    <button
                      type="button"
                      onClick={() => handleSetTaskStatus(row.day, 'PENDING')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                        isPending
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Mark Pending"
                    >
                      <Clock className="w-3 h-3" />
                      <span>PENDING</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetTaskStatus(row.day, 'WIN')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                        isWon
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-emerald-700'
                      }`}
                      title="Mark Win"
                    >
                      <Check className="w-3 h-3" />
                      <span>WIN</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetTaskStatus(row.day, 'LOSS')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                        isLost
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-rose-700'
                      }`}
                      title="Mark Loss"
                    >
                      <X className="w-3 h-3" />
                      <span>LOSS</span>
                    </button>
                  </div>
                </div>

                {/* Match Assignment Section */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {row.matchName ? (
                      <div>
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {row.matchName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-bold text-[10px]">
                            {row.market || 'Selected Market'}
                          </span>
                          <span className="font-mono font-bold text-red-600">@{row.odds.toFixed(2)}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium italic">
                        No match assigned yet
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenAssignModal(row.day)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-xs transition-all cursor-pointer"
                    >
                      {row.matchName ? 'Edit Match' : 'Assign Match'}
                    </button>
                    {row.matchName && (
                      <button
                        type="button"
                        onClick={() => handleClearAssignedMatch(row.day)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Remove Match"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Financial Summary of the Day */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Stake ({row.stakePercent}%)</span>
                    <span className="font-mono font-black text-slate-900">
                      {formatMoney(row.stakeAmount, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      {isLost ? 'Lost Amount' : 'Profit'}
                    </span>
                    <span className={`font-mono font-black ${isLost ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {isLost ? `-${formatMoney(row.realizedLoss, currency)}` : `+${formatMoney(row.potentialProfit, currency)}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">End Balance</span>
                    <span className="font-mono font-black text-slate-900">
                      {formatMoney(row.endBalance, currency)}
                    </span>
                  </div>
                </div>

                {/* Progress / Cumulative Growth */}
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-1">
                  <span>Growth: {row.growthPercent >= 0 ? `+${row.growthPercent}%` : `${row.growthPercent}%`}</span>
                  <span>
                    Cumulative P&L: <span className={row.cumulativeProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {row.cumulativeProfit >= 0 ? '+' : ''}{formatMoney(row.cumulativeProfit, currency)}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* View: Comprehensive Line-by-Line Table View */
        <div className="solid-card p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
                <Layers className="w-4 h-4 text-red-600" />
                <span>Line-by-Line Compounding Task Sheet</span>
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-bold">
              Showing {chunkedSchedule.length} of {scheduleCalculations.length} days
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-700 font-black uppercase tracking-wider border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="py-3 px-3 w-16">Day</th>
                  <th className="py-3 px-3">Start Balance</th>
                  <th className="py-3 px-3 min-w-[200px]">Assigned Match & Market</th>
                  <th className="py-3 px-2 text-center w-16">Odds</th>
                  <th className="py-3 px-3">Stake</th>
                  <th className="py-3 px-3">Profit / Loss</th>
                  <th className="py-3 px-3">End Balance</th>
                  <th className="py-3 px-3">Cumulative Growth</th>
                  <th className="py-3 px-3 text-center min-w-[210px]">Task Status</th>
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
                          ? 'bg-emerald-50/60 hover:bg-emerald-50'
                          : isLost
                          ? 'bg-rose-50/60 hover:bg-rose-50'
                          : isCurrent
                          ? 'bg-amber-50/70 hover:bg-amber-50'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Day Number */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center font-black font-mono text-xs shadow-xs ${
                              isWon
                                ? 'bg-emerald-600 text-white'
                                : isLost
                                ? 'bg-rose-600 text-white'
                                : isCurrent
                                ? 'bg-amber-500 text-white'
                                : 'bg-slate-100 border border-slate-300 text-slate-800'
                            }`}
                          >
                            D{String(row.day).padStart(2, '0')}
                          </span>
                          {isCurrent && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                          )}
                        </div>
                      </td>

                      {/* Start Balance */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {formatMoney(row.startBalance, currency)}
                      </td>

                      {/* Match Assignment */}
                      <td className="py-3 px-3">
                        {row.matchName ? (
                          <div className="flex items-center justify-between gap-2 max-w-xs">
                            <div className="truncate">
                              <div className="font-bold text-slate-900 truncate">
                                {row.matchName}
                              </div>
                              <span className="text-[10px] text-slate-500 font-semibold truncate block">
                                {row.market || 'Target Market'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenAssignModal(row.day)}
                              className="text-[10px] font-bold text-slate-500 hover:text-red-600 px-1.5 py-0.5 rounded border border-slate-200 bg-white cursor-pointer shrink-0"
                            >
                              Edit
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenAssignModal(row.day)}
                            className="text-[11px] font-bold text-red-600 hover:text-red-700 underline cursor-pointer flex items-center gap-1"
                          >
                            <span>+ Assign Match</span>
                          </button>
                        )}
                      </td>

                      {/* Odds */}
                      <td className="py-3 px-2 text-center font-mono font-bold text-slate-800">
                        @{row.odds.toFixed(2)}
                      </td>

                      {/* Stake Amount */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        {formatMoney(row.stakeAmount, currency)}
                      </td>

                      {/* Realized Profit / Loss */}
                      <td className={`py-3 px-3 font-mono font-black ${isLost ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {isLost
                          ? `-${formatMoney(row.realizedLoss, currency)}`
                          : isWon
                          ? `+${formatMoney(row.realizedProfit, currency)}`
                          : `+${formatMoney(row.potentialProfit, currency)} (est)`}
                      </td>

                      {/* End Balance */}
                      <td className="py-3 px-3 font-mono font-black text-slate-900">
                        {formatMoney(row.endBalance, currency)}
                      </td>

                      {/* Cumulative Growth */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">
                        <span className={row.cumulativeProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {row.cumulativeProfit >= 0 ? '+' : ''}{formatMoney(row.cumulativeProfit, currency)}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1.5 font-bold">
                          ({row.growthPercent >= 0 ? `+${row.growthPercent}%` : `${row.growthPercent}%`})
                        </span>
                      </td>

                      {/* TASK STATUS BUTTONS (PENDING, WIN, LOSS) at the very end of each line */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-xs">
                          <button
                            type="button"
                            onClick={() => handleSetTaskStatus(row.day, 'PENDING')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                              isPending
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                            title="Mark as Pending"
                          >
                            <Clock className="w-3 h-3" />
                            <span>PENDING</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetTaskStatus(row.day, 'WIN')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                              isWon
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-emerald-700'
                            }`}
                            title="Mark as Win"
                          >
                            <Check className="w-3 h-3" />
                            <span>WIN</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetTaskStatus(row.day, 'LOSS')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                              isLost
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-rose-700'
                            }`}
                            title="Mark as Loss"
                          >
                            <X className="w-3 h-3" />
                            <span>LOSS</span>
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
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setAssignModalDay(null)}
        >
          <div
            className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center font-black font-mono text-xs">
                  D{String(assignModalDay).padStart(2, '0')}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    Assign Match for Day {assignModalDay}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Select an official Premier League fixture or enter custom match details
                  </p>
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

            {/* Custom Match Name Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Match Title / Teams
              </label>
              <input
                type="text"
                value={customMatchInput}
                onChange={(e) => setCustomMatchInput(e.target.value)}
                placeholder="e.g. Arsenal vs Chelsea"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-500 shadow-xs"
              />
            </div>

            {/* Quick Pick from Official EPL 2026/27 Fixtures */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Select from EPL Fixtures</span>
                <span className="text-[10px] text-slate-400 font-medium">Search club or matchweek</span>
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fixtureSearch}
                  onChange={(e) => setFixtureSearch(e.target.value)}
                  placeholder="Filter fixtures (e.g. Arsenal, Liverpool)..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 shadow-xs"
                />
              </div>

              {/* Scrollable Fixture Matches List */}
              <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
                {allEplFixtures
                  .filter((m) => {
                    if (!fixtureSearch.trim()) return m.matchweek <= 3; // Show initial matchweeks by default
                    const q = fixtureSearch.toLowerCase();
                    return m.homeTeam.toLowerCase().includes(q) || m.awayTeam.toLowerCase().includes(q) || `mw ${m.matchweek}`.includes(q);
                  })
                  .slice(0, 15)
                  .map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setCustomMatchInput(`${m.homeTeam} vs ${m.awayTeam}`);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-red-50 transition-colors flex items-center justify-between cursor-pointer group text-xs"
                    >
                      <div className="truncate">
                        <span className="font-bold text-slate-900 group-hover:text-red-700">
                          {m.homeTeam} vs {m.awayTeam}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          MW {m.matchweek} • {m.dateStr}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 shrink-0" />
                    </button>
                  ))}
              </div>
            </div>

            {/* Market Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Target Market / Selection
              </label>
              <input
                type="text"
                value={selectedMarketInput}
                onChange={(e) => setSelectedMarketInput(e.target.value)}
                placeholder="e.g. BTTS YES or Over 1.5 Goals"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-500 shadow-xs"
              />
              {/* Quick Market Pills */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {COMMON_MARKETS.map((mkt) => (
                  <button
                    key={mkt}
                    type="button"
                    onClick={() => setSelectedMarketInput(mkt)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      selectedMarketInput === mkt
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {mkt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Odds for this Specific Day */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Specific Odds for Day {assignModalDay} (Optional)</span>
                <span className="text-[10px] text-slate-500 font-mono">Default: @{defaultOddsStr}</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="1.01"
                value={customOddsInput}
                onChange={(e) => setCustomOddsInput(e.target.value)}
                placeholder={defaultOddsStr}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-red-500 shadow-xs"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAssignModalDay(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAssignedMatch}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-all cursor-pointer"
              >
                Save Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmActionModal
        config={confirmModal}
        onClose={() => setConfirmModal(null)}
      />
    </div>
  );
};
