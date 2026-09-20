import React, { useState, useEffect } from 'react';
import { AppState, MarketRecordEntry } from '../types';
import { generateId, getStoredDraft, setStoredDraft } from '../utils/storage';
import { ALL_EPL_20_TEAMS } from '../utils/teamData';
import {
  Layers,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Search,
  Check,
  ChevronDown,
  Calendar,
  Clock,
} from 'lucide-react';

interface MarketRecordViewProps {
  state: AppState;
  onAddMarketRecord: (entry: MarketRecordEntry) => void;
  onUpdateMarketRecordResult: (id: string, result: 'PENDING' | 'WIN' | 'LOSS' | 'VOID') => void;
  onDeleteMarketRecord: (id: string) => void;
  onNavigateTab?: (tab: any) => void;
}

// 12 Preset Markets
const PRESET_MARKETS = [
  'BTTS YES',
  'BTTS NO',
  'Over 2.5 Goals',
  'Over 1.5 Goals',
  'Under 2.5 Goals',
  'Under 3.5 Goals',
  'Home Win (1)',
  'Away Win (2)',
  'Draw (X)',
  'Double Chance (1X)',
  'Double Chance (X2)',
  'Double Chance (12)',
];

const DRAFT_KEY = 'btts_market_record_draft_v3';

