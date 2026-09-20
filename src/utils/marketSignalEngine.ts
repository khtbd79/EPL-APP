import {
  EPLMatchEvent,
  CategoryRankingsMap,
  PreMatchNotesMap,
  SavedAnalysisRecord,
} from '../types';
import { ALL_EPL_20_TEAMS, getTeamInfo } from './teamData';

export type SignalGrade = 'STRONG' | 'SOLID' | 'MODERATE' | 'CAUTION' | 'AVOID';

export interface MarketSignal {
  id: string;
  marketName: string;
  category: 'BTTS' | 'GOALS' | 'RESULT' | 'DOUBLE_CHANCE' | 'SPECIAL';
  probability: number; // 0 - 100%
  confidenceScore: number; // 0 - 100%
  signalGrade: SignalGrade;
  badgeText: string;
  fairOdds: number;
  keyReasons: string[];
  riskFactors: string[];
  isTopPick: boolean;
}

export interface TeamMatchPerformance {
  teamName: string;
  totalMatches: number;
  homeOrAwayMatches: number; // matches played at this specific venue
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  avgGoalsFor: number;
  avgGoalsAgainst: number;
  bttsRate: number; // 0 - 100
  over25Rate: number; // 0 - 100
  over15Rate: number; // 0 - 100
  cleanSheetRate: number; // 0 - 100
  failedToScoreRate: number; // 0 - 100
  form: ('W' | 'D' | 'L')[];
  tier?: string;
  priorityStars: number;
}

export interface H2HAnalysis {
  totalMatches: number;
  homeWins: number;
  awayWins: number;
  draws: number;
  homeGoals: number;
  awayGoals: number;
  avgGoals: number;
  bttsRate: number;
  over25Rate: number;
  recentMatches: EPLMatchEvent[];
}

export interface MatchAnalysisResult {
  homeTeam: string;
  awayTeam: string;
  venue: string;
  homeStats: TeamMatchPerformance;
  awayStats: TeamMatchPerformance;
  h2h: H2HAnalysis;
  hasSavedData: boolean;
  homeExpectedGoals: number;
  awayExpectedGoals: number;
  totalExpectedGoals: number;
  projectedScore: string;
  allSignals: MarketSignal[];
  topSignals: MarketSignal[];
  dataConfidenceLevel: 'HIGH_MATCH_DATA' | 'MODERATE_DATA' | 'NO_DATA';
  totalDataSourceMatches: number;
  preMatchNote?: string;
  savedAnalysisScore?: number;
}

/**
 * Calculates team performance for home or away split from Match Center records
 */
