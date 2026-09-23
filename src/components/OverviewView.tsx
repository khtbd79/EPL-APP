import React, { useState, useMemo } from 'react';
import { AppState } from '../types';
import { formatMoney } from '../utils/storage';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Download,
  Printer,
  Filter,
  Search,
  Layers,
  RotateCcw,
} from 'lucide-react';

interface OverviewViewProps {
  state: AppState;
  onDeleteMatch: (id: string) => void;
  onNavigateTab?: (tab: any) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  state,
  onDeleteMatch,
  onNavigateTab,
}) => {
  const currency = state.settings.currency || 'BDT';
  const matchHistory = state.matchHistory || [];

  // Filter States
  const [selectedWeek, setSelectedWeek] = useState<string>('ALL');
  const [selectedMarket, setSelectedMarket] = useState<string>('ALL');
  const [selectedResult, setSelectedResult] = useState<'ALL' | 'WIN' | 'LOSS' | 'PENDING'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Extract all available matchweeks from records
  const availableMatchweeks = useMemo(() => {
    const weeksSet = new Set<number>();
    matchHistory.forEach((m) => {
      if (m.matchweek && m.matchweek > 0) {
        weeksSet.add(m.matchweek);
      }
    });
    return Array.from(weeksSet).sort((a, b) => a - b);
  }, [matchHistory]);

  // Extract all unique markets from records
  const availableMarkets = useMemo(() => {
    const marketSet = new Set<string>();
    matchHistory.forEach((m) => {
      if (m.market) {
        marketSet.add(m.market.trim());
      }
    });
    return Array.from(marketSet).sort();
  }, [matchHistory]);

  // Filtered list
  const filteredMatches = useMemo(() => {
    return matchHistory.filter((m) => {
      // Week filter
      if (selectedWeek !== 'ALL') {
        const weekNum = parseInt(selectedWeek, 10);
        if (m.matchweek !== weekNum) return false;
      }

      // Market filter
      if (selectedMarket !== 'ALL') {
        if (m.market?.trim() !== selectedMarket) return false;
      }

      // Result filter
      if (selectedResult !== 'ALL') {
        if (m.result !== selectedResult) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const home = m.homeTeam?.toLowerCase() || '';
        const away = m.awayTeam?.toLowerCase() || '';
        const market = m.market?.toLowerCase() || '';
        const notes = m.notes?.toLowerCase() || '';
        const weekStr = m.matchweek ? `week ${m.matchweek} mw ${m.matchweek}` : '';
        if (!home.includes(q) && !away.includes(q) && !market.includes(q) && !notes.includes(q) && !weekStr.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [matchHistory, selectedWeek, selectedMarket, selectedResult, searchQuery]);

  // Aggregate Metrics for the current filtered view
  const metrics = useMemo(() => {
    let wonCount = 0;
    let lostCount = 0;
    let pendingCount = 0;
    let totalStake = 0;
    let totalWonProfit = 0;
    let totalLossAmount = 0;

    filteredMatches.forEach((m) => {
      const stake = Number(m.stake) || 0;
      totalStake += stake;

      if (m.result === 'WIN') {
        wonCount++;
        const profit = m.profit > 0 ? m.profit : (m.odds > 1 && stake > 0 ? stake * (m.odds - 1) : 0);
        totalWonProfit += profit;
      } else if (m.result === 'LOSS') {
        lostCount++;
        const loss = m.loss > 0 ? m.loss : stake;
        totalLossAmount += loss;
      } else if (m.result === 'PENDING') {
        pendingCount++;
      }
    });

    const settledCount = wonCount + lostCount;
    const winRate = settledCount > 0 ? Number(((wonCount / settledCount) * 100).toFixed(1)) : 0;
    const netPnL = Number((totalWonProfit - totalLossAmount).toFixed(2));

    return {
      totalCount: filteredMatches.length,
      wonCount,
      lostCount,
      pendingCount,
      winRate,
      totalStake: Number(totalStake.toFixed(2)),
      totalWonProfit: Number(totalWonProfit.toFixed(2)),
      totalLossAmount: Number(totalLossAmount.toFixed(2)),
      netPnL,
    };
  }, [filteredMatches]);

  // Handle Delete Match
  const handleDelete = (id: string) => {
    onDeleteMatch(id);
    setDeleteConfirmId(null);
  };

  // Download CSV
  const handleDownloadCSV = () => {
    if (filteredMatches.length === 0) return;

    const headers = [
      'Matchweek',
      'Date',
      'Time',
      'Home Team',
      'Away Team',
      'Market',
      'Odds',
      'Stake',
      'Result',
      'Net PnL',
      'Profit',
      'Loss',
      'Currency',
      'Notes',
    ];

    const rows = filteredMatches.map((m) => {
      const week = m.matchweek ? `MW ${m.matchweek}` : 'N/A';
      const date = m.date || '';
      const time = m.matchTime || '';
      const home = `"${(m.homeTeam || '').replace(/"/g, '""')}"`;
      const away = `"${(m.awayTeam || '').replace(/"/g, '""')}"`;
      const market = `"${(m.market || '').replace(/"/g, '""')}"`;
      const odds = m.odds || 0;
      const stake = m.stake || 0;
      const result = m.result;
      const netPnL = m.netPnL || (m.result === 'WIN' ? m.profit : -m.loss);
      const profit = m.profit || 0;
      const loss = m.loss || 0;
      const notes = `"${(m.notes || '').replace(/"/g, '""')}"`;

      return [
        week,
        date,
        time,
        home,
        away,
        market,
        odds,
        stake,
        result,
        netPnL,
        profit,
        loss,
        currency,
        notes,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const weekLabel = selectedWeek === 'ALL' ? 'all_weeks' : `mw_${selectedWeek}`;
    const resultLabel = selectedResult === 'ALL' ? 'all' : selectedResult.toLowerCase();
    link.setAttribute('download', `overview_${weekLabel}_${resultLabel}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print Statement
  const handlePrint = () => {
    window.print();
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedWeek('ALL');
    setSelectedMarket('ALL');
    setSelectedResult('ALL');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedWeek !== 'ALL' || selectedMarket !== 'ALL' || selectedResult !== 'ALL' || searchQuery.trim() !== '';

  return (
    <div className="w-full max-w-6xl 2xl:max-w-7xl mx-auto space-y-6 animate-fadeIn pb-32">
      {/* 1. Header Card */}
      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl border border-sky-200">
            <Layers className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            OVER VIEW
          </h1>
        </div>

        {/* Action Controls: Download CSV & Print */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* 2. Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Matches */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Total Matches</span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-2">
            {metrics.totalCount}
          </div>
        </div>

        {/* Won Matches */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
            <span>Won Matches</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-700 mt-2">
            {metrics.wonCount}
            <span className="text-xs font-semibold ml-2 text-emerald-600">({metrics.winRate}%)</span>
          </div>
        </div>

        {/* Lost Matches */}
        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-rose-700 uppercase tracking-wider">
            <span>Lost Matches</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-700 mt-2">
            {metrics.lostCount}
          </div>
        </div>

        {/* Net Profit / Loss */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Net P&L</span>
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div
            className={`text-2xl font-black font-mono mt-2 ${
              metrics.netPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {metrics.netPnL >= 0 ? '+' : ''}
            {formatMoney(metrics.netPnL, currency)}
          </div>
        </div>

        {/* Total Staked */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Total Staked</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-2">
            {formatMoney(metrics.totalStake, currency)}
          </div>
        </div>
      </div>

      {/* 3. Filter Controls */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-black text-slate-800 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-sky-600" />
            <span>Filters</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Matchweek */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Matchweek
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-sky-500 rounded-xl text-xs font-bold text-slate-800 outline-hidden cursor-pointer"
            >
              <option value="ALL">All Matchweeks</option>
              {availableMatchweeks.length > 0 ? (
                availableMatchweeks.map((w) => (
                  <option key={w} value={String(w)}>
                    Matchweek {w}
                  </option>
                ))
              ) : (
                Array.from({ length: 38 }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={String(w)}>
                    Matchweek {w}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Market */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Market
            </label>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-sky-500 rounded-xl text-xs font-bold text-slate-800 outline-hidden cursor-pointer"
            >
              <option value="ALL">All Markets</option>
              {availableMarkets.map((market) => (
                <option key={market} value={market}>
                  {market}
                </option>
              ))}
            </select>
          </div>

          {/* Result */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Result
            </label>
            <select
              value={selectedResult}
              onChange={(e) => setSelectedResult(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-sky-500 rounded-xl text-xs font-bold text-slate-800 outline-hidden cursor-pointer"
            >
              <option value="ALL">All Results</option>
              <option value="WIN">Won</option>
              <option value="LOSS">Lost</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Team name"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 focus:border-sky-500 rounded-xl text-xs text-slate-800 outline-hidden"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Line-by-Line Match Records List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-4 p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Matches ({filteredMatches.length})
            </h2>
            {selectedWeek !== 'ALL' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 font-mono">
                MW {selectedWeek}
              </span>
            )}
            {selectedResult !== 'ALL' && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                  selectedResult === 'WIN'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedResult === 'LOSS'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {selectedResult}
              </span>
            )}
          </div>
        </div>

        {filteredMatches.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-3">
            <Layers className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-600">No matches found</div>
            {hasActiveFilters ? (
              <button
                onClick={handleResetFilters}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center space-x-1.5 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            ) : onNavigateTab ? (
              <button
                onClick={() => onNavigateTab('select_match')}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center space-x-1.5 shadow-xs"
              >
                <span>Select Match</span>
              </button>
            ) : null}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Week</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Match</th>
                  <th className="py-3 px-3">Market</th>
                  <th className="py-3 px-3 text-right">Odds</th>
                  <th className="py-3 px-3 text-right">Stake</th>
                  <th className="py-3 px-3 text-center">Result</th>
                  <th className="py-3 px-3 text-right">Net P&L</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredMatches.map((m) => {
                  const stake = Number(m.stake) || 0;
                  const odds = Number(m.odds) || 1;
                  const profit = m.profit > 0 ? m.profit : (odds > 1 && stake > 0 ? stake * (odds - 1) : 0);
                  const loss = m.loss > 0 ? m.loss : stake;
                  const isWon = m.result === 'WIN';
                  const isLost = m.result === 'LOSS';
                  const isPending = m.result === 'PENDING';

                  return (
                    <tr
                      key={m.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isWon ? 'bg-emerald-50/20' : isLost ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Week */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-mono font-bold text-[11px]">
                          {m.matchweek ? `MW ${m.matchweek}` : 'MW 1'}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-600">
                        <div className="font-bold text-slate-800">{m.date || 'N/A'}</div>
                        {m.matchTime && <div className="text-[10px] text-slate-400">{m.matchTime}</div>}
                      </td>

                      {/* Match Teams */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                          <span>{m.homeTeam}</span>
                          <span className="text-slate-400 text-[10px] font-normal">vs</span>
                          <span>{m.awayTeam}</span>
                        </div>
                      </td>

                      {/* Market */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md inline-block border border-sky-100">
                          {m.market}
                        </div>
                      </td>

                      {/* Odds */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-700 whitespace-nowrap">
                        @{odds.toFixed(2)}
                      </td>

                      {/* Stake */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatMoney(stake, currency)}
                      </td>

                      {/* Result Badge */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {isWon && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white font-black text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>WON</span>
                          </span>
                        )}
                        {isLost && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-600 text-white font-black text-[11px]">
                            <XCircle className="w-3 h-3" />
                            <span>LOST</span>
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-black text-[11px]">
                            <Clock className="w-3 h-3" />
                            <span>PENDING</span>
                          </span>
                        )}
                        {m.result === 'VOID' && (
                          <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 font-black text-[11px]">
                            VOID
                          </span>
                        )}
                      </td>

                      {/* Net P&L */}
                      <td className="py-3 px-3 text-right font-mono font-black whitespace-nowrap">
                        {isWon && (
                          <span className="text-emerald-600">+{formatMoney(profit, currency)}</span>
                        )}
                        {isLost && (
                          <span className="text-rose-600">-{formatMoney(loss, currency)}</span>
                        )}
                        {isPending && <span className="text-slate-400">--</span>}
                        {m.result === 'VOID' && <span className="text-slate-400">0.00</span>}
                      </td>

                      {/* Action (Delete) */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {deleteConfirmId === m.id ? (
                          <div className="flex items-center justify-center space-x-1 animate-fadeIn">
                            <button
                              onClick={() => handleDelete(m.id)}
                              className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700 cursor-pointer shadow-xs"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-1.5 py-1 bg-slate-200 text-slate-700 rounded text-[10px] font-bold hover:bg-slate-300 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(m.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Printable Report Section */}
      <div className="hidden print:block text-black bg-white p-6">
        <div className="border-b-2 border-black pb-4 mb-4">
          <div className="text-xl font-black uppercase tracking-wider">
            EPL PRO MATCH CENTER • OVER VIEW
          </div>
        </div>

        {/* Print Summary */}
        <div className="grid grid-cols-4 gap-3 border border-black p-3 mb-4 text-xs">
          <div>
            <span className="font-bold block">Total Matches:</span>
            <span className="font-mono text-sm">{metrics.totalCount}</span>
          </div>
          <div>
            <span className="font-bold block">Won Matches:</span>
            <span className="font-mono text-sm">{metrics.wonCount}</span>
          </div>
          <div>
            <span className="font-bold block">Lost Matches:</span>
            <span className="font-mono text-sm">{metrics.lostCount}</span>
          </div>
          <div>
            <span className="font-bold block">Net P&L:</span>
            <span className="font-mono text-sm">
              {metrics.netPnL >= 0 ? '+' : ''}{formatMoney(metrics.netPnL, currency)}
            </span>
          </div>
        </div>

        {/* Print Table */}
        <table className="w-full text-xs text-left border-collapse border border-black">
          <thead>
            <tr className="border-b border-black bg-slate-100 font-bold">
              <th className="p-2 border-r border-black">Week</th>
              <th className="p-2 border-r border-black">Date</th>
              <th className="p-2 border-r border-black">Match</th>
              <th className="p-2 border-r border-black">Market</th>
              <th className="p-2 border-r border-black text-right">Odds</th>
              <th className="p-2 border-r border-black text-right">Stake</th>
              <th className="p-2 border-r border-black text-center">Result</th>
              <th className="p-2 text-right">Net P&L</th>
            </tr>
          </thead>
          <tbody>
            {filteredMatches.map((m) => {
              const stake = Number(m.stake) || 0;
              const odds = Number(m.odds) || 1;
              const profit = m.profit > 0 ? m.profit : (odds > 1 && stake > 0 ? stake * (odds - 1) : 0);
              const loss = m.loss > 0 ? m.loss : stake;
              return (
                <tr key={m.id} className="border-b border-black">
                  <td className="p-2 border-r border-black font-mono">MW {m.matchweek || 1}</td>
                  <td className="p-2 border-r border-black font-mono">{m.date}</td>
                  <td className="p-2 border-r border-black font-bold">{m.homeTeam} vs {m.awayTeam}</td>
                  <td className="p-2 border-r border-black">{m.market}</td>
                  <td className="p-2 border-r border-black text-right font-mono">@{odds.toFixed(2)}</td>
                  <td className="p-2 border-r border-black text-right font-mono">{formatMoney(stake, currency)}</td>
                  <td className="p-2 border-r border-black text-center font-bold">{m.result}</td>
                  <td className="p-2 text-right font-mono font-bold">
                    {m.result === 'WIN' ? `+${formatMoney(profit, currency)}` : `-${formatMoney(loss, currency)}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
