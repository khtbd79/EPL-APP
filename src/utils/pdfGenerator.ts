import { AppState } from '../types';
import { calculateFinancials, formatMoney } from './storage';
import { ALL_EPL_20_TEAMS } from './teamData';

// Safe dynamic tag generator to prevent bundlers/optimizers from emitting literal HTML structural tags
const sTag = (tag: string): string => String.fromCharCode(60) + tag + String.fromCharCode(62);
const sClose = (tag: string): string => String.fromCharCode(60, 47) + tag + String.fromCharCode(62);

export type PdfReportType = 'all' | 'matches' | 'epl' | 'notes' | 'market_pnl';

export interface SerialLedgerItem {
  serial: number;
  id: string;
  category: 'RECORD' | 'EPL_MATCH' | 'PRE_MATCH_NOTE' | 'CATEGORY_RANKING';
  categoryLabel: string;
  date: string;
  time?: string;
  title: string;
  subtitle: string;
  details: string;
  status: string;
  statusType: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  amount?: string;
  balanceAfter?: string;
  rawDate: number;
}

/**
 * Builds a unified chronological list of all saved items in the application.
 */
export function buildUnifiedSerialLedger(
  state: AppState,
  sortOrder: 'asc' | 'desc' = 'asc'
): SerialLedgerItem[] {
  const currency = state.settings.currency || '$';
  const list: SerialLedgerItem[] = [];

  // 1. Add Daily Match Entries
  (state.matchHistory || []).forEach((m) => {
    const rawTime = m.date ? new Date(`${m.date}T${m.matchTime || '12:00'}`).getTime() : 0;
    const profitLossStr =
      m.result === 'WIN'
        ? `+${formatMoney(m.profit, currency)}`
        : m.result === 'LOSS'
        ? `-${formatMoney(m.loss, currency)}`
        : 'PENDING';

    list.push({
      serial: 0,
      id: m.id,
      category: 'RECORD',
      categoryLabel: 'Recorded Match',
      date: m.date,
      time: m.matchTime || '—',
      title: `Match #${String(m.dayNumber).padStart(2, '0')}: ${m.homeTeam} vs ${m.awayTeam}`,
      subtitle: `${m.market} • Odds: ${m.odds.toFixed(2)} • Stake: ${formatMoney(m.stake, currency)}`,
      details: m.notes || `League: ${m.league}`,
      status: m.result,
      statusType: m.result === 'WIN' ? 'success' : m.result === 'LOSS' ? 'danger' : 'warning',
      amount: profitLossStr,
      balanceAfter: m.bankrollAfter ? formatMoney(m.bankrollAfter, currency) : undefined,
      rawDate: isNaN(rawTime) ? 0 : rawTime,
    });
  });

  // 2. Add EPL Matchweek Match Events
  (state.eplMatches || []).forEach((e) => {
    const rawTime = e.date ? new Date(`${e.date}T${e.matchTime || '12:00'}`).getTime() : 0;
    const resultLabel =
      e.winner === 'HOME'
        ? `${e.homeTeam} Won`
        : e.winner === 'AWAY'
        ? `${e.awayTeam} Won`
        : 'Draw';

    const scorers = [
      e.homeGoalScorers ? `${e.homeTeam}: ${e.homeGoalScorers}` : '',
      e.awayGoalScorers ? `${e.awayTeam}: ${e.awayGoalScorers}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    list.push({
      serial: 0,
      id: e.id,
      category: 'EPL_MATCH',
      categoryLabel: 'EPL Match Result',
      date: e.date,
      time: e.matchTime || '—',
      title: `[MW ${e.matchweek}] ${e.homeTeam} ${e.homeScore} - ${e.awayScore} ${e.awayTeam}`,
      subtitle: `Venue: ${e.venue} • Result: ${resultLabel}`,
      details: scorers || (e.notes ? `Note: ${e.notes}` : `BTTS: ${e.btts ? 'YES' : 'NO'}, O/U 2.5: ${e.over25 ? 'Over' : 'Under'}`),
      status: `${e.homeScore}-${e.awayScore}`,
      statusType: 'info',
      amount: `Goals: ${e.totalGoals}`,
      balanceAfter: undefined,
      rawDate: isNaN(rawTime) ? 0 : rawTime,
    });
  });

  // 3. Add Quick Pre-Match Notes
  if (state.preMatchNotes) {
    Object.values(state.preMatchNotes).forEach((n) => {
      if (!n || (!n.homePerformance && !n.awayPerformance && !n.tacticalStyle && !n.keyStrengths && !n.keyWeaknesses && !n.keyPlayers && !n.overallPerformance && !n.keyFactor && !n.weakSide)) return;
      const rawTime = n.lastUpdated ? new Date(n.lastUpdated).getTime() : 0;
      const tactical = n.tacticalStyle || n.keyFactor || '';
      const strengths = n.keyStrengths || n.overallPerformance || '';
      const weaknesses = n.keyWeaknesses || n.weakSide || '';
      
      const detailsList = [
        n.homePerformance ? `Home: ${n.homePerformance}` : '',
        n.awayPerformance ? `Away: ${n.awayPerformance}` : '',
        tactical ? `Tactics: ${tactical}` : '',
        strengths ? `Strengths: ${strengths}` : '',
        weaknesses ? `Weaknesses: ${weaknesses}` : '',
        n.keyPlayers ? `Key Players: ${n.keyPlayers}` : '',
      ].filter(Boolean).join(' | ');

      list.push({
        serial: 0,
        id: `note_${n.teamName}`,
        category: 'PRE_MATCH_NOTE',
        categoryLabel: 'Pre-Match Note',
        date: n.lastUpdated ? n.lastUpdated.split('T')[0] : 'Saved Note',
        time: n.lastUpdated && n.lastUpdated.includes('T') ? n.lastUpdated.split('T')[1]?.substring(0, 5) : '—',
        title: `[Note] ${n.teamName}`,
        subtitle: tactical || strengths || `${n.teamName} Tactical Profile`,
        details: detailsList || 'Analysis Saved',
        status: 'NOTE',
        statusType: 'info',
        amount: n.bettingAngle || '—',
        balanceAfter: undefined,
        rawDate: isNaN(rawTime) ? 0 : rawTime,
      });
    });
  }

  // 5. Add Category & Tier Rankings
  if (state.categoryRankings) {
    Object.values(state.categoryRankings).forEach((cr) => {
      if (!cr || !Array.isArray(cr.rankings)) return;
      const rawTime = cr.updatedAt ? new Date(cr.updatedAt).getTime() : 0;
      const t1 = cr.rankings.filter((r) => r.tier === 'TIER_1').map((r) => r.teamName).filter(Boolean).join(', ');
      const t2 = cr.rankings.filter((r) => r.tier === 'TIER_2').map((r) => r.teamName).filter(Boolean).join(', ');
      const t3 = cr.rankings.filter((r) => r.tier === 'TIER_3').map((r) => r.teamName).filter(Boolean).join(', ');

      list.push({
        serial: 0,
        id: `category_mw_${cr.matchweek}`,
        category: 'CATEGORY_RANKING',
        categoryLabel: 'Category Tier Ranking',
        date: cr.updatedAt ? cr.updatedAt.split('T')[0] : `MW ${cr.matchweek}`,
        time: cr.updatedAt && cr.updatedAt.includes('T') ? cr.updatedAt.split('T')[1]?.substring(0, 5) : '—',
        title: `[MW ${cr.matchweek}] Team Category Ranking (1-20)`,
        subtitle: `Tier 1: ${t1 || 'None'}`,
        details: `Tier 2: ${t2 || 'None'} | Tier 3: ${t3 || 'None'}${cr.overallNotes ? ` | Note: ${cr.overallNotes}` : ''}`,
        status: `MW ${cr.matchweek}`,
        statusType: 'success',
        amount: `${cr.rankings.length} Teams`,
        balanceAfter: undefined,
        rawDate: isNaN(rawTime) ? 0 : rawTime,
      });
    });
  }

  // Sort list
  list.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.rawDate - b.rawDate;
    }
    return b.rawDate - a.rawDate;
  });

  // Assign serial numbers (1, 2, 3...)
  return list.map((item, index) => ({
    ...item,
    serial: index + 1,
  }));
}

/**
 * Builds HTML string safely without any unescaped tags or inline script blocks
 */
export function buildPrintHtml(state: AppState, reportType: PdfReportType): string {
  if (reportType === 'market_pnl') {
    return buildMarketPnlPrintHtml(state);
  }

  const fin = calculateFinancials(state);
  const currency = state.settings.currency || '$';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const ledger = buildUnifiedSerialLedger(state, 'asc');
  const filteredLedger =
    reportType === 'matches'
      ? ledger.filter((l) => l.category === 'RECORD')
      : reportType === 'epl'
      ? ledger.filter((l) => l.category === 'EPL_MATCH')
      : reportType === 'notes'
      ? ledger.filter((l) => l.category === 'PRE_MATCH_NOTE')
      : ledger;

  const reportTitle =
    reportType === 'matches'
      ? 'Daily Match History & Performance Report (PDF)'
      : reportType === 'epl'
      ? 'EPL Match Results & Score Ledger (PDF)'
      : reportType === 'notes'
      ? 'EPL 20 Teams Quick Notes (PDF)'
      : 'Complete Master Data Ledger (PDF)';

  const rows = filteredLedger.length === 0
    ? '<tr><td colspan="7" class="text-center" style="padding: 20px; color: #6b7280;">No records found.</td></tr>'
    : filteredLedger
        .map(
          (item) => `
        <tr>
          <td class="text-center font-mono font-bold" style="background:#f9fafb;">${item.serial}</td>
          <td class="font-mono">${item.date}<br><span style="color:#6b7280;font-size:9px;">${item.time || ''}</span></td>
          <td><span style="font-weight:700;color:#374151;">${item.categoryLabel}</span></td>
          <td>
            <div style="font-weight:700;color:#111827;">${item.title}</div>
            <div style="font-size:9.5px;color:#6b7280;margin-top:2px;">${item.subtitle}</div>
          </td>
          <td style="font-size:9.5px;color:#4b5563;">${item.details}</td>
          <td class="text-center">
            <span class="badge ${
              item.status === 'WIN'
                ? 'badge-win'
                : item.status === 'LOSS'
                ? 'badge-loss'
                : item.status === 'PENDING'
                ? 'badge-pending'
                : 'badge-info'
            }">
              ${item.status}
            </span>
          </td>
          <td class="text-right font-mono font-bold ${
            item.amount?.startsWith('+')
              ? 'positive'
              : item.amount?.startsWith('-')
              ? 'negative'
              : ''
          }">
            ${item.amount || '—'}
          </td>
        </tr>`
        )
        .join('');

  const docTypeAndHead = [
    sTag('!DOCTYPE html'),
    sTag('html lang="en"'),
    sTag('head'),
    '  ' + sTag('meta charset="UTF-8"'),
    '  ' + sTag('title') + reportTitle + sClose('title'),
    '  ' + sTag('style'),
    '    @page { size: A4 portrait; margin: 12mm 10mm 15mm 10mm; }',
    '    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }',
    '    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #111827; background: #ffffff; margin: 0; padding: 12px; font-size: 11px; line-height: 1.4; }',
    '    .header-box { border-bottom: 2px solid #dc2626; padding-bottom: 12px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: flex-end; }',
    '    .brand-title { font-size: 20px; font-weight: 900; color: #dc2626; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }',
    '    .brand-sub { font-size: 12px; color: #4b5563; margin: 3px 0 0 0; font-weight: 600; }',
    '    .meta-box { text-align: right; font-size: 10px; color: #6b7280; }',
    '    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 15px; }',
    '    .stat-card { border: 1px solid #e5e7eb; background: #f9fafb; padding: 8px 10px; border-radius: 6px; }',
    '    .stat-card .label { font-size: 9px; text-transform: uppercase; font-weight: 700; color: #6b7280; }',
    '    .stat-card .value { font-size: 14px; font-weight: 800; color: #111827; margin-top: 2px; font-family: monospace; }',
    '    .stat-card .positive { color: #16a34a; }',
    '    .stat-card .negative { color: #dc2626; }',
    '    .section-title { font-size: 13px; font-weight: 800; color: #1f2937; margin: 12px 0 6px 0; border-left: 4px solid #dc2626; padding-left: 6px; }',
    '    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 10.5px; }',
    '    th { background-color: #f3f4f6; color: #374151; font-weight: 700; text-align: left; padding: 6px 8px; border: 1px solid #d1d5db; font-size: 9.5px; text-transform: uppercase; }',
    '    td { padding: 6px 8px; border: 1px solid #e5e7eb; vertical-align: middle; }',
    '    tr:nth-child(even) { background-color: #f9fafb; }',
    '    .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 800; text-transform: uppercase; }',
    '    .badge-win { background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }',
    '    .badge-loss { background-color: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }',
    '    .badge-pending { background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; }',
    '    .badge-info { background-color: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }',
    '    .text-center { text-align: center; }',
    '    .text-right { text-align: right; }',
    '    .font-mono { font-family: monospace; }',
    '    .font-bold { font-weight: 700; }',
    '    .footer { margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 8px; display: flex; justify-content: space-between; font-size: 9px; color: #9ca3af; }',
    '    @media print { body { margin: 0; } .no-print { display: none !important; } }',
    '  ' + sClose('style'),
    sClose('head'),
    sTag('body'),
  ].join('\n');

  const bodyContent = [
    '  <div class="header-box">',
    '    <div>',
    '      <h1 class="brand-title">EPL 2026 Match Center</h1>',
    '      <p class="brand-sub">' + reportTitle + '</p>',
    '    </div>',
    '    <div class="meta-box">',
    '      <div><strong>Date:</strong> ' + dateStr + '</div>',
    '      <div><strong>Time:</strong> ' + timeStr + '</div>',
    '      <div><strong>Total Matches:</strong> ' + String(fin.totalBets) + '</div>',
    '    </div>',
    '  </div>',
    '  <div class="stats-grid">',
    '    <div class="stat-card">',
    '      <div class="label">Net Match P/L</div>',
    '      <div class="value ' + (fin.netBettingPnL >= 0 ? 'positive' : 'negative') + '">',
    '        ' + (fin.netBettingPnL >= 0 ? '+' : '') + formatMoney(fin.netBettingPnL, currency),
    '      </div>',
    '    </div>',
    '    <div class="stat-card">',
    '      <div class="label">Total Profit</div>',
    '      <div class="value positive">+' + formatMoney(fin.totalProfit, currency) + '</div>',
    '    </div>',
    '    <div class="stat-card">',
    '      <div class="label">Win Rate & Matches</div>',
    '      <div class="value">' + fin.winRate.toFixed(1) + '% <span style="font-size:10px;font-weight:normal;">(' + fin.winningBets + 'W/' + fin.losingBets + 'L)</span></div>',
    '    </div>',
    '    <div class="stat-card">',
    '      <div class="label">Total Records</div>',
    '      <div class="value">' + filteredLedger.length + ' Items</div>',
    '    </div>',
    '  </div>',
    '  <div class="section-title">',
    '    Master Ledger Entries (' + filteredLedger.length + ' records)',
    '  </div>',
    '  <table>',
    '    <thead>',
    '      <tr>',
    '        <th class="text-center" style="width: 35px;">SL #</th>',
    '        <th style="width: 85px;">Date/Time</th>',
    '        <th style="width: 100px;">Category</th>',
    '        <th>Match / Title</th>',
    '        <th style="width: 140px;">Market & Details</th>',
    '        <th class="text-center" style="width: 75px;">Status</th>',
    '        <th class="text-right" style="width: 85px;">Amount</th>',
    '      </tr>',
    '    </thead>',
    '    <tbody>',
    '      ' + rows,
    '    </tbody>',
    '  </table>',
    '  <div class="footer">',
    '    <span>EPL Challenge Pro • 100% Offline Local Data</span>',
    '    <span>Print Date: ' + dateStr + ' • Page 1 / 1</span>',
    '  </div>',
    sClose('body'),
    sClose('html'),
  ].join('\n');

  return docTypeAndHead + '\n' + bodyContent;
}

/**
 * Generates and triggers a print window for creating a clean, structured PDF.
 */
export function printPdfDocument(state: AppState, reportType: PdfReportType = 'all'): void {
  const now = new Date();
  const htmlContent = buildPrintHtml(state, reportType);

  // Open clean printable pop-up window
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    try {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch {
      // Fallback if window writing fails
      triggerBlobDownload(htmlContent, `EPL_Report_${reportType}_${now.toISOString().split('T')[0]}.html`);
    }
  } else {
    // Fallback if popup blocker is active: Download HTML file
    triggerBlobDownload(htmlContent, `EPL_Report_${reportType}_${now.toISOString().split('T')[0]}.html`);
  }
}

function triggerBlobDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(url);
  }, 500);
}

/**
 * Generates structured HTML layout for dedicated EPL 20 Teams Pre-Match Notes PDF report.
 */
export function buildPreMatchNotesPrintHtml(
  state: AppState,
  options?: { teamName?: string; onlySaved?: boolean }
): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const notesMap = state.preMatchNotes || {};

  const targetTeams = ALL_EPL_20_TEAMS.filter((team) => {
    if (options?.teamName && options.teamName !== 'all') {
      return team.name === options.teamName;
    }
    if (options?.onlySaved) {
      const n = notesMap[team.name];
      return n && (
        n.homePerformance ||
        n.awayPerformance ||
        n.tacticalStyle ||
        n.keyStrengths ||
        n.keyWeaknesses ||
        n.keyPlayers ||
        n.overallPerformance ||
        n.keyFactor ||
        n.weakSide
      );
    }
    return true;
  });

  const savedCount = ALL_EPL_20_TEAMS.filter((t) => {
    const n = notesMap[t.name];
    return n && (
      n.homePerformance ||
      n.awayPerformance ||
      n.tacticalStyle ||
      n.keyStrengths ||
      n.keyWeaknesses ||
      n.keyPlayers ||
      n.overallPerformance ||
      n.keyFactor ||
      n.weakSide
    );
  }).length;

  const teamCardsHtml = targetTeams.map((team, idx) => {
    const note = notesMap[team.name] || {
      teamName: team.name,
      homePerformance: '',
      awayPerformance: '',
      tacticalStyle: '',
      keyStrengths: '',
      keyWeaknesses: '',
      keyPlayers: '',
      bettingAngle: '',
      injurySuspension: '',
      lastUpdated: '',
    };

    const tactical = note.tacticalStyle || note.keyFactor || '';
    const strengths = note.keyStrengths || note.overallPerformance || '';
    const weaknesses = note.keyWeaknesses || note.weakSide || '';

    const hasData = note.homePerformance || note.awayPerformance || tactical || strengths || weaknesses || note.keyPlayers;

    return `
      <div class="team-card ${hasData ? '' : 'team-empty'}">
        <div class="team-header">
          <div class="team-identity">
            <span class="team-badge">#${idx + 1}</span>
            <div>
              <h2 class="team-title">${team.fullName}</h2>
              <p class="team-meta">📍 ${team.city} • ${team.priorityLabel}</p>
            </div>
          </div>
          <div class="team-status">
            ${
              hasData
                ? '<span class="badge-saved">✓ Saved</span>'
                : '<span class="badge-empty">Empty</span>'
            }
          </div>
        </div>

        <div class="fields-grid">
          <div class="field-box field-home">
            <div class="field-label">🏠 1. Home Performance</div>
            <div class="field-value">${note.homePerformance || '<span class="no-entry">— No entry —</span>'}</div>
          </div>

          <div class="field-box field-away">
            <div class="field-label">✈️ 2. Away Performance</div>
            <div class="field-value">${note.awayPerformance || '<span class="no-entry">— No entry —</span>'}</div>
          </div>

          <div class="field-box field-tactical">
            <div class="field-label">♟️ 3. Tactical Style</div>
            <div class="field-value">${tactical || '<span class="no-entry">— No entry —</span>'}</div>
          </div>

          <div class="field-box field-strengths">
            <div class="field-label">⚡ 4. Key Strengths</div>
            <div class="field-value">${strengths || '<span class="no-entry">— No entry —</span>'}</div>
          </div>

          <div class="field-box field-weaknesses">
            <div class="field-label">⚠️ 5. Key Weaknesses</div>
            <div class="field-value">${weaknesses || '<span class="no-entry">— No entry —</span>'}</div>
          </div>

          <div class="field-box field-players">
            <div class="field-label">⭐ 6. Key Players</div>
            <div class="field-value">${note.keyPlayers || '<span class="no-entry">— No entry —</span>'}</div>
          </div>

          <div class="field-box field-angle">
            <div class="field-label">💡 7. Key Match Angle</div>
            <div class="field-value">${note.bettingAngle || '<span class="no-entry">— No entry —</span>'}</div>
          </div>

          <div class="field-box field-injury">
            <div class="field-label">🏥 8. Injuries & Suspensions</div>
            <div class="field-value">${note.injurySuspension || '<span class="no-entry">— No entry —</span>'}</div>
          </div>
        </div>

        ${
          note.lastUpdated
            ? `<div class="card-footer">Last updated: ${new Date(note.lastUpdated).toLocaleString('en-US')}</div>`
            : ''
        }
      </div>
    `;
  }).join('');

  const docHead = [
    sTag('!DOCTYPE html'),
    sTag('html lang="en"'),
    sTag('head'),
    '  ' + sTag('meta charset="UTF-8"'),
    '  ' + sTag('title') + 'EPL 20 Teams Pre-Match Notes (PDF)' + sClose('title'),
    '  ' + sTag('style'),
    '    @page { size: A4 portrait; margin: 12mm 10mm 15mm 10mm; }',
    '    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }',
    '    body {',
    '      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;',
    '      color: #0f172a;',
    '      background: #ffffff;',
    '      margin: 0;',
    '      padding: 12px;',
    '      font-size: 11px;',
    '      line-height: 1.4;',
    '    }',
    '    .header-box {',
    '      border-bottom: 2px solid #0284c7;',
    '      padding-bottom: 12px;',
    '      margin-bottom: 15px;',
    '      display: flex;',
    '      justify-content: space-between;',
    '      align-items: flex-end;',
    '    }',
    '    .brand-title {',
    '      font-size: 20px;',
    '      font-weight: 900;',
    '      color: #0369a1;',
    '      margin: 0;',
    '      text-transform: uppercase;',
    '      letter-spacing: 0.5px;',
    '    }',
    '    .brand-sub {',
    '      font-size: 12px;',
    '      color: #475569;',
    '      margin: 3px 0 0 0;',
    '      font-weight: 600;',
    '    }',
    '    .meta-box {',
    '      text-align: right;',
    '      font-size: 10px;',
    '      color: #64748b;',
    '    }',
    '    .stats-summary-grid {',
    '      display: grid;',
    '      grid-template-columns: repeat(3, 1fr);',
    '      gap: 8px;',
    '      margin-bottom: 16px;',
    '    }',
    '    .stat-card {',
    '      background: #f8fafc;',
    '      border: 1px solid #cbd5e1;',
    '      border-radius: 8px;',
    '      padding: 8px 12px;',
    '      text-align: center;',
    '    }',
    '    .stat-card .label {',
    '      font-size: 9.5px;',
    '      font-weight: 700;',
    '      color: #64748b;',
    '      text-transform: uppercase;',
    '    }',
    '    .stat-card .value {',
    '      font-size: 15px;',
    '      font-weight: 800;',
    '      color: #0f172a;',
    '      margin-top: 2px;',
    '    }',
    '    .team-card {',
    '      border: 1.5px solid #cbd5e1;',
    '      border-radius: 10px;',
    '      padding: 12px 14px;',
    '      margin-bottom: 16px;',
    '      background: #ffffff;',
    '      page-break-inside: avoid;',
    '    }',
    '    .team-header {',
    '      display: flex;',
    '      justify-content: space-between;',
    '      align-items: center;',
    '      border-bottom: 1.5px solid #e2e8f0;',
    '      padding-bottom: 8px;',
    '      margin-bottom: 10px;',
    '    }',
    '    .team-name-box {',
    '      display: flex;',
    '      align-items: center;',
    '      gap: 8px;',
    '    }',
    '    .team-name {',
    '      font-size: 15px;',
    '      font-weight: 900;',
    '      color: #0f172a;',
    '    }',
    '    .badge-tier {',
    '      display: inline-block;',
    '      padding: 2px 8px;',
    '      border-radius: 9999px;',
    '      font-size: 9px;',
    '      font-weight: 800;',
    '      text-transform: uppercase;',
    '    }',
    '    .tier-title { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }',
    '    .tier-top4 { background: #dcfce7; color: #166534; border: 1px solid #86efac; }',
    '    .tier-mid { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; }',
    '    .tier-relegation { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }',
    '    .grid-fields {',
    '      display: grid;',
    '      grid-template-columns: repeat(2, 1fr);',
    '      gap: 8px;',
    '    }',
    '    .field-box {',
    '      background: #f8fafc;',
    '      border: 1px solid #e2e8f0;',
    '      border-radius: 6px;',
    '      padding: 6px 8px;',
    '    }',
    '    .field-label {',
    '      font-size: 9px;',
    '      font-weight: 800;',
    '      text-transform: uppercase;',
    '      color: #475569;',
    '      margin-bottom: 3px;',
    '    }',
    '    .field-value {',
    '      font-size: 10px;',
    '      color: #1e293b;',
    '      line-height: 1.35;',
    '      white-space: pre-wrap;',
    '    }',
    '    .no-entry {',
    '      color: #94a3b8;',
    '      font-style: italic;',
    '      font-size: 9.5px;',
    '    }',
    '    .card-footer {',
    '      margin-top: 8px;',
    '      padding-top: 6px;',
    '      border-top: 1px dashed #e2e8f0;',
    '      font-size: 8.5px;',
    '      color: #94a3b8;',
    '      text-align: right;',
    '    }',
    '    .footer {',
    '      margin-top: 20px;',
    '      border-top: 1px solid #e2e8f0;',
    '      padding-top: 8px;',
    '      display: flex;',
    '      justify-content: space-between;',
    '      font-size: 9px;',
    '      color: #94a3b8;',
    '    }',
    '    @media print { body { margin: 0; } .no-print { display: none !important; } }',
    '  ' + sClose('style'),
    sClose('head'),
    sTag('body'),
    '  <div class="header-box">',
    '    <div>',
    '      <h1 class="brand-title">EPL 20 Teams Pre-Match Notes</h1>',
    '      <p class="brand-sub">Quick Reference Guide & Tactical Analysis</p>',
    '    </div>',
    '    <div class="meta-box">',
    '      <div><strong>Date:</strong> ' + dateStr + '</div>',
    '      <div><strong>Time:</strong> ' + timeStr + '</div>',
    '      <div><strong>Total Teams:</strong> ' + targetTeams.length + '</div>',
    '    </div>',
    '  </div>',
  ].join('\n');

  const docBody = [
    '  <div class="stats-summary-grid">',
    '    <div class="stat-card">',
    '      <div class="label">Total Teams</div>',
    '      <div class="value">' + targetTeams.length + ' Teams</div>',
    '    </div>',
    '    <div class="stat-card">',
    '      <div class="label">Notes Saved</div>',
    '      <div class="value" style="color: #dc2626;">' + savedCount + '</div>',
    '    </div>',
    '    <div class="stat-card">',
    '      <div class="label">Pending</div>',
    '      <div class="value" style="color: #d97706;">' + (20 - savedCount) + '</div>',
    '    </div>',
    '  </div>',
    teamCardsHtml,
    '  <div class="footer">',
    '    <span>EPL Challenge Pro • 100% Offline Local Storage Data</span>',
    '    <span>Print Date: ' + dateStr + '</span>',
    '  </div>',
    sClose('body'),
    sClose('html'),
  ].join('\n');

  return docHead + '\n' + docBody;
}

/**
 * Trigger clean Printable / Downloadable PDF Window for EPL Pre-Match Notes.
 */
export function printPreMatchNotesDedicatedPdf(
  state: AppState,
  options?: { teamName?: string; onlySaved?: boolean }
): void {
  const htmlContent = buildPreMatchNotesPrintHtml(state, options);
  const now = new Date();
  const suffix = options?.teamName && options.teamName !== 'all' ? options.teamName : '20_Teams';

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    try {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch {
      triggerBlobDownload(htmlContent, `EPL_PreMatch_Notes_${suffix}_${now.toISOString().split('T')[0]}.html`);
    }
  } else {
    triggerBlobDownload(htmlContent, `EPL_PreMatch_Notes_${suffix}_${now.toISOString().split('T')[0]}.html`);
  }
}

/**
 * Downloads a formatted CSV (Excel) of the serial ledger.
 */
export function downloadLedgerCsv(state: AppState): void {
  const ledger = buildUnifiedSerialLedger(state, 'asc');
  const headers = ['Serial_No', 'Category', 'Date', 'Time', 'Title', 'Subtitle', 'Details', 'Status', 'Amount'];

  const rows = ledger.map((item) => [
    item.serial,
    `"${item.categoryLabel}"`,
    `"${item.date}"`,
    `"${item.time || ''}"`,
    `"${item.title.replace(/"/g, '""')}"`,
    `"${item.subtitle.replace(/"/g, '""')}"`,
    `"${item.details.replace(/"/g, '""')}"`,
    `"${item.status}"`,
    `"${item.amount || ''}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `EPL_Master_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(url);
  }, 500);
}

