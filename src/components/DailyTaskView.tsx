import React, { useState, useEffect } from 'react';
import { AppState, MatchRecord } from '../types';
import { calculateFinancials, formatMoney, generateId, getStoredDraft, setStoredDraft, removeStoredDraft } from '../utils/storage';
import { BetSlipModal } from './BetSlipModal';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PlusCircle,
  Clock,
  Ban,
  Activity,
  Ticket,
  ChevronDown
} from 'lucide-react';

import { ALL_EPL_TEAM_NAMES } from '../utils/teamData';

export const BETTING_MARKETS = [
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
] as const;

interface DailyTaskViewProps {
  state: AppState;
  onRecordMatch: (match: MatchRecord) => void;
  onUpdateMatchStatus: (id: string, result: 'WIN' | 'LOSS' | 'VOID') => void;
}

const DAILY_BET_DRAFT_KEY = 'btts_daily_bet_draft';

interface DailyBetDraft {
  homeTeam?: string;
  awayTeam?: string;
  matchDate?: string;
  matchTime?: string;
  league?: string;
  market?: string;
  selection?: string;
  notes?: string;
  oddsStr?: string;
  stakeStr?: string;
}

export const DailyTaskView: React.FC<DailyTaskViewProps> = ({
  state,
  onRecordMatch,
  onUpdateMatchStatus,
}) => {
  const fin = calculateFinancials(state);
  const currency = state.settings.currency || '$';

  // Load saved draft if user was typing before refresh
  const initialDraft = getStoredDraft<DailyBetDraft>(DAILY_BET_DRAFT_KEY, {});

  // Form Inputs
  const [homeTeam, setHomeTeam] = useState(initialDraft.homeTeam || 'Arsenal');
  const [awayTeam, setAwayTeam] = useState(initialDraft.awayTeam || 'Chelsea');
  const [matchDate, setMatchDate] = useState(initialDraft.matchDate || new Date().toISOString().split('T')[0]);
  const [matchTime, setMatchTime] = useState(initialDraft.matchTime || '20:00');
  const [league, setLeague] = useState(initialDraft.league || 'Premier League');
  const [market, setMarket] = useState<string>(
    initialDraft.market ||
    (BETTING_MARKETS.includes(state.settings.autoFillMarket as any)
      ? state.settings.autoFillMarket
      : 'BTTS YES')
  );
  const [selection, setSelection] = useState(initialDraft.selection || '');
  const [notes, setNotes] = useState(initialDraft.notes || '');
  const [oddsStr, setOddsStr] = useState(initialDraft.oddsStr || '1.85');
  const [stakeStr, setStakeStr] = useState(initialDraft.stakeStr || '100');
  const [errorMsg, setErrorMsg] = useState('');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Auto-save form inputs draft whenever any field changes
  useEffect(() => {
    const draft: DailyBetDraft = {
      homeTeam,
      awayTeam,
      matchDate,
      matchTime,
      league,
      market,
      selection,
      notes,
      oddsStr,
      stakeStr,
    };
    setStoredDraft(DAILY_BET_DRAFT_KEY, draft);
  }, [homeTeam, awayTeam, matchDate, matchTime, league, market, selection, notes, oddsStr, stakeStr]);

  // Modal State for Generated Slip
  const [activeSlipMatch, setActiveSlipMatch] = useState<MatchRecord | null>(null);
  const [isNewSlip, setIsNewSlip] = useState(false);

  // Running / Pending matches
  const pendingMatches = state.matchHistory.filter((m) => m.result === 'PENDING');

  const odds = parseFloat(oddsStr);
  const stake = parseFloat(stakeStr);
  const potentialProfit = !isNaN(odds) && !isNaN(stake) && odds > 1 && stake > 0
    ? Number((stake * (odds - 1)).toFixed(2))
    : 0;

  // Validation
  const validateForm = () => {
    setErrorMsg('');

    if (!homeTeam.trim() || !awayTeam.trim()) {
      setErrorMsg('Please enter both Home Team and Away Team names.');
      return false;
    }

    if (homeTeam.trim().toLowerCase() === awayTeam.trim().toLowerCase()) {
      setErrorMsg('Home team and Away team cannot be the same!');
      return false;
    }

    if (!market.trim()) {
      setErrorMsg('Please select a market type.');
      return false;
    }

    if (isNaN(odds) || odds <= 1) {
      setErrorMsg('Please enter valid decimal odds greater than 1.00 (e.g. 1.85).');
      return false;
    }

    if (isNaN(stake) || stake <= 0) {
      setErrorMsg('Please enter a valid stake amount.');
      return false;
    }

    return true;
  };

  // Submit as Pending Match
  const handleCreatePendingBet = () => {
    if (!validateForm()) return;

    const newMatch: MatchRecord = {
      id: generateId(),
      dayNumber: state.currentDay,
      date: matchDate.trim() || new Date().toISOString().split('T')[0],
      matchTime: matchTime.trim() || undefined,
      league: league.trim() || 'EPL',
      homeTeam: homeTeam.trim(),
      awayTeam: awayTeam.trim(),
      market: market.trim() || 'BTTS YES',
      selection: selection.trim() || undefined,
      odds: odds,
      stake: stake,
      result: 'PENDING',
      profit: 0,
      loss: 0,
      netPnL: 0,
      bankrollAfter: fin.netBettingPnL,
      notes: notes.trim() || undefined,
    };

    onRecordMatch(newMatch);

    // Trigger JPEG Match Slip Modal immediately
    setActiveSlipMatch(newMatch);
    setIsNewSlip(true);

    // Clear Draft from storage and form
    removeStoredDraft(DAILY_BET_DRAFT_KEY);
    setHomeTeam('Arsenal');
    setAwayTeam('Chelsea');
    setSelection('');
    setNotes('');
    setOddsStr('1.85');
    setStakeStr('100');
    setSuccessBanner(
      `New match (${newMatch.market}) recorded successfully. Match slip is ready below.`
    );

    setTimeout(() => setSuccessBanner(null), 5000);
  };

  // Immediate Settlement Option (if user wants to complete right away)
  const handleImmediateRecord = (result: 'WIN' | 'LOSS') => {
    if (!validateForm()) return;

    const profit = result === 'WIN' ? potentialProfit : 0;
    const loss = result === 'LOSS' ? stake : 0;
    const netPnL = result === 'WIN' ? profit : -loss;
    const bankrollAfter = fin.netBettingPnL + netPnL;

    const newMatch: MatchRecord = {
      id: generateId(),
      dayNumber: state.currentDay,
      date: matchDate.trim() || new Date().toISOString().split('T')[0],
      matchTime: matchTime.trim() || undefined,
      league: league.trim() || 'EPL',
      homeTeam: homeTeam.trim(),
      awayTeam: awayTeam.trim(),
      market: market.trim() || 'BTTS YES',
      selection: selection.trim() || undefined,
      odds: odds,
      stake: stake,
      result: result,
      profit: Number(profit.toFixed(2)),
      loss: Number(loss.toFixed(2)),
      netPnL: Number(netPnL.toFixed(2)),
      bankrollAfter: Number(bankrollAfter.toFixed(2)),
      notes: notes.trim() || undefined,
    };

    onRecordMatch(newMatch);

    // Trigger JPEG Match Slip Modal
    setActiveSlipMatch(newMatch);
    setIsNewSlip(true);

    // Clear Draft from storage and form
    removeStoredDraft(DAILY_BET_DRAFT_KEY);
    setHomeTeam('Arsenal');
    setAwayTeam('Chelsea');
    setSelection('');
    setNotes('');
    setOddsStr('1.85');
    setStakeStr('100');
    setSuccessBanner(
      `Match ${newMatch.homeTeam} vs ${newMatch.awayTeam} (${newMatch.market}) recorded as ${result}!`
    );

    setTimeout(() => setSuccessBanner(null), 4000);
  };

  return (
    <div className="w-full max-w-6xl 2xl:max-w-7xl mx-auto space-y-6 animate-fadeIn pb-36 sm:pb-40">
      {/* Header Badge */}
      <div className="solid-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-red-100 rounded-2xl relative overflow-hidden shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center space-x-2 tracking-tight">
            <Trophy className="w-6 h-6 text-red-600" />
            <span>SELECT MATCH</span>
          </h1>
        </div>

        {/* Quick Net Profit Indicator */}
        <div className="p-3.5 px-5 rounded-2xl border border-red-200 flex items-center justify-between gap-4 transition-all bg-red-50/70 shadow-xs">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Net Profit
            </div>
            <div className={`text-xl font-black font-mono mt-0.5 ${fin.netBettingPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {fin.netBettingPnL >= 0 ? '+' : ''}{formatMoney(fin.netBettingPnL, currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-bold flex items-center space-x-3 animate-fadeIn shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* PENDING / RUNNING MATCHES SECTION */}
      <div className="solid-card p-6 border border-red-100 bg-white rounded-2xl shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Running Matches</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 font-mono">
              {pendingMatches.length} Open
            </span>
          </div>
        </div>

        {pendingMatches.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Activity className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
            <span>No pending matches</span>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingMatches.map((match, index) => {
              const matchProfit = Number((match.stake * (match.odds - 1)).toFixed(2));
              return (
                <div
                  key={match.id}
                  className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-red-200 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 font-mono font-bold text-xs border border-red-200">
                        #{String(match.dayNumber || index + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <div className="font-black text-slate-900 text-sm sm:text-base">
                          {match.homeTeam} <span className="text-slate-400 font-normal">vs</span> {match.awayTeam}
                        </div>
                        <div className="text-slate-500 text-xs font-medium">
                          {match.league} • Market: <span className="text-slate-800 font-bold">{match.market}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <button
                        onClick={() => setActiveSlipMatch(match)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
                        title="View / Download Match Slip"
                      >
                        <Ticket className="w-3.5 h-3.5 text-slate-500" />
                        <span>Slip</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-200 text-xs">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <div>
                        <span className="text-slate-500">Stake: </span>
                        <span className="font-mono font-black text-slate-900">{formatMoney(match.stake, currency)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Odds: </span>
                        <span className="font-mono font-black text-emerald-600">{match.odds.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">To Win: </span>
                        <span className="font-mono font-black text-emerald-600">+{formatMoney(matchProfit, currency)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => {
                          onUpdateMatchStatus(match.id, 'WIN');
                          setSuccessBanner(`Match marked as WIN! Profit +${formatMoney(matchProfit, currency)} credited to balance.`);
                          setTimeout(() => setSuccessBanner(null), 4000);
                        }}
                        className="flex-1 sm:flex-none py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-black rounded-xl text-xs flex items-center justify-center space-x-1 transition-all active:scale-95 cursor-pointer shadow-xs whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>WIN</span>
                      </button>

                      <button
                        onClick={() => {
                          onUpdateMatchStatus(match.id, 'LOSS');
                          setSuccessBanner(`Match marked as LOSS. Stake -${formatMoney(match.stake, currency)} deducted from balance.`);
                          setTimeout(() => setSuccessBanner(null), 4000);
                        }}
                        className="flex-1 sm:flex-none py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-black rounded-xl text-xs flex items-center justify-center space-x-1 transition-all active:scale-95 cursor-pointer shadow-xs whitespace-nowrap"
                      >
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>LOSS</span>
                      </button>

                      <button
                        onClick={() => {
                          onUpdateMatchStatus(match.id, 'VOID');
                          setSuccessBanner(`Match marked as VOID (Refunded).`);
                          setTimeout(() => setSuccessBanner(null), 4000);
                        }}
                        className="flex-1 sm:flex-none py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                      >
                        <Ban className="w-3.5 h-3.5 shrink-0" />
                        <span>VOID</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* NEW MATCH ENTRY FORM CARD */}
      <div className="solid-card p-6 space-y-6 bg-white border border-red-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-red-100">
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-black text-slate-900 tracking-tight">New Match Entry</h2>
          </div>
          <span className="text-xs text-red-700 font-mono font-bold bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
            Official Form
          </span>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-bold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Grid */}
        <div className="space-y-4">
          {/* Teams Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {/* HOME TEAM */}
            <div className="space-y-1.5 min-w-0">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Home Team</span>
                <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <select
                  onChange={(e) => {
                    const val = e.target.value;
                    setHomeTeam(val);
                    if (val && (!league || league === 'EPL')) {
                      setLeague('EPL');
                    }
                  }}
                  value={homeTeam}
                  className="w-full max-w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 pr-10 text-xs sm:text-sm font-semibold focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 cursor-pointer shadow-xs appearance-none transition-colors"
                >
                  <option value="" className="bg-white text-slate-400">-- Select Home Team --</option>
                  {ALL_EPL_TEAM_NAMES.map((team) => (
                    <option key={`home-${team}`} value={team} className="bg-white text-slate-900 font-medium py-1">
                      {team}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* AWAY TEAM */}
            <div className="space-y-1.5 min-w-0">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Away Team</span>
                <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <select
                  onChange={(e) => {
                    const val = e.target.value;
                    setAwayTeam(val);
                    if (val && (!league || league === 'EPL')) {
                      setLeague('EPL');
                    }
                  }}
                  value={awayTeam}
                  className="w-full max-w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 pr-10 text-xs sm:text-sm font-semibold focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 cursor-pointer shadow-xs appearance-none transition-colors"
                >
                  <option value="" className="bg-white text-slate-400">-- Select Away Team --</option>
                  {ALL_EPL_TEAM_NAMES.map((team) => (
                    <option key={`away-${team}`} value={team} className="bg-white text-slate-900 font-medium py-1">
                      {team}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Match Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Match Date
              </label>
              <input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                onClick={(e) => {
                  try {
                    (e.currentTarget as HTMLInputElement).showPicker?.();
                  } catch (_) {}
                }}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 cursor-pointer transition-colors shadow-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Match Time (Optional)
              </label>
              <input
                type="time"
                value={matchTime}
                onChange={(e) => setMatchTime(e.target.value)}
                onClick={(e) => {
                  try {
                    (e.currentTarget as HTMLInputElement).showPicker?.();
                  } catch (_) {}
                }}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 cursor-pointer transition-colors shadow-xs"
              />
            </div>
          </div>

          {/* League & Market Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                League / Tournament <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. EPL"
                value={league}
                onChange={(e) => setLeague(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-colors shadow-xs"
              />
            </div>

            <div className="space-y-1.5 min-w-0">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Market Type <span className="text-red-500">*</span></span>
              </label>
              <div className="relative">
                <select
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 pr-10 text-xs sm:text-sm font-semibold focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 cursor-pointer appearance-none transition-colors shadow-xs"
                >
                  {BETTING_MARKETS.map((m) => (
                    <option key={m} value={m} className="bg-white text-slate-900 font-medium py-1">
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Odds & Stake Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Decimal Odds <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="1.01"
                placeholder="e.g. 1.85"
                value={oddsStr}
                onChange={(e) => setOddsStr(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-colors shadow-xs"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Stake ({currency}) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] text-slate-500 font-bold mr-1">Quick:</span>
                  {[50, 100, 200, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setStakeStr(String(amt))}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 500"
                value={stakeStr}
                onChange={(e) => setStakeStr(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono font-black focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-colors shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Live Calculation Preview Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-500">Entered Stake:</span>
            <span className="font-mono font-black text-slate-900">
              {stake > 0 ? formatMoney(stake, currency) : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-500">Expected Profit (on WIN):</span>
            <span className="font-mono font-black text-emerald-600">
              {potentialProfit > 0 ? `+${formatMoney(potentialProfit, currency)}` : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs border-t border-slate-200 pt-2 font-bold">
            <span className="text-slate-500">Net Profit After WIN:</span>
            <span className={`font-mono font-black ${(fin.netBettingPnL + potentialProfit) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {(fin.netBettingPnL + potentialProfit) >= 0 ? '+' : ''}{formatMoney(fin.netBettingPnL + potentialProfit, currency)}
            </span>
          </div>
        </div>

        {/* RECORD ACTIONS */}
        <div className="pt-2 space-y-3">
          {/* Error Message right above buttons */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* PRIMARY ACTION: Save Pending Match */}
          <button
            type="button"
            onClick={handleCreatePendingBet}
            className="w-full py-3.5 px-6 rounded-xl font-black text-sm transition-all flex items-center justify-center space-x-2 shadow-sm bg-red-600 hover:bg-red-700 text-white active:scale-[0.98] cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>Save Pending Match</span>
          </button>

          {/* SECONDARY OPTION: Direct Settlement if match is already over */}
          <div className="pt-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleImmediateRecord('WIN')}
                className="py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Instant WIN (+{formatMoney(potentialProfit, currency)})</span>
              </button>

              <button
                type="button"
                onClick={() => handleImmediateRecord('LOSS')}
                className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Instant LOSS (-{formatMoney(stake, currency)})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MATCH SLIP MODAL */}
      {activeSlipMatch && (
        <BetSlipModal
          match={activeSlipMatch}
          currency={currency}
          isNewEntry={isNewSlip}
          onClose={() => {
            setActiveSlipMatch(null);
            setIsNewSlip(false);
          }}
        />
      )}
    </div>
  );
};
