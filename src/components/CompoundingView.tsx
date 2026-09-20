import React, { useState, useMemo, useEffect } from 'react';
import { AppState, ActiveTab } from '../types';
import { formatMoney, getStoredDraft, setStoredDraft } from '../utils/storage';
import {
  Calculator,
  RotateCcw,
  Zap,
  Layers,
  Flame,
  Check
} from 'lucide-react';

interface CompoundingViewProps {
  state: AppState;
  setActiveTab?: (tab: ActiveTab) => void;
}

export type DayStatus = 'PENDING' | 'WON' | 'LOST' | 'SKIPPED';

export interface DayCompoundRow {
  day: number;
  startBalance: number;
  odds: number;
  stakePercent: number;
  stakeAmount: number;
  profit: number;
  endBalance: number;
  cumulativeProfit: number;
  growthPercent: number;
  status: DayStatus;
}

const STANDALONE_COMPOUNDING_KEY = 'btts_standalone_compounding_v4';

interface StandaloneCompoundingState {
  initialCapitalStr: string;
  defaultOddsStr: string;
  reinvestPercentStr: string;
  currency: string;
  customDayOdds: Record<number, number>;
  dayStatuses: Record<number, DayStatus>;
}

export const CompoundingView: React.FC<CompoundingViewProps> = ({ state }) => {
  const appCurrency = state.settings?.currency || 'BDT';
  const initialData = getStoredDraft<StandaloneCompoundingState>(STANDALONE_COMPOUNDING_KEY, {
    initialCapitalStr: '100',
    defaultOddsStr: '1.10',
    reinvestPercentStr: '100',
    currency: appCurrency,
    customDayOdds: {},
    dayStatuses: {},
  });

  const [initialCapitalStr, setInitialCapitalStr] = useState<string>(initialData.initialCapitalStr || '100');
  const [defaultOddsStr, setDefaultOddsStr] = useState<string>(initialData.defaultOddsStr || '1.10');
  const [reinvestPercentStr, setReinvestPercentStr] = useState<string>(initialData.reinvestPercentStr || '100');
  const planCurrency = appCurrency;
  const [customDayOdds, setCustomDayOdds] = useState<Record<number, number>>(initialData.customDayOdds || {});
  const [dayStatuses, setDayStatuses] = useState<Record<number, DayStatus>>(initialData.dayStatuses || {});

  useEffect(() => {
    setStoredDraft(STANDALONE_COMPOUNDING_KEY, {
      initialCapitalStr,
      defaultOddsStr,
      reinvestPercentStr,
      currency: planCurrency,
      customDayOdds,
      dayStatuses,
    });
  }, [initialCapitalStr, defaultOddsStr, reinvestPercentStr, planCurrency, customDayOdds, dayStatuses]);

  const initialCapital = Math.max(0, parseFloat(initialCapitalStr) || 0);
  const defaultOdds = Math.max(1.01, parseFloat(defaultOddsStr) || 1.10);
  const reinvestPercent = Math.min(100, Math.max(1, parseFloat(reinvestPercentStr) || 100));

  const compoundingSchedule = useMemo<DayCompoundRow[]>(() => {
    const rows: DayCompoundRow[] = [];
    if (initialCapital <= 0) {
      for (let day = 1; day <= 30; day++) {
        const dayOdds = customDayOdds[day] !== undefined ? customDayOdds[day] : defaultOdds;
        rows.push({
          day,
          startBalance: 0,
          odds: Math.max(1.01, dayOdds),
          stakePercent: reinvestPercent,
          stakeAmount: 0,
          profit: 0,
          endBalance: 0,
          cumulativeProfit: 0,
          growthPercent: 0,
          status: dayStatuses[day] || 'PENDING',
        });
      }
      return rows;
    }

    let currentBalance = initialCapital;

    for (let day = 1; day <= 30; day++) {
      const dayOdds = customDayOdds[day] !== undefined ? customDayOdds[day] : defaultOdds;
      const validOdds = Math.max(1.01, dayOdds);

      const stakeAmount = Number((currentBalance * (reinvestPercent / 100)).toFixed(2));
      const profit = Number((stakeAmount * (validOdds - 1)).toFixed(2));
      const endBalance = Number((currentBalance + profit).toFixed(2));
      const cumulativeProfit = Number((endBalance - initialCapital).toFixed(2));
      const growthPercent = initialCapital > 0 ? Number((((endBalance - initialCapital) / initialCapital) * 100).toFixed(1)) : 0;

      rows.push({
        day,
        startBalance: currentBalance,
        odds: validOdds,
        stakePercent: reinvestPercent,
        stakeAmount,
        profit,
        endBalance,
        cumulativeProfit,
        growthPercent,
        status: dayStatuses[day] || 'PENDING',
      });

      currentBalance = endBalance;
    }

    return rows;
  }, [initialCapital, defaultOdds, reinvestPercent, customDayOdds, dayStatuses]);

  const day30Row = compoundingSchedule[29];
  const finalBalance = day30Row ? day30Row.endBalance : initialCapital;
  const totalProfit = initialCapital > 0 ? finalBalance - initialCapital : 0;
  const totalGrowth = initialCapital > 0 ? ((finalBalance - initialCapital) / initialCapital) * 100 : 0;
  const multiplier = initialCapital > 0 ? (finalBalance / initialCapital).toFixed(2) : '0.00';

  const completedDaysCount = Object.values(dayStatuses).filter((s) => s === 'WON').length;
  const progressPercent = Math.round((completedDaysCount / 30) * 100);

  const activeMilestoneBalance = useMemo(() => {
    if (completedDaysCount === 0) return initialCapital;
    const lastWonRow = compoundingSchedule[completedDaysCount - 1];
    return lastWonRow ? lastWonRow.endBalance : initialCapital;
  }, [completedDaysCount, compoundingSchedule, initialCapital]);

  const handleOddsChangeForDay = (day: number, valStr: string) => {
    const num = parseFloat(valStr);
    setCustomDayOdds((prev) => {
      if (isNaN(num) || num < 1.01) {
        const next = { ...prev };
        delete next[day];
        return next;
      }
      return { ...prev, [day]: num };
    });
  };

  const toggleDayStatus = (day: number) => {
    setDayStatuses((prev) => {
      const current = prev[day] || 'PENDING';
      let nextStatus: DayStatus = 'PENDING';
      if (current === 'PENDING') nextStatus = 'WON';
      else if (current === 'WON') nextStatus = 'SKIPPED';
      else if (current === 'SKIPPED') nextStatus = 'LOST';
      else nextStatus = 'PENDING';

      return { ...prev, [day]: nextStatus };
    });
  };

  const handleResetChallenge = () => {
    if (window.confirm('Reset all 30-day tracking statuses and custom odds?')) {
      setCustomDayOdds({});
      setDayStatuses({});
    }
  };

  const handleApplyPreset = (capital: string, odds: string, reinvest: string) => {
    setInitialCapitalStr(capital);
    setDefaultOddsStr(odds);
    setReinvestPercentStr(reinvest);
    setCustomDayOdds({});
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-36 sm:pb-40">
      {/* Header Bar */}
      <div className="solid-card p-5 sm:p-6 bg-white border border-red-100 rounded-2xl space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                30-Day Compounding Calculator
              </h1>
            </div>
          </div>

          {/* Quick Odds & Reset */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 mr-1">Odds:</span>
            {[1.10, 1.15, 1.20, 1.25, 1.30].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setDefaultOddsStr(val.toFixed(2));
                  setCustomDayOdds({});
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  defaultOddsStr === val.toFixed(2) && Object.keys(customDayOdds).length === 0
                    ? 'bg-red-600 text-white border-red-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-red-400'
                }`}
              >
                @{val.toFixed(2)}
              </button>
            ))}
            <button
              type="button"
              onClick={handleResetChallenge}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1 ml-1 cursor-pointer shadow-xs"
              title="Reset Challenge"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-500 font-bold whitespace-nowrap text-[11px] flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-red-500" /> Presets:
          </span>
          <button
            type="button"
            onClick={() => handleApplyPreset('100', '1.10', '100')}
            className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 hover:border-red-300 hover:text-red-700 text-slate-700 whitespace-nowrap cursor-pointer text-xs font-medium"
          >
            $100 @ 1.10 (17.4x)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('50', '1.15', '100')}
            className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 hover:border-red-300 hover:text-red-700 text-slate-700 whitespace-nowrap cursor-pointer text-xs font-medium"
          >
            $50 @ 1.15 (66.2x)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('500', '1.10', '100')}
            className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 hover:border-red-300 hover:text-red-700 text-slate-700 whitespace-nowrap cursor-pointer text-xs font-medium"
          >
            $500 @ 1.10 (17.4x)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('1000', '1.10', '70')}
            className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 hover:border-red-300 hover:text-red-700 text-slate-700 whitespace-nowrap cursor-pointer text-xs font-medium"
          >
            $1,000 @ 70% Reinvest
          </button>
        </div>
      </div>

      {/* Input Parameters */}
      <div className="solid-card p-5 bg-white border border-red-100 rounded-2xl space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-red-600" />
            <span>Parameters</span>
          </h2>
          {Object.keys(customDayOdds).length > 0 && (
            <button
              type="button"
              onClick={() => setCustomDayOdds({})}
              className="text-[11px] text-red-600 hover:text-red-700 underline cursor-pointer font-bold"
            >
              Reset {Object.keys(customDayOdds).length} custom odds
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">
              Initial Capital
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                {planCurrency}
              </span>
              <input
                type="number"
                value={initialCapitalStr}
                onChange={(e) => setInitialCapitalStr(e.target.value)}
                placeholder="100"
                min="1"
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 pl-6 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-red-500 shadow-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">
              Daily Target Odds
            </label>
            <input
              type="number"
              step="0.01"
              min="1.01"
              value={defaultOddsStr}
              onChange={(e) => setDefaultOddsStr(e.target.value)}
              placeholder="1.10"
              className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-red-500 shadow-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">
              Reinvest Stake %
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="100"
                value={reinvestPercentStr}
                onChange={(e) => setReinvestPercentStr(e.target.value)}
                placeholder="100"
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 pr-6 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-red-500 shadow-xs"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">
              Currency
            </label>
            <div className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 flex items-center justify-between shadow-xs">
              <span>{planCurrency}</span>
              <span className="text-[10px] text-slate-500 font-mono">FIXED</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-0.5 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Initial Capital</span>
          <div className="text-base sm:text-lg font-black font-mono text-slate-900">
            {formatMoney(initialCapital, planCurrency)}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-0.5 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Day 30 Target</span>
          <div className="text-base sm:text-lg font-black font-mono text-slate-900">
            {formatMoney(finalBalance, planCurrency)}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-0.5 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Net Profit</span>
          <div className="text-base sm:text-lg font-black font-mono text-emerald-700">
            +{formatMoney(totalProfit, planCurrency)}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-0.5 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Progress</span>
          <div className="text-base sm:text-lg font-black font-mono text-slate-900 flex items-center gap-1">
            <span>{completedDaysCount}/30</span>
            <span className="text-xs text-slate-500 font-bold">({progressPercent}%)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1 border border-slate-200">
            <div
              className="bg-red-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 p-3.5 rounded-xl bg-white border border-slate-200 space-y-0.5 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Milestone</span>
          <div className="text-base sm:text-lg font-black font-mono text-slate-900">
            {formatMoney(activeMilestoneBalance, planCurrency)}
          </div>
        </div>
      </div>

      {/* 30-Day Table */}
      <div className="solid-card p-5 bg-white border border-red-100 rounded-2xl space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-red-100 pb-2.5">
          <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
            <Layers className="w-4 h-4 text-red-600" />
            <span>30-Day Milestone Breakdown</span>
          </h3>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1 shadow-xs">
            <Check className="w-3.5 h-3.5 text-emerald-600" /> Won: {completedDaysCount}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-2.5">Day</th>
                <th className="py-2.5 px-2.5">Start</th>
                <th className="py-2.5 px-2.5 min-w-[85px]">Odds</th>
                <th className="py-2.5 px-2.5">Stake ({reinvestPercent}%)</th>
                <th className="py-2.5 px-2.5">Profit</th>
                <th className="py-2.5 px-2.5">End</th>
                <th className="py-2.5 px-2.5">Cumulative</th>
                <th className="py-2.5 px-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {compoundingSchedule.map((row) => {
                const isCustom = customDayOdds[row.day] !== undefined;
                const isWon = row.status === 'WON';
                const isLost = row.status === 'LOST';
                const isSkipped = row.status === 'SKIPPED';

                return (
                  <tr
                    key={row.day}
                    className={`transition-colors ${
                      isWon
                        ? 'bg-emerald-50/60 border-l-4 border-l-emerald-500'
                        : isLost
                        ? 'bg-rose-50/60 border-l-4 border-l-rose-500'
                        : isSkipped
                        ? 'bg-slate-50'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-2 px-2.5">
                      <span
                        className={`w-6 h-6 rounded-md inline-flex items-center justify-center font-black font-mono text-xs ${
                          isWon
                            ? 'bg-emerald-600 text-white'
                            : isLost
                            ? 'bg-rose-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-700 shadow-xs'
                        }`}
                      >
                        {String(row.day).padStart(2, '0')}
                      </span>
                    </td>

                    <td className="py-2 px-2.5 font-mono text-slate-800 font-bold">
                      {formatMoney(row.startBalance, planCurrency)}
                    </td>

                    <td className="py-2 px-2.5">
                      <input
                        type="number"
                        step="0.01"
                        min="1.01"
                        value={customDayOdds[row.day] !== undefined ? customDayOdds[row.day] : row.odds}
                        onChange={(e) => handleOddsChangeForDay(row.day, e.target.value)}
                        className={`w-16 bg-white border rounded px-1.5 py-0.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-red-500 shadow-xs ${
                          isCustom ? 'border-amber-400 text-amber-700' : 'border-slate-300'
                        }`}
                      />
                    </td>

                    <td className="py-2 px-2.5 font-mono text-slate-600">
                      {formatMoney(row.stakeAmount, planCurrency)}
                    </td>

                    <td className="py-2 px-2.5 font-mono font-black text-emerald-600">
                      +{formatMoney(row.profit, planCurrency)}
                    </td>

                    <td className="py-2 px-2.5 font-mono font-black text-slate-900 bg-slate-50 rounded">
                      {formatMoney(row.endBalance, planCurrency)}
                    </td>

                    <td className="py-2 px-2.5 font-mono text-red-600 font-bold">
                      +{formatMoney(row.cumulativeProfit, planCurrency)}
                      <span className="text-[10px] text-slate-500 ml-1 font-bold">
                        ({row.growthPercent}%)
                      </span>
                    </td>

                    <td className="py-2 px-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => toggleDayStatus(row.day)}
                        className={`px-2.5 py-0.5 rounded text-[10px] font-black border transition-all cursor-pointer shadow-xs ${
                          isWon
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : isLost
                            ? 'bg-rose-600 text-white border-rose-600'
                            : isSkipped
                            ? 'bg-slate-200 text-slate-700 border-slate-300'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-red-500 hover:text-red-700'
                        }`}
                      >
                        {row.status}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
