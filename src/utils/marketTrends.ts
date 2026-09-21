import { EPLMatchEvent } from '../types';
import { normalizeTeamName } from './teamData';

export type MarketKey =
  | 'BTTS'
  | 'OVER_25'
  | 'UNDER_25'
  | 'OVER_15'
  | 'UNDER_35'
  | 'HOME_WIN'
  | 'AWAY_WIN'
  | 'DRAW'
  | 'CLEAN_SHEET'
  | 'FIRST_HALF_GOAL';

export interface MarketDefinition {
  key: MarketKey;
  label: string;
  shortLabel: string;
  color: string;
  check: (m: EPLMatchEvent, teamName?: string) => boolean | null;
}

export const ALL_MARKET_DEFINITIONS: MarketDefinition[] = [
  {
    key: 'BTTS',
    label: 'Both Teams To Score (BTTS)',
    shortLabel: 'BTTS',
    color: '#10b981', // emerald
    check: (m) => m.btts === true,
  },
  {
    key: 'OVER_25',
    label: 'Over 2.5 Goals',
    shortLabel: 'Over 2.5',
    color: '#06b6d4', // cyan
    check: (m) => m.totalGoals > 2.5,
  },
  {
    key: 'UNDER_25',
    label: 'Under 2.5 Goals',
    shortLabel: 'Under 2.5',
    color: '#8b5cf6', // purple
    check: (m) => m.totalGoals < 2.5,
  },
  {
    key: 'OVER_15',
    label: 'Over 1.5 Goals',
    shortLabel: 'Over 1.5',
    color: '#3b82f6', // blue
    check: (m) => m.totalGoals > 1.5,
  },
  {
    key: 'UNDER_35',
    label: 'Under 3.5 Goals',
    shortLabel: 'Under 3.5',
    color: '#6366f1', // indigo
    check: (m) => m.totalGoals < 3.5,
  },
  {
    key: 'HOME_WIN',
    label: 'Home Win (1)',
    shortLabel: 'Home Win',
    color: '#f59e0b', // amber
    check: (m, team) => {
      if (!team) return m.winner === 'HOME';
      // If specific team: did team win at home?
      if (normalizeTeamName(m.homeTeam).toLowerCase() === normalizeTeamName(team).toLowerCase()) return m.winner === 'HOME';
      return null;
    },
  },
  {
    key: 'AWAY_WIN',
    label: 'Away Win (2)',
    shortLabel: 'Away Win',
    color: '#ec4899', // pink
    check: (m, team) => {
      if (!team) return m.winner === 'AWAY';
      if (normalizeTeamName(m.awayTeam).toLowerCase() === normalizeTeamName(team).toLowerCase()) return m.winner === 'AWAY';
      return null;
    },
  },
  {
    key: 'DRAW',
    label: 'Draw (X)',
    shortLabel: 'Draw',
    color: '#94a3b8', // slate
    check: (m) => m.winner === 'DRAW',
  },
  {
    key: 'CLEAN_SHEET',
    label: 'Clean Sheet Kept',
    shortLabel: 'Clean Sheet',
    color: '#14b8a6', // teal
    check: (m, team) => {
      if (!team) {
        return m.cleanSheetTeam === 'HOME' || m.cleanSheetTeam === 'AWAY' || m.cleanSheetTeam === 'BOTH';
      }
      const normTeam = normalizeTeamName(team).toLowerCase();
      if (normalizeTeamName(m.homeTeam).toLowerCase() === normTeam) return m.awayScore === 0;
      if (normalizeTeamName(m.awayTeam).toLowerCase() === normTeam) return m.homeScore === 0;
      return false;
    },
  },
  {
    key: 'FIRST_HALF_GOAL',
    label: 'First Half Goal (HT > 0.5)',
    shortLabel: 'HT Over 0.5',
    color: '#f97316', // orange
    check: (m) => {
      const htHome = m.halfTimeHomeScore;
      const htAway = m.halfTimeAwayScore;
      if (htHome !== undefined && htAway !== undefined) {
        return (htHome + htAway) > 0;
      }
      return m.totalGoals > 0;
    },
  },
];

export interface WeekMarketStats {
  week: number;
  totalMatches: number;
  marketHits: Record<MarketKey, number>;
  marketPercentages: Record<MarketKey, number>;
}

export interface MarketTrendSummary {
  key: MarketKey;
  label: string;
  shortLabel: string;
  color: string;
  totalOccurrences: number;
  totalEligible: number;
  overallPercent: number;
  direction: 'UP' | 'DOWN' | 'STABLE';
  diff: number; // percentage point change from earlier half to later half (or prev week)
  weeklyPoints: { week: number; percent: number; hits: number; total: number }[];
}

