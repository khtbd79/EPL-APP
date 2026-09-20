import React, { useState, useMemo, useRef } from 'react';
import { AppState, EPLMatchEvent } from '../types';
import { ALL_EPL_TEAM_NAMES } from '../utils/teamData';
import {
  calculateMarketTrends,
  MarketKey,
  ALL_MARKET_DEFINITIONS,
  MarketTrendSummary,
} from '../utils/marketTrends';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Filter,
  CheckCircle2,
  Calendar,
  FileSpreadsheet,
  Printer
} from 'lucide-react';

interface MarketTrendsViewProps {
  state: AppState;
  onNavigateTab?: (tab: any) => void;
}

export const MarketTrendsView: React.FC<MarketTrendsViewProps> = ({ state }) => {
  const matches: EPLMatchEvent[] = state.eplMatches || [];

  // Filter: 'ALL' or team name
  const [selectedTeam, setSelectedTeam] = useState<string>('ALL');
  // Filter: 'ALL' or specific week
  const [selectedWeek, setSelectedWeek] = useState<string>('ALL');
  // Trend filter: 'ALL' | 'UP' | 'DOWN'
  const [trendFilter, setTrendFilter] = useState<'ALL' | 'UP' | 'DOWN'>('ALL');
  // Selected market for detailed chart
  const [activeMarketKey, setActiveMarketKey] = useState<MarketKey>('BTTS');
  // Toast
  const [toastMsg, setToastMsg] = useState<string>('');

  const reportRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Compute trends
  const trendData = useMemo(() => {
    return calculateMarketTrends(matches, selectedTeam);
  }, [matches, selectedTeam]);

  const { weeks, weeklyStats, summaries, totalMatchesCount } = trendData;

  // Filtered summaries based on UP / DOWN filter
  const displayedSummaries = useMemo(() => {
    if (trendFilter === 'ALL') return summaries;
    return summaries.filter((s) => s.direction === trendFilter);
  }, [summaries, trendFilter]);

  // Active market definition & summary
  const activeDef = ALL_MARKET_DEFINITIONS.find((d) => d.key === activeMarketKey) || ALL_MARKET_DEFINITIONS[0];
  const activeSummary = summaries.find((s) => s.key === activeMarketKey);

  // Weekly data for chart (if specific week selected or all weeks)
  const chartPoints = useMemo(() => {
    if (!activeSummary) return [];
    if (selectedWeek === 'ALL') return activeSummary.weeklyPoints;
    const wNum = parseInt(selectedWeek, 10);
    return activeSummary.weeklyPoints.filter((p) => p.week === wNum);
  }, [activeSummary, selectedWeek]);

  // Export CSV
  const handleDownloadCSV = () => {
    if (matches.length === 0) {
      showToast('No match data to export');
      return;
    }

    const rows: string[] = [];
    rows.push('Market,Team Filter,Total Matches,Occurrences,Percentage,Trend,Change vs Earlier');

    summaries.forEach((s) => {
      rows.push(
        `"${s.label}","${selectedTeam === 'ALL' ? 'All Teams' : selectedTeam}",${s.totalEligible},${s.totalOccurrences},${s.overallPercent}%,${s.direction},${s.diff > 0 ? '+' : ''}${s.diff}%`
      );
    });

    rows.push('');
    rows.push('Week-by-Week Breakdown');
    const header = ['Matchweek', 'Total Matches', ...ALL_MARKET_DEFINITIONS.map((d) => d.shortLabel)];
    rows.push(header.join(','));

    weeklyStats.forEach((ws) => {
      const line = [
        `MW ${ws.week}`,
        ws.totalMatches,
        ...ALL_MARKET_DEFINITIONS.map((d) => `${ws.marketPercentages[d.key] || 0}%`),
      ];
      rows.push(line.join(','));
    });

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `market_trends_${selectedTeam.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 500);

    showToast('CSV downloaded successfully');
  };

  // Printable HTML Report
  const handleDownloadReport = () => {
    if (matches.length === 0) {
      showToast('No match data to export');
      return;
    }

    const printHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Market Trends Report - ${selectedTeam === 'ALL' ? 'All EPL Teams' : selectedTeam}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 24px; color: #0f172a; }
    h1 { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
    .meta { font-size: 12px; color: #64748b; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 24px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
    th { background: #f1f5f9; font-weight: 700; text-transform: uppercase; font-size: 11px; }
    .badge-up { color: #16a34a; font-weight: bold; }
    .badge-down { color: #dc2626; font-weight: bold; }
    .badge-stable { color: #64748b; font-weight: bold; }
    @media print { body { margin: 12px; } }
  </style>
</head>
<body>
  <h1>EPL MARKET TRENDS ANALYSIS</h1>
  <div class="meta">Filter: ${selectedTeam === 'ALL' ? 'All Teams' : selectedTeam} | Total Matches: ${totalMatchesCount} | Generated: ${new Date().toLocaleDateString()}</div>
  <table>
    <thead>
      <tr>
        <th>Market</th>
        <th>Matches</th>
        <th>Hits</th>
        <th>Rate (%)</th>
        <th>Trend</th>
        <th>Change</th>
      </tr>
    </thead>
    <tbody>
      ${summaries
        .map(
          (s) => `<tr>
            <td><strong>${s.label}</strong></td>
            <td>${s.totalEligible}</td>
            <td>${s.totalOccurrences}</td>
            <td><strong>${s.overallPercent}%</strong></td>
            <td class="${s.direction === 'UP' ? 'badge-up' : s.direction === 'DOWN' ? 'badge-down' : 'badge-stable'}">${s.direction}</td>
            <td>${s.diff > 0 ? '+' : ''}${s.diff}%</td>
          </tr>`
        )
        .join('')}
    </tbody>
  </table>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;

    const blob = new Blob([printHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (!w) {
      const a = document.createElement('a');
      a.href = url;
      a.download = `Market_Trends_Report_${selectedTeam}.html`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 500);
    }
    showToast('Report opened / downloaded');
  };

  return (
    <div className="space-y-5 pb-12" ref={reportRef}>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-5 z-50 px-4 py-2.5 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl shadow-xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Filter Bar: Clear & clean, no subtitles */}
      <div className="bg-white border border-red-100 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Team Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-600">Team:</span>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="ALL">All Teams (Combined)</option>
                {ALL_EPL_TEAM_NAMES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Week Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-600">Week:</span>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="ALL">All Matchweeks</option>
                {weeks.map((w) => (
                  <option key={w} value={w.toString()}>
                    Matchweek {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Trend Direction Filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setTrendFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  trendFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTrendFilter('UP')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer ${
                  trendFilter === 'UP'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                <span>Rising (UP)</span>
              </button>
              <button
                onClick={() => setTrendFilter('DOWN')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer ${
                  trendFilter === 'DOWN'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-red-700 hover:text-red-900'
                }`}
              >
                <TrendingDown className="w-3 h-3" />
                <span>Falling (DOWN)</span>
              </button>
            </div>
          </div>

          {/* Action Buttons: Clean and direct */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
              title="Download CSV Spreadsheet"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleDownloadReport}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
              title="Printable / Download Report"
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
          </div>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="bg-white border border-red-100 rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <Calendar className="w-12 h-12 text-red-300 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">No Match Data Recorded</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Please record match results in EPL Match Center or Match Center to generate real market trends.
          </p>
        </div>
      ) : (
        <>
          {/* Main Grid: Market Cards with clear UP / DOWN / STABLE badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
            {displayedSummaries.map((s) => {
              const isSelected = s.key === activeMarketKey;
              return (
                <div
                  key={s.key}
                  onClick={() => setActiveMarketKey(s.key)}
                  className={`rounded-2xl p-4 transition-all cursor-pointer border shadow-xs ${
                    isSelected
                      ? 'border-red-500 bg-red-50/50 shadow-md ring-1 ring-red-500'
                      : 'bg-white border-red-100 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900 truncate" title={s.label}>
                      {s.label}
                    </span>
                    {s.direction === 'UP' && (
                      <span className="shrink-0 px-2 py-0.5 rounded-md text-[11px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>UP {s.diff > 0 ? `+${s.diff}%` : ''}</span>
                      </span>
                    )}
                    {s.direction === 'DOWN' && (
                      <span className="shrink-0 px-2 py-0.5 rounded-md text-[11px] font-black bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center space-x-1">
                        <TrendingDown className="w-3 h-3" />
                        <span>DOWN {s.diff !== 0 ? `${s.diff}%` : ''}</span>
                      </span>
                    )}
                    {s.direction === 'STABLE' && (
                      <span className="shrink-0 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center space-x-1">
                        <Minus className="w-3 h-3" />
                        <span>STABLE</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-slate-900">{s.overallPercent}%</span>
                      <span className="text-[11px] text-slate-500 ml-1.5">
                        ({s.totalOccurrences}/{s.totalEligible})
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="mt-2.5 w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${s.overallPercent}%`,
                        backgroundColor: s.direction === 'UP' ? '#16a34a' : s.direction === 'DOWN' ? '#dc2626' : s.color,
                      }}
                    />
                  </div>

                  {/* Sparkline Dots by Week */}
                  <div className="mt-3 flex items-center justify-between gap-1 pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-500">Weekly:</span>
                    <div className="flex items-center gap-1 overflow-hidden">
                      {s.weeklyPoints.slice(-6).map((wp) => (
                        <div
                          key={wp.week}
                          className="flex flex-col items-center"
                          title={`MW ${wp.week}: ${wp.percent}% (${wp.hits}/${wp.total})`}
                        >
                          <div
                            className="w-1.5 rounded-sm"
                            style={{
                              height: `${Math.max(6, Math.round((wp.percent / 100) * 16))}px`,
                              backgroundColor:
                                wp.percent >= 60 ? '#10b981' : wp.percent <= 35 ? '#f43f5e' : '#94a3b8',
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Graph / Chart Section for Selected Market */}
          <div className="bg-white border border-red-100 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div
                  className="w-3.5 h-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: activeDef.color }}
                />
                <h2 className="text-base font-black text-slate-900">
                  {activeDef.label} — Weekly Graph & Analysis
                </h2>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-500">Overall Rate:</span>
                <span className="font-bold text-red-600 text-sm">
                  {activeSummary?.overallPercent || 0}%
                </span>
                <span className="text-slate-400">
                  ({activeSummary?.totalOccurrences || 0}/{activeSummary?.totalEligible || 0} matches)
                </span>
              </div>
            </div>

            {/* SVG Visual Bar & Line Graph */}
            {chartPoints.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No weekly data recorded for this selection.
              </div>
            ) : (
              <div className="space-y-3">
                {/* SVG Graph */}
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[600px] h-48 sm:h-56 relative bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <svg className="w-full h-full" viewBox="0 0 600 180" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <line x1="40" y1="20" x2="580" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" />
                      <line x1="40" y1="65" x2="580" y2="65" stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" />
                      <line x1="40" y1="110" x2="580" y2="110" stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" />
                      <line x1="40" y1="155" x2="580" y2="155" stroke="#cbd5e1" strokeWidth="1.5" />

                      {/* Y-Axis Labels */}
                      <text x="5" y="24" fill="#64748b" fontSize="10">100%</text>
                      <text x="5" y="69" fill="#64748b" fontSize="10">66%</text>
                      <text x="5" y="114" fill="#64748b" fontSize="10">33%</text>
                      <text x="5" y="159" fill="#64748b" fontSize="10">0%</text>

                      {/* Bars & Line Points */}
                      {chartPoints.map((pt, idx) => {
                        const totalPts = chartPoints.length;
                        const colWidth = 500 / Math.max(totalPts, 1);
                        const x = 50 + idx * colWidth + colWidth / 2;
                        const barHeight = (pt.percent / 100) * 135;
                        const y = 155 - barHeight;

                        return (
                          <g key={pt.week} className="transition-all">
                            {/* Bar */}
                            <rect
                              x={x - 14}
                              y={y}
                              width="28"
                              height={Math.max(barHeight, 2)}
                              rx="4"
                              fill={pt.percent >= 60 ? '#16a34a' : pt.percent <= 35 ? '#dc2626' : activeDef.color}
                              opacity="0.85"
                            />
                            {/* Top percentage text */}
                            <text
                              x={x}
                              y={Math.max(y - 5, 15)}
                              textAnchor="middle"
                              fill="#0f172a"
                              fontSize="10"
                              fontWeight="bold"
                            >
                              {pt.percent}%
                            </text>
                            {/* Week label */}
                            <text
                              x={x}
                              y="172"
                              textAnchor="middle"
                              fill="#64748b"
                              fontSize="10"
                            >
                              MW{pt.week}
                            </text>
                          </g>
                        );
                      })}

                      {/* Connect Line */}
                      {chartPoints.length > 1 && (
                        <polyline
                          fill="none"
                          stroke="#dc2626"
                          strokeWidth="2"
                          strokeDasharray="4 2"
                          points={chartPoints
                            .map((pt, idx) => {
                              const totalPts = chartPoints.length;
                              const colWidth = 500 / Math.max(totalPts, 1);
                              const x = 50 + idx * colWidth + colWidth / 2;
                              const barHeight = (pt.percent / 100) * 135;
                              const y = 155 - barHeight;
                              return `${x},${y}`;
                            })
                            .join(' ')}
                        />
                      )}
                    </svg>
                  </div>
                </div>

                {/* Data Table by Matchweek: Clean and concise */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold text-[10px] uppercase">
                        <th className="py-2.5 px-3">Matchweek</th>
                        <th className="py-2.5 px-3">Matches Analyzed</th>
                        <th className="py-2.5 px-3">Hits</th>
                        <th className="py-2.5 px-3">Hit Rate</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {chartPoints.map((pt) => (
                        <tr key={pt.week} className="hover:bg-slate-50/80">
                          <td className="py-2 px-3 font-bold text-slate-900">MW {pt.week}</td>
                          <td className="py-2 px-3 text-slate-600">{pt.total} matches</td>
                          <td className="py-2 px-3 text-slate-700 font-bold">{pt.hits}</td>
                          <td className="py-2 px-3 font-black text-emerald-600">{pt.percent}%</td>
                          <td className="py-2 px-3">
                            {pt.percent >= 60 ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                High Frequency
                              </span>
                            ) : pt.percent <= 35 ? (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                Low Frequency
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                Balanced
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Full Comparison Matrix Across All Markets by Week */}
          <div className="bg-white border border-red-100 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Full Weekly Market Breakdown ({selectedTeam === 'ALL' ? 'All Teams' : selectedTeam})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2 px-2.5">Week</th>
                    <th className="py-2 px-2.5">Matches</th>
                    {ALL_MARKET_DEFINITIONS.map((d) => (
                      <th key={d.key} className="py-2 px-2.5 text-center">
                        {d.shortLabel}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {weeklyStats.map((ws) => (
                    <tr key={ws.week} className="hover:bg-slate-50">
                      <td className="py-2.5 px-2.5 font-bold text-slate-900">MW {ws.week}</td>
                      <td className="py-2.5 px-2.5 text-slate-500">{ws.totalMatches}</td>
                      {ALL_MARKET_DEFINITIONS.map((d) => {
                        const pct = ws.marketPercentages[d.key] || 0;
                        return (
                          <td key={d.key} className="py-2.5 px-2.5 text-center">
                            <span
                              className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                                pct >= 60
                                  ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                  : pct <= 35
                                  ? 'text-rose-700 bg-rose-50 border border-rose-200'
                                  : 'text-slate-600 bg-slate-100'
                              }`}
                            >
                              {pct}%
                            </span>
                          </td>
                        );
                      })}
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
