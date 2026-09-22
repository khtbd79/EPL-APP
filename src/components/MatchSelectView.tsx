import React, { useState, useMemo } from 'react';
import {
  AppState,
  MarketRecordEntry,
  MatchRecord,
  CandidateMatch,
  ActiveTab,
} from '../types';
import { ALL_EPL_20_TEAMS, getTeamInfo } from '../utils/teamData';
import {
  generateMatchSignals,
  MarketSignal,
  SignalGrade,
} from '../utils/marketSignalEngine';
import { loadSavedAnalyses } from '../utils/teamData';
import { generateId } from '../utils/storage';
import {
  Target,
  ArrowRightLeft,
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  Layers,
  Copy,
  Check,
  ChevronRight,
  Flame,
  BarChart2,
  Swords,
  BookmarkPlus,
  Sparkles,
  Activity,
  Trophy,
  Plus,
} from 'lucide-react';

interface MatchSelectViewProps {
  state: AppState;
  onNavigateTab?: (tab: ActiveTab) => void;
  onAddMarketRecord?: (entry: MarketRecordEntry) => void;
  onRecordMatch?: (match: MatchRecord) => void;
  onAddCandidateMatch?: (candidate: CandidateMatch) => void;
}

export const MatchSelectView: React.FC<MatchSelectViewProps> = ({
  state,
  onNavigateTab,
  onAddMarketRecord,
  onRecordMatch,
  onAddCandidateMatch,
}) => {
  const [homeTeam, setHomeTeam] = useState<string>('Arsenal');
  const [awayTeam, setAwayTeam] = useState<string>('Chelsea');
  const [matchDate, setMatchDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [matchTime, setMatchTime] = useState<string>('19:30');

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');
  const [copiedSignalId, setCopiedSignalId] = useState<string | null>(null);
  const [addedRecordNotice, setAddedRecordNotice] = useState<string | null>(null);

  const pendingCount = useMemo(() => {
    const candidateCount = (state.candidateMatches || []).length;
    const pendingHistory = (state.matchHistory || []).filter((m) => m.result === 'PENDING').length;
    return candidateCount + pendingHistory;
  }, [state.candidateMatches, state.matchHistory]);

  const isSignalInPending = (marketName: string) => {
    const inCandidate = (state.candidateMatches || []).some(
      (c) =>
        c.homeTeam.trim().toLowerCase() === homeTeam.trim().toLowerCase() &&
        c.awayTeam.trim().toLowerCase() === awayTeam.trim().toLowerCase() &&
        c.market.trim().toLowerCase() === marketName.trim().toLowerCase()
    );
    const inHistory = (state.matchHistory || []).some(
      (m) =>
        m.result === 'PENDING' &&
        m.homeTeam.trim().toLowerCase() === homeTeam.trim().toLowerCase() &&
        m.awayTeam.trim().toLowerCase() === awayTeam.trim().toLowerCase() &&
        m.market.trim().toLowerCase() === marketName.trim().toLowerCase()
    );
    return inCandidate || inHistory;
  };

  const savedAnalyses = useMemo(() => loadSavedAnalyses(), []);

  const analysisResult = useMemo(() => {
    return generateMatchSignals(
      homeTeam,
      awayTeam,
      state.eplMatches || [],
      state.categoryRankings,
      state.preMatchNotes,
      savedAnalyses
    );
  }, [homeTeam, awayTeam, state.eplMatches, state.categoryRankings, state.preMatchNotes, savedAnalyses]);

  const handleSwapTeams = () => {
    const temp = homeTeam;
    setHomeTeam(awayTeam);
    setAwayTeam(temp);
  };

  const filteredSignals = useMemo(() => {
    if (activeCategoryFilter === 'ALL') return analysisResult.allSignals;
    if (activeCategoryFilter === 'TOP') return analysisResult.topSignals;
    return analysisResult.allSignals.filter((s) => s.category === activeCategoryFilter);
  }, [analysisResult, activeCategoryFilter]);

  const handleAddToMarketRecords = (signal: MarketSignal) => {
    const entryId = generateId();
    const fairOdds = typeof signal.fairOdds === 'number' && signal.fairOdds > 1 ? signal.fairOdds : 1.85;
    const defaultStake = 100;

    // 1. Add as preliminary candidate selection to Select Match (does NOT go to Dashboard until confirmed in Select Match)
    if (onAddCandidateMatch) {
      const newCandidate: CandidateMatch = {
        id: entryId,
        createdAt: new Date().toISOString(),
        date: matchDate.trim() || new Date().toISOString().split('T')[0],
        matchTime: matchTime.trim() || undefined,
        homeTeam: homeTeam.trim(),
        awayTeam: awayTeam.trim(),
        market: signal.marketName,
        odds: fairOdds,
        stake: defaultStake,
        probability: signal.probability,
        notes: `From Match Comparison • ${signal.probability}%`,
      };
      onAddCandidateMatch(newCandidate);
    } else if (onRecordMatch) {
      const newPendingMatch: MatchRecord = {
        id: entryId,
        dayNumber: state.currentDay,
        date: matchDate.trim() || new Date().toISOString().split('T')[0],
        matchTime: matchTime.trim() || undefined,
        league: 'Premier League',
        homeTeam: homeTeam.trim(),
        awayTeam: awayTeam.trim(),
        market: signal.marketName,
        selection: signal.marketName,
        odds: fairOdds,
        stake: defaultStake,
        result: 'PENDING',
        profit: 0,
        loss: 0,
        netPnL: 0,
        bankrollAfter: 0,
        notes: `From Match Comparison • ${signal.probability}%`,
      };
      onRecordMatch(newPendingMatch);
    }

    // 2. Also save into marketRecords for analysis persistence
    if (onAddMarketRecord) {
      const newEntry: MarketRecordEntry = {
        id: entryId,
        createdAt: new Date().toISOString(),
        date: matchDate,
        matchTime: matchTime,
        homeTeam,
        awayTeam,
        venue: analysisResult.venue,
        selectedMarkets: [signal.marketName],
        odds: fairOdds,
        result: 'PENDING',
        notes: `${signal.marketName} • ${signal.probability}%`,
      };
      onAddMarketRecord(newEntry);
    }

    setAddedRecordNotice(`Added ${signal.marketName} to Select Match`);
    setTimeout(() => {
      setAddedRecordNotice(null);
    }, 3000);
  };

  const handleCopyAnalysis = (signal?: MarketSignal) => {
    let text = `${homeTeam.toUpperCase()} VS ${awayTeam.toUpperCase()}\n`;
    text += `VENUE: ${analysisResult.venue}\n`;
    if (analysisResult.hasSavedData) {
      text += `PROJECTED: ${analysisResult.projectedScore} (xG: ${analysisResult.totalExpectedGoals})\n\n`;
      if (signal) {
        text += `MARKET: ${signal.marketName}\n`;
        text += `PROBABILITY: ${signal.probability}%\n`;
        text += `FAIR ODDS: @${signal.fairOdds}\n`;
      } else {
        text += `SIGNALS:\n`;
        analysisResult.topSignals.forEach((s, idx) => {
          text += `${idx + 1}. ${s.marketName} (${s.probability}% @${s.fairOdds})\n`;
        });
      }
    } else {
      text += `STATUS: NO SAVED MATCH DATA\n`;
    }

    navigator.clipboard.writeText(text);
    setCopiedSignalId(signal ? signal.id : 'all');
    setTimeout(() => setCopiedSignalId(null), 2500);
  };

  const getSignalBadgeClasses = (grade: SignalGrade) => {
    switch (grade) {
      case 'STRONG':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'SOLID':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'MODERATE':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'CAUTION':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'AVOID':
        return 'bg-rose-50 text-rose-800 border-rose-200';
    }
  };

  const getProgressBarColor = (grade: SignalGrade) => {
    switch (grade) {
      case 'STRONG':
        return 'bg-red-600';
      case 'SOLID':
        return 'bg-blue-600';
      case 'MODERATE':
        return 'bg-amber-500';
      case 'CAUTION':
        return 'bg-orange-500';
      case 'AVOID':
        return 'bg-rose-500';
    }
  };

  const homeInfo = getTeamInfo(homeTeam);
  const awayInfo = getTeamInfo(awayTeam);

  const eplMatchesList = state.eplMatches || [];
  const recentFixtures = useMemo(() => {
    return [...eplMatchesList].slice(0, 10);
  }, [eplMatchesList]);

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white border border-red-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600">
            <Target className="w-5 h-5" />
          </div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-wider">
              MATCH COMPARISON
            </h1>
            {analysisResult.hasSavedData && (
              <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                ACTIVE
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {addedRecordNotice && (
            <span className="text-xs font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl">
              {addedRecordNotice}
            </span>
          )}
          <button
            onClick={() => handleCopyAnalysis()}
            className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
          >
            {copiedSignalId === 'all' ? (
              <>
                <Check className="w-3.5 h-3.5 text-red-600" />
                <span className="text-red-600 font-mono">COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>SHARE</span>
              </>
            )}
          </button>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('select_match')}
              className="py-2 px-3.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Target className="w-3.5 h-3.5" />
              <span>SELECT MATCH {pendingCount > 0 ? `(${pendingCount})` : ''}</span>
            </button>
          )}
        </div>
      </div>

      {/* Fixture Control Deck */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-red-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-3 items-center">
          {/* Home Team Card */}
          <div className="lg:col-span-5 p-3.5 rounded-xl bg-slate-50 border border-red-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-red-600">
                HOME
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-500">
                {analysisResult.homeStats.totalMatches} MATCHES
              </span>
            </div>

            <select
              value={homeTeam}
              onChange={(e) => {
                const val = e.target.value;
                if (val === awayTeam) setAwayTeam(homeTeam);
                setHomeTeam(val);
              }}
              className="w-full bg-white border border-slate-200 text-slate-900 font-bold text-base rounded-lg px-3 py-2 outline-none focus:border-red-500 cursor-pointer shadow-xs"
            >
              {ALL_EPL_20_TEAMS.map((t) => (
                <option key={t.id} value={t.name} className="bg-white text-slate-900 font-bold">
                  {t.name}
                </option>
              ))}
            </select>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span className="truncate">{homeInfo?.city || 'HOME'}</span>
              <span className="text-red-600 font-bold">{analysisResult.homeStats.tier}</span>
            </div>
          </div>

          {/* Swap Trigger */}
          <div className="lg:col-span-1 flex justify-center py-1 lg:py-0">
            <button
              type="button"
              onClick={handleSwapTeams}
              className="p-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow active:scale-95 transition-all cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Away Team Card */}
          <div className="lg:col-span-5 p-3.5 rounded-xl bg-slate-50 border border-blue-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                AWAY
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-500">
                {analysisResult.awayStats.totalMatches} MATCHES
              </span>
            </div>

            <select
              value={awayTeam}
              onChange={(e) => {
                const val = e.target.value;
                if (val === homeTeam) setHomeTeam(awayTeam);
                setAwayTeam(val);
              }}
              className="w-full bg-white border border-slate-200 text-slate-900 font-bold text-base rounded-lg px-3 py-2 outline-none focus:border-blue-500 cursor-pointer shadow-xs"
            >
              {ALL_EPL_20_TEAMS.map((t) => (
                <option key={t.id} value={t.name} className="bg-white text-slate-900 font-bold">
                  {t.name}
                </option>
              ))}
            </select>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span className="truncate">{awayInfo?.city || 'AWAY'}</span>
              <span className="text-blue-600 font-bold">{analysisResult.awayStats.tier}</span>
            </div>
          </div>
        </div>

        {/* Match Metadata & Venue Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-600 font-mono">
            <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-red-600" />
              <input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="bg-transparent text-slate-800 text-xs font-bold outline-none cursor-pointer"
              />
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <input
                type="time"
                value={matchTime}
                onChange={(e) => setMatchTime(e.target.value)}
                className="bg-transparent text-slate-800 text-xs font-bold outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Quick Load Fixtures */}
        {recentFixtures.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 pb-1 scrollbar-thin">
            {recentFixtures.map((m) => {
              const isActive = homeTeam === m.homeTeam && awayTeam === m.awayTeam;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setHomeTeam(m.homeTeam);
                    setAwayTeam(m.awayTeam);
                    if (m.date) setMatchDate(m.date);
                    if (m.matchTime) setMatchTime(m.matchTime);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{m.homeTeam} vs {m.awayTeam}</span>
                  <span className="ml-1 font-mono opacity-70">({m.homeScore}-{m.awayScore})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Body */}
      {!analysisResult.hasSavedData ? (
        <div className="p-8 sm:p-12 rounded-2xl border border-slate-200 text-center space-y-4 bg-white shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-500">
            <Activity className="w-6 h-6" />
          </div>
          <div className="text-sm font-bold text-slate-700 tracking-wider uppercase">
            NO SAVED DATA IN MATCH CENTER
          </div>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('daily_task')}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all cursor-pointer uppercase inline-flex items-center space-x-1.5 shadow-md shadow-red-600/20"
            >
              <Trophy className="w-4 h-4" />
              <span>MATCH CENTER</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Key Metrics Board */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl border border-red-200 bg-white shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  PROJECTED SCORE
                </span>
                <div className="text-2xl font-black font-mono text-red-600 mt-0.5">
                  {analysisResult.projectedScore}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-red-50 text-red-600 border border-red-200">
                <Flame className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 bg-white shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  EXPECTED GOALS
                </span>
                <div className="text-2xl font-black font-mono text-blue-600 mt-0.5">
                  {analysisResult.totalExpectedGoals}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-white shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  HEAD TO HEAD
                </span>
                <div className="text-lg font-black font-mono text-amber-600 mt-1">
                  {analysisResult.h2h.totalMatches > 0
                    ? `${analysisResult.h2h.homeWins}W - ${analysisResult.h2h.draws}D - ${analysisResult.h2h.awayWins}L`
                    : 'NO H2H'}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                <Swords className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-purple-200 bg-white shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  TOP PICK
                </span>
                <div className="text-sm font-black text-purple-700 mt-1 truncate max-w-[140px]">
                  {analysisResult.topSignals[0]?.marketName || '-'}
                </div>
                {analysisResult.topSignals[0] && (
                  <button
                    onClick={() => handleAddToMarketRecords(analysisResult.topSignals[0])}
                    className="mt-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 underline flex items-center space-x-1 cursor-pointer"
                  >
                    <span>
                      {isSignalInPending(analysisResult.topSignals[0].marketName)
                        ? '✓ In Select Match'
                        : '+ Add to Select Match'}
                    </span>
                  </button>
                )}
              </div>
              <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-200">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Market Signals Deck */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-red-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-red-600" />
                <h2 className="text-sm font-black text-slate-900 tracking-wider uppercase">
                  MARKET SIGNALS
                </h2>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
                {[
                  { id: 'ALL', label: 'ALL' },
                  { id: 'TOP', label: 'TOP PICKS' },
                  { id: 'BTTS', label: 'BTTS' },
                  { id: 'GOALS', label: 'GOALS' },
                  { id: 'RESULT', label: '1X2' },
                  { id: 'DOUBLE_CHANCE', label: 'DOUBLE CHANCE' },
                  { id: 'SPECIAL', label: '1ST HALF' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategoryFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      activeCategoryFilter === tab.id
                        ? 'bg-red-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredSignals.map((sig) => (
                <div
                  key={sig.id}
                  className="p-3.5 sm:p-4 rounded-xl border bg-slate-50/70 border-slate-200 hover:border-red-300 flex flex-col justify-between space-y-3 transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500">
                          {sig.category}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">
                          {sig.marketName}
                        </h3>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border shrink-0 ${getSignalBadgeClasses(
                          sig.signalGrade
                        )}`}
                      >
                        {sig.signalGrade}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500 font-bold">PROBABILITY</span>
                        <span className="font-black text-slate-900">
                          {sig.probability}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getProgressBarColor(sig.signalGrade)}`}
                          style={{ width: `${sig.probability}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">FAIR ODDS</span>
                        <span className="font-bold text-red-600">@{sig.fairOdds}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">CONFIDENCE</span>
                        <span className="font-bold text-slate-800">{sig.signalGrade}</span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      {sig.keyReasons.map((reason, idx) => (
                        <div key={idx} className="flex items-start space-x-1.5 text-xs text-slate-700">
                          <ChevronRight className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center space-x-2">
                    <button
                      onClick={() => handleAddToMarketRecords(sig)}
                      className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95 shadow-xs ${
                        isSignalInPending(sig.marketName)
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      {isSignalInPending(sig.marketName) ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>IN SELECT MATCH</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>ADD TO SELECT MATCH</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleCopyAnalysis(sig)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 cursor-pointer active:scale-95"
                    >
                      {copiedSignalId === sig.id ? (
                        <Check className="w-3.5 h-3.5 text-red-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Comparison & H2H */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Stats Comparison */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-red-200 shadow-sm space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center space-x-2">
                <TrendingUp className="w-3.5 h-3.5 text-red-600" />
                <span>VENUE PERFORMANCE</span>
              </h3>

              <div className="space-y-2.5">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-red-600">{homeTeam}: {analysisResult.homeStats.avgGoalsFor}</span>
                    <span className="text-slate-500">AVG GOALS SCORED</span>
                    <span className="text-blue-600">{awayTeam}: {analysisResult.awayStats.avgGoalsFor}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden flex justify-end">
                      <div
                        className="h-full bg-red-600 rounded-full"
                        style={{ width: `${Math.min(100, (analysisResult.homeStats.avgGoalsFor / 3) * 100)}%` }}
                      />
                    </div>
                    <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${Math.min(100, (analysisResult.awayStats.avgGoalsFor / 3) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-red-600">{homeTeam}: {analysisResult.homeStats.avgGoalsAgainst}</span>
                    <span className="text-slate-500">AVG GOALS CONCEDED</span>
                    <span className="text-blue-600">{awayTeam}: {analysisResult.awayStats.avgGoalsAgainst}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden flex justify-end">
                      <div
                        className="h-full bg-red-600 rounded-full"
                        style={{ width: `${Math.min(100, (analysisResult.homeStats.avgGoalsAgainst / 3) * 100)}%` }}
                      />
                    </div>
                    <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${Math.min(100, (analysisResult.awayStats.avgGoalsAgainst / 3) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-red-600">{homeTeam}: {analysisResult.homeStats.bttsRate}%</span>
                    <span className="text-slate-500">BTTS RATE</span>
                    <span className="text-blue-600">{awayTeam}: {analysisResult.awayStats.bttsRate}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden flex justify-end">
                      <div
                        className="h-full bg-red-600 rounded-full"
                        style={{ width: `${analysisResult.homeStats.bttsRate}%` }}
                      />
                    </div>
                    <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${analysisResult.awayStats.bttsRate}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-red-600">{homeTeam}: {analysisResult.homeStats.cleanSheetRate}%</span>
                    <span className="text-slate-500">CLEAN SHEET RATE</span>
                    <span className="text-blue-600">{awayTeam}: {analysisResult.awayStats.cleanSheetRate}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden flex justify-end">
                      <div
                        className="h-full bg-red-600 rounded-full"
                        style={{ width: `${analysisResult.homeStats.cleanSheetRate}%` }}
                      />
                    </div>
                    <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${analysisResult.awayStats.cleanSheetRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* H2H Log */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-red-200 shadow-sm space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center space-x-2">
                <Swords className="w-3.5 h-3.5 text-amber-600" />
                <span>HEAD TO HEAD RECORD</span>
              </h3>

              {analysisResult.h2h.recentMatches.length > 0 ? (
                <div className="space-y-2">
                  {analysisResult.h2h.recentMatches.map((m) => (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500 font-mono text-[11px]">{m.date}</span>
                        <span className="font-bold text-slate-900">
                          {m.homeTeam} vs {m.awayTeam}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2.5">
                        <span className="font-black font-mono text-red-700 text-xs bg-white px-2 py-0.5 rounded border border-slate-200">
                          {m.homeScore} - {m.awayScore}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            m.btts ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {m.btts ? 'BTTS' : 'NO BTTS'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 font-mono uppercase">
                    NO DIRECT HEAD TO HEAD RECORD
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