/**
 * Computes weekly and overall trends across all recorded matches
 * for all teams or filtered by a specific team.
 */
export function calculateMarketTrends(
  matches: EPLMatchEvent[],
  teamFilter?: string
): {
  weeks: number[];
  weeklyStats: WeekMarketStats[];
  summaries: MarketTrendSummary[];
  totalMatchesCount: number;
} {
  // Filter matches if team is selected
  const normalizedTeamFilter = teamFilter && teamFilter !== 'ALL' ? normalizeTeamName(teamFilter).toLowerCase() : null;
  const eligibleMatches = normalizedTeamFilter
    ? matches.filter((m) => {
        const h = normalizeTeamName(m.homeTeam).toLowerCase();
        const a = normalizeTeamName(m.awayTeam).toLowerCase();
        return h === normalizedTeamFilter || a === normalizedTeamFilter;
      })
    : matches;

  if (eligibleMatches.length === 0) {
    return {
      weeks: [],
      weeklyStats: [],
      summaries: ALL_MARKET_DEFINITIONS.map((def) => ({
        key: def.key,
        label: def.label,
        shortLabel: def.shortLabel,
        color: def.color,
        totalOccurrences: 0,
        totalEligible: 0,
        overallPercent: 0,
        direction: 'STABLE',
        diff: 0,
        weeklyPoints: [],
      })),
      totalMatchesCount: 0,
    };
  }

  // Group by matchweek
  const weekMap: Record<number, EPLMatchEvent[]> = {};
  eligibleMatches.forEach((m) => {
    const w = m.matchweek || 1;
    if (!weekMap[w]) weekMap[w] = [];
    weekMap[w].push(m);
  });

  const weeks = Object.keys(weekMap)
    .map(Number)
    .sort((a, b) => a - b);

  const weeklyStats: WeekMarketStats[] = weeks.map((w) => {
    const weekMatches = weekMap[w];
    const total = weekMatches.length;
    const hits: Record<MarketKey, number> = {} as any;
    const pcts: Record<MarketKey, number> = {} as any;

    ALL_MARKET_DEFINITIONS.forEach((def) => {
      let count = 0;
      let eligible = 0;
      weekMatches.forEach((m) => {
        const res = def.check(m, teamFilter !== 'ALL' ? teamFilter : undefined);
        if (res !== null) {
          eligible++;
          if (res) count++;
        }
      });
      hits[def.key] = count;
      pcts[def.key] = eligible > 0 ? Math.round((count / eligible) * 100) : 0;
    });

    return {
      week: w,
      totalMatches: total,
      marketHits: hits,
      marketPercentages: pcts,
    };
  });

  // Calculate summaries and UP/DOWN/STABLE direction
  const summaries: MarketTrendSummary[] = ALL_MARKET_DEFINITIONS.map((def) => {
    let totalOccurrences = 0;
    let totalEligible = 0;

    eligibleMatches.forEach((m) => {
      const res = def.check(m, teamFilter !== 'ALL' ? teamFilter : undefined);
      if (res !== null) {
        totalEligible++;
        if (res) totalOccurrences++;
      }
    });

    const overallPercent = totalEligible > 0 ? Math.round((totalOccurrences / totalEligible) * 100) : 0;

    const weeklyPoints = weeklyStats.map((ws) => ({
      week: ws.week,
      percent: ws.marketPercentages[def.key] || 0,
      hits: ws.marketHits[def.key] || 0,
      total: ws.totalMatches,
    }));

    // Direction calculation:
    // If only 1 week: compare with 50% baseline or 'STABLE'
    // If 2+ weeks: compare the second half of weeks vs the first half of weeks (or last week vs previous)
    let direction: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
    let diff = 0;

    if (weeklyPoints.length >= 2) {
      const mid = Math.floor(weeklyPoints.length / 2);
      const firstHalf = weeklyPoints.slice(0, mid);
      const secondHalf = weeklyPoints.slice(mid);

      const avgFirst = firstHalf.reduce((acc, p) => acc + p.percent, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((acc, p) => acc + p.percent, 0) / secondHalf.length;

      diff = Math.round(avgSecond - avgFirst);

      if (diff >= 4) direction = 'UP';
      else if (diff <= -4) direction = 'DOWN';
      else direction = 'STABLE';
    }

    return {
      key: def.key,
      label: def.label,
      shortLabel: def.shortLabel,
      color: def.color,
      totalOccurrences,
      totalEligible,
      overallPercent,
      direction,
      diff,
      weeklyPoints,
    };
  });

  return {
    weeks,
    weeklyStats,
    summaries,
    totalMatchesCount: eligibleMatches.length,
  };
}
