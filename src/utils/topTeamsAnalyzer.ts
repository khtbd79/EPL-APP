import { AppState, TopTeamAnalysis, TopTeamsAnalysisReport, TierLevel } from '../types';
import { ALL_EPL_20_TEAMS } from './teamData';

/**
 * Analyzes all user-recorded EPL data (matches, weekly category rankings, pre-match notes)
 * and generates an analytical Top 5 Teams report with each team's single best attribute.
 *
 * STRICT RULE: If no data has been recorded for a team, it is NEVER included.
 * No demo or placeholder team data is ever generated.
 */
export function analyzeTop5Teams(state: AppState): TopTeamsAnalysisReport {
  const matches = state.eplMatches || [];
  const categoryRankings = state.categoryRankings || {};
  const preMatchNotes = state.preMatchNotes || {};
  const currentMatchweek = state.currentMatchweek || 1;

  // 1. Identify the latest category ranking week available
  const rankingWeeks = Object.keys(categoryRankings)
    .map(Number)
    .filter((n) => !isNaN(n))
    .sort((a, b) => b - a);

  const latestCategoryWeek = rankingWeeks.length > 0 ? categoryRankings[rankingWeeks[0]] : null;

  // 2. Evaluate only teams with actual recorded data
  const evaluatedTeams: (TopTeamAnalysis & { hasData: boolean })[] = [];

  ALL_EPL_20_TEAMS.forEach((team) => {
    const cleanName = team.name.toLowerCase().trim();

    // Matches involving this team
    const teamMatches = matches.filter(
      (m) =>
        m.homeTeam.toLowerCase().trim() === cleanName ||
        m.awayTeam.toLowerCase().trim() === cleanName
    );

    const homeMatches = matches.filter(
      (m) => m.homeTeam.toLowerCase().trim() === cleanName
    );
    const awayMatches = matches.filter(
      (m) => m.awayTeam.toLowerCase().trim() === cleanName
    );

    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;
    let bttsCount = 0;
    let cleanSheets = 0;
    let over25Count = 0;
    let over15Count = 0;
    let under25Count = 0;
    let under35Count = 0;
    let htOver05Count = 0;

    teamMatches.forEach((m) => {
      const isHome = m.homeTeam.toLowerCase().trim() === cleanName;
      const myGoals = isHome ? m.homeScore : m.awayScore;
      const oppGoals = isHome ? m.awayScore : m.homeScore;
      const totalMatchGoals = m.homeScore + m.awayScore;

      goalsFor += myGoals;
      goalsAgainst += oppGoals;

      if (myGoals > oppGoals) wins++;
      else if (myGoals === oppGoals) draws++;
      else losses++;

      if (myGoals > 0 && oppGoals > 0) bttsCount++;
      if (oppGoals === 0) cleanSheets++;
      if (totalMatchGoals >= 3) over25Count++;
      if (totalMatchGoals >= 2) over15Count++;
      if (totalMatchGoals <= 2) under25Count++;
      if (totalMatchGoals <= 3) under35Count++;
      if ((m.halfTimeHomeScore ?? 0) + (m.halfTimeAwayScore ?? 0) >= 1) htOver05Count++;
    });

    let homeWins = 0;
    homeMatches.forEach((m) => {
      if (m.homeScore > m.awayScore) homeWins++;
    });

    let awayWins = 0;
    awayMatches.forEach((m) => {
      if (m.awayScore > m.homeScore) awayWins++;
    });

    const matchesPlayed = teamMatches.length;
    const points = wins * 3 + draws * 1;
    const goalDifference = goalsFor - goalsAgainst;
    const winRate = matchesPlayed > 0 ? (wins / matchesPlayed) * 100 : 0;
    const bttsRate = matchesPlayed > 0 ? (bttsCount / matchesPlayed) * 100 : 0;
    const cleanSheetRate = matchesPlayed > 0 ? (cleanSheets / matchesPlayed) * 100 : 0;
    const over25Rate = matchesPlayed > 0 ? (over25Count / matchesPlayed) * 100 : 0;
    const homeWinRate = homeMatches.length > 0 ? (homeWins / homeMatches.length) * 100 : 0;
    const awayWinRate = awayMatches.length > 0 ? (awayWins / awayMatches.length) * 100 : 0;
    const avgGoalsScored = matchesPlayed > 0 ? Number((goalsFor / matchesPlayed).toFixed(2)) : 0;
    const avgGoalsConceded = matchesPlayed > 0 ? Number((goalsAgainst / matchesPlayed).toFixed(2)) : 0;

    // Check category rankings
    let tier: TierLevel | undefined = undefined;
    let categoryPosition: number | undefined = undefined;
    if (latestCategoryWeek?.rankings) {
      const found = latestCategoryWeek.rankings.find(
        (r) => r.teamName.toLowerCase().trim() === cleanName
      );
      if (found) {
        tier = found.tier;
        categoryPosition = found.position;
      }
    }

    // Pre-match notes
    const note = preMatchNotes[team.name] || preMatchNotes[team.shortName];
    const userKeyStrengths = note?.keyStrengths?.trim();
    const userBettingAngle = note?.bettingAngle?.trim();
    const tacticalStyle = note?.tacticalStyle?.trim();
    const hasNotes = !!(
      userKeyStrengths ||
      userBettingAngle ||
      tacticalStyle ||
      note?.homePerformance ||
      note?.awayPerformance
    );

    // STRICT CHECK: Does this team have real data?
    const hasData = matchesPlayed > 0 || categoryPosition !== undefined || hasNotes;
    if (!hasData) {
      // Do NOT include teams with no recorded user data!
      return;
    }

    // Composite score based STRICTLY on real data
    let compositeScore = 0;
    if (matchesPlayed > 0) {
      compositeScore += points * 10;
      compositeScore += goalDifference * 3;
      compositeScore += winRate * 0.8;
      compositeScore += cleanSheetRate * 0.4;
      compositeScore += avgGoalsScored * 5;
    }

    if (categoryPosition !== undefined) {
      compositeScore += (21 - categoryPosition) * 4;
    }
    if (tier === 'TIER_1') compositeScore += 30;
    else if (tier === 'TIER_2') compositeScore += 15;

    // Determine Best Aspect based on actual metrics
    let bestAspectTag: 'ATTACK' | 'DEFENSE' | 'HOME_FORTRESS' | 'BTTS_HIGH_SCORING' | 'FORM_CONTROL' =
      'FORM_CONTROL';
    let bestAspectTitle = 'Tactical Discipline & Match Control';
    let bestAspectSummary =
      'Disciplined midfield organization and balanced transition between offense and defense.';

    if (matchesPlayed >= 2 && cleanSheetRate >= 50 && avgGoalsConceded <= 0.8) {
      bestAspectTag = 'DEFENSE';
      bestAspectTitle = 'Rock-Solid Defense & Clean Sheets';
      bestAspectSummary = `Organized defensive structure conceding only ${avgGoalsConceded} goals per match with a ${cleanSheetRate.toFixed(0)}% clean sheet rate.`;
    } else if (matchesPlayed >= 2 && (avgGoalsScored >= 2.0 || (over25Rate >= 65 && goalsFor >= 5))) {
      bestAspectTag = 'ATTACK';
      bestAspectTitle = 'Clinical Attack & High Goal Output';
      bestAspectSummary = `Sharp attacking efficiency, averaging ${avgGoalsScored} goals per match.`;
    } else if (homeMatches.length >= 2 && homeWinRate >= 75) {
      bestAspectTag = 'HOME_FORTRESS';
      bestAspectTitle = 'Home Venue Dominance';
      bestAspectSummary = `Dominant home presence with a ${homeWinRate.toFixed(0)}% home win rate.`;
    } else if (matchesPlayed >= 2 && bttsRate >= 65) {
      bestAspectTag = 'BTTS_HIGH_SCORING';
      bestAspectTitle = 'High-Scoring Consistency & BTTS';
      bestAspectSummary = `Consistently involved in dynamic end-to-end matches, registering BTTS YES in ${bttsRate.toFixed(0)}% of fixtures.`;
    } else if (matchesPlayed >= 2 && winRate >= 60) {
      bestAspectTag = 'FORM_CONTROL';
      bestAspectTitle = 'Elite Match Control & 3-Point Conversion';
      bestAspectSummary = `Consistent match-winning ability under pressure with a ${winRate.toFixed(0)}% win rate.`;
    } else if (tier === 'TIER_1') {
      bestAspectTag = 'FORM_CONTROL';
      bestAspectTitle = 'Tier 1 Quality & High Consistency';
      bestAspectSummary = 'Ranked as an elite tier contender with superior squad balance and tactical depth.';
    }

    if (userKeyStrengths) {
      bestAspectSummary += ` (${userKeyStrengths})`;
    }

    // Determine which market has the highest recorded hit-rate for this team
    let topMarket = 'Win';
    let topMarketRate = winRate;
    if (matchesPlayed > 0) {
      const candidateMarkets = [
        { name: 'Win', rate: winRate },
        { name: 'Clean Sheet', rate: cleanSheetRate },
        { name: 'BTTS', rate: bttsRate },
        { name: 'Over 1.5', rate: (over15Count / matchesPlayed) * 100 },
        { name: 'Over 2.5', rate: over25Rate },
        { name: 'Under 2.5', rate: (under25Count / matchesPlayed) * 100 },
        { name: 'Under 3.5', rate: (under35Count / matchesPlayed) * 100 },
        { name: 'HT Over 0.5', rate: (htOver05Count / matchesPlayed) * 100 },
      ];
      candidateMarkets.sort((a, b) => b.rate - a.rate);
      topMarket = candidateMarkets[0].name;
      topMarketRate = Number(candidateMarkets[0].rate.toFixed(1));
    }

    evaluatedTeams.push({
      rank: 0,
      teamName: team.name,
      shortName: team.shortName,
      stadium: team.stadium,
      matchesPlayed,
      wins,
      draws,
      losses,
      points,
      goalsFor,
      goalsAgainst,
      goalDifference,
      winRate: Number(winRate.toFixed(1)),
      bttsRate: Number(bttsRate.toFixed(1)),
      cleanSheetRate: Number(cleanSheetRate.toFixed(1)),
      over25Rate: Number(over25Rate.toFixed(1)),
      homeWinRate: Number(homeWinRate.toFixed(1)),
      awayWinRate: Number(awayWinRate.toFixed(1)),
      avgGoalsScored,
      avgGoalsConceded,
      bestAspectTitle,
      bestAspectTitleEn: bestAspectTitle,
      bestAspectSummary,
      bestAspectTag,
      userKeyStrengths,
      userBettingAngle,
      tacticalStyle,
      recommendedMarkets: team.primaryMarkets || ['Win', 'Over 1.5'],
      topMarket,
      topMarketRate,
      tier,
      categoryPosition,
      compositeScore,
      hasData: true,
    });
  });

  // Sort strictly by compositeScore (descending), then points, then goalDifference
  evaluatedTeams.sort((a, b) => {
    if (b.compositeScore !== a.compositeScore) {
      return b.compositeScore - a.compositeScore;
    }
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }
    return b.goalsFor - a.goalsFor;
  });

  // Take up to 5 teams with real data
  const topTeams: TopTeamAnalysis[] = evaluatedTeams.slice(0, 5).map((t, idx) => ({
    ...t,
    rank: idx + 1,
  }));

  const totalMatchesAnalyzed = matches.length;
  const totalTeamsRanked = evaluatedTeams.length;

  let executiveSummary = '';
  if (topTeams.length === 0) {
    executiveSummary = 'No team data recorded yet. Record match scores or category rankings to view analysis.';
  } else if (totalMatchesAnalyzed > 0) {
    executiveSummary = `Top teams evaluated from ${totalMatchesAnalyzed} recorded EPL matches, category rankings, and tactical notes.`;
  } else {
    executiveSummary = 'Top teams evaluated from recorded category rankings and pre-match tactical notes.';
  }

  return {
    generatedAt: new Date().toISOString(),
    currentMatchweek,
    totalMatchesAnalyzed,
    totalTeamsRanked,
    topTeams,
    executiveSummary,
  };
}
