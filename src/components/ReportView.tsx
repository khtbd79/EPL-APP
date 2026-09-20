import React, { useState } from 'react';
import { AppState, ActiveTab } from '../types';
import { SummaryReportsView } from './SummaryReportsView';
import { MatchHistoryView } from './MatchHistoryView';
import { SavedDataLedgerView } from './SavedDataLedgerView';
import {
  FileText,
  BarChart3,
  History,
  Receipt,
  Download
} from 'lucide-react';

interface ReportViewProps {
  state: AppState;
  onDeleteMatch: (id: string) => void;
  onUpdateMatchStatus: (id: string, result: 'WIN' | 'LOSS' | 'VOID') => void;
  onNavigateTab?: (tab: ActiveTab) => void;
  initialSubTab?: 'analytics' | 'history' | 'ledger';
}

export const ReportView: React.FC<ReportViewProps> = ({
  state,
  onDeleteMatch,
  onUpdateMatchStatus,
  onNavigateTab,
  initialSubTab = 'analytics'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'history' | 'ledger'>(initialSubTab);

  const totalMatches = (state.matchHistory || []).length;
  const totalSettled = (state.matchHistory || []).filter((m) => m.result !== 'PENDING').length;

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header with Sub-Tabs */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-red-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/20 shrink-0">
            <FileText className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Report & Records
            </h1>
          </div>
        </div>

        {/* Sub-tabs: Analytics / Match History / Saved Ledger */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold self-start md:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`py-2 px-3.5 rounded-xl transition-all cursor-pointer flex items-center space-x-2 whitespace-nowrap ${
              activeSubTab === 'analytics'
                ? 'bg-red-600 text-white shadow-sm shadow-red-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`py-2 px-3.5 rounded-xl transition-all cursor-pointer flex items-center space-x-2 whitespace-nowrap ${
              activeSubTab === 'history'
                ? 'bg-red-600 text-white shadow-sm shadow-red-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Match History</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
              activeSubTab === 'history' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {totalMatches}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('ledger')}
            className={`py-2 px-3.5 rounded-xl transition-all cursor-pointer flex items-center space-x-2 whitespace-nowrap ${
              activeSubTab === 'ledger'
                ? 'bg-red-600 text-white shadow-sm shadow-red-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Saved Ledger</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Content Rendering */}
      <div>
        {activeSubTab === 'analytics' && (
          <SummaryReportsView state={state} />
        )}

        {activeSubTab === 'history' && (
          <MatchHistoryView
            state={state}
            onDeleteMatch={onDeleteMatch}
            onUpdateMatchStatus={onUpdateMatchStatus}
          />
        )}

        {activeSubTab === 'ledger' && (
          <SavedDataLedgerView
            state={state}
            onNavigateTab={onNavigateTab}
          />
        )}
      </div>
    </div>
  );
};
