import { MatchRecord } from '../types';
import { formatMoney } from './storage';

/**
 * Programmatically renders an ultra-high-definition Match Slip Ticket image
 * using standard HTML5 Canvas 2D context in a crisp Red & White theme.
 * Guaranteed 100% reliable - zero external dependencies, offline safe.
 */
export function generateBetSlipJpeg(match: MatchRecord, currency: string = '$'): string {
  if (!match || !match.homeTeam || !match.awayTeam || !match.odds || match.odds <= 1 || !match.stake || match.stake <= 0) {
    return '';
  }

  const canvas = document.createElement('canvas');
  // Ultra HD Resolution (scaled by 2 for crisp mobile/desktop display)
  const scale = 2;
  const width = 640;
  const height = match.notes ? 920 : 880;
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.scale(scale, scale);

  // 1. Clean Light Background
  ctx.fillStyle = '#f8fafc'; // light slate-50
  ctx.fillRect(0, 0, width, height);

  // Background subtle grid decoration
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 2. Main Ticket Container Card
  const pad = 24;
  const cardX = pad;
  const cardY = pad;
  const cardW = width - pad * 2;
  const cardH = height - pad * 2;
  const radius = 20;

  // Draw Card Background
  ctx.save();
  ctx.shadowColor = 'rgba(220, 38, 38, 0.08)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;

  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, radius);
  ctx.fillStyle = '#ffffff'; // pure white
  ctx.fill();
  ctx.restore();

  // Card Border
  ctx.strokeStyle = '#fecaca'; // red-200
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, radius);
  ctx.stroke();

  // 3. Header Banner (Red Gradient)
  const headerH = 100;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, headerH, [radius, radius, 0, 0]);
  ctx.clip();

  const headerGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + headerH);
  headerGrad.addColorStop(0, '#dc2626'); // red-600
  headerGrad.addColorStop(1, '#b91c1c'); // red-700
  ctx.fillStyle = headerGrad;
  ctx.fillRect(cardX, cardY, cardW, headerH);

  // Header Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('EPL 2026 MATCH CENTER', cardX + 20, cardY + 28);

  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.fillText('OFFICIAL MATCH SLIP', cardX + 20, cardY + 58);

  // Match # Badge in Header
  const matchNumText = `MATCH #${String(match.dayNumber).padStart(2, '0')}`;
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  const matchNumTextWidth = ctx.measureText(matchNumText).width;
  const badgeW = matchNumTextWidth + 24;
  const badgeH = 32;
  const badgeX = cardX + cardW - badgeW - 20;
  const badgeY = cardY + 34;

  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 16);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.fillText(matchNumText, badgeX + 12, badgeY + 21);
  ctx.restore();

  // 4. Ticket Metadata Info Bar (Date & Slip ID)
  let curY = cardY + headerH + 24;

  ctx.fillStyle = '#64748b';
  ctx.font = '12px system-ui, -apple-system, sans-serif';
  ctx.fillText('SLIP ID:', cardX + 24, curY);

  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 12px monospace';
  const slipIdStr = `#EPL-${match.id.substring(0, 8).toUpperCase()}`;
  ctx.fillText(slipIdStr, cardX + 75, curY);

  const dateStr = match.matchTime ? `DATE: ${match.date} ${match.matchTime}` : `DATE: ${match.date}`;
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 12px monospace';
  const dateW = ctx.measureText(dateStr).width;
  ctx.fillText(dateStr, cardX + cardW - dateW - 24, curY);

  curY += 16;

  // Dashed Separator Line
  drawDashedLine(ctx, cardX + 24, curY, cardX + cardW - 24, curY, '#fecaca', [6, 4]);

  curY += 28;

  // 5. League & Matchup Section
  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
  ctx.fillText(`🏆 ${(match.league || 'EPL').toUpperCase()}`, cardX + 24, curY);

  curY += 28;

  // Teams Box
  const teamsBoxY = curY;
  const teamsBoxH = 104;
  ctx.beginPath();
  ctx.roundRect(cardX + 20, teamsBoxY, cardW - 40, teamsBoxH, 14);
  ctx.fillStyle = '#fef2f2'; // light red
  ctx.fill();
  ctx.strokeStyle = '#fecaca';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Home Team
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 17px system-ui, -apple-system, sans-serif';
  ctx.fillText(match.homeTeam, cardX + 36, teamsBoxY + 36);

  // VS text
  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('VS', cardX + 36, teamsBoxY + 58);

  // Away Team
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 17px system-ui, -apple-system, sans-serif';
  ctx.fillText(match.awayTeam, cardX + 36, teamsBoxY + 86);

  curY = teamsBoxY + teamsBoxH + 24;

  // Market Selection Banner
  ctx.fillStyle = '#64748b';
  ctx.font = '12px system-ui, -apple-system, sans-serif';
  ctx.fillText('SELECTED MARKET / PREDICTION:', cardX + 24, curY);

  curY += 18;

  ctx.beginPath();
  ctx.roundRect(cardX + 20, curY, cardW - 40, 44, 10);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#fecaca';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
  const marketDisplayText = match.selection && match.selection !== match.market
    ? `⚽ ${match.market.toUpperCase()} • ${match.selection.toUpperCase()}`
    : `⚽ ${match.market.toUpperCase()}`;
  ctx.fillText(marketDisplayText, cardX + 36, curY + 28);

  curY += 60;

  // 6. Odds & Financials Grid Box
  const gridY = curY;
  const gridH = 100;
  const gridW = (cardW - 48) / 2;

  // Box 1: Odds
  ctx.beginPath();
  ctx.roundRect(cardX + 20, gridY, gridW - 6, gridH, 12);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '11px system-ui, -apple-system, sans-serif';
  ctx.fillText('DECIMAL ODDS', cardX + 32, gridY + 28);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 24px monospace';
  ctx.fillText(match.odds.toFixed(2), cardX + 32, gridY + 64);

  // Box 2: Stake
  ctx.beginPath();
  ctx.roundRect(cardX + 20 + gridW + 6, gridY, gridW - 6, gridH, 12);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '11px system-ui, -apple-system, sans-serif';
  ctx.fillText('YOUR STAKE', cardX + 32 + gridW + 6, gridY + 28);

  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 20px monospace';
  ctx.fillText(formatMoney(match.stake, currency), cardX + 32 + gridW + 6, gridY + 64);

  curY = gridY + gridH + 16;

  // Potential Return / Profit Banner
  const returnAmount = match.odds > 1 ? match.stake * match.odds : match.stake;
  const potentialProfit = match.odds > 1 ? match.stake * (match.odds - 1) : 0;

  ctx.beginPath();
  ctx.roundRect(cardX + 20, curY, cardW - 40, 64, 14);
  const retGrad = ctx.createLinearGradient(cardX + 20, curY, cardX + cardW - 20, curY + 64);
  retGrad.addColorStop(0, '#dc2626'); // red-600
  retGrad.addColorStop(1, '#991b1b'); // red-800
  ctx.fillStyle = retGrad;
  ctx.fill();

  ctx.fillStyle = '#fecaca';
  ctx.font = '11px system-ui, -apple-system, sans-serif';
  ctx.fillText('POTENTIAL RETURN (IF WIN):', cardX + 36, curY + 26);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px monospace';
  ctx.fillText(formatMoney(returnAmount, currency), cardX + 36, curY + 52);

  // Profit Tag on right
  const profitStr = `+${formatMoney(potentialProfit, currency)}`;
  ctx.font = 'bold 13px monospace';
  const profitW = ctx.measureText(profitStr).width;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(profitStr, cardX + cardW - profitW - 36, curY + 42);

  curY += 78;

  // Optional Notes section if present
  if (match.notes) {
    ctx.beginPath();
    ctx.roundRect(cardX + 20, curY, cardW - 40, 38, 10);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.fillText(`📝 Note: ${match.notes}`, cardX + 32, curY + 24);

    curY += 48;
  }

  // 7. Status Stamp Badge
  let statusBg = '#f59e0b';
  let statusTextClr = '#ffffff';
  let statusLabel = 'PENDING MATCH';

  if (match.result === 'WIN') {
    statusBg = '#16a34a';
    statusTextClr = '#ffffff';
    statusLabel = 'WIN (MATCH WON)';
  } else if (match.result === 'LOSS') {
    statusBg = '#dc2626';
    statusTextClr = '#ffffff';
    statusLabel = 'LOSS (MATCH LOST)';
  } else if (match.result === 'VOID') {
    statusBg = '#64748b';
    statusTextClr = '#ffffff';
    statusLabel = 'VOID / CANCELLED';
  }

  ctx.beginPath();
  ctx.roundRect(cardX + 20, curY, cardW - 40, 42, 12);
  ctx.fillStyle = statusBg;
  ctx.fill();

  ctx.fillStyle = statusTextClr;
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  const labelW = ctx.measureText(statusLabel).width;
  ctx.fillText(statusLabel, cardX + (cardW - labelW) / 2, curY + 26);

  curY += 58;

  // 8. Simulated Barcode & Footer
  drawSimulatedBarcode(ctx, cardX + 40, curY, cardW - 80, 22);

  curY += 32;

  ctx.fillStyle = '#64748b';
  ctx.font = '10px monospace';
  const footerNote = 'EPL PRO MATCH CENTER • VERIFIED TICKET';
  const footerW = ctx.measureText(footerNote).width;
  ctx.fillText(footerNote, cardX + (cardW - footerW) / 2, curY);

  // Generate JPEG Data URL with 95% quality
  return canvas.toDataURL('image/jpeg', 0.95);
}