function calculateVenuePerformance(
  teamName: string,
  isHomeVenue: boolean,
  matches: EPLMatchEvent[],
  categoryRankings?: CategoryRankingsMap
): TeamMatchPerformance {
  const teamInfo = getTeamInfo(teamName);
  const cleanTeam = teamName.toLowerCase().trim();

  // All matches involving this team
  const allTeamMatches = matches.filter(
    (m) => m.homeTeam.toLowerCase().trim() === cleanTeam || m.awayTeam.toLowerCase().trim() === cleanTeam
  );

  // Matches played at this specific venue (Home vs Away)
  const venueMatches = matches.filter((m) =>
    isHomeVenue
      ? m.homeTeam.toLowerCase().trim() === cleanTeam
      : m.awayTeam.toLowerCase().trim() === cleanTeam
  );

  // Look for latest Category ranking
  let currentTier: string | undefined = undefined;
  if (categoryRankings) {
    const weeks = Object.keys(categoryRankings).map(Number).sort((a, b) => b - a);
    if (weeks.length > 0) {
      const latestRanking = categoryRankings[weeks[0]];
      const found = latestRanking?.rankings?.find((r) => r.teamName.toLowerCase().trim() === cleanTeam);
      if (found) currentTier = found.tier;
    }
  }

  // If no venue matches are recorded yet, check if team has any recorded matches at all
  if (venueMatches.length === 0) {
    if (allTeamMatches.length > 0) {
      let gf = 0;
      let ga = 0;
      let bttsCount = 0;
      let over25Count = 0;
      let over15Count = 0;
      let cleanSheets = 0;
      let failedToScore = 0;

      allTeamMatches.forEach((m) => {
        const isHome = m.homeTeam.toLowerCase().trim() === cleanTeam;
        const teamScore = isHome ? m.homeScore : m.awayScore;
        const oppScore = isHome ? m.awayScore : m.homeScore;

        gf += teamScore;
        ga += oppScore;
        if (m.homeScore > 0 && m.awayScore > 0) bttsCount++;
        if (m.homeScore + m.awayScore > 2.5) over25Count++;
        if (m.homeScore + m.awayScore > 1.5) over15Count++;
        if (oppScore === 0) cleanSheets++;
        if (teamScore === 0) failedToScore++;
      });

      const count = allTeamMatches.length;
      return {
        teamName,
        totalMatches: count,
        homeOrAwayMatches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: gf,
        goalsAgainst: ga,
        avgGoalsFor: Number((gf / count).toFixed(2)),
        avgGoalsAgainst: Number((ga / count).toFixed(2)),
        bttsRate: Math.round((bttsCount / count) * 100),
        over25Rate: Math.round((over25Count / count) * 100),
        over15Rate: Math.round((over15Count / count) * 100),
        cleanSheetRate: Math.round((cleanSheets / count) * 100),
        failedToScoreRate: Math.round((failedToScore / count) * 100),
        form: [],
        tier: currentTier,
        priorityStars: teamInfo?.priorityStars || 4,
      };
    }

    // No data at all for this team in Match Center
    return {
      teamName,
      totalMatches: 0,
      homeOrAwayMatches: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      avgGoalsFor: 0,
      avgGoalsAgainst: 0,
      bttsRate: 0,
      over25Rate: 0,
      over15Rate: 0,
      cleanSheetRate: 0,
      failedToScoreRate: 0,
      form: [],
      tier: currentTier,
      priorityStars: teamInfo?.priorityStars || 4,
    };
  }

  let wins = 0;
  let draws = 0;
  let losses = 0;
  let gf = 0;
  let ga = 0;
  let bttsCount = 0;
  let over25Count = 0;
  let over15Count = 0;
  let cleanSheets = 0;
  let failedToScore = 0;

  venueMatches.forEach((m) => {
    const teamScore = isHomeVenue ? m.homeScore : m.awayScore;
    const oppScore = isHomeVenue ? m.awayScore : m.homeScore;

    gf += teamScore;
    ga += oppScore;

    if (teamScore > oppScore) wins++;
    else if (teamScore === oppScore) draws++;
    else losses++;

    if (m.homeScore > 0 && m.awayScore > 0) bttsCount++;
    if (m.homeScore + m.awayScore > 2.5) over25Count++;
    if (m.homeScore + m.awayScore > 1.5) over15Count++;
    if (oppScore === 0) cleanSheets++;
    if (teamScore === 0) failedToScore++;
  });

  // Calculate recent form from chronological matches
  const sorted = [...allTeamMatches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const form: ('W' | 'D' | 'L')[] = sorted.slice(-5).map((m) => {
    const isHome = m.homeTeam.toLowerCase().trim() === cleanTeam;
    const teamScore = isHome ? m.homeScore : m.awayScore;
    const oppScore = isHome ? m.awayScore : m.homeScore;
    if (teamScore > oppScore) return 'W';
    if (teamScore === oppScore) return 'D';
    return 'L';
  });

  const count = venueMatches.length;
  return {
    teamName,
    totalMatches: allTeamMatches.length,
    homeOrAwayMatches: count,
    wins,
    draws,
    losses,
    goalsFor: gf,
    goalsAgainst: ga,
    avgGoalsFor: Number((gf / count).toFixed(2)),
    avgGoalsAgainst: Number((ga / count).toFixed(2)),
    bttsRate: Math.round((bttsCount / count) * 100),
    over25Rate: Math.round((over25Count / count) * 100),
    over15Rate: Math.round((over15Count / count) * 100),
    cleanSheetRate: Math.round((cleanSheets / count) * 100),
    failedToScoreRate: Math.round((failedToScore / count) * 100),
    form,
    tier: currentTier,
    priorityStars: teamInfo?.priorityStars || 4,
  };
}

/**
 * Calculates Head-to-Head record between Home & Away
 */
function analyzeH2H(homeTeam: string, awayTeam: string, matches: EPLMatchEvent[]): H2HAnalysis {
  const cleanHome = homeTeam.toLowerCase().trim();
  const cleanAway = awayTeam.toLowerCase().trim();

  const h2hMatches = matches.filter(
    (m) =>
      (m.homeTeam.toLowerCase().trim() === cleanHome && m.awayTeam.toLowerCase().trim() === cleanAway) ||
      (m.homeTeam.toLowerCase().trim() === cleanAway && m.awayTeam.toLowerCase().trim() === cleanHome)
  );

  let homeWins = 0;
  let awayWins = 0;
  let draws = 0;
  let homeGoals = 0;
  let awayGoals = 0;
  let bttsCount = 0;
  let over25Count = 0;

  h2hMatches.forEach((m) => {
    const isActualHome = m.homeTeam.toLowerCase().trim() === cleanHome;
    const hScore = isActualHome ? m.homeScore : m.awayScore;
    const aScore = isActualHome ? m.awayScore : m.homeScore;

    homeGoals += hScore;
    awayGoals += aScore;

    if (hScore > aScore) homeWins++;
    else if (aScore > hScore) awayWins++;
    else draws++;

    if (m.homeScore > 0 && m.awayScore > 0) bttsCount++;
    if (m.homeScore + m.awayScore > 2.5) over25Count++;
  });

  const total = h2hMatches.length;
  return {
    totalMatches: total,
    homeWins,
    awayWins,
    draws,
    homeGoals,
    awayGoals,
    avgGoals: total > 0 ? Number(((homeGoals + awayGoals) / total).toFixed(2)) : 0,
    bttsRate: total > 0 ? Math.round((bttsCount / total) * 100) : 0,
    over25Rate: total > 0 ? Math.round((over25Count / total) * 100) : 0,
    recentMatches: h2hMatches.slice(0, 5),
  };
}

/**
 * Main Signal Engine: evaluates all primary football betting markets
 */
export function generateMatchSignals(
  homeTeam: string,
  awayTeam: string,
  eplMatches: EPLMatchEvent[],
  categoryRankings?: CategoryRankingsMap,
  preMatchNotes?: PreMatchNotesMap,
  savedAnalyses?: SavedAnalysisRecord[]
): MatchAnalysisResult {
  const homeInfo = getTeamInfo(homeTeam);
  const awayInfo = getTeamInfo(awayTeam);
  const venue = homeInfo ? `${homeInfo.stadium} (${homeInfo.city})` : `${homeTeam} Stadium`;

  const homeStats = calculateVenuePerformance(homeTeam, true, eplMatches, categoryRankings);
  const awayStats = calculateVenuePerformance(awayTeam, false, eplMatches, categoryRankings);
  const h2h = analyzeH2H(homeTeam, awayTeam, eplMatches);

  // Require saved match center data for both teams to perform evaluation
  const hasSavedData = homeStats.totalMatches > 0 && awayStats.totalMatches > 0;

  if (!hasSavedData) {
    return {
      homeTeam,
      awayTeam,
      venue,
      homeStats,
      awayStats,
      h2h,
      hasSavedData: false,
      homeExpectedGoals: 0,
      awayExpectedGoals: 0,
      totalExpectedGoals: 0,
      projectedScore: '-',
      allSignals: [],
      topSignals: [],
      dataConfidenceLevel: 'NO_DATA',
      totalDataSourceMatches: 0,
      preMatchNote: undefined,
      savedAnalysisScore: undefined,
    };
  }

  // Assess data reliability
  const totalMatchesTracked = homeStats.totalMatches + awayStats.totalMatches;
  let dataConfidenceLevel: 'HIGH_MATCH_DATA' | 'MODERATE_DATA' | 'NO_DATA' = 'MODERATE_DATA';
  if (totalMatchesTracked >= 6) {
    dataConfidenceLevel = 'HIGH_MATCH_DATA';
  }

  // Expected Goals (xG estimate based on attack vs defense metrics)
  // Home team scores: blend of Home GF and Away GA
  const homeXG = Number(((homeStats.avgGoalsFor * 0.55 + awayStats.avgGoalsAgainst * 0.45) * 0.95 + 0.1).toFixed(2));
  // Away team scores: blend of Away GF and Home GA
  const awayXG = Number(((awayStats.avgGoalsFor * 0.55 + homeStats.avgGoalsAgainst * 0.45) * 0.95 + 0.05).toFixed(2));
  const totalXG = Number((homeXG + awayXG).toFixed(2));

  // Projected Scoreline
  const projHome = Math.round(homeXG);
  const projAway = Math.round(awayXG);
  const projectedScore = `${projHome} - ${projAway}`;

  // Pre-match notes lookup
  const preNote = preMatchNotes?.[homeTeam]?.bettingAngle || preMatchNotes?.[awayTeam]?.bettingAngle;

  // Saved analysis lookup
  const savedRecord = savedAnalyses?.find(
    (s) =>
      (s.homeTeam.toLowerCase().trim() === homeTeam.toLowerCase().trim() &&
        s.awayTeam.toLowerCase().trim() === awayTeam.toLowerCase().trim()) ||
      s.selectedTeam.toLowerCase().trim() === homeTeam.toLowerCase().trim()
  );

  const signals: MarketSignal[] = [];

  // Helper for grade assignment
  const getGrade = (prob: number): SignalGrade => {
    if (prob >= 75) return 'STRONG';
    if (prob >= 63) return 'SOLID';
    if (prob >= 52) return 'MODERATE';
    if (prob >= 40) return 'CAUTION';
    return 'AVOID';
  };

  const getBadge = (grade: SignalGrade, label: string): string => {
    switch (grade) {
      case 'STRONG':
        return `STRONG SIGNAL • ${label}`;
      case 'SOLID':
        return `SOLID OPPORTUNITY • ${label}`;
      case 'MODERATE':
        return `MODERATE / WATCH • ${label}`;
      case 'CAUTION':
        return `CAUTION • ${label}`;
      case 'AVOID':
        return `AVOID / HIGH RISK • ${label}`;
    }
  };

  // -------------------------------------------------------------
  // 1. BTTS YES (Both Teams To Score - YES)
  // -------------------------------------------------------------
  const bttsProb = Math.min(
    95,
    Math.max(
      15,
      Math.round(
        homeStats.bttsRate * 0.35 +
          awayStats.bttsRate * 0.35 +
          h2h.bttsRate * 0.2 +
          (homeStats.avgGoalsFor >= 1.2 && awayStats.avgGoalsFor >= 1.0 ? 10 : -8)
      )
    )
  );
  const bttsGrade = getGrade(bttsProb);
  signals.push({
    id: 'btts_yes',
    marketName: 'BTTS YES (Both Teams to Score)',
    category: 'BTTS',
    probability: bttsProb,
    confidenceScore: bttsProb,
    signalGrade: bttsGrade,
    badgeText: getBadge(bttsGrade, `${bttsProb}% Probability`),
    fairOdds: Number((100 / bttsProb).toFixed(2)),
    keyReasons: [
      `${homeTeam} Home BTTS rate: ${homeStats.bttsRate}% (Avg ${homeStats.avgGoalsFor} GF / ${homeStats.avgGoalsAgainst} GA)`,
      `${awayTeam} Away BTTS rate: ${awayStats.bttsRate}% (Avg ${awayStats.avgGoalsFor} GF / ${awayStats.avgGoalsAgainst} GA)`,
      h2h.totalMatches > 0
        ? `H2H History: ${h2h.bttsRate}% BTTS in ${h2h.totalMatches} recorded meetings`
        : `Projected xG: ${homeTeam} ${homeXG} - ${awayXG} ${awayTeam}`,
    ],
    riskFactors: [
      homeStats.cleanSheetRate > 40 ? `${homeTeam} has high clean sheet rate at home (${homeStats.cleanSheetRate}%)` : '',
      awayStats.failedToScoreRate > 35 ? `${awayTeam} failed to score in ${awayStats.failedToScoreRate}% of away games` : '',
    ].filter(Boolean),
    isTopPick: bttsProb >= 70,
  });

  // -------------------------------------------------------------
  // 2. BTTS NO (Both Teams To Score - NO)
  // -------------------------------------------------------------
  const bttsNoProb = 100 - bttsProb;
  const bttsNoGrade = getGrade(bttsNoProb);
  signals.push({
    id: 'btts_no',
    marketName: 'BTTS NO (Clean Sheet / Zero Goals for either)',
    category: 'BTTS',
    probability: bttsNoProb,
    confidenceScore: bttsNoProb,
    signalGrade: bttsNoGrade,
    badgeText: getBadge(bttsNoGrade, `${bttsNoProb}% Probability`),
    fairOdds: Number((100 / Math.max(1, bttsNoProb)).toFixed(2)),
    keyReasons: [
      `${homeTeam} Clean Sheets: ${homeStats.cleanSheetRate}%, ${awayTeam} Failed-to-score: ${awayStats.failedToScoreRate}%`,
      `Opposing clean defense potential: Combined clean-sheet expectancy ~ ${Math.round((homeStats.cleanSheetRate + awayStats.cleanSheetRate) / 2)}%`,
    ],
    riskFactors: [
      bttsProb > 60 ? `High attacking capability creates goal threats on both sides` : '',
    ].filter(Boolean),
    isTopPick: bttsNoProb >= 68,
  });

  // -------------------------------------------------------------
  // 3. OVER 2.5 GOALS
  // -------------------------------------------------------------
  const over25Prob = Math.min(
    95,
    Math.max(
      15,
      Math.round(
        homeStats.over25Rate * 0.35 +
          awayStats.over25Rate * 0.35 +
          h2h.over25Rate * 0.15 +
          (totalXG >= 2.8 ? 15 : totalXG >= 2.4 ? 5 : -12)
      )
    )
  );
  const over25Grade = getGrade(over25Prob);
  signals.push({
    id: 'over_25',
    marketName: 'Over 2.5 Goals',
    category: 'GOALS',
    probability: over25Prob,
    confidenceScore: over25Prob,
    signalGrade: over25Grade,
    badgeText: getBadge(over25Grade, `${over25Prob}% Expected`),
    fairOdds: Number((100 / over25Prob).toFixed(2)),
    keyReasons: [
      `Combined Expected Goals (xG): ${totalXG} goals / match`,
      `${homeTeam} Home Over 2.5 Rate: ${homeStats.over25Rate}%, ${awayTeam} Away Over 2.5 Rate: ${awayStats.over25Rate}%`,
      h2h.totalMatches > 0 ? `H2H Avg Goals: ${h2h.avgGoals} goals (${h2h.over25Rate}% Over 2.5)` : `Attack-minded tactical matchup`,
    ],
    riskFactors: [
      totalXG < 2.4 ? `Calculated combined goals (${totalXG}) is under the 2.5 threshold` : '',
    ].filter(Boolean),
    isTopPick: over25Prob >= 72,
  });

  // -------------------------------------------------------------
  // 4. UNDER 2.5 GOALS
  // -------------------------------------------------------------
  const under25Prob = 100 - over25Prob;
  const under25Grade = getGrade(under25Prob);
  signals.push({
    id: 'under_25',
    marketName: 'Under 2.5 Goals',
    category: 'GOALS',
    probability: under25Prob,
    confidenceScore: under25Prob,
    signalGrade: under25Grade,
    badgeText: getBadge(under25Grade, `${under25Prob}% Expected`),
    fairOdds: Number((100 / Math.max(1, under25Prob)).toFixed(2)),
    keyReasons: [
      `Tight defensive encounter expected (xG: ${totalXG} goals)`,
      `${homeTeam} Home defense conceding avg ${homeStats.avgGoalsAgainst} goals`,
      `${awayTeam} Away defense conceding avg ${awayStats.avgGoalsAgainst} goals`,
    ],
    riskFactors: [
      over25Prob > 55 ? `High-power attacking lineups can generate sudden multi-goal bursts` : '',
    ].filter(Boolean),
    isTopPick: under25Prob >= 68,
  });

  // -------------------------------------------------------------
  // 5. OVER 1.5 GOALS (Safety / Banker Goal Market)
  // -------------------------------------------------------------
  const over15Prob = Math.min(
    98,
    Math.max(
      40,
      Math.round(
        homeStats.over15Rate * 0.4 +
          awayStats.over15Rate * 0.4 +
          (totalXG >= 2.0 ? 15 : 0) +
          (h2h.avgGoals >= 1.8 ? 5 : 0)
      )
    )
  );
  const over15Grade = getGrade(over15Prob);
  signals.push({
    id: 'over_15',
    marketName: 'Over 1.5 Goals (High Safety)',
    category: 'GOALS',
    probability: over15Prob,
    confidenceScore: over15Prob,
    signalGrade: over15Grade,
    badgeText: getBadge(over15Grade, `${over15Prob}% Confidence`),
    fairOdds: Number((100 / over15Prob).toFixed(2)),
    keyReasons: [
      `High-probability safety line with combined expected total of ${totalXG} goals`,
      `${homeTeam} scores or concedes in over ${homeStats.over15Rate}% of home fixtures`,
      `${awayTeam} fixtures average ${awayStats.avgGoalsFor + awayStats.avgGoalsAgainst} total goals on the road`,
    ],
    riskFactors: [
      over15Prob < 75 ? `Cautious low-scoring tactical standoff risk` : '',
    ].filter(Boolean),
    isTopPick: over15Prob >= 82,
  });

  // -------------------------------------------------------------
  // 6. UNDER 3.5 GOALS (Safety Ceiling Market)
  // -------------------------------------------------------------
  const under35Prob = Math.min(
    96,
    Math.max(
      35,
      Math.round(
        100 - (over25Prob * 0.55 + (totalXG >= 3.2 ? 25 : totalXG >= 2.7 ? 12 : -10))
      )
    )
  );
  const under35Grade = getGrade(under35Prob);
  signals.push({
    id: 'under_35',
    marketName: 'Under 3.5 Goals (Safety Buffer)',
    category: 'GOALS',
    probability: under35Prob,
    confidenceScore: under35Prob,
    signalGrade: under35Grade,
    badgeText: getBadge(under35Grade, `${under35Prob}% Probability`),
    fairOdds: Number((100 / under35Prob).toFixed(2)),
    keyReasons: [
      `Provides a 3-goal safety ceiling for moderate and controlled scorelines`,
      `Expected goals (${totalXG}) sits comfortably under the 3.5 threshold`,
    ],
    riskFactors: [
      totalXG >= 3.0 ? `Both teams capable of blowout games when in top flow` : '',
    ].filter(Boolean),
    isTopPick: under35Prob >= 80,
  });

  // -------------------------------------------------------------
  // 7. HOME WIN (1)
  // -------------------------------------------------------------
  const homeAdvantage = 12; // Home turf statistical edge
  const starDiff = (homeStats.priorityStars - awayStats.priorityStars) * 12;
  const tierAdvantage =
    homeStats.tier === 'TIER_1' && awayStats.tier === 'TIER_3'
      ? 20
      : homeStats.tier === 'TIER_1' && awayStats.tier === 'TIER_2'
      ? 10
      : homeStats.tier === 'TIER_3' && awayStats.tier === 'TIER_1'
      ? -18
      : 0;

  const rawHomeProb = 36 + homeAdvantage + starDiff + tierAdvantage + (homeStats.wins > 0 ? (homeStats.wins / Math.max(1, homeStats.homeOrAwayMatches)) * 20 : 0) - (awayStats.wins > 0 ? (awayStats.wins / Math.max(1, awayStats.homeOrAwayMatches)) * 12 : 0);
  const homeWinProb = Math.min(88, Math.max(10, Math.round(rawHomeProb)));
  const homeWinGrade = getGrade(homeWinProb);
  signals.push({
    id: 'home_win',
    marketName: `Home Win: ${homeTeam} (1)`,
    category: 'RESULT',
    probability: homeWinProb,
    confidenceScore: homeWinProb,
    signalGrade: homeWinGrade,
    badgeText: getBadge(homeWinGrade, `${homeWinProb}% Probability`),
    fairOdds: Number((100 / homeWinProb).toFixed(2)),
    keyReasons: [
      `${homeTeam} Home turf advantage at ${venue}`,
      `${homeTeam} Priority: ${homeStats.priorityStars}★ ${homeStats.tier ? `• ${homeStats.tier}` : ''}`,
      h2h.homeWins > h2h.awayWins ? `Head-to-head advantage: ${h2h.homeWins} wins vs ${h2h.awayWins} losses` : `Home scoring momentum (xG: ${homeXG})`,
    ],
    riskFactors: [
      awayStats.priorityStars >= homeStats.priorityStars ? `${awayTeam} possesses equal or superior squad caliber` : '',
      awayStats.wins > 0 && awayStats.avgGoalsFor > 1.4 ? `${awayTeam} dangerous counter-attack threat on the road` : '',
    ].filter(Boolean),
    isTopPick: homeWinProb >= 65,
  });

  // -------------------------------------------------------------
  // 8. AWAY WIN (2)
  // -------------------------------------------------------------
  const rawAwayProb = 28 - homeAdvantage - starDiff - tierAdvantage + (awayStats.wins > 0 ? (awayStats.wins / Math.max(1, awayStats.homeOrAwayMatches)) * 20 : 0);
  const awayWinProb = Math.min(80, Math.max(8, Math.round(rawAwayProb)));
  const awayWinGrade = getGrade(awayWinProb);
  signals.push({
    id: 'away_win',
    marketName: `Away Win: ${awayTeam} (2)`,
    category: 'RESULT',
    probability: awayWinProb,
    confidenceScore: awayWinProb,
    signalGrade: awayWinGrade,
    badgeText: getBadge(awayWinGrade, `${awayWinProb}% Probability`),
    fairOdds: Number((100 / Math.max(1, awayWinProb)).toFixed(2)),
    keyReasons: [
      `${awayTeam} quality index: ${awayStats.priorityStars}★ ${awayStats.tier ? `• ${awayStats.tier}` : ''}`,
      awayStats.avgGoalsFor >= 1.5 ? `${awayTeam} averages ${awayStats.avgGoalsFor} goals per away outing` : `Tactical travel setup`,
    ],
    riskFactors: [
      `Hostile away environment at ${venue}`,
      homeStats.cleanSheetRate > 35 ? `${homeTeam} difficult to breach at home` : '',
    ].filter(Boolean),
    isTopPick: awayWinProb >= 62,
  });

  // -------------------------------------------------------------
  // 9. DRAW (X)
  // -------------------------------------------------------------
  const drawProb = Math.min(
    42,
    Math.max(
      12,
      Math.round(
        26 +
          (Math.abs(homeWinProb - awayWinProb) <= 12 ? 8 : -8) +
          (h2h.draws > 0 ? 5 : 0) +
          (totalXG <= 2.2 ? 6 : -4)
      )
    )
  );
  const drawGrade = getGrade(drawProb * 2); // adjusted scale for draw
  signals.push({
    id: 'draw',
    marketName: 'Draw (X)',
    category: 'RESULT',
    probability: drawProb,
    confidenceScore: drawProb,
    signalGrade: drawGrade,
    badgeText: getBadge(drawGrade, `${drawProb}% Probability`),
    fairOdds: Number((100 / drawProb).toFixed(2)),
    keyReasons: [
      `Balanced matchup rating between sides`,
      totalXG <= 2.5 ? `Low expected goal margin (${Math.abs(homeXG - awayXG).toFixed(2)}) favors level outcome` : `Tight competitive setup`,
    ],
    riskFactors: [
      `Draw is statistically the most fragile single match outcome`,
    ],
    isTopPick: drawProb >= 32,
  });

  // -------------------------------------------------------------
  // 10. DOUBLE CHANCE 1X (Home or Draw)
  // -------------------------------------------------------------
  const dc1XProb = Math.min(96, Math.max(30, Math.round(homeWinProb + drawProb * 0.85)));
  const dc1XGrade = getGrade(dc1XProb);
  signals.push({
    id: 'double_chance_1x',
    marketName: `Double Chance (1X - ${homeTeam} or Draw)`,
    category: 'DOUBLE_CHANCE',
    probability: dc1XProb,
    confidenceScore: dc1XProb,
    signalGrade: dc1XGrade,
    badgeText: getBadge(dc1XGrade, `${dc1XProb}% Safety Rating`),
    fairOdds: Number((100 / dc1XProb).toFixed(2)),
    keyReasons: [
      `High-safety cover protecting both ${homeTeam} victory and drawn result`,
      `${homeTeam} rarely suffers home defeat when properly favored`,
    ],
    riskFactors: [
      awayWinProb > 45 ? `${awayTeam} possesses genuine firepower to break host fortress` : '',
    ].filter(Boolean),
    isTopPick: dc1XProb >= 78,
  });

  // -------------------------------------------------------------
  // 11. DOUBLE CHANCE X2 (Draw or Away)
  // -------------------------------------------------------------
  const dcX2Prob = Math.min(96, Math.max(30, Math.round(awayWinProb + drawProb * 0.85)));
  const dcX2Grade = getGrade(dcX2Prob);
  signals.push({
    id: 'double_chance_x2',
    marketName: `Double Chance (X2 - Draw or ${awayTeam})`,
    category: 'DOUBLE_CHANCE',
    probability: dcX2Prob,
    confidenceScore: dcX2Prob,
    signalGrade: dcX2Grade,
    badgeText: getBadge(dcX2Grade, `${dcX2Prob}% Safety Rating`),
    fairOdds: Number((100 / dcX2Prob).toFixed(2)),
    keyReasons: [
      `Covers both away win and stalemate conditions`,
      `${awayTeam} brings formidable traveling pedigree`,
    ],
    riskFactors: [
      homeWinProb > 50 ? `${homeTeam} strong venue momentum` : '',
    ].filter(Boolean),
    isTopPick: dcX2Prob >= 78,
  });

  // -------------------------------------------------------------
  // 12. FIRST HALF GOAL (Over 0.5 First Half)
  // -------------------------------------------------------------
  const fhGoalProb = Math.min(
    95,
    Math.max(
      35,
      Math.round(62 + (totalXG >= 2.6 ? 15 : totalXG >= 2.2 ? 6 : -10) + (bttsProb >= 65 ? 8 : 0))
    )
  );
  const fhGrade = getGrade(fhGoalProb);
  signals.push({
    id: 'fh_goal',
    marketName: 'First Half Goal (Over 0.5 Goals in 1st Half)',
    category: 'SPECIAL',
    probability: fhGoalProb,
    confidenceScore: fhGoalProb,
    signalGrade: fhGrade,
    badgeText: getBadge(fhGrade, `${fhGoalProb}% Probability`),
    fairOdds: Number((100 / fhGoalProb).toFixed(2)),
    keyReasons: [
      `High early tempo expected from opening whistle`,
      `Combined attacking volume (${totalXG} total xG) supports early breakthrough`,
    ],
    riskFactors: [
      totalXG < 2.0 ? `Slow-tempo tactical feeling-out period in opening 30 mins` : '',
    ].filter(Boolean),
    isTopPick: fhGoalProb >= 80,
  });

  // Sort signals by probability / confidence descending
  signals.sort((a, b) => b.probability - a.probability);

  // Determine top 3-4 best signals
  const topSignals = signals
    .filter((s) => s.isTopPick || s.signalGrade === 'STRONG' || s.signalGrade === 'SOLID')
    .slice(0, 4);

  return {
    homeTeam,
    awayTeam,
    venue,
    homeStats,
    awayStats,
    h2h,
    hasSavedData: true,
    homeExpectedGoals: homeXG,
    awayExpectedGoals: awayXG,
    totalExpectedGoals: totalXG,
    projectedScore,
    allSignals: signals,
    topSignals: topSignals.length > 0 ? topSignals : signals.slice(0, 3),
    dataConfidenceLevel,
    totalDataSourceMatches: totalMatchesTracked + h2h.totalMatches,
    preMatchNote: preNote,
    savedAnalysisScore: savedRecord?.totalWeightedScore,
  };
}
