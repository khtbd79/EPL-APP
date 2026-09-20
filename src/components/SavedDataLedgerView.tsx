import React, { useState, useMemo } from 'react';
import { AppState, MatchRecord } from '../types';
import { calculateFinancials, formatMoney } from '../utils/storage';
import {
  buildUnifiedSerialLedger,
  printPdfDocument,
  buildPrintHtml,
  downloadLedgerCsv,
  PdfReportType,
  SerialLedgerItem
} from '../utils/pdfGenerator';
import { BetSlipModal } from './BetSlipModal';
import { ReportPreviewModal } from './ReportPreviewModal';
import {
  FileText,
  Printer,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Clock,
  Ticket,
  Calendar,
  Wallet,
  ShieldCheck,
  Layers,
  ChevronDown,
  Info,
  Sparkles,
  ArrowDownCircle,
  ArrowUpCircle,
  FileSpreadsheet,
  Trophy
} from 'lucide-react';

interface SavedDataLedgerViewProps {
  state: AppState;
  onNavigateTab?: (tab: any) => void;
}

export const SavedDataLedgerView: React.FC<SavedDataLedgerViewProps> = ({ state, onNavigateTab }) => {
  const fin = calculateFinancials(state);
  const currency = state.settings.currency || '$';

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'RECORD' | 'EPL_MATCH'>('ALL');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedMatchForSlip, setSelectedMatchForSlip] = useState<MatchRecord | null>(null);
  const [isPdfDropdownOpen, setIsPdfDropdownOpen] = useState(false);
  const [reportModalData, setReportModalData] = useState<{
    isOpen: boolean;
    title: string;
    htmlContent: string;
    downloadFilename: string;
  } | null>(null);

  // Generate serial ledger
  const allLedgerItems = useMemo(() => {
    return buildUnifiedSerialLedger(state, sortOrder).filter(item => item.category !== 'PRE_MATCH_NOTE');
  }, [state, sortOrder]);

  // Filter items
  const filteredItems = useMemo(() => {
    return allLedgerItems.filter((item) => {
      const matchCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
      const searchLower = searchTerm.toLowerCase().trim();
      const matchSearch =
        !searchLower ||
        item.title.toLowerCase().includes(searchLower) ||
        item.subtitle.toLowerCase().includes(searchLower) ||
        item.details.toLowerCase().includes(searchLower) ||
        item.date.toLowerCase().includes(searchLower) ||
        item.status.toLowerCase().includes(searchLower);

      return matchCategory && matchSearch;
    });
  }, [allLedgerItems, categoryFilter, searchTerm]);

  // Counts
  const counts = useMemo(() => {
    return {
      all: allLedgerItems.length,
      matches: (state.matchHistory || []).length,
      epl: (state.eplMatches || []).length,
      notes: Object.keys(state.preMatchNotes || {}).length,
    };
  }, [allLedgerItems, state]);

  // Handle PDF Export
  const handleExportPdf = (reportType: PdfReportType) => {
    setIsPdfDropdownOpen(false);
    const html = buildPrintHtml(state, reportType);
    const titleMap: Record<PdfReportType, string> = {
      all: 'EPL Master Dossier (All Records)',
      matches: 'EPL Match History Journal',
      epl: 'EPL Match Results & Standings Sheet',
      notes: 'EPL Pre-Match Tactical Dossiers',
      market_pnl: 'EPL Market Win & Loss Analysis',
    };
    setReportModalData({
      isOpen: true,
      title: titleMap[reportType] || 'EPL Report Dossier',
      htmlContent: html,
      downloadFilename: `EPL_Report_${reportType}_${new Date().toISOString().split('T')[0]}.html`,
    });
  };

  // Find match record for Match Slip view
  const handleOpenSlip = (itemId: string) => {
    const found = (state.matchHistory || []).find((m) => m.id === itemId);
    if (found) {
      setSelectedMatchForSlip(found);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-36 sm:pb-40">
      {/* 1. Header & Quick PDF Actions */}
      <div className="bg-white border border-red-200 shadow-sm rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              SAVED LEDGER
            </h1>
          </div>

          {/* Primary PDF & Export Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('top_teams')}
                className="py-2.5 px-3.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <Trophy className="w-4 h-4 text-red-600" />
                <span>Top 5 Teams Report</span>
              </button>
            )}

            {/* PDF Dropdown Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPdfDropdownOpen(!isPdfDropdownOpen)}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md flex items-center space-x-2 transition-all active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-white" />
                <span>Save / Print PDF</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isPdfDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-red-200 rounded-xl shadow-2xl p-2 z-50 space-y-1 animate-scaleUp">
                  <div className="px-2 py-1 text-[10px] font-bold text-red-600 uppercase tracking-wider border-b border-slate-100">
                    PDF Report Options
                  </div>
                  <button
                    onClick={() => handleExportPdf('all')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-800 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>1. Complete Master PDF (All Data)</span>
                    <span className="text-[10px] text-red-600 font-mono font-bold">({counts.all})</span>
                  </button>
                  <button
                    onClick={() => handleExportPdf('matches')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-800 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>2. Daily Match History PDF</span>
                    <span className="text-[10px] text-red-600 font-mono font-bold">({counts.matches})</span>
                  </button>
                  <button
                    onClick={() => handleExportPdf('epl')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-800 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>3. EPL 20 Teams Match Sheet PDF</span>
                    <span className="text-[10px] text-red-600 font-mono font-bold">({counts.epl})</span>
                  </button>
                  <button
                    onClick={() => handleExportPdf('notes')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-800 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>4. 20 Teams Pre-Match Notes PDF</span>
                    <span className="text-[10px] text-red-600 font-mono font-bold">({counts.notes})</span>
                  </button>
                </div>
              )}
            </div>

            {/* CSV Download Button */}
            <button
              onClick={() => downloadLedgerCsv(state)}
              className="py-2.5 px-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs flex items-center space-x-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
              title="Download Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-red-600" />
              <span>Excel (CSV)</span>
            </button>
          </div>
        </div>

        {/* Summary Metric Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 font-semibold block">Total Records</span>
            <div className="text-xl font-black font-mono text-red-600">{counts.all} Entries</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 font-semibold block">Recorded Matches</span>
            <div className="text-xl font-black font-mono text-slate-900">{counts.matches} Matches</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 font-semibold block">EPL 20 Teams Matches</span>
            <div className="text-xl font-black font-mono text-slate-900">{counts.epl} Matches</div>
          </div>
        </div>
      </div>

      {/* 2. Filter, Search & Sorting Bar */}
      <div className="bg-white border border-red-200 shadow-sm rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search records (team, date, etc.)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 focus:border-red-500 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none placeholder-slate-400"
          />
        </div>

        {/* Filter Category Chips */}
        <div className="flex items-center space-x-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              categoryFilter === 'ALL'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200'
            }`}
          >
            All Records ({counts.all})
          </button>
          <button
            onClick={() => setCategoryFilter('RECORD')}
            className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              categoryFilter === 'RECORD'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200'
            }`}
          >
            Match Entries ({counts.matches})
          </button>
          <button
            onClick={() => setCategoryFilter('EPL_MATCH')}
            className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              categoryFilter === 'EPL_MATCH'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200'
            }`}
          >
            EPL Matches ({counts.epl})
          </button>
        </div>

        {/* Sort Order Toggle */}
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="p-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center space-x-1.5 self-end md:self-auto shrink-0 transition-all cursor-pointer"
          title="Toggle sort order"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-red-600" />
          <span>{sortOrder === 'asc' ? 'Serial 1, 2, 3...' : 'Newest to Oldest'}</span>
        </button>
      </div>

      {/* 3. Main Serial Ledger Table */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-red-200 shadow-sm rounded-2xl p-12 text-center text-slate-500 space-y-3">
          <Info className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Saved Records Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchTerm || categoryFilter !== 'ALL'
              ? 'Try adjusting your search or category filters.'
              : 'When you record matches or EPL match results, they will automatically appear here sequentially.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-red-200 shadow-sm rounded-2xl overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 text-center w-16">SL #</th>
                  <th className="py-3.5 px-4 w-28">Date & Time</th>
                  <th className="py-3.5 px-4 w-32">Category</th>
                  <th className="py-3.5 px-4">Match / Description</th>
                  <th className="py-3.5 px-4">Market & Details</th>
                  <th className="py-3.5 px-4 text-center w-28">Status / Score</th>
                  <th className="py-3.5 px-4 text-right w-28">Value / PnL</th>
                  <th className="py-3.5 px-4 text-right w-20">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredItems.map((item) => (
                  <tr key={`${item.category}-${item.id}`} className="hover:bg-red-50/40 transition-colors">
                    {/* Serial Number */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-red-600 bg-red-50/40">
                      {String(item.serial).padStart(2, '0')}
                    </td>

                    {/* Date / Time */}
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      <div>{item.date}</div>
                      <div className="text-[10px] text-slate-400">{item.time}</div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                          item.category === 'RECORD'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : item.category === 'EPL_MATCH'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {item.categoryLabel}
                      </span>
                    </td>

                    {/* Title */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{item.subtitle}</div>
                    </td>

                    {/* Details */}
                    <td className="py-3.5 px-4 text-[11px] text-slate-600">
                      {item.details}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          item.status === 'WIN'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'LOSS'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : item.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Amount */}
                    <td
                      className={`py-3.5 px-4 text-right font-mono font-bold ${
                        item.amount?.startsWith('+')
                          ? 'text-emerald-600'
                          : item.amount?.startsWith('-')
                          ? 'text-red-600'
                          : 'text-slate-900'
                      }`}
                    >
                      {item.amount || '—'}
                    </td>

                    {/* Action (e.g. View Slip) */}
                    <td className="py-3.5 px-4 text-right">
                      {item.category === 'RECORD' ? (
                        <button
                          onClick={() => handleOpenSlip(item.id)}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold inline-flex items-center space-x-1 cursor-pointer"
                          title="View Match Slip"
                        >
                          <Ticket className="w-3 h-3 text-red-600" />
                          <span>Slip</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 font-mono">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredItems.map((item) => (
              <div key={`m-${item.category}-${item.id}`} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-lg bg-red-50 text-red-700 font-mono font-bold text-xs border border-red-200">
                      SL #{String(item.serial).padStart(2, '0')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        item.category === 'RECORD'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : item.category === 'EPL_MATCH'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {item.categoryLabel}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500">
                    {item.date} {item.time ? `• ${item.time}` : ''}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
                  {item.details && (
                    <p className="text-[11px] text-slate-600 mt-1 italic">{item.details}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.status === 'WIN'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : item.status === 'LOSS'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : item.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {item.status}
                  </span>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`font-mono font-bold text-xs ${
                        item.amount?.startsWith('+')
                          ? 'text-emerald-600'
                          : item.amount?.startsWith('-')
                          ? 'text-red-600'
                          : 'text-slate-900'
                      }`}
                    >
                      {item.amount || ''}
                    </span>

                    {item.category === 'RECORD' && (
                      <button
                        onClick={() => handleOpenSlip(item.id)}
                        className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <Ticket className="w-3 h-3 text-red-600" />
                        <span>Slip</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Match Slip Modal */}
      {selectedMatchForSlip && (
        <BetSlipModal
          match={selectedMatchForSlip}
          currency={currency}
          onClose={() => setSelectedMatchForSlip(null)}
        />
      )}

      {/* Report Preview Modal */}
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