// Helper: Dashed Line
function drawDashedLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  dashPattern: number[]
) {
  ctx.save();
  ctx.beginPath();
  ctx.setLineDash(dashPattern);
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

// Helper: Simulated Barcode
function drawSimulatedBarcode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  ctx.save();
  ctx.fillStyle = '#0f172a';
  let curX = x;
  const endX = x + width;

  // Draw deterministic lines for ticket barcode
  const pattern = [2, 4, 1, 3, 2, 5, 2, 1, 4, 2, 3, 1, 5, 2, 2, 4, 1, 3, 2, 4, 3, 1, 2, 5];
  let pIdx = 0;

  while (curX < endX) {
    const barWidth = pattern[pIdx % pattern.length];
    const spaceWidth = pattern[(pIdx + 1) % pattern.length];

    ctx.fillRect(curX, y, barWidth, height);
    curX += barWidth + spaceWidth;
    pIdx += 2;
  }
  ctx.restore();
}

/**
 * Triggers a direct clean download of the Match Slip JPEG file on PC, Android WebView, or Mobile.
 */
export function downloadBetSlipJpeg(match: MatchRecord, currency: string = '$'): boolean {
  if (!match || !match.homeTeam || !match.awayTeam || !match.odds || match.odds <= 1 || !match.stake || match.stake <= 0) {
    console.warn('Cannot generate match slip: incomplete match details.');
    return false;
  }

  try {
    const dataUrl = generateBetSlipJpeg(match, currency);
    if (!dataUrl || dataUrl.length < 100) {
      console.error('Failed to generate match slip image.');
      return false;
    }

    const cleanHome = match.homeTeam.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanAway = match.awayTeam.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `MatchSlip_${match.dayNumber}_${cleanHome}_vs_${cleanAway}.jpg`;

    // Convert data URL to Blob for 100% reliable download across Android WebView, iOS, and PC
    const parts = dataUrl.split(',');
    const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup after short delay to ensure browser handles download stream
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(blobUrl);
    }, 1000);

    return true;
  } catch (err) {
    console.error('Error downloading match slip JPEG:', err);
    return false;
  }
}
