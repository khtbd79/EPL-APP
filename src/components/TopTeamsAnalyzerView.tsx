import React, { useState, useMemo } from 'react';
import { AppState } from '../types';
import { analyzeTop5Teams } from '../utils/topTeamsAnalyzer';
import { downloadTopTeamsPdf, printTopTeamsReport } from '../utils/topTeamsPdfExporter';
import {
  Trophy,
  Download,
  Printer,
  Copy,
  Check,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface TopTeamsAnalyzerViewProps {
  state: AppState;
  onSelectTeam?: (teamName: string) => void;
}

export const TopTeamsAnalyzerView: React.FC<TopTeamsAnalyzerViewProps> = ({
  state,
  onSelectTeam,
}) => {
  const [copied, setCopied] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Dynamically analyze recorded data only
  const report = useMemo(() => {
    return analyzeTop5Teams(state);
  }, [state.eplMatches, state.categoryRankings, state.preMatchNotes, state.currentMatchweek]);

  const handleDownloadPdf = () => {
    try {
      setPdfGenerating(true);
      downloadTopTeamsPdf(report);
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setTimeout(() => setPdfGenerating(false), 500);
    }
  };

  const handlePrint = () => {
    try {
      printTopTeamsReport(report);
    } catch (err) {
      console.error('Print error:', err);
    }
  };

  const handleCopyText = async () => {
    if (report.topTeams.length === 0) return;

    const lines = [
      `EPL TOP 5 TEAMS ANALYSIS`,
      `Matchweek: ${report.currentMatchweek} | Matches Analyzed: ${report.totalMatchesAnalyzed}`,
      `Date: ${new Date().toLocaleDateString('en-US')}`,
      `-----------------------------------------`,
      ``,
    ];

    report.topTeams.forEach((t) => {
      lines.push(`#${t.rank}. ${t.teamName} ${t.tier ? `[${t.tier.replace('_', ' ')}]` : ''}`);
      lines.push(`Position: #${t.rank} | Points: ${t.points} | Win Rate: ${t.winRate}%`);
      if (t.topMarket) lines.push(`Top Market: ${t.topMarket} (${t.topMarketRate}%)`);
      lines.push(``);
    });

    lines.push(`Summary: ${report.executiveSummary}`);

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Clipboard error:', e);
    }
  };

  const getRankBadgeStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-amber-500 text-white font-bold';
      case 2:
        return 'bg-slate-300 text-slate-800 font-bold';
      case 3:
        return 'bg-amber-700 text-white font-bold';
      default:
        return 'bg-slate-100 text-slate-700 font-bold border border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action & Stats Bar */}
      <div className="bg-white border border-red-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Top 5 Teams
              </h1>
            </div>
          </div>

          {/* Action Buttons: Direct PDF Download, Print & Copy */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={pdfGenerating || report.topTeams.length === 0}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              title="Download clean PDF file"
            >
              <Download className="w-4 h-4" />
              <span>{pdfGenerating ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={report.topTeams.length === 0}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              title="Print document"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print</span>
            </button>

            <button
              onClick={handleCopyText}
              disabled={report.topTeams.length === 0}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              title="Copy text summary"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* When NO Data Exists: Clean Empty State (NO fake/demo teams) */}
      {report.topTeams.length === 0 ? (
        <div className="p-12 text-center border border-red-200 rounded-2xl bg-white space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto text-red-500">
            <Trophy className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">No Team Data Recorded</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Record EPL match scores, category rankings, or pre-match notes in Match Center to display team power rankings.
          </p>
        </div>
      ) : (
        <>
          {/* Top Teams Cards (Ranked strictly by recorded data) */}
          <div className="grid grid-cols-1 gap-4">
            {report.topTeams.map((team) => {
              const rankBadge = getRankBadgeStyle(team.rank);
              const tierLabel = team.tier ? team.tier.replace('_', ' ') : 'TIER 1';

              return (
                <div
                  key={team.teamName}
                  onClick={() => onSelectTeam && onSelectTeam(team.teamName)}
                  className={`bg-white border ${
                    team.rank === 1 ? 'border-amber-300 ring-1 ring-amber-200' : 'border-red-100'
                  } rounded-2xl p-4 sm:p-5 transition-colors hover:border-red-300 cursor-pointer shadow-sm`}
                >
                  {/* Team Identity Row: Single Team Name & TIER 1 badge */}
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${rankBadge}`}
                      >
                        <span className="text-sm font-black">{team.rank}</span>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <h3 className="text-base sm:text-lg font-black text-slate-900">
                          {team.teamName}
                        </h3>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 tracking-wider">
                          {tierLabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-500">
                        Position #{team.rank}
                      </span>
                    </div>
                  </div>

                  {/* Clean 4-Metric Grid: Top Market, Win Rate, Points, Position */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3.5 text-center text-xs">
                    {/* 1. Market with Highest Occurrence Rate */}
                    <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 flex flex-col justify-center">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 block tracking-wider">
                        Top Market
                      </span>
                      <span className="font-bold text-emerald-700 text-sm mt-1 block truncate">
                        {team.topMarket || 'Win'} ({team.topMarketRate || team.winRate}%)
                      </span>
                    </div>

                    {/* 2. Win Rate */}
                    <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-200 flex flex-col justify-center">
                      <span className="text-[10px] uppercase font-bold text-teal-800 block tracking-wider">
                        Win Rate
                      </span>
                      <span className="font-bold text-teal-700 text-sm mt-1 block">
                        {team.winRate}%
                      </span>
                    </div>

                    {/* 3. Points */}
                    <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200 flex flex-col justify-center">
                      <span className="text-[10px] uppercase font-bold text-amber-800 block tracking-wider">
                        Points
                      </span>
                      <span className="font-bold text-amber-700 text-sm mt-1 block">
                        {team.points} pts
                      </span>
                    </div>

                    {/* 4. Position */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-center">
                      <span className="text-[10px] uppercase font-bold text-slate-600 block tracking-wider">
                        Position
                      </span>
                      <span className="font-bold text-slate-900 text-sm mt-1 block">
                        Rank #{team.rank}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clean Comparison Matrix */}
          <div className="bg-white border border-red-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-red-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Summary
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-slate-50">
                    <th className="py-2.5 px-3">Position</th>
                    <th className="py-2.5 px-3">Team</th>
                    <th className="py-2.5 px-3">Tier</th>
                    <th className="py-2.5 px-3">Top Market</th>
                    <th className="py-2.5 px-3">Win Rate</th>
                    <th className="py-2.5 px-3">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.topTeams.map((t) => (
                    <tr key={t.teamName} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-black text-amber-600">#{t.rank}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {t.teamName}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          {t.tier ? t.tier.replace('_', ' ') : 'TIER 1'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-emerald-700 font-bold">
                        {t.topMarket || 'Win'} ({t.topMarketRate || t.winRate}%)
                      </td>
                      <td className="py-3 px-3 text-teal-700 font-bold">{t.winRate}%</td>
                      <td className="py-3 px-3 font-black text-slate-900">{t.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