export interface MarketBetSummary {
  market: string;
  totalBets: number;
  wonBets: number;
  lostBets: number;
  pendingBets: number;
  voidBets: number;
  winRate: number; // percentage of settled matches
  totalStake: number;
  totalProfit: number;
  totalLoss: number;
  netPnL: number;
  recentBets: {
    match: string;
    date: string;
    result: 'WIN' | 'LOSS' | 'PENDING' | 'VOID';
    stake: number;
    pnl: number;
    odds: number;
  }[];
}

/**
 * Calculates market-by-market breakdown of user match performance:
 * Shows exactly which markets the user won on and which markets they lost on.
 */
export function calculateMarketBetSummaries(state: AppState): MarketBetSummary[] {
  const matches = state.matchHistory || [];
  const map: Record<string, MarketBetSummary> = {};

  matches.forEach((m) => {
    const market = (m.market || 'Unknown Market').trim();
    if (!map[market]) {
      map[market] = {
        market,
        totalBets: 0,
        wonBets: 0,
        lostBets: 0,
        pendingBets: 0,
        voidBets: 0,
        winRate: 0,
        totalStake: 0,
        totalProfit: 0,
        totalLoss: 0,
        netPnL: 0,
        recentBets: [],
      };
    }

    const s = map[market];
    s.totalBets += 1;
    s.totalStake += m.stake || 0;

    if (m.result === 'WIN') {
      s.wonBets += 1;
      s.totalProfit += m.profit || 0;
      s.netPnL += m.profit || 0;
    } else if (m.result === 'LOSS') {
      s.lostBets += 1;
      s.totalLoss += m.loss || 0;
      s.netPnL -= m.loss || 0;
    } else if (m.result === 'PENDING') {
      s.pendingBets += 1;
    } else if (m.result === 'VOID') {
      s.voidBets += 1;
    }

    s.recentBets.push({
      match: `${m.homeTeam} vs ${m.awayTeam}`,
      date: m.date,
      result: m.result,
      stake: m.stake || 0,
      pnl: m.result === 'WIN' ? m.profit : m.result === 'LOSS' ? -m.loss : 0,
      odds: m.odds || 0,
    });
  });

  return Object.values(map)
    .map((item) => {
      const settled = item.wonBets + item.lostBets;
      item.winRate = settled > 0 ? (item.wonBets / settled) * 100 : 0;
      return item;
    })
    .sort((a, b) => b.totalBets - a.totalBets || b.netPnL - a.netPnL);
}

