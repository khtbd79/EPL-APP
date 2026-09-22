import React, { useState, useEffect } from 'react';
import { AppState, MatchRecord, CandidateMatch } from '../types';
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
  ChevronDown,
  Trash2,
  PenSquare,
  ArrowRight,
  RefreshCw,
  Target
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
  onDeleteMatch?: (id: string) => void;
  onUpdateMatch?: (match: MatchRecord) => void;
  onClearPendingMatches?: () => void;
  onNavigateTab?: (tab: any) => void;
  onConfirmCandidate?: (candidate: CandidateMatch) => void;
  onDeleteCandidate?: (id: string) => void;
  onUpdateCandidate?: (candidate: CandidateMatch) => void;
  onClearCandidates?: () => void;
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
  onDeleteMatch,
  onUpdateMatch,
  onClearPendingMatches,
  onNavigateTab,
  onConfirmCandidate,
  onDeleteCandidate,
  onUpdateCandidate,
  onClearCandidates,
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

  const candidates = state.candidateMatches || [];

  // Confirm candidate into official pending bet (places bet and sends to Dashboard Pending Matches)
  const handleConfirmCandidateBet = (cand: CandidateMatch) => {
    if (onConfirmCandidate) {
      onConfirmCandidate(cand);
    } else {
      const newMatch: MatchRecord = {
        id: cand.id,
        dayNumber: state.currentDay,
        date: cand.date,
        matchTime: cand.matchTime,
        league: 'Premier League',
        homeTeam: cand.homeTeam,
        awayTeam: cand.awayTeam,
        market: cand.market,
        selection: cand.market,
        odds: cand.odds,
        stake: cand.stake,
        result: 'PENDING',
        profit: 0,
        loss: 0,
        netPnL: 0,
        bankrollAfter: fin.netBettingPnL,
        notes: cand.notes,
      };
      onRecordMatch(newMatch);
      if (onDeleteCandidate) {
        onDeleteCandidate(cand.id);
      }
    }

    const slipRecord: MatchRecord = {
      id: cand.id,
      dayNumber: state.currentDay,
      date: cand.date,
      matchTime: cand.matchTime,
      league: 'Premier League',
      homeTeam: cand.homeTeam,
      awayTeam: cand.awayTeam,
      market: cand.market,
      selection: cand.market,
      odds: cand.odds,
      stake: cand.stake,
      result: 'PENDING',
      profit: 0,
      loss: 0,
      netPnL: 0,
      bankrollAfter: fin.netBettingPnL,
      notes: cand.notes,
    };
    setActiveSlipMatch(slipRecord);
    setIsNewSlip(true);

    setSuccessBanner(
      `Bet Confirmed! ${cand.homeTeam} vs ${cand.awayTeam} (${cand.market}) is now an active pending bet on Dashboard.`
    );
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleSettleCandidateDirectly = (cand: CandidateMatch, res: 'WIN' | 'LOSS' | 'VOID') => {
    const profit = res === 'WIN' ? Number((cand.stake * (cand.odds - 1)).toFixed(2)) : 0;
    const loss = res === 'LOSS' ? cand.stake : 0;
    const netPnL = res === 'WIN' ? profit : (res === 'LOSS' ? -loss : 0);

    const record: MatchRecord = {
      id: cand.id,
      dayNumber: state.currentDay,
      date: cand.date,
      matchTime: cand.matchTime,
      league: 'Premier League',
      homeTeam: cand.homeTeam,
      awayTeam: cand.awayTeam,
      market: cand.market,
      selection: cand.market,
      odds: cand.odds,
      stake: cand.stake,
      result: res,
      profit,
      loss,
      netPnL,
      bankrollAfter: fin.netBettingPnL,
      notes: cand.notes,
    };
    onRecordMatch(record);
    if (onDeleteCandidate) {
      onDeleteCandidate(cand.id);
    }
    setSuccessBanner(`Selection settled as ${res} and added to history.`);
    setTimeout(() => setSuccessBanner(null), 3500);
  };

  const handleLoadCandidateIntoForm = (cand: CandidateMatch) => {
    setHomeTeam(cand.homeTeam);
    setAwayTeam(cand.awayTeam);
    if (cand.date) setMatchDate(cand.date);
    if (cand.matchTime) setMatchTime(cand.matchTime);
    setLeague('Premier League');
    setMarket(cand.market);
    setOddsStr(String(cand.odds || '1.85'));
    setStakeStr(String(cand.stake || '100'));
    setNotes(cand.notes || '');
    setSuccessBanner(`Loaded ${cand.homeTeam} vs ${cand.awayTeam} (${cand.market}) into entry form.`);
    setTimeout(() => setSuccessBanner(null), 3500);

    const formEl = document.getElementById('new-match-entry-card');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInlineUpdateCandidateStake = (cand: CandidateMatch, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0 && onUpdateCandidate) {
      onUpdateCandidate({ ...cand, stake: num });
    }
  };

  const handleInlineUpdateCandidateOdds = (cand: CandidateMatch, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num) && num > 1 && onUpdateCandidate) {
      onUpdateCandidate({ ...cand, odds: num });
    }
  };

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

  // Load a pending match into the New Match Entry form to decide / finalize bet
  const handleLoadIntoForm = (m: MatchRecord) => {
    setHomeTeam(m.homeTeam);
    setAwayTeam(m.awayTeam);
    if (m.date) setMatchDate(m.date);
    if (m.matchTime) setMatchTime(m.matchTime);
    if (m.league) setLeague(m.league);
    setMarket(m.market);
    setOddsStr(String(m.odds || '1.85'));
    setStakeStr(String(m.stake || '100'));
    if (m.selection) setSelection(m.selection);
    if (m.notes) setNotes(m.notes);
    setSuccessBanner(`Loaded ${m.homeTeam} vs ${m.awayTeam} (${m.market}) into entry form.`);
    setTimeout(() => setSuccessBanner(null), 3500);

    const formEl = document.getElementById('new-match-entry-card');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Inline quick update of Stake
  const handleInlineUpdateStake = (match: MatchRecord, newStakeStr: string) => {
    const newStake = parseFloat(newStakeStr);
    if (!isNaN(newStake) && newStake >= 0 && onUpdateMatch) {
      onUpdateMatch({
        ...match,
        stake: newStake,
      });
    }
  };

  // Inline quick update of Odds
  const handleInlineUpdateOdds = (match: MatchRecord, newOddsStr: string) => {
    const newOdds = parseFloat(newOddsStr);
    if (!isNaN(newOdds) && newOdds > 1 && onUpdateMatch) {
      onUpdateMatch({
        ...match,
        odds: newOdds,
      });
    }
  };

  // Delete a single pending match selection
  const handleDeletePendingMatch = (id: string, matchDesc?: string) => {
    if (onDeleteMatch) {
      onDeleteMatch(id);
      setSuccessBanner(matchDesc ? `Removed ${matchDesc}` : 'Selection removed');
      setTimeout(() => setSuccessBanner(null), 3000);
    }
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

      {/* 1. CANDIDATE SELECTIONS FROM MATCH COMPARISON (PRELIMINARY QUEUE) */}
      <div className="solid-card p-6 border-2 border-red-200 bg-white rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-red-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-200">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Selected Markets from Comparison
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 font-mono">
                  {candidates.length} Preliminary
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Review preliminary markets line-by-line. Confirm bet to place into Dashboard Pending Matches.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('demo_match')}
                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <span>Compare Matches</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {candidates.length > 0 && onClearCandidates && (
              <button
                onClick={() => {
                  if (window.confirm('Clear all preliminary candidate selections?')) {
                    onClearCandidates();
                    setSuccessBanner('All preliminary candidates cleared.');
                    setTimeout(() => setSuccessBanner(null), 3000);
                  }
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-bold transition-all cursor-pointer"
                title="Clear all preliminary candidates"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {candidates.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <Activity className="w-7 h-7 text-slate-400 mx-auto opacity-50" />
            <p>No preliminary markets selected yet</p>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('demo_match')}
                className="mt-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-red-600 border border-red-200 rounded-xl font-bold text-xs inline-flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
              >
                <span>+ Pick Markets from Match Comparison</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {candidates.map((cand, idx) => {
              const potentialProfit = Number((cand.stake * (cand.odds - 1)).toFixed(2));
              return (
                <div
                  key={cand.id}
                  className="p-4 rounded-2xl bg-slate-50/90 border-2 border-slate-200 hover:border-red-300 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-start sm:items-center space-x-3">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-mono font-bold text-xs border border-purple-200 shrink-0">
                        Pick #{String(idx + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <div className="font-black text-slate-900 text-sm sm:text-base flex items-center space-x-1.5 flex-wrap">
                          <span>{cand.homeTeam}</span>
                          <span className="text-red-500 font-normal">vs</span>
                          <span>{cand.awayTeam}</span>
                        </div>
                        <div className="text-slate-500 text-xs font-medium flex items-center space-x-2 flex-wrap mt-0.5">
                          {cand.date && <span>{cand.date}</span>}
                          {cand.matchTime && <span>• {cand.matchTime}</span>}
                          <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-bold text-[11px]">
                            {cand.market}
                          </span>
                          {cand.probability && (
                            <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                              {cand.probability}% Confidence
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 self-end sm:self-center shrink-0">
                      {/* Confirm & Place Bet Button */}
                      <button
                        onClick={() => handleConfirmCandidateBet(cand)}
                        className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                        title="Confirm bet and move to Dashboard Pending Matches"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Confirm & Place Bet</span>
                      </button>

                      <button
                        onClick={() => handleLoadCandidateIntoForm(cand)}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-xs"
                        title="Load into entry form to customize"
                      >
                        <PenSquare className="w-3.5 h-3.5 text-slate-500" />
                        <span>Form</span>
                      </button>

                      <button
                        onClick={() => {
                          if (onDeleteCandidate) onDeleteCandidate(cand.id);
                          setSuccessBanner(`Removed ${cand.homeTeam} vs ${cand.awayTeam}`);
                          setTimeout(() => setSuccessBanner(null), 3000);
                        }}
                        className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                        title="Remove candidate selection"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Stake & Odds Adjuster & Quick Settle */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-slate-200 text-xs">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-500 font-medium">Stake:</span>
                        <input
                          type="number"
                          min="1"
                          step="10"
                          value={cand.stake}
                          onChange={(e) => handleInlineUpdateCandidateStake(cand, e.target.value)}
                          className="w-20 px-2 py-1 bg-white border border-slate-300 focus:border-red-500 rounded-lg text-xs font-mono font-bold text-slate-900 outline-hidden"
                          title="Adjust stake"
                        />
                        <span className="text-slate-400 text-[11px] font-mono">{currency}</span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-500 font-medium">Odds:</span>
                        <input
                          type="number"
                          min="1.01"
                          step="0.05"
                          value={cand.odds}
                          onChange={(e) => handleInlineUpdateCandidateOdds(cand, e.target.value)}
                          className="w-18 px-2 py-1 bg-white border border-slate-300 focus:border-red-500 rounded-lg text-xs font-mono font-bold text-emerald-600 outline-hidden"
                          title="Adjust odds"
                        />
                      </div>

                      <div className="flex items-center space-x-1">
                        <span className="text-slate-500 font-medium">To Win:</span>
                        <span className="font-mono font-black text-emerald-600">
                          +{formatMoney(potentialProfit, currency)}
                        </span>
                      </div>
                    </div>

                    {/* Quick direct settle buttons */}
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        onClick={() => handleSettleCandidateDirectly(cand, 'WIN')}
                        className="py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold rounded-xl text-[11px] flex items-center space-x-1 transition-all active:scale-95 cursor-pointer shadow-xs"
                        title="Directly settle as WIN"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>WIN</span>
                      </button>
                      <button
                        onClick={() => handleSettleCandidateDirectly(cand, 'LOSS')}
                        className="py-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold rounded-xl text-[11px] flex items-center space-x-1 transition-all active:scale-95 cursor-pointer shadow-xs"
                        title="Directly settle as LOSS"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>LOSS</span>
                      </button>
                      <button
                        onClick={() => handleSettleCandidateDirectly(cand, 'VOID')}
                        className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold rounded-xl text-[11px] flex items-center space-x-1 transition-all active:scale-95 cursor-pointer shadow-xs"
                        title="Directly settle as VOID"
                      >
                        <Ban className="w-3 h-3" />
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

      {/* PENDING / RUNNING MATCHES SECTION */}
      <div className="solid-card p-6 border border-red-100 bg-white rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Running Matches & Selections</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 font-mono">
              {pendingMatches.length} Open
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('demo_match')}
                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <span>Compare More Matches</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {pendingMatches.length > 0 && onClearPendingMatches && (
              <button
                onClick={() => {
                  if (window.confirm('Clear all open pending match selections?')) {
                    onClearPendingMatches();
                    setSuccessBanner('All open pending selections cleared.');
                    setTimeout(() => setSuccessBanner(null), 3000);
                  }
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-bold transition-all cursor-pointer"
                title="Clear All Pending"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {pendingMatches.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <Activity className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
            <p>No pending matches or selections</p>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('demo_match')}
                className="mt-2 px-4 py-2 bg-white hover:bg-slate-100 text-red-600 border border-red-200 rounded-xl font-bold text-xs inline-flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
              >
                <span>+ Pick from Match Comparison</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {pendingMatches.map((match, index) => {
              const matchProfit = Number((match.stake * (match.odds - 1)).toFixed(2));
              return (
                <div
                  key={match.id}
                  className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-red-200 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-start sm:items-center space-x-3">
                      <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 font-mono font-bold text-xs border border-red-200 shrink-0">
                        #{String(match.dayNumber || index + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <div className="font-black text-slate-900 text-sm sm:text-base flex items-center space-x-1.5 flex-wrap">
                          <span>{match.homeTeam}</span>
                          <span className="text-red-500 font-normal">vs</span>
                          <span>{match.awayTeam}</span>
                        </div>
                        <div className="text-slate-500 text-xs font-medium flex items-center space-x-2 flex-wrap mt-0.5">
                          <span>{match.league}</span>
                          {match.date && <span>• {match.date}</span>}
                          {match.matchTime && <span>• {match.matchTime}</span>}
                          <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-bold text-[11px]">
                            {match.market}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleLoadIntoForm(match)}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-xs"
                        title="Load into form below to customize or place bet"
                      >
                        <PenSquare className="w-3.5 h-3.5 text-slate-500" />
                        <span>Form</span>
                      </button>
                      <button
                        onClick={() => setActiveSlipMatch(match)}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-xs"
                        title="View / Download Match Slip"
                      >
                        <Ticket className="w-3.5 h-3.5 text-slate-500" />
                        <span>Slip</span>
                      </button>
                      <button
                        onClick={() => handleDeletePendingMatch(match.id, `${match.homeTeam} vs ${match.awayTeam}`)}
                        className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                        title="Delete this selection"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-slate-200 text-xs">
                    {/* Inline Stake & Odds Adjuster */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-500 font-medium">Stake:</span>
                        <input
                          type="number"
                          min="1"
                          step="10"
                          value={match.stake}
                          onChange={(e) => handleInlineUpdateStake(match, e.target.value)}
                          className="w-20 px-2 py-1 bg-white border border-slate-300 focus:border-red-500 rounded-lg text-xs font-mono font-bold text-slate-900 outline-hidden"
                          title="Click to adjust stake"
                        />
                        <span className="text-slate-400 text-[11px] font-mono">{currency}</span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-500 font-medium">Odds:</span>
                        <input
                          type="number"
                          min="1.01"
                          step="0.05"
                          value={match.odds}
                          onChange={(e) => handleInlineUpdateOdds(match, e.target.value)}
                          className="w-18 px-2 py-1 bg-white border border-slate-300 focus:border-red-500 rounded-lg text-xs font-mono font-bold text-emerald-600 outline-hidden"
                          title="Click to adjust odds"
                        />
                      </div>

                      <div className="flex items-center space-x-1">
                        <span className="text-slate-500 font-medium">To Win:</span>
                        <span className="font-mono font-black text-emerald-600">
                          +{formatMoney(matchProfit, currency)}
                        </span>
                      </div>
                    </div>

                    {/* Settlement Buttons */}
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        onClick={() => {
                          onUpdateMatchStatus(match.id, 'WIN');
                          setSuccessBanner(`Match marked as WIN! Profit +${formatMoney(matchProfit, currency)} credited to balance.`);
                          setTimeout(() => setSuccessBanner(null), 4000);
                        }}
                        className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-black rounded-xl text-xs flex items-center justify-center space-x-1 transition-all active:scale-95 cursor-pointer shadow-xs whitespace-nowrap"
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
                        className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-black rounded-xl text-xs flex items-center justify-center space-x-1 transition-all active:scale-95 cursor-pointer shadow-xs whitespace-nowrap"
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
                        className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
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
      <div id="new-match-entry-card" className="solid-card p-6 space-y-6 bg-white border border-red-100 rounded-2xl shadow-sm">
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
