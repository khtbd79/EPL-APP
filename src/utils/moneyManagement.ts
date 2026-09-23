import { AppState, MoneyTransaction, MatchRecord } from '../types';

export interface LedgerEntry {
  id: string;
  timestamp: string; // For chronological sorting
  date: string;
  time?: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'BET_PLACED' | 'BET_WON' | 'BET_LOST' | 'BET_VOID';
  title: string;
  details?: string;
  flow: 'IN' | 'OUT' | 'NEUTRAL';
  amount: number; // The financial impact on available cash
  totalPayout?: number; // For wins: stake + profit
  runningBalance: number;
  transactionId?: string; // For manual deposits/withdrawals to allow removal
}

export interface MoneySummary {
  // Global / Account-wide
  currentBalance: number;
  pendingStakes: number;
  accountEquity: number;
  totalDeposited: number;
  totalWithdrawn: number;
  netCashDeposited: number;
  totalWinningsCollected: number; // Total stake + profit from all won bets
  totalLostStakes: number;
  totalNetPnL: number;
  allTimeROI: number;

  // Selected Period Metrics
  periodDeposits: number;
  periodWithdrawals: number;
  periodStakes: number;
  periodWinnings: number; // Won stake + profit returned
  periodLosses: number;
  periodNetPnL: number;
  periodBetCount: number;
  periodWinCount: number;
  periodLossCount: number;
  periodWinRate: number;
}

/**
 * Builds a chronological ledger of all money movements:
 * 1. Deposits (+)
 * 2. Withdrawals (-)
 * 3. Bets placed / pending (-)
 * 4. Won bets (Stake + Profit added back)
 * 5. Lost bets (0 payout, stake was consumed)
 * 6. Void bets (Stake refunded)
 */
