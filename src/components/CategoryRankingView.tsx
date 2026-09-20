import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  AppState,
  CategoryRankingItem,
  MatchweekCategoryRanking,
  TierLevel
} from '../types';
import { ALL_EPL_20_TEAMS, EPLTeamInfo } from '../utils/teamData';
import {
  ListOrdered,
  Save,
  Printer,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Info,
  Calendar,
  Layers,
  Shield,
  Clock,
  Trash2,
  FileText,
  Zap,
  MapPin,
  Download
} from 'lucide-react';

interface CategoryRankingViewProps {
  state: AppState;
  onSaveCategoryRanking: (ranking: MatchweekCategoryRanking) => void;
  onNavigateTab?: (tab: any) => void;
}

// Safe dynamic tag generator to prevent bundlers/optimizers from emitting literal HTML structural tags
const sTag = (tag: string): string => String.fromCharCode(60) + tag + String.fromCharCode(62);
const sClose = (tag: string): string => String.fromCharCode(60, 47) + tag + String.fromCharCode(62);

// Default tier assignment helper based on position (1-based)
const getDefaultTierForPosition = (pos: number): TierLevel => {
  if (pos <= 6) return 'TIER_1'; // Ranks 1-6: Green (Tier 1)
  if (pos <= 14) return 'TIER_2'; // Ranks 7-14: Orange (Tier 2)
  return 'TIER_3'; // Ranks 15-20: Red (Tier 3)
};

// Tier styling details
export const TIER_CONFIG: Record<
  TierLevel,
  {
    label: string;
    colorName: string;
    bgBadge: string;
    textBadge: string;
    borderBadge: string;
    dotColor: string;
    activeBtnClass: string;
    inactiveBtnClass: string;
    cardBorder: string;
    printColor: string;
    printBg: string;
  }
> = {
  TIER_1: {
    label: 'TIER 1',
    colorName: 'Green',
    bgBadge: 'bg-emerald-50',
    textBadge: 'text-emerald-700',
    borderBadge: 'border-emerald-200',
    dotColor: 'bg-emerald-600',
    activeBtnClass: 'bg-emerald-600 text-white font-bold shadow-sm',
    inactiveBtnClass: 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200',
    cardBorder: 'border-emerald-300',
    printColor: '#059669',
    printBg: '#ecfdf5',
  },
  TIER_2: {
    label: 'TIER 2',
    colorName: 'Orange',
    bgBadge: 'bg-amber-50',
    textBadge: 'text-amber-700',
    borderBadge: 'border-amber-200',
    dotColor: 'bg-amber-600',
    activeBtnClass: 'bg-amber-500 text-white font-bold shadow-sm',
    inactiveBtnClass: 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200',
    cardBorder: 'border-amber-300',
    printColor: '#d97706',
    printBg: '#fffbeb',
  },
  TIER_3: {
    label: 'TIER 3',
    colorName: 'Red',
    bgBadge: 'bg-rose-50',
    textBadge: 'text-rose-700',
    borderBadge: 'border-rose-200',
    dotColor: 'bg-rose-600',
    activeBtnClass: 'bg-red-600 text-white font-bold shadow-sm',
    inactiveBtnClass: 'bg-white text-red-700 hover:bg-red-50 border border-red-200',
    cardBorder: 'border-red-300',
    printColor: '#dc2626',
    printBg: '#fef2f2',
  },
};

