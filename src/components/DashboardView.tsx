import React, { useState } from 'react';
import { ActiveTab, AppState, MatchRecord } from '../types';
import { calculateFinancials, formatMoney } from '../utils/storage';
import { calculateEPLStandings } from '../utils/teamData';
import {
  calculateMarketBetSummaries,
  printMarketPnlPdf,
  buildMarketPnlPrintHtml,
  MarketBetSummary,
} from '../utils/pdfGenerator';
import { TeamCrest } from './TeamCrest';
import { ReportPreviewModal } from './ReportPreviewModal';
import {
  Trophy,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  ArrowUpRight,
  Shield,
  Activity,
  Layers,
  ChevronRight,
  Printer,
  FileSpreadsheet,
  BarChart3,
  Percent,
  Check,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

interface DashboardViewProps {
  state: AppState;
  setActiveTab: (tab: ActiveTab) => void;
  onRecordMatch?: (match: MatchRecord) => void;
  onUpdateMatchStatus?: (id: string, result: 'WIN' | 'LOSS' | 'VOID') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  setActiveTab,
  onUpdateMatchStatus
}) => {
  const fin = calculateFinancials(state);
  const currency = state.settings.currency || 'BDT';

  // 1. TOP 5 TEAMS (Calculated strictly from user-recorded team match data)
  const standings = calculateEPLStandings(state.eplMatches || []);
  const teamsWithMatches = standings.filter((t) => t.played > 0);
  const top5Teams = teamsWithMatches.slice(0, 5);

  // 2. TOP 5 MARKETS (Calculated strictly from user-recorded match data)
  const eplMatches = state.eplMatches || [];
  const totalEplMatches = eplMatches.length;

  const marketStats = React.useMemo(() => {
    // If no match/team data is added, NEVER return demo or simulated data
    if (totalEplMatches === 0) {
      return [];
    }

    const bttsCount = eplMatches.filter((m) => m.btts).length;
    const over25Count = eplMatches.filter((m) => m.over25).length;
    const homeWinCount = eplMatches.filter((m) => m.winner === 'HOME').length;
    const over15Count = eplMatches.filter((m) => m.totalGoals > 1.5).length;
    const cleanSheetCount = eplMatches.filter((m) => m.cleanSheetTeam && m.cleanSheetTeam !== 'NONE').length;

    const list = [
      {
        name: 'BTTS YES',
        winRate: (bttsCount / totalEplMatches) * 100,
        count: bttsCount,
        sample: `${bttsCount}/${totalEplMatches} Matches`
      },
      {
        name: 'Over 2.5 Goals',
        winRate: (over25Count / totalEplMatches) * 100,
        count: over25Count,
        sample: `${over25Count}/${totalEplMatches} Matches`
      },
      {
        name: 'Over 1.5 Goals',
        winRate: (over15Count / totalEplMatches) * 100,
        count: over15Count,
        sample: `${over15Count}/${totalEplMatches} Matches`
      },
      {
        name: 'Home Win',
        winRate: (homeWinCount / totalEplMatches) * 100,
        count: homeWinCount,
        sample: `${homeWinCount}/${totalEplMatches} Matches`
      },
      {
        name: 'Clean Sheet',
        winRate: (cleanSheetCount / totalEplMatches) * 100,
        count: cleanSheetCount,
        sample: `${cleanSheetCount}/${totalEplMatches} Matches`
      },
    ];

    return list.sort((a, b) => b.winRate - a.winRate).slice(0, 5);
  }, [eplMatches, totalEplMatches]);

  // 3. WIN & LOSS (User Predictions Settled: Won vs Lost)
  const wonCount = fin.winningBets;
  const lostCount = fin.losingBets;
  const settledCount = wonCount + lostCount;
  const winPercent = settledCount > 0 ? (wonCount / settledCount) * 100 : 0;
  const lossPercent = settledCount > 0 ? (lostCount / settledCount) * 100 : 0;

  // 4. PENDING MATCHES
  const pendingBets = (state.matchHistory || []).filter((m) => m.result === 'PENDING');

  // 5. USER PREDICTION MARKET BREAKDOWN (Won vs Lost per market)
  const [marketFilter, setMarketFilter] = useState<'all' | 'won' | 'lost'>('all');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const marketBetSummaries = React.useMemo(() => {
    return calculateMarketBetSummaries(state);
  }, [state.matchHistory]);

  const filteredMarketSummaries = React.useMemo(() => {
    if (marketFilter === 'won') {
      return marketBetSummaries.filter((m) => m.wonBets > 0 && m.wonBets >= m.lostBets);
    }
    if (marketFilter === 'lost') {
      return marketBetSummaries.filter((m) => m.lostBets > 0 && m.lostBets > m.wonBets);
    }
    return marketBetSummaries;
  }, [marketBetSummaries, marketFilter]);

  const winningMarketsCount = marketBetSummaries.filter((m) => m.netPnL > 0).length;
  const losingMarketsCount = marketBetSummaries.filter((m) => m.netPnL < 0).length;
  const totalUserBetsSettled = marketBetSummaries.reduce((sum, m) => sum + m.wonBets + m.lostBets, 0);

  const printableHtml = React.useMemo(() => {
    return buildMarketPnlPrintHtml(state);
  }, [state]);

  const handleQuickPrint = () => {
    printMarketPnlPdf(state);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-all active:scale-95 whitespace-nowrap shrink-0"
            title="Print Market Win / Loss Report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
          <div className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-black font-mono border border-slate-200 whitespace-nowrap shrink-0">
            <span className="hidden sm:inline">{totalEplMatches} Matches Synced</span>
            <span className="sm:hidden">{totalEplMatches} Synced</span>
          </div>
        </div>
      </div>

      {/* Grid for Top 5 Teams & Top 5 Markets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ========================================================
            CARD 1: TOP 5 TEAM
        ======================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
                <Trophy className="w-4 h-4 stroke-[2.2]" />
              </div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Top 5 Teams</h2>
            </div>
            <button
              onClick={() => setActiveTab('standings')}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center space-x-1 cursor-pointer"
            >
              <span>Full Standings</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {top5Teams.length === 0 ? (
            <div className="p-8 text-center flex-1 flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                <Trophy className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="text-xs font-bold text-slate-700">No Team Data Recorded</div>
              <button
                onClick={() => setActiveTab('team_data')}
                className="mt-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Go to Team Data
              </button>
            </div>
          ) : (
            <div className="p-2 flex-1 flex flex-col justify-center">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="py-2.5 px-3 text-center w-8">#</th>
                    <th className="py-2.5 px-3">Team</th>
                    <th className="py-2.5 px-2 text-center">P</th>
                    <th className="py-2.5 px-2 text-center">W</th>
                    <th className="py-2.5 px-2 text-center">D</th>
                    <th className="py-2.5 px-2 text-center">L</th>
                    <th className="py-2.5 px-2 text-center font-mono">GD</th>
                    <th className="py-2.5 px-3 text-center font-black text-slate-900">PTS</th>
                    <th className="py-2.5 px-3 text-center hidden sm:table-cell">Form</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                  {top5Teams.map((team, idx) => (
                    <tr key={team.team} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 text-center font-bold">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-black font-mono">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2.5">
                          <TeamCrest teamName={team.team} className="w-6 h-6 shrink-0" size={24} />
                          <span className="font-extrabold text-slate-900 truncate">{team.team}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-slate-600">{team.played}</td>
                      <td className="py-3 px-2 text-center font-mono text-emerald-600 font-bold">{team.won}</td>
                      <td className="py-3 px-2 text-center font-mono text-orange-600 font-bold">{team.drawn}</td>
                      <td className="py-3 px-2 text-center font-mono text-red-600 font-bold">{team.lost}</td>
                      <td className="py-3 px-2 text-center font-mono font-bold">
                        <span className={team.goalDifference > 0 ? 'text-emerald-600' : team.goalDifference < 0 ? 'text-red-600' : 'text-slate-400'}>
                          {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-black font-mono text-slate-900 text-sm">
                        {team.points}
                      </td>
                      <td className="py-3 px-3 text-center hidden sm:table-cell">
                        {team.form.length === 0 ? (
                          <span className="text-[10px] text-slate-300">-</span>
                        ) : (
                          <div className="flex items-center justify-center space-x-1">
                            {team.form.map((f, i) => (
                              <span
                                key={i}
                                data-form={f}
                                className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center text-white font-mono ${
                                  f === 'W'
                                    ? 'form-badge-w bg-green-600'
                                    : f === 'D'
                                    ? 'form-badge-d bg-orange-500'
                                    : 'form-badge-l bg-red-600'
                                }`}
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ========================================================
            CARD 2: TOP 5 MARKET (GRAPH)
        ======================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20">
                <TrendingUp className="w-4 h-4 stroke-[2.2]" />
              </div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Top 5 Markets</h2>
            </div>
            <button
              onClick={() => setActiveTab('all_markets')}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center space-x-1 cursor-pointer"
            >
              <span>All Markets</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {marketStats.length === 0 ? (
            <div className="p-8 text-center flex-1 flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                <TrendingUp className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="text-xs font-bold text-slate-700">No Team Data Recorded</div>
              <button
                onClick={() => setActiveTab('team_data')}
                className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Go to Team Data
              </button>
            </div>
          ) : (
            <div className="p-5 flex-1 flex flex-col justify-around space-y-4">
              {marketStats.map((market, idx) => (
                <div key={market.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-4 text-center font-mono font-bold text-slate-400">
                        {idx + 1}
                      </span>
                      <span className="font-extrabold text-slate-900">{market.name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold hidden sm:inline">
                        ({market.sample})
                      </span>
                    </div>
                    <span className="font-black font-mono text-slate-900 text-xs">
                      {market.winRate.toFixed(1)}%
                    </span>
                  </div>

                  {/* Progress Bar Graph */}
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0
                          ? 'bg-red-600'
                          : idx === 1
                          ? 'bg-blue-600'
                          : idx === 2
                          ? 'bg-emerald-600'
                          : idx === 3
                          ? 'bg-indigo-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(8, market.winRate))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid for Win & Loss and Pending Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ========================================================
            CARD 3: WIN & LOSS (PERCENTAGE GRAPH)
        ======================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
                <Activity className="w-4 h-4 stroke-[2.2]" />
              </div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Win & Loss</h2>
            </div>
            <div className="text-xs font-bold font-mono text-slate-600">
              Total Settled: <span className="text-slate-900 font-black">{settledCount}</span>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
            {/* Visual Comparative Graph Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-black font-mono">
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Win: {winPercent.toFixed(1)}%</span>
                </span>
                <span className="text-rose-700 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Loss: {lossPercent.toFixed(1)}%</span>
                </span>
              </div>

              {settledCount === 0 ? (
                <div className="w-full h-7 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 text-[11px] font-bold text-slate-400">
                  No settled predictions yet
                </div>
              ) : (
                <div className="w-full h-7 bg-slate-100 rounded-xl overflow-hidden flex p-1 gap-1 border border-slate-200">
                  <div
                    className="h-full bg-emerald-500 rounded-lg transition-all duration-500 flex items-center justify-center text-[10px] font-black text-white font-mono"
                    style={{ width: `${Math.max(5, winPercent)}%` }}
                  >
                    {winPercent >= 15 ? `${winPercent.toFixed(0)}%` : ''}
                  </div>
                  <div
                    className="h-full bg-rose-500 rounded-lg transition-all duration-500 flex items-center justify-center text-[10px] font-black text-white font-mono"
                    style={{ width: `${Math.max(5, lossPercent)}%` }}
                  >
                    {lossPercent >= 15 ? `${lossPercent.toFixed(0)}%` : ''}
                  </div>
                </div>
              )}
            </div>

            {/* Metric Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 whitespace-nowrap">
                  <span className="hidden sm:inline">Won Matches</span>
                  <span className="sm:hidden">Won</span>
                </div>
                <div className="text-xl font-black font-mono text-emerald-800 mt-0.5">{wonCount}</div>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700 whitespace-nowrap">
                  <span className="hidden sm:inline">Lost Matches</span>
                  <span className="sm:hidden">Lost</span>
                </div>
                <div className="text-xl font-black font-mono text-rose-800 mt-0.5">{lostCount}</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Win Rate</div>
                <div className="text-xl font-black font-mono text-slate-900 mt-0.5">{winPercent.toFixed(1)}%</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Net Return</div>
                <div className={`text-xl font-black font-mono mt-0.5 whitespace-nowrap ${fin.netBettingPnL >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {fin.netBettingPnL >= 0 ? '+' : ''}{formatMoney(fin.netBettingPnL, currency)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            CARD 4: PENDING MATCHES
        ======================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
                <Clock className="w-4 h-4 stroke-[2.2]" />
              </div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Pending Matches</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black font-mono bg-amber-100 text-amber-800 border border-amber-200">
                {pendingBets.length} Active
              </span>
              <button
                onClick={() => setActiveTab('select_match')}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center space-x-0.5 cursor-pointer ml-1"
              >
                <span>Add</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-center">
            {pendingBets.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
                <div className="text-sm font-black text-slate-700">No Pending Matches Active</div>
                <button
                  onClick={() => setActiveTab('select_match')}
                  className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Add Match in Match Center
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-y-auto max-h-[300px]">
                {pendingBets.map((item) => (
                  <div key={item.id} className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-extrabold text-slate-900 truncate">
                        {item.homeTeam} vs {item.awayTeam}
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                        <span className="text-red-600 font-extrabold">{item.market}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Odds: <strong className="font-mono text-slate-800">@{item.odds.toFixed(2)}</strong></span>
                        <span className="hidden sm:inline">•</span>
                        <span>Stake: <strong className="font-mono text-slate-800">{formatMoney(item.stake, currency)}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        Pending
                      </span>

                      {onUpdateMatchStatus && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => onUpdateMatchStatus(item.id, 'WIN')}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 cursor-pointer"
                            title="Mark as Won"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onUpdateMatchStatus(item.id, 'LOSS')}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 cursor-pointer"
                            title="Mark as Lost"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          CARD 5: MARKET WIN & LOSS BREAKDOWN
      ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header with Title & Action Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center border border-red-600/20">
              <BarChart3 className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  <span className="hidden sm:inline">Market Performance Analysis (Win & Loss)</span>
                  <span className="sm:hidden">Market Performance</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-red-100 text-red-700 shrink-0">
                  {marketBetSummaries.length} Markets
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Filter Pills & Print */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setMarketFilter('all')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg font-bold text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap ${
                  marketFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All ({marketBetSummaries.length})
              </button>
              <button
                type="button"
                onClick={() => setMarketFilter('won')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg font-bold text-[11px] sm:text-xs transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                  marketFilter === 'won' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Won ({winningMarketsCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setMarketFilter('lost')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg font-bold text-[11px] sm:text-xs transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                  marketFilter === 'lost' ? 'bg-rose-600 text-white shadow-xs font-black' : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                <XCircle className="w-3 h-3" />
                <span>Lost ({losingMarketsCount})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0 whitespace-nowrap"
              title="Print Market Win / Loss Table"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Overview Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 border-b border-slate-100 bg-white text-center">
          <div className="p-3 sm:p-3.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Total Markets</div>
            <div className="text-lg font-black font-mono text-slate-900 mt-0.5">{marketBetSummaries.length}</div>
          </div>
          <div className="p-3 sm:p-3.5 bg-emerald-50/40">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 whitespace-nowrap">
              <span className="hidden sm:inline">Profitable Markets (Net Profit)</span>
              <span className="sm:hidden">Profitable Markets</span>
            </div>
            <div className="text-lg font-black font-mono text-emerald-800 mt-0.5">{winningMarketsCount}</div>
          </div>
          <div className="p-3 sm:p-3.5 bg-rose-50/40">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700 whitespace-nowrap">
              <span className="hidden sm:inline">Deficit Markets (Net Loss)</span>
              <span className="sm:hidden">Deficit Markets</span>
            </div>
            <div className="text-lg font-black font-mono text-rose-800 mt-0.5">{losingMarketsCount}</div>
          </div>
          <div className="p-3 sm:p-3.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
              <span className="hidden sm:inline">Total Settled Matches</span>
              <span className="sm:hidden">Settled Matches</span>
            </div>
            <div className="text-lg font-black font-mono text-slate-900 mt-0.5">{totalUserBetsSettled} Matches</div>
          </div>
        </div>

        {/* Detailed Market Breakdown Content */}
        {filteredMarketSummaries.length === 0 ? (
          <div className="p-8 text-center">
            <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-black text-slate-700">No Records Found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/70 border-b border-slate-100">
                  <th className="py-3 px-4">Market Name</th>
                  <th className="py-3 px-3 text-center">Total Matches</th>
                  <th className="py-3 px-3 text-center text-emerald-700 font-black">Won</th>
                  <th className="py-3 px-3 text-center text-rose-700 font-black">Lost</th>
                  <th className="py-3 px-3 text-center">Win Rate</th>
                  <th className="py-3 px-3 text-right">Total Stake</th>
                  <th className="py-3 px-4 text-right">Net Profit / Loss (P/L)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filteredMarketSummaries.map((m) => {
                  const isProfit = m.netPnL > 0;
                  const isLoss = m.netPnL < 0;
                  const settled = m.wonBets + m.lostBets;
                  const winPercent = settled > 0 ? (m.wonBets / settled) * 100 : 0;
                  const lossPercent = settled > 0 ? (m.lostBets / settled) * 100 : 0;

                  return (
                    <tr key={m.market} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>{m.market}</span>
                        </div>
                        {m.pendingBets > 0 && (
                          <div className="text-[10px] text-amber-600 font-bold mt-0.5">
                            ({m.pendingBets} pending)
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-900">
                        {m.totalBets}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-black text-[11px]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{m.wonBets} W</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-mono font-black text-[11px]">
                          <XCircle className="w-3 h-3" />
                          <span>{m.lostBets} L</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-24 h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                            <div
                              className="h-full bg-emerald-500 transition-all duration-300"
                              style={{ width: `${settled === 0 ? 0 : winPercent}%` }}
                            />
                            <div
                              className="h-full bg-rose-500 transition-all duration-300"
                              style={{ width: `${settled === 0 ? 0 : lossPercent}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-600">
                            {settled > 0 ? `${winPercent.toFixed(1)}% Win` : '0.0%'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-700">
                        {formatMoney(m.totalStake, currency)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-black text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-md ${
                            isProfit
                              ? 'bg-emerald-100/70 text-emerald-800'
                              : isLoss
                              ? 'bg-rose-100/70 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isProfit ? '+' : ''}{formatMoney(m.netPnL, currency)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isProfit
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isLoss
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {isProfit ? 'Won' : isLoss ? 'Lost' : 'Even'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Print & PDF Preview Modal */}
      {isPrintModalOpen && (
        <ReportPreviewModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="Market Win & Loss Performance Report"
          htmlContent={printableHtml}
          downloadFilename={`EPL_Market_Win_Loss_Report_${new Date().toISOString().split('T')[0]}.html`}
        />
      )}
    </div>
  );
};