/**
 * Builds printable HTML for Market Win/Loss Analysis Report
 */
export function buildMarketPnlPrintHtml(state: AppState): string {
  const currency = state.settings.currency || 'BDT';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const summaries = calculateMarketBetSummaries(state);
  const totalSettled = summaries.reduce((acc, s) => acc + s.wonBets + s.lostBets, 0);
  const totalWon = summaries.reduce((acc, s) => acc + s.wonBets, 0);
  const totalLost = summaries.reduce((acc, s) => acc + s.lostBets, 0);
  const totalNet = summaries.reduce((acc, s) => acc + s.netPnL, 0);

  const winningMarkets = summaries.filter((s) => s.netPnL > 0);
  const losingMarkets = summaries.filter((s) => s.netPnL < 0);

  const docHead = [
    sTag('!DOCTYPE html'),
    sTag('html lang="en"'),
    sTag('head'),
    '  ' + sTag('meta charset="UTF-8"'),
    '  ' + sTag('title') + 'Market Win & Loss Performance Report' + sClose('title'),
    '  ' + sTag('style'),
    '    @page { size: A4 portrait; margin: 12mm 10mm 15mm 10mm; }',
    '    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }',
    '    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #0f172a; background: #ffffff; margin: 0; padding: 14px; font-size: 11px; line-height: 1.45; }',
    '    .header { border-bottom: 2.5px solid #dc2626; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }',
    '    .title { font-size: 20px; font-weight: 900; color: #dc2626; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }',
    '    .subtitle { font-size: 12px; color: #475569; margin: 4px 0 0 0; font-weight: 600; }',
    '    .meta { text-align: right; font-size: 10px; color: #64748b; }',
    '    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px; }',
    '    .kpi-card { border: 1px solid #e2e8f0; background: #f8fafc; padding: 10px 12px; border-radius: 8px; }',
    '    .kpi-label { font-size: 9.5px; text-transform: uppercase; font-weight: 700; color: #64748b; }',
    '    .kpi-val { font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 3px; font-family: monospace; }',
    '    .pos { color: #16a34a !important; }',
    '    .neg { color: #dc2626 !important; }',
    '    .section-heading { font-size: 13px; font-weight: 800; color: #1e293b; margin: 16px 0 8px 0; border-left: 4px solid #dc2626; padding-left: 8px; text-transform: uppercase; }',
    '    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 10.5px; }',
    '    th { background: #f1f5f9; color: #334155; font-weight: 800; text-align: left; padding: 7px 9px; border: 1px solid #cbd5e1; font-size: 9.5px; text-transform: uppercase; }',
    '    td { padding: 7px 9px; border: 1px solid #e2e8f0; vertical-align: middle; }',
    '    tr:nth-child(even) { background: #f8fafc; }',
    '    .badge { display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 9px; font-weight: 800; text-transform: uppercase; font-family: monospace; }',
    '    .badge-win { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }',
    '    .badge-loss { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }',
    '    .badge-pending { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }',
    '    .progress-bar-container { background: #e2e8f0; border-radius: 9999px; height: 8px; width: 80px; overflow: hidden; display: inline-flex; }',
    '    .progress-win { background: #16a34a; height: 100%; }',
    '    .progress-loss { background: #dc2626; height: 100%; }',
    '    .footer { margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 10px; display: flex; justify-content: space-between; font-size: 9.5px; color: #94a3b8; }',
    '    @media print { body { padding: 0; } .no-print { display: none !important; } }',
    '  ' + sClose('style'),
    sClose('head'),
    sTag('body'),
  ].join('\n');

  const tableRows = summaries.length === 0
    ? '<tr><td colspan="8" style="text-align:center;padding:24px;color:#64748b;">No match history recorded yet. Record match entries in Match Center to analyze.</td></tr>'
    : summaries.map((s) => {
        const isNetProfit = s.netPnL > 0;
        const isNetLoss = s.netPnL < 0;
        const netColor = isNetProfit ? 'pos' : isNetLoss ? 'neg' : '';
        const winBarWidth = s.wonBets + s.lostBets > 0 ? (s.wonBets / (s.wonBets + s.lostBets)) * 100 : 0;
        const lossBarWidth = 100 - winBarWidth;

        return `<tr>
          <td style="font-weight: 800; color: #0f172a;">
            ${s.market}
          </td>
          <td style="text-align:center; font-family: monospace; font-weight: 700;">${s.totalBets}</td>
          <td style="text-align:center;">
            <span class="badge badge-win">${s.wonBets} Won</span>
          </td>
          <td style="text-align:center;">
            <span class="badge badge-loss">${s.lostBets} Lost</span>
          </td>
          <td style="text-align:center;">
            <div style="display:flex;align-items:center;justify-content:center;gap:6px;">
              <div class="progress-bar-container">
                <div class="progress-win" style="width: ${winBarWidth}%;"></div>
                <div class="progress-loss" style="width: ${lossBarWidth}%;"></div>
              </div>
              <span style="font-family:monospace;font-weight:700;font-size:10px;">${s.winRate.toFixed(1)}%</span>
            </div>
          </td>
          <td style="text-align:right; font-family: monospace;">${formatMoney(s.totalStake, currency)}</td>
          <td style="text-align:right; font-family: monospace; font-weight:800;" class="${netColor}">
            ${s.netPnL > 0 ? '+' : ''}${formatMoney(s.netPnL, currency)}
          </td>
          <td style="text-align:center;">
            <span class="badge ${isNetProfit ? 'badge-win' : isNetLoss ? 'badge-loss' : 'badge-pending'}">
              ${isNetProfit ? 'PROFITABLE' : isNetLoss ? 'DEFICIT MARKET' : 'BREAK-EVEN'}
            </span>
          </td>
        </tr>`;
      }).join('');

  const bodyContent = [
    '  <div class="header">',
    '    <div>',
    '      <h1 class="title">EPL Market Win & Loss Analysis</h1>',
    '      <p class="subtitle">Detailed breakdown of winning and losing markets</p>',
    '    </div>',
    '    <div class="meta">',
    '      <div><strong>Printed On:</strong> ' + dateStr + ' ' + timeStr + '</div>',
    '      <div><strong>Markets Active:</strong> ' + summaries.length + '</div>',
    '      <div><strong>Settled Matches:</strong> ' + totalSettled + '</div>',
    '    </div>',
    '  </div>',
    '  <div class="kpi-grid">',
    '    <div class="kpi-card">',
    '      <div class="kpi-label">Winning Markets</div>',
    '      <div class="kpi-val pos">' + winningMarkets.length + ' Markets</div>',
    '    </div>',
    '    <div class="kpi-card">',
    '      <div class="kpi-label">Losing Markets</div>',
    '      <div class="kpi-val neg">' + losingMarkets.length + ' Markets</div>',
    '    </div>',
    '    <div class="kpi-card">',
    '      <div class="kpi-label">Overall Win Rate</div>',
    '      <div class="kpi-val">' + (totalSettled > 0 ? ((totalWon / totalSettled) * 100).toFixed(1) : '0.0') + '% (' + totalWon + 'W/' + totalLost + 'L)</div>',
    '    </div>',
    '    <div class="kpi-card">',
    '      <div class="kpi-label">Total Net P/L</div>',
    '      <div class="kpi-val ' + (totalNet >= 0 ? 'pos' : 'neg') + '">' + (totalNet >= 0 ? '+' : '') + formatMoney(totalNet, currency) + '</div>',
    '    </div>',
    '  </div>',
    '  <div class="section-heading">Market Win / Loss Performance Table</div>',
    '  <table>',
    '    <thead>',
    '      <tr>',
    '        <th>Market Name</th>',
    '        <th style="text-align:center; width: 60px;">Total</th>',
    '        <th style="text-align:center; width: 80px;">Won</th>',
    '        <th style="text-align:center; width: 80px;">Lost</th>',
    '        <th style="text-align:center; width: 140px;">Win Rate Ratio</th>',
    '        <th style="text-align:right; width: 90px;">Total Staked</th>',
    '        <th style="text-align:right; width: 100px;">Net Profit / Loss</th>',
    '        <th style="text-align:center; width: 110px;">Market Verdict</th>',
    '      </tr>',
    '    </thead>',
    '    <tbody>',
    '      ' + tableRows,
    '    </tbody>',
    '  </table>',
    '  <div class="footer">',
    '    <span>EPL Pro Match Center • 100% Offline Financial Journal</span>',
    '    <span>Page 1 / 1 • Generated for ' + (state.settings.currency || 'BDT') + ' Account</span>',
    '  </div>',
    sClose('body'),
    sClose('html'),
  ].join('\n');

  return docHead + '\n' + bodyContent;
}

/**
 * Triggers a clean print window or downloadable HTML file for the Market Win/Loss Report
 */
export function printMarketPnlPdf(state: AppState): void {
  const htmlContent = buildMarketPnlPrintHtml(state);
  const now = new Date();
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    try {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch {
      triggerBlobDownload(htmlContent, `EPL_Market_Win_Loss_Report_${now.toISOString().split('T')[0]}.html`);
    }
  } else {
    triggerBlobDownload(htmlContent, `EPL_Market_Win_Loss_Report_${now.toISOString().split('T')[0]}.html`);
  }
}