export const CategoryRankingView: React.FC<CategoryRankingViewProps> = ({
  state,
  onSaveCategoryRanking,
}) => {
  const currentSeasonMatchweek = state.currentMatchweek || state.settings?.activeMatchweek || 1;
  const [selectedMatchweek, setSelectedMatchweek] = useState<number>(currentSeasonMatchweek);

  // Initialize 20 items for ranking - default to blank items when not saved
  const [items, setItems] = useState<CategoryRankingItem[]>(() => {
    const saved = state.categoryRankings?.[currentSeasonMatchweek];
    if (saved && Array.isArray(saved.rankings) && saved.rankings.length === 20) {
      return saved.rankings;
    }
    // Default 1 to 20 blank items (no default pre-filled teams)
    return Array.from({ length: 20 }, (_, idx) => ({
      position: idx + 1,
      teamName: '',
      tier: getDefaultTierForPosition(idx + 1),
      notes: '',
    }));
  });

  const [overallNotes, setOverallNotes] = useState<string>(() => {
    return state.categoryRankings?.[currentSeasonMatchweek]?.overallNotes || '';
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Load saved ranking whenever selectedMatchweek changes
  useEffect(() => {
    const saved = state.categoryRankings?.[selectedMatchweek];
    if (saved && Array.isArray(saved.rankings) && saved.rankings.length === 20) {
      setItems(saved.rankings);
      setOverallNotes(saved.overallNotes || '');
      setHasUnsavedChanges(false);
    } else {
      // Start with blank 20 positions for unsaved matchweeks
      setItems(
        Array.from({ length: 20 }, (_, idx) => ({
          position: idx + 1,
          teamName: '',
          tier: getDefaultTierForPosition(idx + 1),
          notes: '',
        }))
      );
      setOverallNotes('');
      setHasUnsavedChanges(false);
    }
  }, [selectedMatchweek, state.categoryRankings]);

  // Compute calculated standings order from match results
  function getCalculatedStandingsOrder(appState: AppState): string[] {
    const table: Record<string, { points: number; gd: number; gf: number; name: string }> = {};
    ALL_EPL_20_TEAMS.forEach((t) => {
      table[t.name] = { points: 0, gd: 0, gf: 0, name: t.name };
    });

    (appState.eplMatches || []).forEach((m) => {
      if (!table[m.homeTeam]) table[m.homeTeam] = { points: 0, gd: 0, gf: 0, name: m.homeTeam };
      if (!table[m.awayTeam]) table[m.awayTeam] = { points: 0, gd: 0, gf: 0, name: m.awayTeam };

      table[m.homeTeam].gf += m.homeScore;
      table[m.homeTeam].gd += m.homeScore - m.awayScore;
      table[m.awayTeam].gf += m.awayScore;
      table[m.awayTeam].gd += m.awayScore - m.homeScore;

      if (m.winner === 'HOME') {
        table[m.homeTeam].points += 3;
      } else if (m.winner === 'AWAY') {
        table[m.awayTeam].points += 3;
      } else if (m.winner === 'DRAW') {
        table[m.homeTeam].points += 1;
        table[m.awayTeam].points += 1;
      }
    });

    return Object.values(table)
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
      })
      .map((t) => t.name);
  }

  // Handle Team change at index
  const handleTeamChange = (index: number, newTeamName: string) => {
    setItems((prev) => {
      const next = [...prev];
      // Check if newTeamName is already chosen elsewhere, offer to swap
      const existingIdx = next.findIndex((item, idx) => idx !== index && item.teamName === newTeamName);
      if (existingIdx !== -1 && newTeamName !== '') {
        const oldTeam = next[index].teamName;
        next[existingIdx] = { ...next[existingIdx], teamName: oldTeam };
      }
      next[index] = { ...next[index], teamName: newTeamName };
      return next;
    });
    setHasUnsavedChanges(true);
  };

  // Handle Tier change at index
  const handleTierChange = (index: number, newTier: TierLevel) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], tier: newTier };
      return next;
    });
    setHasUnsavedChanges(true);
  };

  // Handle Notes change at index
  const handleNotesChange = (index: number, noteText: string) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], notes: noteText };
      return next;
    });
    setHasUnsavedChanges(true);
  };

  // Move item up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setItems((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = { ...next[index], position: index };
      next[index] = { ...temp, position: index + 1 };
      return next;
    });
    setHasUnsavedChanges(true);
  };

  // Move item down
  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    setItems((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = { ...next[index], position: index + 2 };
      next[index] = { ...temp, position: index + 1 };
      return next;
    });
    setHasUnsavedChanges(true);
  };

  // Save current ranking
  const handleSave = () => {
    const payload: MatchweekCategoryRanking = {
      matchweek: selectedMatchweek,
      updatedAt: new Date().toISOString(),
      rankings: items.map((item, idx) => ({
        ...item,
        position: idx + 1,
      })),
      overallNotes: overallNotes.trim(),
    };

    onSaveCategoryRanking(payload);
    setHasUnsavedChanges(false);
    showToast(`Matchweek ${selectedMatchweek} Category & Tier Rankings Saved Successfully!`);
  };

  // Apply default tier breakdown (1-6 Green, 7-14 Orange, 15-20 Red)
  const handleApplyDefaultTierScheme = () => {
    setItems((prev) =>
      prev.map((item, idx) => ({
        ...item,
        tier: getDefaultTierForPosition(idx + 1),
      }))
    );
    setHasUnsavedChanges(true);
    showToast('Standard Tier Template (Top 6 Green, Mid 8 Orange, Bottom 6 Red) Applied');
  };

  // Auto-Fill from Current EPL Standings
  const handleAutoFillStandings = () => {
    const standingsOrder = getCalculatedStandingsOrder(state);
    setItems((prev) =>
      prev.map((item, idx) => ({
        ...item,
        teamName: standingsOrder[idx] || item.teamName,
        tier: getDefaultTierForPosition(idx + 1),
      }))
    );
    setHasUnsavedChanges(true);
    showToast('Rankings Synchronized with Current EPL Standings!');
  };

  // Reset/Clear team selections
  const handleResetRankings = () => {
    if (window.confirm(`Are you sure you want to reset all 20 rankings for Matchweek ${selectedMatchweek}?`)) {
      setItems(
        Array.from({ length: 20 }, (_, idx) => ({
          position: idx + 1,
          teamName: '',
          tier: getDefaultTierForPosition(idx + 1),
          notes: '',
        }))
      );
      setOverallNotes('');
      setHasUnsavedChanges(true);
      showToast(`Matchweek ${selectedMatchweek} Rankings Cleared`);
    }
  };

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Duplicate team checking
  const selectedTeamsList = items.map((i) => i.teamName).filter(Boolean);
  const duplicates = selectedTeamsList.filter((name, idx, arr) => arr.indexOf(name) !== idx);
  const unassignedTeams = ALL_EPL_20_TEAMS.filter(
    (t) => !selectedTeamsList.includes(t.name)
  );

  // Statistics counters
  const tier1Count = items.filter((i) => i.tier === 'TIER_1' && i.teamName).length;
  const tier2Count = items.filter((i) => i.tier === 'TIER_2' && i.teamName).length;
  const tier3Count = items.filter((i) => i.tier === 'TIER_3' && i.teamName).length;
  const assignedCount = selectedTeamsList.length;

  const currentSavedRecord = state.categoryRankings?.[selectedMatchweek];

  // ========================================================
  // PRINT & PDF REPORT GENERATOR
  // ========================================================
  const handlePrint = () => {
    const dateFormatted = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const timeFormatted = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const tier1Items = items.filter((i) => i.tier === 'TIER_1');
    const tier2Items = items.filter((i) => i.tier === 'TIER_2');
    const tier3Items = items.filter((i) => i.tier === 'TIER_3');

    const renderPrintRows = (tierList: CategoryRankingItem[], tierConfig: (typeof TIER_CONFIG)['TIER_1']) => {
      if (tierList.length === 0) {
        return `<tr><td colspan="4" style="padding: 10px; text-align: center; color: #64748b; font-style: italic;">No teams assigned to this tier</td></tr>`;
      }
      return tierList
        .map((item) => {
          const teamInfo = ALL_EPL_20_TEAMS.find((t) => t.name === item.teamName);
          return `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px 12px; font-weight: 800; font-family: monospace; font-size: 13px; text-align: center; width: 45px; background: #f8fafc; border-right: 1px solid #e2e8f0;">
              #${item.position}
            </td>
            <td style="padding: 8px 12px; font-weight: 700; color: #0f172a; font-size: 14px;">
              ${item.teamName || '<span style="color:#94a3b8; font-style:italic;">(Unassigned)</span>'}
            </td>
            <td style="padding: 8px 12px; text-align: center; width: 110px;">
              <span style="display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; background: ${tierConfig.printBg}; color: ${tierConfig.printColor}; border: 1px solid ${tierConfig.printColor}40;">
                ${tierConfig.label}
              </span>
            </td>
            <td style="padding: 8px 12px; font-size: 12px; color: #334155;">
              ${item.notes ? `<em>${item.notes}</em>` : '—'}
            </td>
          </tr>
        `;
        })
        .join('');
    };

    const htmlHead = [
      sTag('!DOCTYPE html'),
      sTag('html lang="en"'),
      sTag('head'),
      '  ' + sTag('meta charset="UTF-8"'),
      '  ' + sTag('title') + `EPL_Matchweek_${selectedMatchweek}_Category_Rankings` + sClose('title'),
      '  ' + sTag('style'),
    ].join('\n');

    const htmlStyle = `
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: #ffffff;
            color: #0f172a;
            margin: 0;
            padding: 20px;
            font-size: 12px;
            line-height: 1.4;
          }
          .header-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #0f172a;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .title-area h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.5px;
          }
          .title-area p {
            margin: 4px 0 0 0;
            font-size: 13px;
            color: #475569;
            font-weight: 600;
          }
          .meta-badge {
            text-align: right;
            font-size: 11px;
            color: #64748b;
          }
          .mw-pill {
            background: #0f172a;
            color: #ffffff;
            font-weight: 800;
            font-size: 14px;
            padding: 6px 14px;
            border-radius: 8px;
            display: inline-block;
            margin-bottom: 4px;
          }
          .summary-strip {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 20px;
          }
          .tier-stat-card {
            padding: 10px 14px;
            border-radius: 8px;
            border: 1px solid #cbd5e1;
          }
          .tier-stat-card h3 {
            margin: 0;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .tier-stat-card .val {
            font-size: 18px;
            font-weight: 900;
            margin-top: 4px;
          }
          .section-title {
            font-size: 14px;
            font-weight: 800;
            padding: 6px 10px;
            border-radius: 6px;
            margin: 16px 0 8px 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            overflow: hidden;
          }
          th {
            background: #f1f5f9;
            color: #334155;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 8px 12px;
            border-bottom: 1px solid #cbd5e1;
            text-align: left;
          }
          .notes-box {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 12px;
            margin-top: 16px;
          }
          .notes-box h4 {
            margin: 0 0 6px 0;
            font-size: 12px;
            color: #334155;
            text-transform: uppercase;
          }
          .footer {
            margin-top: 24px;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #94a3b8;
          }
          @media print {
            .no-print { display: none; }
          }
    `;

    const htmlBodyContent = `
        <div class="header-box">
          <div class="title-area">
            <h1>🏆 EPL TEAM CATEGORY RANKINGS</h1>
            <p>Premier League Official 20-Team Classification</p>
          </div>
          <div class="meta-badge">
            <div class="mw-pill">MATCHWEEK ${selectedMatchweek}</div>
            <div>Printed: ${dateFormatted} at ${timeFormatted}</div>
          </div>
        </div>

        <div class="summary-strip">
          <div class="tier-stat-card" style="background: #ecfdf5; border-color: #a7f3d0;">
            <h3 style="color: #065f46;">TIER 1 (GREEN)</h3>
            <div class="val" style="color: #047857;">${tier1Count} Teams</div>
          </div>
          <div class="tier-stat-card" style="background: #fffbeb; border-color: #fde68a;">
            <h3 style="color: #92400e;">TIER 2 (ORANGE)</h3>
            <div class="val" style="color: #b45309;">${tier2Count} Teams</div>
          </div>
          <div class="tier-stat-card" style="background: #fef2f2; border-color: #fecaca;">
            <h3 style="color: #991b1b;">TIER 3 (RED)</h3>
            <div class="val" style="color: #b91c1c;">${tier3Count} Teams</div>
          </div>
        </div>

        <!-- 1. TIER 1 SECTION -->
        <div class="section-title" style="background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;">
          <span>TIER 1 — Elite & High-Form Teams (${tier1Count})</span>
          <span style="font-size: 11px; font-weight: 600;">Green</span>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 45px; text-align: center;">Rank</th>
              <th>Team Name</th>
              <th style="text-align: center; width: 110px;">Tier Category</th>
              <th>Tactical Remark / Form</th>
            </tr>
          </thead>
          <tbody>
            ${renderPrintRows(tier1Items, TIER_CONFIG.TIER_1)}
          </tbody>
        </table>

        <!-- 2. TIER 2 SECTION -->
        <div class="section-title" style="background: #fffbeb; color: #92400e; border: 1px solid #fde68a;">
          <span>TIER 2 — Mid-Table & Competitive Teams (${tier2Count})</span>
          <span style="font-size: 11px; font-weight: 600;">Orange</span>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 45px; text-align: center;">Rank</th>
              <th>Team Name</th>
              <th style="text-align: center; width: 110px;">Tier Category</th>
              <th>Tactical Remark / Form</th>
            </tr>
          </thead>
          <tbody>
            ${renderPrintRows(tier2Items, TIER_CONFIG.TIER_2)}
          </tbody>
        </table>

        <!-- 3. TIER 3 SECTION -->
        <div class="section-title" style="background: #fef2f2; color: #991b1b; border: 1px solid #fecaca;">
          <span>TIER 3 — Relegation Risk & Volatile Teams (${tier3Count})</span>
          <span style="font-size: 11px; font-weight: 600;">Red</span>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 45px; text-align: center;">Rank</th>
              <th>Team Name</th>
              <th style="text-align: center; width: 110px;">Tier Category</th>
              <th>Tactical Remark / Form</th>
            </tr>
          </thead>
          <tbody>
            ${renderPrintRows(tier3Items, TIER_CONFIG.TIER_3)}
          </tbody>
        </table>

        ${
          overallNotes
            ? `
          <div class="notes-box">
            <h4>Matchweek Strategy & Category Notes:</h4>
            <div style="font-size: 12px; color: #1e293b; white-space: pre-wrap;">${overallNotes}</div>
          </div>
        `
            : ''
        }

        <div class="footer">
          <span>EPL Pro Match Center • Category Module</span>
          <span>Matchweek ${selectedMatchweek} Serial Rankings</span>
        </div>
    `;

    const printScript = sTag('script') + `
      window.onload = function() {
        setTimeout(function() {
          window.print();
        }, 350);
      };
    ` + sClose('script');

    const htmlContent = [
      htmlHead,
      htmlStyle,
      '  ' + sClose('style'),
      sClose('head'),
      sTag('body'),
      htmlBodyContent,
      printScript,
      sClose('body'),
      sClose('html'),
    ].join('\n');

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      try {
        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
      } catch {
        triggerDownloadHtml(htmlContent, `EPL_Matchweek_${selectedMatchweek}_Category_Rankings.html`);
      }
    } else {
      triggerDownloadHtml(htmlContent, `EPL_Matchweek_${selectedMatchweek}_Category_Rankings.html`);
    }
  };

  const handleDownloadReport = () => {
    const tier1Items = items.filter((i) => i.tier === 'TIER_1');
    const tier2Items = items.filter((i) => i.tier === 'TIER_2');
    const tier3Items = items.filter((i) => i.tier === 'TIER_3');

    const renderPrintRows = (tierList: CategoryRankingItem[], tierConfig: (typeof TIER_CONFIG)['TIER_1']) => {
      if (tierList.length === 0) {
        return `<tr><td colspan="4" style="padding: 10px; text-align: center; color: #64748b; font-style: italic;">No teams assigned to this tier</td></tr>`;
      }
      return tierList
        .map((item) => {
          const teamInfo = ALL_EPL_20_TEAMS.find((t) => t.name === item.teamName);
          return `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px 12px; font-weight: 800; font-family: monospace; font-size: 13px; text-align: center; width: 45px; background: #f8fafc; border-right: 1px solid #e2e8f0;">
              #${item.position}
            </td>
            <td style="padding: 8px 12px; font-weight: 700; color: #0f172a; font-size: 14px;">
              ${item.teamName || '<span style="color:#94a3b8; font-style:italic;">(Unassigned)</span>'}
            </td>
            <td style="padding: 8px 12px; text-align: center; width: 110px;">
              <span style="display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; background: ${tierConfig.printBg}; color: ${tierConfig.printColor}; border: 1px solid ${tierConfig.printColor}40;">
                ${tierConfig.label}
              </span>
            </td>
            <td style="padding: 8px 12px; font-size: 12px; color: #334155;">
              ${item.notes ? `<em>${item.notes}</em>` : '—'}
            </td>
          </tr>
        `;
        })
        .join('');
    };

    const dateFormatted = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const timeFormatted = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const exportHead = [
      sTag('!DOCTYPE html'),
      sTag('html lang="en"'),
      sTag('head'),
      '  ' + sTag('meta charset="UTF-8"'),
      '  ' + sTag('title') + `EPL Matchweek ${selectedMatchweek} Category Rankings` + sClose('title'),
      '  ' + sTag('style'),
    ].join('\n');

    const exportStyle = `
          @page { size: A4 portrait; margin: 12mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 16px;
            font-size: 13px;
            line-height: 1.4;
          }
          .header-box {
            border-bottom: 3px solid #10b981;
            padding-bottom: 12px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .title-area h1 {
            font-size: 20px;
            font-weight: 900;
            color: #065f46;
            margin: 0;
            letter-spacing: -0.5px;
          }
          .title-area p {
            margin: 4px 0 0 0;
            font-size: 12px;
            color: #64748b;
          }
          .meta-badge {
            text-align: right;
          }
          .mw-pill {
            display: inline-block;
            background: #065f46;
            color: #ffffff;
            font-weight: 800;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 13px;
            letter-spacing: 0.5px;
          }
          .summary-strip {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 16px;
          }
          .tier-stat-card {
            padding: 8px 12px;
            border-radius: 8px;
            border: 1px solid #cbd5e1;
          }
          .tier-stat-card h3 {
            margin: 0;
            font-size: 12px;
            font-weight: 800;
          }
          .tier-stat-card .val {
            font-size: 18px;
            font-weight: 900;
            margin-top: 4px;
            font-family: monospace;
          }
          .section-title {
            font-size: 13px;
            font-weight: 900;
            margin: 16px 0 6px 0;
            padding: 4px 8px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            overflow: hidden;
          }
          th {
            background: #f1f5f9;
            color: #334155;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 8px 12px;
            border-bottom: 1px solid #cbd5e1;
            text-align: left;
          }
          .notes-box {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 12px;
            margin-top: 16px;
          }
          .notes-box h4 {
            margin: 0 0 6px 0;
            font-size: 12px;
            color: #334155;
            text-transform: uppercase;
          }
          .footer {
            margin-top: 24px;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #94a3b8;
          }
    `;

    const exportBodyContent = `
        <div class="header-box">
          <div class="title-area">
            <h1>🏆 EPL TEAM CATEGORY RANKINGS</h1>
            <p>Premier League Official 20-Team Classification</p>
          </div>
          <div class="meta-badge">
            <div class="mw-pill">MATCHWEEK ${selectedMatchweek}</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Exported: ${dateFormatted} ${timeFormatted}</div>
          </div>
        </div>

        <div class="summary-strip">
          <div class="tier-stat-card" style="background: #ecfdf5; border-color: #a7f3d0;">
            <h3 style="color: #065f46;">TIER 1 (GREEN)</h3>
            <div class="val" style="color: #047857;">${tier1Count} Teams</div>
          </div>
          <div class="tier-stat-card" style="background: #fffbeb; border-color: #fde68a;">
            <h3 style="color: #92400e;">TIER 2 (ORANGE)</h3>
            <div class="val" style="color: #b45309;">${tier2Count} Teams</div>
          </div>
          <div class="tier-stat-card" style="background: #fef2f2; border-color: #fecaca;">
            <h3 style="color: #991b1b;">TIER 3 (RED)</h3>
            <div class="val" style="color: #b91c1c;">${tier3Count} Teams</div>
          </div>
        </div>

        <!-- 1. TIER 1 SECTION -->
        <div class="section-title" style="background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;">
          <span>TIER 1 — Elite & High-Form Teams (${tier1Count})</span>
          <span style="font-size: 11px; font-weight: 600;">Green</span>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 45px; text-align: center;">Pos</th>
              <th>Team</th>
              <th style="width: 110px; text-align: center;">Tier</th>
              <th>Notes / Form</th>
            </tr>
          </thead>
          <tbody>
            ${renderPrintRows(tier1Items, TIER_CONFIG.TIER_1)}
          </tbody>
        </table>

        <!-- 2. TIER 2 SECTION -->
        <div class="section-title" style="background: #fffbeb; color: #92400e; border: 1px solid #fde68a;">
          <span>TIER 2 — Mid-Table & Competitive Teams (${tier2Count})</span>
          <span style="font-size: 11px; font-weight: 600;">Orange</span>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 45px; text-align: center;">Pos</th>
              <th>Team</th>
              <th style="width: 110px; text-align: center;">Tier</th>
              <th>Notes / Form</th>
            </tr>
          </thead>
          <tbody>
            ${renderPrintRows(tier2Items, TIER_CONFIG.TIER_2)}
          </tbody>
        </table>

        <!-- 3. TIER 3 SECTION -->
        <div class="section-title" style="background: #fef2f2; color: #991b1b; border: 1px solid #fecaca;">
          <span>TIER 3 — Relegation Risk & Volatile Teams (${tier3Count})</span>
          <span style="font-size: 11px; font-weight: 600;">Red</span>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 45px; text-align: center;">Pos</th>
              <th>Team</th>
              <th style="width: 110px; text-align: center;">Tier</th>
              <th>Notes / Form</th>
            </tr>
          </thead>
          <tbody>
            ${renderPrintRows(tier3Items, TIER_CONFIG.TIER_3)}
          </tbody>
        </table>

        ${
          overallNotes
            ? `
        <div class="notes-box">
          <h4>Matchweek ${selectedMatchweek} Category Notes</h4>
          <p style="margin: 0; color: #1e293b; font-size: 12px; white-space: pre-wrap;">${overallNotes}</p>
        </div>`
            : ''
        }

        <div class="footer">
          <span>EPL Pro Match Center • Category Module</span>
          <span>Matchweek ${selectedMatchweek} Serial Rankings</span>
        </div>
    `;

    const htmlContent = [
      exportHead,
      exportStyle,
      '  ' + sClose('style'),
      sClose('head'),
      sTag('body'),
      exportBodyContent,
      sClose('body'),
      sClose('html'),
    ].join('\n');

    triggerDownloadHtml(htmlContent, `EPL_Matchweek_${selectedMatchweek}_Category_Rankings.html`);
  };

  const triggerDownloadHtml = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 400);
  };

  return (
    <div className="space-y-5 pb-20 animate-fadeIn w-full mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-red-600 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 border border-red-500 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span className="text-xs">{toastMessage}</span>
        </div>
      )}

      {/* Main Header & Top Controls */}
      <div className="solid-card p-5 sm:p-6 border border-red-200 bg-white rounded-2xl space-y-4 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-red-50 text-red-600 border border-red-200 shadow-xs shrink-0">
              <ListOrdered className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Category Rankings
                </h1>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold">
                  MW {selectedMatchweek}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSave}
              className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer ${
                hasUnsavedChanges
                  ? 'bg-red-600 text-white ring-2 ring-red-400 animate-pulse'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>{hasUnsavedChanges ? 'Save Changes' : 'Save Rankings'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center space-x-1.5 border border-slate-200 active:scale-[0.98] transition-all cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-red-600" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleDownloadReport}
              className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center space-x-1.5 border border-slate-200 active:scale-[0.98] transition-all cursor-pointer"
              title="Download standalone HTML file"
            >
              <Download className="w-3.5 h-3.5 text-red-600" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Matchweek Switcher & Utility Tools */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedMatchweek((prev) => Math.max(1, prev - 1))}
              disabled={selectedMatchweek === 1}
              className="py-1.5 px-3 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 border border-slate-200 transition-all flex items-center space-x-1 cursor-pointer shadow-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev MW</span>
            </button>

            <div className="relative">
              <select
                value={selectedMatchweek}
                onChange={(e) => setSelectedMatchweek(Number(e.target.value))}
                className="bg-white border border-red-200 text-red-700 font-bold text-xs sm:text-sm rounded-xl py-1.5 pl-3 pr-8 outline-none focus:ring-1 focus:ring-red-400 cursor-pointer appearance-none shadow-xs"
              >
                {Array.from({ length: 38 }, (_, i) => i + 1).map((w) => {
                  const isSaved = !!state.categoryRankings?.[w];
                  return (
                    <option key={w} value={w} className="bg-white text-slate-900 font-medium">
                      Matchweek {w} {isSaved ? '✓' : ''}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-red-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={() => setSelectedMatchweek((prev) => Math.min(38, prev + 1))}
              disabled={selectedMatchweek === 38}
              className="py-1.5 px-3 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 border border-slate-200 transition-all flex items-center space-x-1 cursor-pointer shadow-xs"
            >
              <span>Next MW</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {selectedMatchweek !== currentSeasonMatchweek && (
              <button
                onClick={() => setSelectedMatchweek(currentSeasonMatchweek)}
                className="py-1 px-2.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-[11px] font-semibold flex items-center space-x-1 transition-all cursor-pointer"
              >
                <Zap className="w-3 h-3 text-red-600" />
                <span>Jump to Current (MW {currentSeasonMatchweek})</span>
              </button>
            )}
          </div>

          {/* Preset & Sync Shortcuts */}
          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <button
              onClick={handleAutoFillStandings}
              className="py-1.5 px-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
              title="Sync order from current standings table"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Sync Standings</span>
              <span className="sm:hidden">Sync</span>
            </button>

            <button
              onClick={handleApplyDefaultTierScheme}
              className="py-1.5 px-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
              title="Reset tiers to standard template (1-6 T1, 7-14 T2, 15-20 T3)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Default Tiers</span>
              <span className="sm:hidden">Template</span>
            </button>

            <button
              onClick={handleResetRankings}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer shadow-xs"
              title="Clear all rankings"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tier Distribution Overview */}
        <div className="space-y-2 pt-2">
          {/* Proportion bar */}
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden flex border border-slate-200">
            <div
              style={{ width: `${(tier1Count / 20) * 100}%` }}
              className="bg-emerald-500 transition-all duration-300"
              title={`Tier 1: ${tier1Count} teams`}
            />
            <div
              style={{ width: `${(tier2Count / 20) * 100}%` }}
              className="bg-amber-500 transition-all duration-300"
              title={`Tier 2: ${tier2Count} teams`}
            />
            <div
              style={{ width: `${(tier3Count / 20) * 100}%` }}
              className="bg-red-500 transition-all duration-300"
              title={`Tier 3: ${tier3Count} teams`}
            />
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <div className="text-xs font-bold text-emerald-800">Tier 1</div>
              </div>
              <div className="text-sm sm:text-base font-bold font-mono text-emerald-700">
                {tier1Count} <span className="text-[10px] font-normal text-emerald-600">teams</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <div className="text-xs font-bold text-amber-800">Tier 2</div>
              </div>
              <div className="text-sm sm:text-base font-bold font-mono text-amber-700">
                {tier2Count} <span className="text-[10px] font-normal text-amber-600">teams</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <div className="text-xs font-bold text-rose-800">Tier 3</div>
              </div>
              <div className="text-sm sm:text-base font-bold font-mono text-rose-700">
                {tier3Count} <span className="text-[10px] font-normal text-rose-600">teams</span>
              </div>
            </div>
          </div>
        </div>

        {/* Duplicates Alert */}
        {duplicates.length > 0 && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              <strong>Duplicate team detected:</strong> {duplicates.join(', ')}. Please assign unique teams.
            </span>
          </div>
        )}
      </div>

      {/* 20-Team Rankings Table */}
      <div className="solid-card border border-red-200 bg-white rounded-2xl overflow-hidden shadow-sm">
        {/* Table Header Row */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <div className="flex items-center space-x-4 flex-1">
            <span className="w-8 text-center font-mono">#</span>
            <span className="flex-1 min-w-[180px]">Team</span>
          </div>
          <div className="hidden md:block flex-1 max-w-sm px-3">Form / Notes</div>
          <div className="w-32 text-center">Tier</div>
          <div className="w-12 text-center hidden sm:block">Move</div>
        </div>

        {/* 20 Rows with Clean Dividers */}
        <div className="divide-y divide-slate-100">
          {items.map((item, index) => {
            const currentTier = item.tier || 'TIER_1';
            const isDuplicate = item.teamName && duplicates.includes(item.teamName);

            // Left border accent color
            const borderAccent =
              currentTier === 'TIER_1'
                ? 'border-l-4 border-l-emerald-500'
                : currentTier === 'TIER_2'
                ? 'border-l-4 border-l-amber-500'
                : 'border-l-4 border-l-red-500';

            return (
              <React.Fragment key={index}>
                {/* Visual Cutoff Divider between Tier 1 and Tier 2 */}
                {index === 6 && (
                  <div className="bg-emerald-50 px-4 py-1.5 border-y border-emerald-200 text-[10px] font-bold text-emerald-700 flex items-center justify-between tracking-wider uppercase">
                    <span>── Tier 1 Cutoff (Top 6 Form) ──</span>
                    <span>Tier 2 Begins</span>
                  </div>
                )}

                {/* Visual Cutoff Divider between Tier 2 and Tier 3 */}
                {index === 14 && (
                  <div className="bg-amber-50 px-4 py-1.5 border-y border-amber-200 text-[10px] font-bold text-amber-700 flex items-center justify-between tracking-wider uppercase">
                    <span>── Tier 2 Cutoff (Mid 8 Form) ──</span>
                    <span>Tier 3 Begins</span>
                  </div>
                )}

                <div
                  className={`p-2.5 sm:p-3 transition-colors flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 hover:bg-slate-50/60 ${borderAccent} ${
                    isDuplicate ? 'bg-amber-50' : ''
                  }`}
                >
                  {/* Left: Position & Team Selector */}
                  <div className="flex items-center space-x-2.5 flex-1">
                    {/* Position Number */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        currentTier === 'TIER_1'
                          ? 'bg-emerald-100 text-emerald-800'
                          : currentTier === 'TIER_2'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      #{index + 1}
                    </div>

                    {/* Team Dropdown */}
                    <div className="relative flex-1 min-w-[170px]">
                      <select
                        value={item.teamName}
                        onChange={(e) => handleTeamChange(index, e.target.value)}
                        className={`w-full bg-white text-slate-900 font-semibold text-xs sm:text-sm rounded-xl py-1.5 pl-3 pr-7 border outline-none cursor-pointer appearance-none transition-all shadow-xs ${
                          item.teamName
                            ? 'border-slate-300 focus:border-red-400'
                            : 'border-slate-200 text-slate-400'
                        }`}
                      >
                        <option value="" className="bg-white text-slate-400">
                          -- Select Team (#{index + 1}) --
                        </option>
                        {ALL_EPL_20_TEAMS.map((team) => {
                          const isTaken = items.some(
                            (otherItem, otherIdx) => otherIdx !== index && otherItem.teamName === team.name
                          );
                          return (
                            <option
                              key={team.id}
                              value={team.name}
                              className="bg-white text-slate-900 font-medium"
                            >
                              {team.name} {isTaken ? '(Swap)' : ''}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Notes Input */}
                  <div className="flex-1 max-w-sm">
                    <input
                      type="text"
                      placeholder="Form / tactical note..."
                      value={item.notes || ''}
                      onChange={(e) => handleNotesChange(index, e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-1.5 outline-none focus:border-red-400 placeholder:text-slate-400 font-medium shadow-xs"
                    />
                  </div>

                  {/* Right: Segmented Tier Toggle [ T1 | T2 | T3 ] */}
                  <div className="flex items-center justify-between sm:justify-end space-x-2 shrink-0">
                    <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTierChange(index, 'TIER_1')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                          currentTier === 'TIER_1'
                            ? 'bg-emerald-600 text-white shadow-xs font-bold'
                            : 'text-slate-600 hover:text-emerald-700'
                        }`}
                        title="Tier 1 (Green • Top Form)"
                      >
                        T1
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTierChange(index, 'TIER_2')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                          currentTier === 'TIER_2'
                            ? 'bg-amber-500 text-white shadow-xs font-bold'
                            : 'text-slate-600 hover:text-amber-700'
                        }`}
                        title="Tier 2 (Orange • Mid Form)"
                      >
                        T2
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTierChange(index, 'TIER_3')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                          currentTier === 'TIER_3'
                            ? 'bg-red-600 text-white shadow-xs font-bold'
                            : 'text-slate-600 hover:text-red-700'
                        }`}
                        title="Tier 3 (Red • Low Form)"
                      >
                        T3
                      </button>
                    </div>

                    {/* Move Up / Down Buttons */}
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1.5 rounded-md bg-white hover:bg-slate-50 disabled:opacity-30 text-slate-700 disabled:cursor-not-allowed transition-colors border border-slate-200 cursor-pointer shadow-xs"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === items.length - 1}
                        className="p-1.5 rounded-md bg-white hover:bg-slate-50 disabled:opacity-30 text-slate-700 disabled:cursor-not-allowed transition-colors border border-slate-200 cursor-pointer shadow-xs"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Matchweek Strategy Notes Card */}
      <div className="solid-card p-5 border border-red-200 bg-white rounded-2xl space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-red-600" />
            <span>Matchweek {selectedMatchweek} Strategy & Analysis Notes</span>
          </label>
          <span className="text-[11px] text-slate-500">
            {hasUnsavedChanges ? '⚠️ Unsaved changes' : '✓ Saved'}
          </span>
        </div>
        <textarea
          rows={2}
          value={overallNotes}
          onChange={(e) => {
            setOverallNotes(e.target.value);
            setHasUnsavedChanges(true);
          }}
          placeholder="Summary notes on team forms, key BTTS fixtures, tactical changes for this matchweek..."
          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 text-xs outline-none focus:border-red-400 transition-colors shadow-xs"
        />
        <div className="flex justify-end pt-1">
          <button
            onClick={handleSave}
            className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Save Rankings & Notes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