export const MarketRecordView: React.FC<MarketRecordViewProps> = ({
  state,
  onAddMarketRecord,
  onUpdateMarketRecordResult,
  onDeleteMarketRecord,
}) => {
  const records = state.marketRecords || [];

  // Draft persistence
  const initialDraft = getStoredDraft(DRAFT_KEY, {
    homeTeam: 'Manchester City',
    awayTeam: 'Arsenal',
    selectedMarkets: ['BTTS YES'],
    matchDate: new Date().toISOString().split('T')[0],
    matchTime: '20:00',
  });

  const [homeTeam, setHomeTeam] = useState<string>(initialDraft.homeTeam || 'Manchester City');
  const [awayTeam, setAwayTeam] = useState<string>(initialDraft.awayTeam || 'Arsenal');
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(
    Array.isArray(initialDraft.selectedMarkets) && initialDraft.selectedMarkets.length > 0
      ? initialDraft.selectedMarkets
      : ['BTTS YES']
  );
  const [matchDate, setMatchDate] = useState<string>(
    initialDraft.matchDate || new Date().toISOString().split('T')[0]
  );
  const [matchTime, setMatchTime] = useState<string>(
    initialDraft.matchTime || '20:00'
  );

  // Filter & Search
  const [filterResult, setFilterResult] = useState<'ALL' | 'PENDING' | 'WIN' | 'LOSS' | 'VOID'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto venue
  const homeTeamInfo = ALL_EPL_20_TEAMS.find(
    (t) => t.name.toLowerCase() === homeTeam.toLowerCase()
  );
  const venue = homeTeamInfo ? `${homeTeamInfo.name} (${homeTeamInfo.stadium})` : `${homeTeam} Stadium`;

  useEffect(() => {
    setStoredDraft(DRAFT_KEY, {
      homeTeam,
      awayTeam,
      selectedMarkets,
      matchDate,
      matchTime,
    });
  }, [homeTeam, awayTeam, selectedMarkets, matchDate, matchTime]);

  // Market Toggle
  const toggleMarket = (marketName: string) => {
    if (selectedMarkets.includes(marketName)) {
      if (selectedMarkets.length === 1) {
        setErrorMsg('Please keep at least one market selected.');
        setTimeout(() => setErrorMsg(null), 2500);
        return;
      }
      setSelectedMarkets(selectedMarkets.filter((m) => m !== marketName));
    } else {
      setSelectedMarkets([...selectedMarkets, marketName]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!homeTeam || !awayTeam) {
      setErrorMsg('Please select both Home and Away teams.');
      return;
    }
    if (homeTeam.toLowerCase() === awayTeam.toLowerCase()) {
      setErrorMsg('Home and Away teams must be different.');
      return;
    }
    if (selectedMarkets.length === 0) {
      setErrorMsg('Please select at least one market.');
      return;
    }
    if (!matchDate) {
      setErrorMsg('Please select a valid date.');
      return;
    }

    const newRecord: MarketRecordEntry = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      date: matchDate,
      matchTime: matchTime || '20:00',
      matchweek: state.currentMatchweek || 1,
      homeTeam,
      awayTeam,
      venue,
      selectedMarkets: [...selectedMarkets],
      result: 'PENDING',
    };

    onAddMarketRecord(newRecord);
    setSuccessMsg('Market record saved successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Summary counts
  const totalCount = records.length;
  const pendingCount = records.filter((r) => r.result === 'PENDING').length;
  const winCount = records.filter((r) => r.result === 'WIN').length;

  const filteredRecords = records.filter((rec) => {
    const matchesResult = filterResult === 'ALL' || rec.result === filterResult;
    const matchesSearch =
      !searchQuery.trim() ||
      rec.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.date.includes(searchQuery) ||
      rec.selectedMarkets.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesResult && matchesSearch;
  });

  return (
    <div className="w-full max-w-6xl 2xl:max-w-7xl mx-auto space-y-6 pb-20 animate-fadeIn">
      {/* Clean Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:p-6 rounded-2xl bg-white border border-red-100 shadow-sm relative overflow-hidden">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-red-50 text-red-600 border border-red-200">
            <Layers className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
              Market Record
            </h1>
          </div>
        </div>

        {/* Quick Compact Stats */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 shadow-xs">
            Total: <strong className="text-slate-900 font-mono">{totalCount}</strong>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 shadow-xs">
            Pending: <strong className="font-mono">{pendingCount}</strong>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-xs">
            Won: <strong className="font-mono">{winCount}</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Form on Left, List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form Card */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleSubmit}
            className="p-6 rounded-2xl bg-white border border-red-100 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-red-100">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-red-600" />
                Add New Record
              </span>
              <span className="text-[11px] text-red-600 font-bold">
                {selectedMarkets.length} selected
              </span>
            </div>

            {/* Notifications */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Teams Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-600">Home Team</label>
                <div className="relative">
                  <select
                    value={homeTeam}
                    onChange={(e) => setHomeTeam(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 appearance-none cursor-pointer shadow-xs"
                  >
                    {ALL_EPL_20_TEAMS.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-600">Away Team</label>
                <div className="relative">
                  <select
                    value={awayTeam}
                    onChange={(e) => setAwayTeam(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 appearance-none cursor-pointer shadow-xs"
                  >
                    {ALL_EPL_20_TEAMS.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Venue Info */}
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
              <span>Venue:</span>
              <span className="text-slate-900 font-semibold truncate max-w-[200px]">{venue}</span>
            </div>

            {/* Market Selection */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-600">
                  Select Markets
                </label>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {PRESET_MARKETS.map((market) => {
                  const isSelected = selectedMarkets.includes(market);
                  return (
                    <button
                      key={market}
                      type="button"
                      onClick={() => toggleMarket(market)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer ${
                        isSelected
                          ? 'bg-red-600 text-white border-red-600 font-black shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-red-300 hover:text-red-700'
                      }`}
                    >
                      <span className="truncate">{market}</span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 stroke-[3] shrink-0 ml-1 text-white" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-slate-300 shrink-0 ml-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-600 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-red-600" />
                  <span>Date <span className="text-rose-600">*</span></span>
                </label>
                <input
                  type="date"
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 shadow-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-600 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-red-600" />
                  <span>Time</span>
                </label>
                <input
                  type="time"
                  value={matchTime}
                  onChange={(e) => setMatchTime(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 shadow-xs"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center justify-center space-x-2 shadow-sm active:scale-[0.98] transition-all cursor-pointer mt-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Save Market Record</span>
            </button>
          </form>
        </div>

        {/* Right Records List Card */}
        <div className="lg:col-span-7 space-y-3">
          {/* Top Search & Filter Toolbar */}
          <div className="p-3 rounded-2xl bg-white border border-red-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search team, market, date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 w-full sm:w-auto overflow-x-auto shadow-xs">
              {(['ALL', 'PENDING', 'WIN', 'LOSS', 'VOID'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterResult(tab)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                    filterResult === tab
                      ? tab === 'WIN'
                        ? 'bg-emerald-600 text-white font-black shadow-xs'
                        : tab === 'LOSS'
                        ? 'bg-rose-600 text-white font-black shadow-xs'
                        : tab === 'PENDING'
                        ? 'bg-amber-500 text-white font-black shadow-xs'
                        : 'bg-red-600 text-white font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab === 'ALL' ? 'All' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Records List Container */}
          {filteredRecords.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-dashed border-red-200 text-center space-y-2 shadow-sm">
              <Layers className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-sm font-semibold text-slate-800">No records found</div>
              <p className="text-xs text-slate-500">
                Add your first record using the form on the left.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredRecords.map((item) => {
                const isWin = item.result === 'WIN';
                const isLoss = item.result === 'LOSS';
                const isVoid = item.result === 'VOID';

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-white border border-red-100 hover:border-red-300 transition-all space-y-2.5 shadow-sm"
                  >
                    {/* Row 1: Match Teams & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
                        <span className="text-red-600 font-black">{item.homeTeam}</span>
                        <span className="text-slate-400 text-xs font-normal">vs</span>
                        <span className="text-slate-800 font-bold">{item.awayTeam}</span>
                      </div>

                      {/* Status Tag */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black border ${
                          isWin
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : isLoss
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : isVoid
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {item.result}
                      </span>
                    </div>

                    {/* Row 2: Selected Markets Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {item.selectedMarkets.map((m) => (
                        <span
                          key={m}
                          className="px-2.5 py-0.5 rounded-lg bg-red-50 border border-red-100 text-red-700 text-[11px] font-mono font-semibold"
                        >
                          {m}
                        </span>
                      ))}
                    </div>

                    {/* Row 3: Date & Time + Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 border-t border-slate-100 text-xs">
                      {/* Schedule info (Date & Time) */}
                      <div className="flex items-center gap-3 text-slate-600">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-red-600" />
                          <span className="text-slate-800 font-medium">{item.date}</span>
                        </div>
                        {item.matchTime && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-red-600" />
                            <span className="text-slate-800 font-medium">{item.matchTime}</span>
                          </div>
                        )}
                        <span className="text-[11px] text-slate-400 hidden sm:inline truncate max-w-[150px]">
                          {item.venue}
                        </span>
                      </div>

                      {/* Result Action Buttons */}
                      <div className="flex items-center gap-1 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => onUpdateMarketRecordResult(item.id, 'WIN')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isWin
                              ? 'bg-emerald-600 text-white font-black shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200'
                          }`}
                        >
                          Win
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateMarketRecordResult(item.id, 'LOSS')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isLoss
                              ? 'bg-rose-600 text-white font-black shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200'
                          }`}
                        >
                          Loss
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateMarketRecordResult(item.id, 'VOID')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isVoid
                              ? 'bg-slate-700 text-white font-black shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200'
                          }`}
                        >
                          Void
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteMarketRecord(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