export const computeLedgerAndSummary = (
  state: AppState,
  timeframe: 'ALL' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY',
  referenceDateStr?: string
): { ledger: LedgerEntry[]; periodLedger: LedgerEntry[]; summary: MoneySummary } => {
  const transactions = state.moneyTransactions || [];
  const matches = state.matchHistory || [];

  // 1. Gather all events with normalized timestamp
  interface RawEvent {
    id: string;
    timestamp: number;
    date: string;
    time?: string;
    type: 'DEPOSIT' | 'WITHDRAW' | 'BET_PLACED' | 'BET_WON' | 'BET_LOST' | 'BET_VOID';
    title: string;
    details?: string;
    flow: 'IN' | 'OUT' | 'NEUTRAL';
    amount: number;
    totalPayout?: number;
    transactionId?: string;
  }

  const rawEvents: RawEvent[] = [];

  // Add deposit/withdrawal transactions
  transactions.forEach((tx) => {
    const timeStr = tx.time || '12:00';
    const dateObj = new Date(`${tx.date}T${timeStr}:00`);
    const ts = !isNaN(dateObj.getTime()) ? dateObj.getTime() : new Date(tx.createdAt || Date.now()).getTime();

    if (tx.type === 'DEPOSIT') {
      rawEvents.push({
        id: `tx-${tx.id}`,
        timestamp: ts,
        date: tx.date,
        time: tx.time,
        type: 'DEPOSIT',
        title: `Deposit (${tx.method || 'Cash'})`,
        details: tx.note || undefined,
        flow: 'IN',
        amount: Number(tx.amount) || 0,
        transactionId: tx.id,
      });
    } else {
      rawEvents.push({
        id: `tx-${tx.id}`,
        timestamp: ts,
        date: tx.date,
        time: tx.time,
        type: 'WITHDRAW',
        title: `Withdrawal (${tx.method || 'Bank'})`,
        details: tx.note || undefined,
        flow: 'OUT',
        amount: Number(tx.amount) || 0,
        transactionId: tx.id,
      });
    }
  });

  // Add match bet events
  matches.forEach((m, idx) => {
    const timeStr = m.matchTime || '15:00';
    const matchDateStr = m.date || new Date().toISOString().split('T')[0];
    const dateObj = new Date(`${matchDateStr}T${timeStr}:00`);
    const baseTs = !isNaN(dateObj.getTime()) ? dateObj.getTime() : Date.now() + idx;

    const stake = Number(m.stake) || 0;
    const odds = Number(m.odds) || 1;
    const profit = m.profit > 0 ? m.profit : (odds > 1 && stake > 0 ? Number((stake * (odds - 1)).toFixed(2)) : 0);
    const loss = m.loss > 0 ? m.loss : stake;
    const totalPayout = Number((stake + profit).toFixed(2));

    if (m.result === 'PENDING') {
      // Placing the bet commits the stake from available balance
      rawEvents.push({
        id: `bet-${m.id}-place`,
        timestamp: baseTs,
        date: matchDateStr,
        time: m.matchTime,
        type: 'BET_PLACED',
        title: `Bet Placed: ${m.homeTeam} vs ${m.awayTeam}`,
        details: `${m.market} @ ${odds.toFixed(2)} (Active Pending)`,
        flow: 'OUT',
        amount: stake,
      });
    } else if (m.result === 'WIN') {
      // Net settlement: stake is returned + profit gained (Total Payout = stake + profit)
      // Since stake was invested, net balance delta is +profit
      rawEvents.push({
        id: `bet-${m.id}-win`,
        timestamp: baseTs + 7200000, // 2 hours later after match finish
        date: matchDateStr,
        time: m.matchTime,
        type: 'BET_WON',
        title: `Bet Won: ${m.homeTeam} vs ${m.awayTeam}`,
        details: `${m.market} @ ${odds.toFixed(2)} • Winnings: +${profit} (Payout: ${totalPayout})`,
        flow: 'IN',
        amount: profit,
        totalPayout: totalPayout,
      });
    } else if (m.result === 'LOSS') {
      // Stake was lost; net balance delta is -loss
      rawEvents.push({
        id: `bet-${m.id}-loss`,
        timestamp: baseTs + 7200000,
        date: matchDateStr,
        time: m.matchTime,
        type: 'BET_LOST',
        title: `Bet Lost: ${m.homeTeam} vs ${m.awayTeam}`,
        details: `${m.market} @ ${odds.toFixed(2)} • Stake lost: -${loss}`,
        flow: 'OUT',
        amount: loss,
      });
    } else if (m.result === 'VOID') {
      // Stake refunded
      rawEvents.push({
        id: `bet-${m.id}-void`,
        timestamp: baseTs + 7200000,
        date: matchDateStr,
        time: m.matchTime,
        type: 'BET_VOID',
        title: `Bet Refunded (Void): ${m.homeTeam} vs ${m.awayTeam}`,
        details: `${m.market} • Stake ${stake} returned`,
        flow: 'NEUTRAL',
        amount: 0,
      });
    }
  });

  // 2. Sort chronologically from oldest to newest to compute running balance
  rawEvents.sort((a, b) => a.timestamp - b.timestamp);

  let currentRun = 0;
  const fullLedger: LedgerEntry[] = rawEvents.map((e) => {
    if (e.type === 'DEPOSIT') {
      currentRun += e.amount;
    } else if (e.type === 'WITHDRAW') {
      currentRun -= e.amount;
    } else if (e.type === 'BET_PLACED') {
      currentRun -= e.amount;
    } else if (e.type === 'BET_WON') {
      currentRun += e.amount;
    } else if (e.type === 'BET_LOST') {
      currentRun -= e.amount;
    }
    // BET_VOID leaves running cash unchanged

    return {
      id: e.id,
      timestamp: new Date(e.timestamp).toISOString(),
      date: e.date,
      time: e.time,
      type: e.type,
      title: e.title,
      details: e.details,
      flow: e.flow,
      amount: e.amount,
      totalPayout: e.totalPayout,
      runningBalance: Number(currentRun.toFixed(2)),
      transactionId: e.transactionId,
    };
  });

  // Global totals
  let totalDeposited = 0;
  let totalWithdrawn = 0;
  transactions.forEach((tx) => {
    if (tx.type === 'DEPOSIT') totalDeposited += Number(tx.amount) || 0;
    if (tx.type === 'WITHDRAW') totalWithdrawn += Number(tx.amount) || 0;
  });

  let totalPendingStakes = 0;
  let totalWonStake = 0;
  let totalProfit = 0;
  let totalLostStakes = 0;

  matches.forEach((m) => {
    const s = Number(m.stake) || 0;
    const o = Number(m.odds) || 1;
    const p = m.profit > 0 ? m.profit : (o > 1 && s > 0 ? Number((s * (o - 1)).toFixed(2)) : 0);
    const l = m.loss > 0 ? m.loss : s;

    if (m.result === 'PENDING') {
      totalPendingStakes += s;
    } else if (m.result === 'WIN') {
      totalWonStake += s;
      totalProfit += p;
    } else if (m.result === 'LOSS') {
      totalLostStakes += l;
    }
  });

  const totalNetPnL = totalProfit - totalLostStakes;
  const netCashDeposited = totalDeposited - totalWithdrawn;
  const currentBalance = Number((netCashDeposited + totalNetPnL - totalPendingStakes).toFixed(2));
  const accountEquity = Number((netCashDeposited + totalNetPnL).toFixed(2));
  const totalWinningsCollected = Number((totalWonStake + totalProfit).toFixed(2));
  const allTimeROI = (totalWonStake + totalLostStakes) > 0
    ? Number(((totalNetPnL / (totalWonStake + totalLostStakes)) * 100).toFixed(1))
    : 0;

  // 3. Timeframe Filtering
  const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date();
  const refDateStr = refDate.toISOString().split('T')[0];
  const refYear = refDate.getFullYear();
  const refMonth = refDate.getMonth();

  // Helper to determine if a date falls in the period
  const isInTimeframe = (dateStr: string): boolean => {
    if (timeframe === 'ALL') return true;
    if (!dateStr) return false;

    if (timeframe === 'DAILY') {
      return dateStr === refDateStr;
    }

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;

    if (timeframe === 'MONTHLY') {
      return d.getFullYear() === refYear && d.getMonth() === refMonth;
    }

    if (timeframe === 'YEARLY') {
      return d.getFullYear() === refYear;
    }

    if (timeframe === 'WEEKLY') {
      // 7-day window containing refDate
      const diffTime = Math.abs(d.getTime() - refDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }

    return true;
  };

  // Filter transactions and matches for the period metrics
  let periodDeposits = 0;
  let periodWithdrawals = 0;
  transactions.forEach((tx) => {
    if (isInTimeframe(tx.date)) {
      if (tx.type === 'DEPOSIT') periodDeposits += Number(tx.amount) || 0;
      if (tx.type === 'WITHDRAW') periodWithdrawals += Number(tx.amount) || 0;
    }
  });

  let periodStakes = 0;
  let periodWinnings = 0;
  let periodLosses = 0;
  let periodNetPnL = 0;
  let periodBetCount = 0;
  let periodWinCount = 0;
  let periodLossCount = 0;

  matches.forEach((m) => {
    if (isInTimeframe(m.date)) {
      const s = Number(m.stake) || 0;
      const o = Number(m.odds) || 1;
      const p = m.profit > 0 ? m.profit : (o > 1 && s > 0 ? Number((s * (o - 1)).toFixed(2)) : 0);
      const l = m.loss > 0 ? m.loss : s;

      periodStakes += s;
      periodBetCount++;

      if (m.result === 'WIN') {
        periodWinCount++;
        periodWinnings += Number((s + p).toFixed(2));
        periodNetPnL += p;
      } else if (m.result === 'LOSS') {
        periodLossCount++;
        periodLosses += l;
        periodNetPnL -= l;
      }
    }
  });

  const periodResolved = periodWinCount + periodLossCount;
  const periodWinRate = periodResolved > 0 ? Number(((periodWinCount / periodResolved) * 100).toFixed(1)) : 0;

  const periodLedger = fullLedger.filter((item) => isInTimeframe(item.date));

  const summary: MoneySummary = {
    currentBalance,
    pendingStakes: Number(totalPendingStakes.toFixed(2)),
    accountEquity,
    totalDeposited: Number(totalDeposited.toFixed(2)),
    totalWithdrawn: Number(totalWithdrawn.toFixed(2)),
    netCashDeposited: Number(netCashDeposited.toFixed(2)),
    totalWinningsCollected,
    totalLostStakes: Number(totalLostStakes.toFixed(2)),
    totalNetPnL: Number(totalNetPnL.toFixed(2)),
    allTimeROI,

    periodDeposits: Number(periodDeposits.toFixed(2)),
    periodWithdrawals: Number(periodWithdrawals.toFixed(2)),
    periodStakes: Number(periodStakes.toFixed(2)),
    periodWinnings: Number(periodWinnings.toFixed(2)),
    periodLosses: Number(periodLosses.toFixed(2)),
    periodNetPnL: Number(periodNetPnL.toFixed(2)),
    periodBetCount,
    periodWinCount,
    periodLossCount,
    periodWinRate,
  };

  return {
    ledger: [...fullLedger].reverse(), // Newest first for general view
    periodLedger: [...periodLedger].reverse(),
    summary,
  };
};
