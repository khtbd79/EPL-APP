import React, { useState, useMemo } from 'react';
import { AppState, MoneyTransaction, MoneyTransactionType } from '../types';
import { formatMoney, generateId } from '../utils/storage';
import { computeLedgerAndSummary, LedgerEntry } from '../utils/moneyManagement';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Printer,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  TrendingUp,
  Coins,
  Receipt,
  X,
  PlusCircle,
  Filter,
  RefreshCw,
  HelpCircle,
  ChevronRight,
  Download
} from 'lucide-react';

interface MoneyManagementViewProps {
  state: AppState;
  onAddTransaction: (tx: MoneyTransaction) => void;
  onDeleteTransaction: (id: string) => void;
  onNavigateTab?: (tab: any) => void;
}

export const MoneyManagementView: React.FC<MoneyManagementViewProps> = ({
  state,
  onAddTransaction,
  onDeleteTransaction,
  onNavigateTab,
}) => {
  const currency = state.settings.currency || 'BDT';

  // Timeframe state
  const [timeframe, setTimeframe] = useState<'ALL' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CASHFLOW' | 'BETS'>('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<MoneyTransactionType>('DEPOSIT');
  const [modalAmount, setModalAmount] = useState('1000');
  const [modalMethod, setModalMethod] = useState('bKash');
  const [modalDate, setModalDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalTime, setModalTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  );
  const [modalNote, setModalNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Compute ledger and summary metrics
  const { ledger, periodLedger, summary } = useMemo(() => {
    return computeLedgerAndSummary(state, timeframe, selectedDate);
  }, [state, timeframe, selectedDate]);

  // Filtered ledger for display
  const displayedLedger = useMemo(() => {
    const list = timeframe === 'ALL' ? ledger : periodLedger;
    if (typeFilter === 'CASHFLOW') {
      return list.filter((item) => item.type === 'DEPOSIT' || item.type === 'WITHDRAW');
    }
    if (typeFilter === 'BETS') {
      return list.filter((item) => item.type.startsWith('BET_'));
    }
    return list;
  }, [ledger, periodLedger, timeframe, typeFilter]);

  // Handle open modal
  const handleOpenModal = (type: MoneyTransactionType) => {
    setModalType(type);
    setModalAmount(type === 'DEPOSIT' ? '1000' : '500');
    setModalMethod(type === 'DEPOSIT' ? 'bKash' : 'Bank Transfer');
    setModalDate(new Date().toISOString().split('T')[0]);
    setModalTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    setModalNote('');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  // Handle submit modal
  const handleSubmitTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(modalAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      setErrorMessage('Please enter a valid positive amount.');
      return;
    }

    if (modalType === 'WITHDRAW' && amountNum > summary.currentBalance) {
      setErrorMessage(
        `Withdrawal exceeds available balance (${formatMoney(summary.currentBalance, currency)}).`
      );
      return;
    }

    const newTx: MoneyTransaction = {
      id: generateId(),
      type: modalType,
      amount: amountNum,
      date: modalDate,
      time: modalTime,
      method: modalMethod.trim() || (modalType === 'DEPOSIT' ? 'Cash' : 'Bank Transfer'),
      note: modalNote.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onAddTransaction(newTx);
    setIsModalOpen(false);
    setSuccessBanner(
      `${modalType === 'DEPOSIT' ? 'Deposit' : 'Withdrawal'} of ${formatMoney(amountNum, currency)} recorded successfully.`
    );
    setTimeout(() => setSuccessBanner(null), 3500);
  };

  // Preset amount chips
  const amountPresets = [500, 1000, 2000, 5000, 10000, 25000];

  // Print statement
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-6xl 2xl:max-w-7xl mx-auto space-y-6 animate-fadeIn pb-32">
      {/* 1. Header Card */}
      <div className="solid-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl shadow-sm relative overflow-hidden">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200 shadow-xs">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
                <span>MONEY MANAGEMENT</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Real-time Bankroll Ledger • Automated Bet Settlements • Deposits & Withdrawals
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => handleOpenModal('DEPOSIT')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>+ Deposit</span>
          </button>

          <button
            onClick={() => handleOpenModal('WITHDRAW')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>- Withdraw</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            title="Print statement report for selected timeframe"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Statement</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-bold flex items-center space-x-3 animate-fadeIn shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* 2. Key Financial Cards (Primary Account Overview) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Main Available Balance */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between opacity-80 text-xs font-bold uppercase tracking-wider">
            <span>Main Account Balance</span>
            <Coins className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black font-mono mt-2 tracking-tight">
            {formatMoney(summary.currentBalance, currency)}
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-white/20 flex items-center justify-between text-xs text-emerald-100 font-medium">
            <span>Account Equity:</span>
            <span className="font-mono font-bold text-white">{formatMoney(summary.accountEquity, currency)}</span>
          </div>
        </div>

        {/* Pending Stakes in Play */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>In-Play / Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-600 mt-2 tracking-tight">
            {formatMoney(summary.pendingStakes, currency)}
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Active Bets:</span>
            <span className="font-mono font-bold text-slate-800">
              {state.matchHistory.filter((m) => m.result === 'PENDING').length} matches
            </span>
          </div>
        </div>

        {/* Total Won Payouts (Stake + Profit) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Winnings Credited</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600 mt-2 tracking-tight">
            +{formatMoney(summary.totalWinningsCollected, currency)}
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Won Stake + Profit:</span>
            <span className="font-mono font-bold text-emerald-700">
              {state.matchHistory.filter((m) => m.result === 'WIN').length} Won
            </span>
          </div>
        </div>

        {/* Total Deposits vs Withdrawals */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Net Cash Deposited</span>
            <TrendingUp className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-2 tracking-tight">
            {formatMoney(summary.netCashDeposited, currency)}
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Deposits / Withdraws:</span>
            <span className="font-mono font-bold text-slate-800">
              +{formatMoney(summary.totalDeposited, '')} / -{formatMoney(summary.totalWithdrawn, '')}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Timeframe Filter Toolbar */}
      <div className="solid-card p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setTimeframe(mode)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                timeframe === mode
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {mode === 'ALL' && 'All Time'}
              {mode === 'DAILY' && 'Daily'}
              {mode === 'WEEKLY' && 'Weekly'}
              {mode === 'MONTHLY' && 'Monthly'}
              {mode === 'YEARLY' && 'Yearly'}
            </button>
          ))}
        </div>

        {/* Date / Month Picker when period filter is active */}
        {timeframe !== 'ALL' && (
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type={timeframe === 'MONTHLY' ? 'month' : 'date'}
              value={selectedDate.slice(0, timeframe === 'MONTHLY' ? 7 : 10)}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(timeframe === 'MONTHLY' ? `${e.target.value}-01` : e.target.value);
                }
              }}
              className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 outline-hidden"
            />
          </div>
        )}
      </div>

      {/* 4. Selected Timeframe Financial Summary (Daily / Weekly / Monthly / Yearly / All) */}
      <div className="solid-card p-5 bg-slate-50/80 border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              {timeframe === 'ALL' && 'All-Time Financial Statement Summary'}
              {timeframe === 'DAILY' && `Daily Statement Summary (${selectedDate})`}
              {timeframe === 'WEEKLY' && `Weekly Statement Summary (${selectedDate})`}
              {timeframe === 'MONTHLY' && `Monthly Statement Summary (${selectedDate.slice(0, 7)})`}
              {timeframe === 'YEARLY' && `Yearly Statement Summary (${selectedDate.slice(0, 4)})`}
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            {timeframe === 'ALL' ? ledger.length : periodLedger.length} events
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3">
          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Deposits</div>
            <div className="text-base font-black font-mono text-emerald-600 mt-1">
              +{formatMoney(timeframe === 'ALL' ? summary.totalDeposited : summary.periodDeposits, currency)}
            </div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Withdrawals</div>
            <div className="text-base font-black font-mono text-slate-700 mt-1">
              -{formatMoney(timeframe === 'ALL' ? summary.totalWithdrawn : summary.periodWithdrawals, currency)}
            </div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Bets Staked</div>
            <div className="text-base font-black font-mono text-slate-800 mt-1">
              {formatMoney(
                timeframe === 'ALL'
                  ? state.matchHistory.reduce((acc, m) => acc + (Number(m.stake) || 0), 0)
                  : summary.periodStakes,
                currency
              )}
            </div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Won Payouts</div>
            <div className="text-base font-black font-mono text-emerald-600 mt-1">
              +{formatMoney(timeframe === 'ALL' ? summary.totalWinningsCollected : summary.periodWinnings, currency)}
            </div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Lost Stakes</div>
            <div className="text-base font-black font-mono text-rose-600 mt-1">
              -{formatMoney(timeframe === 'ALL' ? summary.totalLostStakes : summary.periodLosses, currency)}
            </div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Period Net P&L</div>
            <div
              className={`text-base font-black font-mono mt-1 ${
                (timeframe === 'ALL' ? summary.totalNetPnL : summary.periodNetPnL) >= 0
                  ? 'text-emerald-600'
                  : 'text-rose-600'
              }`}
            >
              {(timeframe === 'ALL' ? summary.totalNetPnL : summary.periodNetPnL) >= 0 ? '+' : ''}
              {formatMoney(timeframe === 'ALL' ? summary.totalNetPnL : summary.periodNetPnL, currency)}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Statement Ledger Table */}
      <div className="solid-card bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-3 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-slate-800" />
            <h2 className="text-base font-black text-slate-900 tracking-tight">Account Statement Ledger</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 font-mono">
              {displayedLedger.length} Records
            </span>
          </div>

          {/* Type Filter */}
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            {(['ALL', 'CASHFLOW', 'BETS'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTypeFilter(filter)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  typeFilter === filter
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {filter === 'ALL' && 'All Activity'}
                {filter === 'CASHFLOW' && 'Deposits / Withdrawals'}
                {filter === 'BETS' && 'Bets Only'}
              </button>
            ))}
          </div>
        </div>

        {displayedLedger.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-3">
            <Coins className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-black text-slate-700">No Transactions Found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Deposit funds or place and win bets to see your detailed bankroll statement.
            </p>
            <button
              onClick={() => handleOpenModal('DEPOSIT')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center space-x-1.5 shadow-xs"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Make First Deposit</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Date / Time</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3 text-right">Cash Flow</th>
                  <th className="py-3 px-3 text-right">Running Balance</th>
                  <th className="py-3 px-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedLedger.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Date & Time */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-800">{item.date}</div>
                        {item.time && <div className="text-[10px] text-slate-400 font-mono">{item.time}</div>}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {item.type === 'DEPOSIT' && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px] inline-flex items-center space-x-1">
                            <ArrowDownLeft className="w-3 h-3" />
                            <span>Deposit</span>
                          </span>
                        )}
                        {item.type === 'WITHDRAW' && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[11px] inline-flex items-center space-x-1">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>Withdrawal</span>
                          </span>
                        )}
                        {item.type === 'BET_PLACED' && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[11px] inline-flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Bet Placed</span>
                          </span>
                        )}
                        {item.type === 'BET_WON' && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px] inline-flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Bet Won</span>
                          </span>
                        )}
                        {item.type === 'BET_LOST' && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[11px] inline-flex items-center space-x-1">
                            <XCircle className="w-3 h-3" />
                            <span>Bet Lost</span>
                          </span>
                        )}
                        {item.type === 'BET_VOID' && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[11px]">
                            Void Refund
                          </span>
                        )}
                      </td>

                      {/* Description */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{item.title}</div>
                        {item.details && <div className="text-[11px] text-slate-500 mt-0.5">{item.details}</div>}
                      </td>

                      {/* Cash Flow */}
                      <td className="py-3 px-3 text-right font-mono font-black whitespace-nowrap">
                        {item.type === 'DEPOSIT' && (
                          <span className="text-emerald-600">+{formatMoney(item.amount, currency)}</span>
                        )}
                        {item.type === 'WITHDRAW' && (
                          <span className="text-rose-600">-{formatMoney(item.amount, currency)}</span>
                        )}
                        {item.type === 'BET_PLACED' && (
                          <span className="text-amber-600">-{formatMoney(item.amount, currency)}</span>
                        )}
                        {item.type === 'BET_WON' && (
                          <div className="leading-tight">
                            <span className="text-emerald-600">+{formatMoney(item.amount, currency)}</span>
                            {item.totalPayout && (
                              <div className="text-[10px] text-slate-400 font-normal">
                                Payout: {formatMoney(item.totalPayout, currency)}
                              </div>
                            )}
                          </div>
                        )}
                        {item.type === 'BET_LOST' && (
                          <span className="text-rose-600">-{formatMoney(item.amount, currency)}</span>
                        )}
                        {item.type === 'BET_VOID' && <span className="text-slate-500">0.00</span>}
                      </td>

                      {/* Running Balance */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatMoney(item.runningBalance, currency)}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        {item.transactionId && (
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this deposit/withdrawal transaction?')) {
                                onDeleteTransaction(item.transactionId!);
                                setSuccessBanner('Transaction removed.');
                                setTimeout(() => setSuccessBanner(null), 3000);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete manual transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Deposit / Withdraw Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5 animate-scaleUp relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header Tabs */}
            <div>
              <div className="flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setModalType('DEPOSIT');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                    modalType === 'DEPOSIT'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Deposit Funds</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalType('WITHDRAW');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                    modalType === 'WITHDRAW'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Withdraw Funds</span>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitTransaction} className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Amount ({currency})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={modalAmount}
                    onChange={(e) => setModalAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full pl-3 pr-14 py-2.5 bg-slate-50 border border-slate-300 focus:border-red-600 rounded-xl font-mono font-black text-lg text-slate-900 outline-hidden transition-colors"
                    required
                    autoFocus
                  />
                  <span className="absolute right-3.5 top-3 font-mono font-bold text-xs text-slate-400">
                    {currency}
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {amountPresets.map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setModalAmount(String(preset))}
                      className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono font-bold transition-colors cursor-pointer"
                    >
                      +{preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Payment Method / Channel
                </label>
                <select
                  value={modalMethod}
                  onChange={(e) => setModalMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-red-600 rounded-xl text-xs font-bold text-slate-800 outline-hidden"
                >
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Rocket">Rocket</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Crypto">Crypto (USDT/BTC)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={modalTime}
                    onChange={(e) => setModalTime(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              {/* Note / Reference */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Note / Reference (Optional)
                </label>
                <input
                  type="text"
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  placeholder="e.g. Initial Deposit, Weekly Bankroll Top-up"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 outline-hidden"
                />
              </div>

              {/* Error display */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-3 rounded-xl text-white font-black text-sm transition-all shadow-md active:scale-95 cursor-pointer ${
                  modalType === 'DEPOSIT'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {modalType === 'DEPOSIT' ? 'Deposit' : 'Withdrawal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 7. Dedicated Print Statement Layout (Hidden on Screen, Rendered on Print) */}
      <div className="hidden print:block text-black bg-white p-6">
        <div className="border-b-2 border-black pb-4 mb-4">
          <div className="text-xl font-black uppercase tracking-wider">
            EPL PRO MATCH CENTER • MONEY MANAGEMENT STATEMENT
          </div>
          <div className="text-xs text-slate-600 mt-1">
            Statement Period: {timeframe} ({selectedDate}) • Currency: {currency} • Generated:{' '}
            {new Date().toLocaleString()}
          </div>
        </div>

        {/* Printable Summary Table */}
        <div className="grid grid-cols-4 gap-3 border border-black p-3 mb-4 text-xs">
          <div>
            <span className="font-bold block">Current Balance:</span>
            <span className="font-mono text-sm">{formatMoney(summary.currentBalance, currency)}</span>
          </div>
          <div>
            <span className="font-bold block">Net Cash Deposited:</span>
            <span className="font-mono text-sm">{formatMoney(summary.netCashDeposited, currency)}</span>
          </div>
          <div>
            <span className="font-bold block">Total Winnings Collected:</span>
            <span className="font-mono text-sm">+{formatMoney(summary.totalWinningsCollected, currency)}</span>
          </div>
          <div>
            <span className="font-bold block">Net Betting P&L:</span>
            <span className="font-mono text-sm">
              {summary.totalNetPnL >= 0 ? '+' : ''}
              {formatMoney(summary.totalNetPnL, currency)}
            </span>
          </div>
        </div>

        {/* Printable Detailed Ledger Table */}
        <table className="w-full text-xs text-left border-collapse border border-black">
          <thead>
            <tr className="border-b border-black bg-slate-100 font-bold">
              <th className="p-2 border-r border-black">Date</th>
              <th className="p-2 border-r border-black">Type</th>
              <th className="p-2 border-r border-black">Description</th>
              <th className="p-2 border-r border-black text-right">Amount</th>
              <th className="p-2 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {displayedLedger.map((item) => (
              <tr key={item.id} className="border-b border-black">
                <td className="p-2 border-r border-black font-mono">{item.date}</td>
                <td className="p-2 border-r border-black font-bold">{item.type}</td>
                <td className="p-2 border-r border-black">{item.title}</td>
                <td className="p-2 border-r border-black text-right font-mono">
                  {item.flow === 'IN' ? '+' : item.flow === 'OUT' ? '-' : ''}
                  {formatMoney(item.amount, currency)}
                </td>
                <td className="p-2 text-right font-mono font-bold">
                  {formatMoney(item.runningBalance, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
