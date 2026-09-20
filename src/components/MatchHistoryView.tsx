import React, { useState } from 'react';
import { AppState, MatchRecord } from '../types';
import { formatMoney } from '../utils/storage';
import { BetSlipModal } from './BetSlipModal';
import { buildPrintHtml } from '../utils/pdfGenerator';
import { ConfirmActionModal, ConfirmModalConfig } from './ConfirmActionModal';
import { ReportPreviewModal } from './ReportPreviewModal';
import {
  History,
  Search,
  Trash2,
  Info,
  Clock,
  Ticket,
  Printer
} from 'lucide-react';

interface MatchHistoryViewProps {
  state: AppState;
  onDeleteMatch: (id: string) => void;
  onUpdateMatchStatus?: (id: string, result: 'WIN' | 'LOSS' | 'VOID') => void;
}

export const MatchHistoryView: React.FC<MatchHistoryViewProps> = ({
  state,
  onDeleteMatch,
  onUpdateMatchStatus,
}) => {
  const currency = state.settings.currency || '$';
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState<'ALL' | 'PENDING' | 'WIN' | 'LOSS' | 'VOID'>('ALL');
  const [selectedMatchForSlip, setSelectedMatchForSlip] = useState<MatchRecord | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmModalConfig | null>(null);
  const [reportModalData, setReportModalData] = useState<{
    isOpen: boolean;
    title: string;
    htmlContent: string;
    downloadFilename: string;
  } | null>(null);

  const handleDeletePrompt = (matchId: string, matchDesc: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Match Record',
      message: `Are you sure you want to delete the record for "${matchDesc}"?`,
      confirmLabel: 'Yes, Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
      onConfirm: () => onDeleteMatch(matchId),
    });
  };

  const handleOpenPdfReport = () => {
    const html = buildPrintHtml(state, 'bets');
    setReportModalData({
      isOpen: true,
      title: 'EPL Match History Journal',
      htmlContent: html,
      downloadFilename: `EPL_Match_History_${new Date().toISOString().split('T')[0]}.html`,
    });
  };

  const filteredMatches = state.matchHistory.filter((m) => {
    const matchesSearch =
      m.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.league.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesResult = filterResult === 'ALL' || m.result === filterResult;

    return matchesSearch && matchesResult;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-36 sm:pb-40">
      {/* Header */}
      <div className="solid-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-red-100 rounded-2xl relative overflow-hidden shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center space-x-2 tracking-tight">
            <History className="w-6 h-6 text-red-600" />
            <span>Match History</span>
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleOpenPdfReport}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center space-x-2 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
            title="Save / Print Match History PDF"
          >
            <Printer className="w-4 h-4" />
            <span>PDF Download / Print</span>
          </button>

          <div className="flex items-center space-x-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Total:</span>
            <span className="text-sm font-black font-mono text-red-600">
              {state.matchHistory.length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="solid-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-red-100 rounded-2xl shadow-sm">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search teams or league..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-colors shadow-xs"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterResult('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              filterResult === 'ALL'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200'
            }`}
          >
            All ({state.matchHistory.length})
          </button>
          <button
            onClick={() => setFilterResult('PENDING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              filterResult === 'PENDING'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-700 hover:text-amber-800 bg-amber-50 border border-amber-200'
            }`}
          >
            Pending ({state.matchHistory.filter((m) => m.result === 'PENDING').length})
          </button>
          <button
            onClick={() => setFilterResult('WIN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              filterResult === 'WIN'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200'
            }`}
          >
            Wins ({state.matchHistory.filter((m) => m.result === 'WIN').length})
          </button>
          <button
            onClick={() => setFilterResult('LOSS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              filterResult === 'LOSS'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-rose-700 hover:text-rose-800 bg-rose-50 border border-rose-200'
            }`}
          >
            Losses ({state.matchHistory.filter((m) => m.result === 'LOSS').length})
          </button>
        </div>
      </div>

      {/* Table / List View */}
      {filteredMatches.length === 0 ? (
        <div className="solid-card p-12 text-center text-slate-400 bg-white border border-red-100 rounded-2xl shadow-sm">
          <Info className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-800">No match records found</p>
        </div>
      ) : (
        <div className="solid-card overflow-hidden bg-white border border-red-100 rounded-2xl shadow-sm">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">League</th>
                  <th className="py-3.5 px-4">Teams</th>
                  <th className="py-3.5 px-4">Odds</th>
                  <th className="py-3.5 px-4">Stake</th>
                  <th className="py-3.5 px-4">Result / Status</th>
                  <th className="py-3.5 px-4">Profit / Loss</th>
                  <th className="py-3.5 px-4">Balance After</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredMatches.map((match) => (
                  <tr key={match.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-red-600">
                      #{String(match.dayNumber).padStart(2, '0')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">{match.date}</td>
                    <td className="py-3.5 px-4 text-slate-800 font-bold">{match.league}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {match.homeTeam} <span className="text-slate-400 font-normal">vs</span> {match.awayTeam}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{match.odds.toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{formatMoney(match.stake, currency)}</td>
                    <td className="py-3.5 px-4">
                      {match.result === 'PENDING' ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1 shadow-xs">
                            <Clock className="w-3 h-3 animate-pulse text-amber-600" />
                            <span>PENDING</span>
                          </span>
                          {onUpdateMatchStatus && (
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => onUpdateMatchStatus(match.id, 'WIN')}
                                className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-black cursor-pointer shadow-xs"
                                title="Set WIN"
                              >
                                WIN
                              </button>
                              <button
                                onClick={() => onUpdateMatchStatus(match.id, 'LOSS')}
                                className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-black cursor-pointer shadow-xs"
                                title="Set LOSS"
                              >
                                LOSS
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-xs ${
                            match.result === 'WIN'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : match.result === 'LOSS'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {match.result}
                        </span>
                      )}
                    </td>
                    <td
                      className={`py-3.5 px-4 font-mono font-bold ${
                        match.result === 'WIN'
                          ? 'text-emerald-600'
                          : match.result === 'LOSS'
                          ? 'text-rose-600'
                          : 'text-slate-500'
                      }`}
                    >
                      {match.result === 'WIN'
                        ? `+${formatMoney(match.profit, currency)}`
                        : match.result === 'LOSS'
                        ? `-${formatMoney(match.loss, currency)}`
                        : formatMoney(0, currency)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {match.result === 'PENDING'
                        ? '—'
                        : formatMoney(match.bankrollAfter, currency)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setSelectedMatchForSlip(match)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer shadow-xs"
                          title="View / Download Match Slip"
                        >
                          <Ticket className="w-3.5 h-3.5 text-slate-500" />
                          <span>Slip</span>
                        </button>
                        <button
                          onClick={() => handleDeletePrompt(match.id, `${match.homeTeam} vs ${match.awayTeam}`)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card View */}
          <div className="lg:hidden divide-y divide-slate-100">
            {filteredMatches.map((match) => (
              <div key={match.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-red-50 text-red-700 font-mono font-bold text-xs border border-red-200">
                      #{String(match.dayNumber).padStart(2, '0')}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{match.date}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      match.result === 'WIN'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : match.result === 'LOSS'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : match.result === 'PENDING'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {match.result}
                  </span>
                </div>

                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {match.homeTeam} <span className="text-slate-400 font-normal">vs</span> {match.awayTeam}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 font-medium">
                    {match.league} • Market: <span className="text-slate-800 font-bold">{match.market}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs font-mono border border-slate-200 shadow-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold uppercase">Odds</span>
                    <span className="text-slate-900 font-bold">{match.odds.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold uppercase">Stake</span>
                    <span className="text-slate-900 font-bold">{formatMoney(match.stake, currency)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold uppercase">PnL</span>
                    <span
                      className={`font-bold ${
                        match.result === 'WIN'
                          ? 'text-emerald-600'
                          : match.result === 'LOSS'
                          ? 'text-rose-600'
                          : 'text-slate-500'
                      }`}
                    >
                      {match.result === 'WIN'
                        ? `+${formatMoney(match.profit, currency)}`
                        : match.result === 'LOSS'
                        ? `-${formatMoney(match.loss, currency)}`
                        : '—'}
                    </span>
                  </div>
                </div>

                {match.result === 'PENDING' && onUpdateMatchStatus && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-xs text-amber-700 font-bold">Select Result:</span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onUpdateMatchStatus(match.id, 'WIN')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black cursor-pointer shadow-xs"
                      >
                        WIN
                      </button>
                      <button
                        onClick={() => onUpdateMatchStatus(match.id, 'LOSS')}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black cursor-pointer shadow-xs"
                      >
                        LOSS
                      </button>
                      <button
                        onClick={() => onUpdateMatchStatus(match.id, 'VOID')}
                        className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold cursor-pointer border border-slate-300 shadow-xs"
                      >
                        VOID
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-slate-500 font-medium">
                    Balance After:{' '}
                    <span className="font-mono text-slate-900 font-bold">
                      {match.result === 'PENDING' ? 'Pending' : formatMoney(match.bankrollAfter, currency)}
                    </span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedMatchForSlip(match)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer shadow-xs"
                      title="View / Download Match Slip"
                    >
                      <Ticket className="w-3.5 h-3.5 text-slate-500" />
                      <span>Slip</span>
                    </button>
                    <button
                      onClick={() => handleDeletePrompt(match.id, `${match.homeTeam} vs ${match.awayTeam}`)}
                      className="text-rose-600 hover:text-rose-700 text-xs font-medium flex items-center space-x-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BET SLIP MODAL */}
      {selectedMatchForSlip && (
        <BetSlipModal
          match={selectedMatchForSlip}
          currency={currency}
          onClose={() => setSelectedMatchForSlip(null)}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmActionModal
        config={confirmConfig}
        onClose={() => setConfirmConfig(null)}
      />

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
