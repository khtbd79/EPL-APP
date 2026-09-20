import { TopTeamsAnalysisReport } from '../types';

/**
 * Escapes strings for PDF literal text syntax: ( ... )
 */
function escapePdfText(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/**
 * Pure client-side PDF generator (PDF 1.4 compliant).
 * Completely self-contained: 0 external dependencies, 0 dynamic module imports.
 * Generates an ultra-crisp, vector-clean A4 PDF report with high-contrast styling.
 */
export function generateTopTeamsPdfBlob(report: TopTeamsAnalysisReport): Blob {
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const pageWidth = 595; // A4 width in pt
  const pageHeight = 842; // A4 height in pt
  const margin = 36;
  const contentWidth = pageWidth - margin * 2; // 523

  // We write PDF stream drawing commands
  let stream = '';

  // 1. Header Banner Box (Slate-950 dark)
  stream += '0.04 0.06 0.09 rg\n';
  stream += `0 ${pageHeight - 80} ${pageWidth} 80 re f\n`;

  // Gold accent bar
  stream += '0.96 0.62 0.04 rg\n';
  stream += `0 ${pageHeight - 82} ${pageWidth} 2 re f\n`;

  // Title Text
  stream += 'BT\n/F2 18 Tf\n1 1 1 rg\n';
  stream += `${margin} ${pageHeight - 42} Td\n`;
  stream += `(${escapePdfText('EPL TOP 5 TEAMS ANALYSIS')}) Tj\nET\n`;

  // Subtitle / Meta
  stream += 'BT\n/F1 9 Tf\n0.58 0.64 0.72 rg\n';
  stream += `${margin} ${pageHeight - 62} Td\n`;
  const metaText = `Matchweek: ${report.currentMatchweek}   |   Matches Analyzed: ${report.totalMatchesAnalyzed}   |   Date: ${dateStr}`;
  stream += `(${escapePdfText(metaText)}) Tj\nET\n`;

  // Content positioning: start below header banner (from top)
  let currentY = pageHeight - 110;

  if (report.topTeams.length === 0) {
    stream += 'BT\n/F1 11 Tf\n0.39 0.45 0.55 rg\n';
    stream += `${margin} ${currentY - 20} Td\n`;
    stream += `(${escapePdfText('No team data recorded yet. Record match scores or rankings to generate analysis.')}) Tj\nET\n`;
  } else {
    report.topTeams.forEach((team) => {
      const cardHeight = 110;

      // Card Background
      stream += '0.97 0.98 0.99 rg\n'; // slate-50
      stream += `${margin} ${currentY - cardHeight} ${contentWidth} ${cardHeight} re f\n`;

      // Card Border
      stream += '0.89 0.91 0.94 RG\n'; // slate-200
      stream += '0.75 w\n';
      stream += `${margin} ${currentY - cardHeight} ${contentWidth} ${cardHeight} re S\n`;

      // Rank Badge Box
      if (team.rank === 1) {
        stream += '0.96 0.62 0.04 rg\n'; // Amber gold
      } else if (team.rank === 2) {
        stream += '0.40 0.45 0.55 rg\n'; // Silver slate
      } else if (team.rank === 3) {
        stream += '0.71 0.41 0.16 rg\n'; // Bronze
      } else {
        stream += '0.15 0.23 0.36 rg\n';
      }
      stream += `${margin + 8} ${currentY - 34} 26 26 re f\n`;

      // Rank Text
      stream += 'BT\n/F2 13 Tf\n1 1 1 rg\n';
      stream += `${margin + 12} ${currentY - 25} Td\n`;
      stream += `(#${team.rank}) Tj\nET\n`;

      // Team Name & Stadium
      stream += 'BT\n/F2 13 Tf\n0.06 0.09 0.16 rg\n';
      stream += `${margin + 42} ${currentY - 20} Td\n`;
      stream += `(${escapePdfText(team.teamName)}) Tj\nET\n`;

      stream += 'BT\n/F1 9 Tf\n0.39 0.45 0.55 rg\n';
      stream += `${margin + 42} ${currentY - 32} Td\n`;
      stream += `(${escapePdfText(team.shortName)}) Tj\nET\n`;

      // Best Aspect Tag (Pill)
      stream += '0.93 0.98 0.96 rg\n'; // emerald-50
      stream += `${margin + contentWidth - 120} ${currentY - 30} 110 18 re f\n`;
      stream += '0.65 0.90 0.75 RG\n';
      stream += `${margin + contentWidth - 120} ${currentY - 30} 110 18 re S\n`;

      stream += 'BT\n/F2 8 Tf\n0.02 0.59 0.41 rg\n'; // emerald-600
      stream += `${margin + contentWidth - 114} ${currentY - 23} Td\n`;
      stream += `(${escapePdfText(team.bestAspectTag.replace('_', ' '))}) Tj\nET\n`;

      // Best Aspect Callout Box
      stream += '0.95 0.97 0.99 rg\n';
      stream += `${margin + 8} ${currentY - 72} ${contentWidth - 16} 32 re f\n`;
      stream += '0.02 0.59 0.41 rg\n';
      stream += `${margin + 8} ${currentY - 72} 3 32 re f\n`; // green left bar

      // Best Aspect Title & Summary
      stream += 'BT\n/F2 9.5 Tf\n0.02 0.45 0.32 rg\n';
      stream += `${margin + 16} ${currentY - 52} Td\n`;
      stream += `(Best Aspect: ${escapePdfText(team.bestAspectTitle)}) Tj\nET\n`;

      stream += 'BT\n/F1 8.5 Tf\n0.20 0.25 0.33 rg\n';
      stream += `${margin + 16} ${currentY - 65} Td\n`;
      const shortSummary = team.bestAspectSummary.length > 95
        ? team.bestAspectSummary.substring(0, 92) + '...'
        : team.bestAspectSummary;
      stream += `(${escapePdfText(shortSummary)}) Tj\nET\n`;

      // Stats Bar Divider
      stream += '0.89 0.91 0.94 RG\n';
      stream += '0.5 w\n';
      stream += `${margin + 8} ${currentY - 78} m ${margin + contentWidth - 8} ${currentY - 78} l S\n`;

      // Stats Line
      stream += 'BT\n/F1 8 Tf\n0.28 0.33 0.41 rg\n';
      stream += `${margin + 10} ${currentY - 95} Td\n`;
      const statsStr = `Matches: ${team.matchesPlayed} (${team.wins}W-${team.draws}D-${team.losses}L)   |   Points: ${team.points}   |   GD: ${team.goalDifference > 0 ? '+' : ''}${team.goalDifference}   |   Win: ${team.winRate}%   |   Clean Sheets: ${team.cleanSheetRate}%   |   BTTS: ${team.bttsRate}%`;
      stream += `(${escapePdfText(statsStr)}) Tj\nET\n`;

      currentY -= cardHeight + 14;
    });
  }

  // Footer
  stream += '0.89 0.91 0.94 RG\n';
  stream += '0.5 w\n';
  stream += `${margin} 28 m ${margin + contentWidth} 28 l S\n`;

  stream += 'BT\n/F1 8 Tf\n0.58 0.64 0.72 rg\n';
  stream += `${margin} 16 Td\n`;
  stream += `(${escapePdfText('EPL Pro Match Center - Top 5 Teams Analytical Report')}) Tj\nET\n`;

  stream += 'BT\n/F1 8 Tf\n0.58 0.64 0.72 rg\n';
  stream += `${pageWidth - margin - 50} 16 Td\n`;
  stream += `(${escapePdfText('Page 1 of 1')}) Tj\nET\n`;

  // Assemble the PDF 1.4 file
  const streamBytes = new TextEncoder().encode(stream);
  const streamLength = streamBytes.length;

  const header = '%PDF-1.4\n';

  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 6 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> >>\nendobj\n`;
  const obj4 = '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';
  const obj5 = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n';
  const obj6Header = `6 0 obj\n<< /Length ${streamLength} >>\nstream\n`;
  const obj6Footer = '\nendstream\nendobj\n';

  // Calculate byte offsets for XRef
  let currentOffset = header.length;
  const offsets: number[] = [];

  offsets.push(currentOffset);
  currentOffset += obj1.length;

  offsets.push(currentOffset);
  currentOffset += obj2.length;

  offsets.push(currentOffset);
  currentOffset += obj3.length;

  offsets.push(currentOffset);
  currentOffset += obj4.length;

  offsets.push(currentOffset);
  currentOffset += obj5.length;

  offsets.push(currentOffset);
  currentOffset += obj6Header.length + streamLength + obj6Footer.length;

  const startXref = currentOffset;

  let xref = `xref\n0 7\n0000000000 65535 f \n`;
  offsets.forEach((offset) => {
    xref += String(offset).padStart(10, '0') + ' 00000 n \n';
  });

  const trailer = `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  // Concatenate parts
  const enc = new TextEncoder();
  const pdfBytes = new Uint8Array(
    enc.encode(header).length +
      enc.encode(obj1).length +
      enc.encode(obj2).length +
      enc.encode(obj3).length +
      enc.encode(obj4).length +
      enc.encode(obj5).length +
      enc.encode(obj6Header).length +
      streamBytes.length +
      enc.encode(obj6Footer).length +
      enc.encode(xref).length +
      enc.encode(trailer).length
  );

  let pos = 0;
  const writeStr = (s: string) => {
    const b = enc.encode(s);
    pdfBytes.set(b, pos);
    pos += b.length;
  };

  writeStr(header);
  writeStr(obj1);
  writeStr(obj2);
  writeStr(obj3);
  writeStr(obj4);
  writeStr(obj5);
  writeStr(obj6Header);
  pdfBytes.set(streamBytes, pos);
  pos += streamBytes.length;
  writeStr(obj6Footer);
  writeStr(xref);
  writeStr(trailer);

  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Downloads a high-resolution, vector-clean PDF report of Top 5 Teams
 * using pure browser Blob creation (100% reliable inside iframes, desktop mode, and offline).
 */
export function downloadTopTeamsPdf(report: TopTeamsAnalysisReport): void {
  const blob = generateTopTeamsPdfBlob(report);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `EPL_Top_5_Teams_MW${report.currentMatchweek}_${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Robust print helper: Creates printable HTML and triggers browser print
 * with fallback download so it never fails even in restrictive iframes.
 */
export function printTopTeamsReport(report: TopTeamsAnalysisReport): void {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const cardsHtml = report.topTeams.length === 0
    ? '<p style="color:#64748b; padding:20px 0;">No team data recorded yet. Record match scores or rankings to view analysis.</p>'
    : report.topTeams
        .map(
          (t) => `
    <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 12px; page-break-inside: avoid; background: #ffffff;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="display: inline-block; width: 28px; height: 28px; line-height: 28px; text-align: center; font-weight: bold; background: ${t.rank === 1 ? '#f59e0b' : '#334155'}; color: #ffffff; border-radius: 6px; font-size: 13px;">#${t.rank}</span>
          <div>
            <h3 style="margin: 0; font-size: 15px; font-weight: bold; color: #0f172a;">${t.teamName}</h3>
            <span style="font-size: 11px; color: #64748b;">${t.shortName}</span>
          </div>
        </div>
        <span style="font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 4px; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;">${t.bestAspectTag.replace('_', ' ')}</span>
      </div>

      <div style="background: #f8fafc; border-left: 3px solid #059669; padding: 8px 12px; margin-bottom: 8px;">
        <div style="font-size: 12px; font-weight: bold; color: #065f46; margin-bottom: 3px;">Best Aspect: ${t.bestAspectTitle}</div>
        <div style="font-size: 11.5px; color: #334155; line-height: 1.4;">${t.bestAspectSummary}</div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; font-size: 10.5px; text-align: center;">
        <div style="background: #f8fafc; padding: 4px; border-radius: 4px; border: 1px solid #f1f5f9;">
          <span style="display: block; color: #64748b; font-size: 9px;">MATCHES</span>
          <strong>${t.matchesPlayed} (${t.wins}-${t.draws}-${t.losses})</strong>
        </div>
        <div style="background: #f8fafc; padding: 4px; border-radius: 4px; border: 1px solid #f1f5f9;">
          <span style="display: block; color: #64748b; font-size: 9px;">POINTS</span>
          <strong style="color: #059669;">${t.points}</strong>
        </div>
        <div style="background: #f8fafc; padding: 4px; border-radius: 4px; border: 1px solid #f1f5f9;">
          <span style="display: block; color: #64748b; font-size: 9px;">GOAL DIFF</span>
          <strong>${t.goalDifference > 0 ? '+' : ''}${t.goalDifference}</strong>
        </div>
        <div style="background: #f8fafc; padding: 4px; border-radius: 4px; border: 1px solid #f1f5f9;">
          <span style="display: block; color: #64748b; font-size: 9px;">WIN RATE</span>
          <strong>${t.winRate}%</strong>
        </div>
        <div style="background: #f8fafc; padding: 4px; border-radius: 4px; border: 1px solid #f1f5f9;">
          <span style="display: block; color: #64748b; font-size: 9px;">CLEAN SHEET</span>
          <strong>${t.cleanSheetRate}%</strong>
        </div>
        <div style="background: #f8fafc; padding: 4px; border-radius: 4px; border: 1px solid #f1f5f9;">
          <span style="display: block; color: #64748b; font-size: 9px;">BTTS</span>
          <strong>${t.bttsRate}%</strong>
        </div>
      </div>
    </div>
  `
        )
        .join('');

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>EPL Top 5 Teams Report - MW ${report.currentMatchweek}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 16px; background: #ffffff; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
    .title { font-size: 18px; font-weight: 800; margin: 0; }
    .meta { font-size: 11px; color: #64748b; }
    .footer { margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 8px; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">EPL TOP 5 TEAMS ANALYSIS</h1>
      <div class="meta">Matchweek: ${report.currentMatchweek} • Total Matches Analyzed: ${report.totalMatchesAnalyzed}</div>
    </div>
    <div class="meta" style="text-align: right;">
      <div>Generated: ${dateStr}</div>
      <div>EPL Challenge Pro</div>
    </div>
  </div>

  ${cardsHtml}

  <div class="footer">
    <span>EPL Top 5 Teams Analytical Report</span>
    <span>Page 1 of 1</span>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`;

  // Try opening print window
  let windowOpened = false;
  try {
    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(fullHtml);
      printWin.document.close();
      windowOpened = true;
    }
  } catch {
    windowOpened = false;
  }

  // If opening popup window was blocked, download the standalone printable HTML file
  if (!windowOpened) {
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EPL_Top_5_Teams_MW${report.currentMatchweek}_Printable.html`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    }, 500);
  }
}
