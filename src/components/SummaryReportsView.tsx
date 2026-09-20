import React, { useState } from 'react';
import { AppState } from '../types';
import { calculateFinancials, formatMoney } from '../utils/storage';
import { printPdfDocument, buildPrintHtml } from '../utils/pdfGenerator';
import { ReportPreviewModal } from './ReportPreviewModal';
import {
  BarChart3,
  Printer,
  FileSpreadsheet,
  Download,
  Calendar,
  PieChart,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  XCircle,
  Coins,
  ShieldAlert
} from 'lucide-react';

interface SummaryReportsViewProps {
  state: AppState;
}

export const SummaryReportsView: React.FC<SummaryReportsViewProps> = ({ state }) => {
  const fin = calculateFinancials(state);
  const currency = state.settings.currency || '$';
  const [period, setPeriod] = useState<'cycle' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('cycle');
  const [reportModalData, setReportModalData] = useState<{
    isOpen: boolean;
    title: string;
    htmlContent: string;
    downloadFilename: string;
  } | null>(null);

  // Print Report Handler
  const handlePrint = () => {
    const html = buildPrintHtml(state, 'all');
    setReportModalData({
      isOpen: true,
      title: 'EPL Complete Summary Report',
      htmlContent: html,
      downloadFilename: `EPL_Summary_Report_${new Date().toISOString().split('T')[0]}.html`,
    });
  };

  // Generate JPG / Image or JSON text download
  const handleExportTextSummary = () => {
    const reportText = `
========================================
           EPL PERFORMANCE REPORT           
========================================
Generated: ${new Date().toLocaleString()}
Total Matches: ${fin.totalBets}
----------------------------------------
FINANCIAL SUMMARY:
- Net Profit:       ${fin.netBettingPnL >= 0 ? '+' : ''}${formatMoney(fin.netBettingPnL, currency)}
- Total Profit:     ${formatMoney(fin.totalProfit, currency)}
- Total Loss:       ${formatMoney(fin.totalLoss, currency)}
- Win Rate:         ${fin.winRate.toFixed(1)}%

MATCH STATISTICS:
- Total Matches:    ${fin.totalBets}
- Won Matches:      ${fin.winningBets}
- Lost Matches:     ${fin.losingBets}
- Pending Matches:  ${fin.pendingBets}
========================================
`.trim();

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EPL_Report_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Construct chart data points for SVG chart (cumulative profit & loss from matches)
  let runningPnL = 0;
  const chartPoints = state.matchHistory.map((m) => {
    runningPnL += m.netPnL;
    return { day: m.dayNumber, bankroll: runningPnL };
  });

  const minBankroll = Math.min(0, ...chartPoints.map((p) => p.bankroll));
  const maxBankroll = Math.max(100, ...chartPoints.map((p) => p.bankroll));
  const bankrollRange = maxBankroll - minBankroll || 1;

  return (
    <div className="space-y-6 animate-fadeIn pb-36 sm:pb-40">
      {/* Header & Export Bar */}
      <div className="solid-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-red-100 rounded-2xl relative overflow-hidden no-print shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center space-x-2.5 tracking-tight">
            <BarChart3 className="w-6 h-6 text-red-600" />
            <span>Summary & Analytics Reports</span>
          </h1>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center space-x-2 transition-all active:scale-[0.98] cursor-pointer shadow-xs"
            title="Print or Save as PDF"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>PDF / Print</span>
          </button>

          <button
            onClick={handleExportTextSummary}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center space-x-2 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
            title="Download Summary File"
          >
            <Download className="w-4 h-4" />
            <span>Export Summary</span>
          </button>
        </div>
      </div>

      {/* Period Selector Tabs (no-print) */}
      <div className="solid-card p-1.5 flex items-center justify-start space-x-1.5 overflow-x-auto bg-white border border-slate-200 rounded-2xl no-print shadow-xs">
        {(['cycle', 'daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap cursor-pointer ${
              period === p
                ? 'bg-red-600 text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {p === 'cycle' ? 'All Matches' : p}
          </button>
        ))}
      </div>

      {/* Printable Report Header (only visible when printing) */}
      <div className="hidden print-only mb-6">
        <h1 className="text-3xl font-black">EPL PERFORMANCE REPORT</h1>
        <p className="text-sm text-slate-600">Generated on {new Date().toLocaleString()}</p>
        <hr className="my-4 border-slate-300" />
      </div>

      {/* Match Financial & Performance Statistics Display */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Net Profit */}
        <div className="solid-card p-4.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Net Profit</div>
          <div className={`text-xl sm:text-2xl font-mono font-black mt-1 ${fin.netBettingPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {fin.netBettingPnL >= 0 ? '+' : ''}{formatMoney(fin.netBettingPnL, currency)}
          </div>
        </div>

        {/* Total Profit */}
        <div className="solid-card p-4.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Profit</div>
          <div className="text-xl sm:text-2xl font-mono font-black text-emerald-600 mt-1">
            +{formatMoney(fin.totalProfit, currency)}
          </div>
        </div>

        {/* Total Loss */}
        <div className="solid-card p-4.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Loss</div>
          <div className="text-xl sm:text-2xl font-mono font-black text-rose-600 mt-1">
            -{formatMoney(fin.totalLoss, currency)}
          </div>
        </div>

        {/* Win Rate */}
        <div className="solid-card p-4.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Win Rate</div>
          <div className="text-xl sm:text-2xl font-mono font-black text-slate-900 mt-1">
            {fin.winRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Match Performance Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Matches */}
        <div className="solid-card p-4.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Matches</div>
          <div className="text-2xl font-mono font-black text-slate-900 mt-1">
            {fin.totalBets}
          </div>
        </div>

        {/* Won Matches */}
        <div className="solid-card p-4.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Won Matches</div>
          <div className="text-2xl font-mono font-black text-emerald-600 mt-1">
            {fin.winningBets}
          </div>
        </div>

        {/* Lost Matches */}
        <div className="solid-card p-4.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Lost Matches</div>
          <div className="text-2xl font-mono font-black text-rose-600 mt-1">
            {fin.losingBets}
          </div>
        </div>

        {/* Pending Matches */}
        <div className="solid-card p-4.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Pending Matches</div>
          <div className="text-2xl font-mono font-black text-amber-600 mt-1">
            {fin.pendingBets}
          </div>
        </div>
      </div>

      {/* Visual Performance Chart */}
      <div className="solid-card p-6 space-y-4 bg-white border border-red-100 rounded-2xl shadow-sm">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-red-600" />
          <span>Performance & Profit Trajectory</span>
        </h2>

        {chartPoints.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No match data yet. Complete matches to view the growth curve.
          </div>
        ) : (
          <div className="h-48 sm:h-64 w-full pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeDasharray="4" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeDasharray="4" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeDasharray="4" />

              {/* Line graph polyline */}
              <polyline
                fill="none"
                stroke="#dc2626"
                strokeWidth="3"
                points={chartPoints
                  .map((pt, idx) => {
                    const x = (idx / Math.max(1, chartPoints.length - 1)) * 500;
                    const normalized = (pt.bankroll - minBankroll) / bankrollRange;
                    const y = 180 - normalized * 160;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />

              {/* Data points */}
              {chartPoints.map((pt, idx) => {
                const x = (idx / Math.max(1, chartPoints.length - 1)) * 500;
                const normalized = (pt.bankroll - minBankroll) / bankrollRange;
                const y = 180 - normalized * 160;
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="4"
                    className="fill-red-600 stroke-white"
                    strokeWidth="2"
                  >
                    <title>{`Match #${idx + 1}: ${formatMoney(pt.bankroll, currency)}`}</title>
                  </circle>
                );
              })}
            </svg>
          </div>
        )}
      </div>

      {/* Report Preview & Print Modal */}
      {reportModalData && (
        <ReportPreviewModal
          isOpen={reportModalData.isOpen}
          title={reportModalData.title}
          htmlContent={reportModalData.htmlContent}
          downloadFilename={reportModalData.downloadFilename}
          onClose={() => setReportModalData(null)}
        />
      )}
    </div>
  );
};
