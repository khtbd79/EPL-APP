import {
  TeamAnalyzerStats,
  HomeAwayStrengthStats,
  BTTSDedicatedStats,
  H2HEntry,
  FactorScores,
  MarketOdds,
  SavedAnalysisRecord,
  EPLMatchEvent
} from '../types';

export interface EPLTeamInfo {
  id: string;
  name: string;
  fullName: string;
  shortName: string;
  stadium: string;
  city: string;
  capacity?: number;
  priorityStars: number;
  priorityLabel: string;
  primaryMarkets: string[];
  secondaryMarkets: string[];
}

export const ALL_EPL_20_TEAMS: EPLTeamInfo[] = [
  {
    id: 'ars',
    name: 'Arsenal',
    fullName: 'Arsenal FC',
    shortName: 'Arsenal',
    stadium: 'Emirates Stadium',
    city: 'London',
    capacity: 60704,
    priorityStars: 5,
    priorityLabel: '★★★★★',
    primaryMarkets: ['Win', 'Over 1.5'],
    secondaryMarkets: ['BTTS YES', 'Clean Sheet']
  },
  {
    id: 'avl',
    name: 'Aston Villa',
    fullName: 'Aston Villa FC',
    shortName: 'Aston Villa',
    stadium: 'Villa Park',
    city: 'Birmingham',
    capacity: 42682,
    priorityStars: 5,
    priorityLabel: '★★★★★',
    primaryMarkets: ['BTTS YES', 'Over 2.5'],
    secondaryMarkets: ['Win', 'AH 0']
  },
  {
    id: 'bou',
    name: 'Bournemouth',
    fullName: 'AFC Bournemouth',
    shortName: 'Bournemouth',
    stadium: 'Vitality Stadium (Dean Court)',
    city: 'Bournemouth',
    capacity: 11307,
    priorityStars: 4,
    priorityLabel: '★★★★☆',
    primaryMarkets: ['BTTS YES', 'Over 2.5'],
    secondaryMarkets: ['1X / Double Chance', 'AH +0.5']
  },
  {
    id: 'bre',
    name: 'Brentford',
    fullName: 'Brentford FC',
    shortName: 'Brentford',
    stadium: 'Gtech Community Stadium',
    city: 'London',
    capacity: 17250,
    priorityStars: 4,
    priorityLabel: '★★★★☆',
    primaryMarkets: ['BTTS YES', 'Over 1.5'],
    secondaryMarkets: ['1X', 'AH 0']
  },
  {
    id: 'bha',
    name: 'Brighton & Hove Albion',
    fullName: 'Brighton & Hove Albion FC',
    shortName: 'Brighton & Hove Albion',
    stadium: 'American Express Stadium (Amex)',
    city: 'Brighton',
    capacity: 31800,
    priorityStars: 4,
    priorityLabel: '★★★★☆',
    primaryMarkets: ['Over 2.5', 'BTTS YES'],
    secondaryMarkets: ['Win', 'Over 3.5']
  },
  {
    id: 'che',
    name: 'Chelsea',
    fullName: 'Chelsea FC',
    shortName: 'Chelsea',
    stadium: 'Stamford Bridge',
    city: 'London',
    capacity: 40343,
    priorityStars: 5,
    priorityLabel: '★★★★★',
    primaryMarkets: ['Over 2.5', 'BTTS YES'],
    secondaryMarkets: ['Win', 'AH -0.5']
  },
  {
    id: 'cry',
    name: 'Crystal Palace',
    fullName: 'Crystal Palace FC',
    shortName: 'Crystal Palace',
    stadium: 'Selhurst Park',
    city: 'London',
    capacity: 25486,
    priorityStars: 4,
    priorityLabel: '★★★★☆',
    primaryMarkets: ['BTTS YES', 'Under 3.5'],
    secondaryMarkets: ['1X', 'AH +0.5']
  },
  {
    id: 'eve',
    name: 'Everton',
    fullName: 'Everton FC',
    shortName: 'Everton',
    stadium: 'Goodison Park',
    city: 'Liverpool',
    capacity: 39572,
    priorityStars: 4,
    priorityLabel: '★★★★☆',
    primaryMarkets: ['Under 2.5', '1X Home'],
    secondaryMarkets: ['BTTS NO', 'AH +0.5']
  },
  {
    id: 'ful',
    name: 'Fulham',
    fullName: 'Fulham FC',
    shortName: 'Fulham',
    stadium: 'Craven Cottage',
    city: 'London',
    capacity: 25700,
    priorityStars: 4,
    priorityLabel: '★★★★☆',
    primaryMarkets: ['BTTS YES', 'Over 2.5'],
    secondaryMarkets: ['1X', 'AH 0']
  },
  {
    id: 'cov',
    name: 'Coventry City',
    fullName: 'Coventry City FC',
    shortName: 'Coventry City',
    stadium: 'Coventry Building Society Arena',
    city: 'Coventry',
    capacity: 32609,
    priorityStars: 3,
    priorityLabel: '★★★☆☆',
    primaryMarkets: ['BTTS YES', '1X Home'],
    secondaryMarkets: ['Over 1.5', 'AH +1.0']
  },
  {
    id: 'ips',
    name: 'Ipswich Town',
    fullName: 'Ipswich Town FC',
    shortName: 'Ipswich Town',
    stadium: 'Portman Road',
    city: 'Ipswich',
    capacity: 30014,
    priorityStars: 3,
    priorityLabel: '★★★☆☆',
    primaryMarkets: ['BTTS YES', 'Over 2.5'],
    secondaryMarkets: ['AH +1.5', '1X']
  },
  {
    id: 'hul',
    name: 'Hull City',
    fullName: 'Hull City AFC',
    shortName: 'Hull City',
    stadium: 'MKM Stadium',
    city: 'Kingston upon Hull',
    capacity: 25586,
    priorityStars: 3,
    priorityLabel: '★★★☆☆',
    primaryMarkets: ['BTTS YES', '1X'],
    secondaryMarkets: ['Over 1.5', 'AH +1.0']
  },
  {
    id: 'liv',
    name: 'Liverpool',
    fullName: 'Liverpool FC',
    shortName: 'Liverpool',
    stadium: 'Anfield',
    city: 'Liverpool',
    capacity: 61276,
    priorityStars: 5,
    priorityLabel: '★★★★★',
    primaryMarkets: ['Win', 'Over 2.5'],
    secondaryMarkets: ['BTTS YES', 'AH -1.5']
  },
  {
    id: 'mci',
    name: 'Manchester City',
    fullName: 'Manchester City FC',
    shortName: 'Manchester City',
    stadium: 'Etihad Stadium',
    city: 'Manchester',
    capacity: 53400,
    priorityStars: 5,
    priorityLabel: '★★★★★',
    primaryMarkets: ['Win', 'Over 2.5'],
    secondaryMarkets: ['BTTS YES', 'AH -1.5']
  },
  {
    id: 'mun',
    name: 'Manchester United',
    fullName: 'Manchester United FC',
    shortName: 'Manchester United',
    stadium: 'Old Trafford',
    city: 'Manchester',
    capacity: 74310,
    priorityStars: 5,
    priorityLabel: '★★★★★',
    primaryMarkets: ['BTTS YES', 'Over 2.5'],
    secondaryMarkets: ['Win', '1X']
  },
  {
    id: 'new',
    name: 'Newcastle United',
    fullName: 'Newcastle United FC',
    shortName: 'Newcastle United',
    stadium: "St. James' Park",
    city: 'Newcastle upon Tyne',
    capacity: 52305,
    priorityStars: 5,
    priorityLabel: '★★★★★',
    primaryMarkets: ['BTTS YES', 'Over 2.5'],
    secondaryMarkets: ['1X Home', 'Win']
  },
  {
    id: 'for',
    name: 'Nottingham Forest',
    fullName: 'Nottingham Forest FC',
    shortName: 'Nottingham Forest',
    stadium: 'City Ground',
    city: 'Nottingham',
    capacity: 30445,
    priorityStars: 4,
    priorityLabel: '★★★★☆',
    primaryMarkets: ['1X Home', 'Under 3.5'],
    secondaryMarkets: ['BTTS YES', 'AH +0.5']
  },
  {
    id: 'lee',
    name: 'Leeds United',
    fullName: 'Leeds United FC',
    shortName: 'Leeds United',
    stadium: 'Elland Road',
    city: 'Leeds',
    capacity: 37890,
    priorityStars: 4,
    priorityLabel: '★★★★☆',
    primaryMarkets: ['BTTS YES', 'Over 2.5'],
    secondaryMarkets: ['1X Home', 'AH 0']
  },
  {
    id: 'tot',
    name: 'Tottenham Hotspur',
    fullName: 'Tottenham Hotspur FC',
    shortName: 'Tottenham Hotspur',
    stadium: 'Tottenham Hotspur Stadium',
    city: 'London',
    capacity: 62850,
    priorityStars: 5,
    priorityLabel: '★★★★★',
    primaryMarkets: ['Over 2.5', 'BTTS YES'],
    secondaryMarkets: ['Win', 'Over 3.5']
  },
  {
    id: 'sun',
    name: 'Sunderland',
    fullName: 'Sunderland AFC',
    shortName: 'Sunderland',
    stadium: 'Stadium of Light',
    city: 'Sunderland',
    capacity: 49000,
    priorityStars: 3,
    priorityLabel: '★★★☆☆',
    primaryMarkets: ['1X Home', 'BTTS YES'],
    secondaryMarkets: ['Under 2.5', 'AH +1.0']
  },
];

export const ALL_EPL_TEAM_NAMES: string[] = ALL_EPL_20_TEAMS.map((t) => t.name);

// 20 EPL Teams Stadiums list in requested format e.g. "Arsenal (Emirates Stadium)"
export const EPL_20_STADIUM_OPTIONS: string[] = ALL_EPL_20_TEAMS.map(
  (t) => `${t.name} (${t.stadium})`
);

// Compatibility alias
export const EPL_TEAMS_POOL = ALL_EPL_20_TEAMS;
export const EPL_TEAM_NAMES = ALL_EPL_TEAM_NAMES;

// Additional Premier League Stadiums mapping for aliases / extra teams
const ADDITIONAL_STADIUMS_MAP: Record<string, { stadium: string; city: string; capacity: number }> = {
  'west ham': { stadium: 'London Stadium', city: 'London', capacity: 62500 },
  'wolves': { stadium: 'Molineux Stadium', city: 'Wolverhampton', capacity: 31750 },
  'wolverhampton': { stadium: 'Molineux Stadium', city: 'Wolverhampton', capacity: 31750 },
  'wolverhampton wanderers': { stadium: 'Molineux Stadium', city: 'Wolverhampton', capacity: 31750 },
  'leicester': { stadium: 'King Power Stadium', city: 'Leicester', capacity: 32261 },
  'leicester city': { stadium: 'King Power Stadium', city: 'Leicester', capacity: 32261 },
  'southampton': { stadium: "St Mary's Stadium", city: 'Southampton', capacity: 32384 },
  'luton': { stadium: 'Kenilworth Road', city: 'Luton', capacity: 11500 },
  'luton town': { stadium: 'Kenilworth Road', city: 'Luton', capacity: 11500 },
  'burnley': { stadium: 'Turf Moor', city: 'Burnley', capacity: 21944 },
  'sheffield united': { stadium: 'Bramall Lane', city: 'Sheffield', capacity: 32050 },
};

export interface TeamGroundDetail {
  teamName: string;
  stadium: string;
  city: string;
  capacity?: number;
  venueLabel: string;
}

// Standardized alias mapping so historical abbreviations and colloquial team names resolve to official full names
export const HISTORICAL_TEAM_ALIASES: Record<string, string> = {
  'ars': 'Arsenal',
  'arsenal': 'Arsenal',
  'arsenal fc': 'Arsenal',
  'avl': 'Aston Villa',
  'aston villa': 'Aston Villa',
  'aston villa fc': 'Aston Villa',
  'villa': 'Aston Villa',
  'bou': 'Bournemouth',
  'afc bournemouth': 'Bournemouth',
  'bournemouth': 'Bournemouth',
  'bournemouth fc': 'Bournemouth',
  'bre': 'Brentford',
  'brentford': 'Brentford',
  'brentford fc': 'Brentford',
  'bha': 'Brighton & Hove Albion',
  'brighton': 'Brighton & Hove Albion',
  'brighton & hove': 'Brighton & Hove Albion',
  'brighton and hove albion': 'Brighton & Hove Albion',
  'brighton & hove albion fc': 'Brighton & Hove Albion',
  'che': 'Chelsea',
  'chelsea': 'Chelsea',
  'chelsea fc': 'Chelsea',
  'cry': 'Crystal Palace',
  'palace': 'Crystal Palace',
  'crystal palace': 'Crystal Palace',
  'crystal palace fc': 'Crystal Palace',
  'eve': 'Everton',
  'everton': 'Everton',
  'everton fc': 'Everton',
  'ful': 'Fulham',
  'fulham': 'Fulham',
  'fulham fc': 'Fulham',
  'hul': 'Hull City',
  'hull': 'Hull City',
  'hull city': 'Hull City',
  'hull city afc': 'Hull City',
  'ips': 'Ipswich Town',
  'ipswich': 'Ipswich Town',
  'ipswich town': 'Ipswich Town',
  'ipswich town fc': 'Ipswich Town',
  'lee': 'Leeds United',
  'leeds': 'Leeds United',
  'leeds united': 'Leeds United',
  'leeds united fc': 'Leeds United',
  'liv': 'Liverpool',
  'liverpool': 'Liverpool',
  'liverpool fc': 'Liverpool',
  'mci': 'Manchester City',
  'man city': 'Manchester City',
  'manchester city': 'Manchester City',
  'manchester city fc': 'Manchester City',
  'mun': 'Manchester United',
  'man utd': 'Manchester United',
  'man united': 'Manchester United',
  'manchester united': 'Manchester United',
  'manchester united fc': 'Manchester United',
  'new': 'Newcastle United',
  'newcastle': 'Newcastle United',
  'newcastle united': 'Newcastle United',
  'newcastle united fc': 'Newcastle United',
  'for': 'Nottingham Forest',
  'forest': 'Nottingham Forest',
  'nottingham': 'Nottingham Forest',
  'nottingham forest': 'Nottingham Forest',
  'nottingham forest fc': 'Nottingham Forest',
  'sun': 'Sunderland',
  'sunderland': 'Sunderland',
  'sunderland afc': 'Sunderland',
  'tot': 'Tottenham Hotspur',
  'tottenham': 'Tottenham Hotspur',
  'tottenham hotspur': 'Tottenham Hotspur',
  'tottenham hotspur fc': 'Tottenham Hotspur',
  'spurs': 'Tottenham Hotspur',
  'cov': 'Coventry City',
  'coventry': 'Coventry City',
  'coventry city': 'Coventry City',
  'coventry city fc': 'Coventry City',
};

export const normalizeTeamName = (rawName: string): string => {
  if (!rawName) return '';
  const clean = rawName.trim().toLowerCase();
  if (HISTORICAL_TEAM_ALIASES[clean]) {
    return HISTORICAL_TEAM_ALIASES[clean];
  }

  // Check direct match against ALL_EPL_20_TEAMS name, fullName, shortName, id
  const directMatch = ALL_EPL_20_TEAMS.find(
    (t) =>
      t.name.toLowerCase() === clean ||
      t.fullName.toLowerCase() === clean ||
      t.shortName.toLowerCase() === clean ||
      t.id.toLowerCase() === clean
  );
  if (directMatch) {
    return directMatch.name;
  }

  // Check stripped common prefixes or suffixes
  const stripped = clean
    .replace(/^afc\s+/i, '')
    .replace(/\s+(fc|afc)$/i, '')
    .trim();

  if (HISTORICAL_TEAM_ALIASES[stripped]) {
    return HISTORICAL_TEAM_ALIASES[stripped];
  }

  const strippedMatch = ALL_EPL_20_TEAMS.find(
    (t) =>
      t.name.toLowerCase() === stripped ||
      t.fullName.toLowerCase() === stripped ||
      t.shortName.toLowerCase() === stripped
  );
  if (strippedMatch) {
    return strippedMatch.name;
  }

  return rawName.trim();
};

export const getTeamStadium = (teamName: string): string => {
  if (!teamName) return 'Home Ground';
  const clean = normalizeTeamName(teamName).toLowerCase();
  const rawClean = teamName.trim().toLowerCase();
  const found = ALL_EPL_20_TEAMS.find(
    (t) =>
      t.name.toLowerCase() === clean ||
      t.fullName.toLowerCase() === clean ||
      t.name.toLowerCase() === rawClean ||
      t.fullName.toLowerCase() === rawClean
  );
  if (found) return found.stadium;

  if (ADDITIONAL_STADIUMS_MAP[clean]) {
    return ADDITIONAL_STADIUMS_MAP[clean].stadium;
  }
  if (ADDITIONAL_STADIUMS_MAP[rawClean]) {
    return ADDITIONAL_STADIUMS_MAP[rawClean].stadium;
  }

  return `${normalizeTeamName(teamName)} Home Stadium`;
};

export const getTeamGroundDetails = (teamName: string): TeamGroundDetail => {
  if (!teamName) {
    return {
      teamName: '',
      stadium: 'Home Ground',
      city: 'England',
      venueLabel: 'Home Ground',
    };
  }

  const clean = normalizeTeamName(teamName).toLowerCase();
  const rawClean = teamName.trim().toLowerCase();
  const found = ALL_EPL_20_TEAMS.find(
    (t) =>
      t.name.toLowerCase() === clean ||
      t.fullName.toLowerCase() === clean ||
      t.name.toLowerCase() === rawClean ||
      t.fullName.toLowerCase() === rawClean
  );

  if (found) {
    return {
      teamName: found.name,
      stadium: found.stadium,
      city: found.city,
      capacity: found.capacity,
      venueLabel: `${found.name} Home Ground: ${found.stadium} (${found.city})${found.capacity ? ` • Capacity: ${found.capacity.toLocaleString()}` : ''}`,
    };
  }

  if (ADDITIONAL_STADIUMS_MAP[clean] || ADDITIONAL_STADIUMS_MAP[rawClean]) {
    const extra = ADDITIONAL_STADIUMS_MAP[clean] || ADDITIONAL_STADIUMS_MAP[rawClean];
    return {
      teamName: normalizeTeamName(teamName),
      stadium: extra.stadium,
      city: extra.city,
      capacity: extra.capacity,
      venueLabel: `${normalizeTeamName(teamName)} Home Ground: ${extra.stadium} (${extra.city}) • Capacity: ${extra.capacity.toLocaleString()}`,
    };
  }

  const resolvedName = normalizeTeamName(teamName);
  return {
    teamName: resolvedName,
    stadium: `${resolvedName} Stadium`,
    city: 'England',
    venueLabel: `${resolvedName} Home Ground`,
  };
};

export const getTeamInfo = (teamName: string): EPLTeamInfo | undefined => {
  if (!teamName) return undefined;
  const clean = normalizeTeamName(teamName).toLowerCase();
  const rawClean = teamName.trim().toLowerCase();
  return ALL_EPL_20_TEAMS.find(
    (t) =>
      t.name.toLowerCase() === clean ||
      t.fullName.toLowerCase() === clean ||
      t.name.toLowerCase() === rawClean ||
      t.fullName.toLowerCase() === rawClean
  );
};

// Standings calculations from entered match results
export interface TeamStandingData {
  position: number;
  team: string;
  shortName: string;
  stadium: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  homePlayed: number;
  homeWon: number;
  homeDrawn: number;
  homeLost: number;
  homeGF: number;
  homeGA: number;
  awayPlayed: number;
  awayWon: number;
  awayDrawn: number;
  awayLost: number;
  awayGF: number;
  awayGA: number;
  cleanSheets: number;
  bttsMatches: number;
  over25Matches: number;
  form: ('W' | 'D' | 'L')[];
}

/**
 * Sanitizes and deduplicates EPL matches.
 * Rules:
 * 1. Normalizes all team names to official EPL team names.
 * 2. Filters out any matches where homeTeam == awayTeam.
 * 3. CRITICAL: In any given Matchweek, each team can play AT MOST ONE match!
 *    If duplicate records exist for the same matchweek (e.g. from previous bugs or multiple edits),
 *    the latest/most complete record is preserved and duplicates are discarded.
 */
export const sanitizeAndDeduplicateMatches = (matches: EPLMatchEvent[]): EPLMatchEvent[] => {
  if (!Array.isArray(matches)) return [];

  const normalized: EPLMatchEvent[] = matches
    .filter((m) => m && m.homeTeam && m.awayTeam)
    .map((m) => ({
      ...m,
      homeTeam: normalizeTeamName(m.homeTeam),
      awayTeam: normalizeTeamName(m.awayTeam),
      matchweek: Number(m.matchweek) || 1,
    }))
    .filter((m) => m.homeTeam.toLowerCase().trim() !== m.awayTeam.toLowerCase().trim());

  // Sort by date / createdAt descending so the latest update takes precedence
  const sorted = [...normalized].sort((a, b) => {
    const timeA = new Date(a.createdAt || a.date || 0).getTime();
    const timeB = new Date(b.createdAt || b.date || 0).getTime();
    return timeB - timeA;
  });

  // Track teams seen per matchweek: week -> Set<teamNameLower>
  const weekTeamsSeen = new Map<number, Set<string>>();
  const deduped: EPLMatchEvent[] = [];

  for (const match of sorted) {
    const mw = match.matchweek || 1;
    if (!weekTeamsSeen.has(mw)) {
      weekTeamsSeen.set(mw, new Set());
    }
    const teamsInWeek = weekTeamsSeen.get(mw)!;
    const hKey = match.homeTeam.toLowerCase().trim();
    const aKey = match.awayTeam.toLowerCase().trim();

    // If either team has already been recorded in this matchweek, skip duplicate/conflicting entry
    if (teamsInWeek.has(hKey) || teamsInWeek.has(aKey)) {
      continue;
    }

    teamsInWeek.add(hKey);
    teamsInWeek.add(aKey);
    deduped.push(match);
  }

  // Sort back chronologically by matchweek, then date
  return deduped.sort((a, b) => {
    const mwDiff = (a.matchweek || 1) - (b.matchweek || 1);
    if (mwDiff !== 0) return mwDiff;
    return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
  });
};

export const calculateEPLStandings = (matches: EPLMatchEvent[]): TeamStandingData[] => {
  const standingsMap: Record<string, TeamStandingData> = {};

  ALL_EPL_20_TEAMS.forEach((team) => {
    standingsMap[team.name] = {
      position: 0,
      team: team.name,
      shortName: team.shortName,
      stadium: team.stadium,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      homePlayed: 0,
      homeWon: 0,
      homeDrawn: 0,
      homeLost: 0,
      homeGF: 0,
      homeGA: 0,
      awayPlayed: 0,
      awayWon: 0,
      awayDrawn: 0,
      awayLost: 0,
      awayGF: 0,
      awayGA: 0,
      cleanSheets: 0,
      bttsMatches: 0,
      over25Matches: 0,
      form: [],
    };
  });

  // Always sanitize and deduplicate to ensure each team plays at most 1 match per matchweek!
  const cleanMatches = sanitizeAndDeduplicateMatches(matches);

  // Sort matches chronologically to track form correctly
  const sortedMatches = [...cleanMatches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  sortedMatches.forEach((m) => {
    const homeTeamKey = normalizeTeamName(m.homeTeam);
    const awayTeamKey = normalizeTeamName(m.awayTeam);
    const home = standingsMap[homeTeamKey] || standingsMap[m.homeTeam];
    const away = standingsMap[awayTeamKey] || standingsMap[m.awayTeam];

    if (!home || !away) return;

    // Home team match update
    home.played += 1;
    home.homePlayed += 1;
    home.goalsFor += m.homeScore;
    home.homeGF += m.homeScore;
    home.goalsAgainst += m.awayScore;
    home.homeGA += m.awayScore;

    // Away team match update
    away.played += 1;
    away.awayPlayed += 1;
    away.goalsFor += m.awayScore;
    away.awayGF += m.awayScore;
    away.goalsAgainst += m.homeScore;
    away.awayGA += m.homeScore;

    if (m.homeScore > m.awayScore) {
      // Home Win
      home.won += 1;
      home.homeWon += 1;
      home.points += 3;
      home.form.push('W');

      away.lost += 1;
      away.awayLost += 1;
      away.form.push('L');
    } else if (m.homeScore < m.awayScore) {
      // Away Win
      away.won += 1;
      away.awayWon += 1;
      away.points += 3;
      away.form.push('W');

      home.lost += 1;
      home.homeLost += 1;
      home.form.push('L');
    } else {
      // Draw
      home.drawn += 1;
      home.homeDrawn += 1;
      home.points += 1;
      home.form.push('D');

      away.drawn += 1;
      away.awayDrawn += 1;
      away.points += 1;
      away.form.push('D');
    }

    if (m.awayScore === 0) home.cleanSheets += 1;
    if (m.homeScore === 0) away.cleanSheets += 1;

    if (m.homeScore > 0 && m.awayScore > 0) {
      home.bttsMatches += 1;
      away.bttsMatches += 1;
    }

    if (m.homeScore + m.awayScore > 2.5) {
      home.over25Matches += 1;
      away.over25Matches += 1;
    }
  });

  const list = Object.values(standingsMap).map((item) => {
    item.goalDifference = item.goalsFor - item.goalsAgainst;
    item.form = item.form.slice(-5); // Keep last 5
    return item;
  });

  // Sort by Points DESC -> Goal Difference DESC -> Goals For DESC -> Name ASC
  list.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.team.localeCompare(b.team);
  });

  list.forEach((item, index) => {
    item.position = index + 1;
  });

  return list;
};

// Calculate complete team performance profile
export interface TeamDetailedProfile {
  team: string;
  info: EPLTeamInfo;
  standing?: TeamStandingData;
  matches: EPLMatchEvent[];
  homeMatches: EPLMatchEvent[];
  awayMatches: EPLMatchEvent[];
  bttsRate: number; // percentage
  over25Rate: number; // percentage
  cleanSheetRate: number; // percentage
  failedToScoreRate: number; // percentage
  avgGoalsScored: number;
  avgGoalsConceded: number;
  winRate: number;
}

export const getTeamDetailedProfile = (teamName: string, matches: EPLMatchEvent[]): TeamDetailedProfile => {
  const resolvedName = normalizeTeamName(teamName);
  const cleanTarget = resolvedName.toLowerCase();
  const info = getTeamInfo(resolvedName) || {
    id: resolvedName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name: resolvedName,
    fullName: resolvedName,
    shortName: resolvedName,
    stadium: `${resolvedName} Stadium`,
    city: 'England',
    priorityStars: 4,
    priorityLabel: '★★★★☆',
    primaryMarkets: ['Win'],
    secondaryMarkets: ['Over 1.5']
  };

  const standings = calculateEPLStandings(matches);
  const standing = standings.find((s) => normalizeTeamName(s.team).toLowerCase() === cleanTarget);

  const teamMatches = matches.filter((m) => {
    const normHome = normalizeTeamName(m.homeTeam).toLowerCase();
    const normAway = normalizeTeamName(m.awayTeam).toLowerCase();
    return normHome === cleanTarget || normAway === cleanTarget;
  });

  const homeMatches = teamMatches.filter(
    (m) => normalizeTeamName(m.homeTeam).toLowerCase() === cleanTarget
  );
  const awayMatches = teamMatches.filter(
    (m) => normalizeTeamName(m.awayTeam).toLowerCase() === cleanTarget
  );

  const totalPlayed = teamMatches.length;
  let failedToScore = 0;
  let cleanSheets = 0;
  let bttsCount = 0;
  let over25Count = 0;
  let goalsScored = 0;
  let goalsConceded = 0;
  let wins = 0;

  teamMatches.forEach((m) => {
    const isHome = normalizeTeamName(m.homeTeam).toLowerCase() === cleanTarget;
    const teamScore = isHome ? m.homeScore : m.awayScore;
    const oppScore = isHome ? m.awayScore : m.homeScore;

    goalsScored += teamScore;
    goalsConceded += oppScore;

    if (teamScore === 0) failedToScore++;
    if (oppScore === 0) cleanSheets++;
    if (m.homeScore > 0 && m.awayScore > 0) bttsCount++;
    if (m.homeScore + m.awayScore > 2.5) over25Count++;
    if (teamScore > oppScore) wins++;
  });

  return {
    team: resolvedName,
    info,
    standing,
    matches: teamMatches,
    homeMatches,
    awayMatches,
    bttsRate: totalPlayed > 0 ? (bttsCount / totalPlayed) * 100 : 0,
    over25Rate: totalPlayed > 0 ? (over25Count / totalPlayed) * 100 : 0,
    cleanSheetRate: totalPlayed > 0 ? (cleanSheets / totalPlayed) * 100 : 0,
    failedToScoreRate: totalPlayed > 0 ? (failedToScore / totalPlayed) * 100 : 0,
    avgGoalsScored: totalPlayed > 0 ? Number((goalsScored / totalPlayed).toFixed(2)) : 0,
    avgGoalsConceded: totalPlayed > 0 ? Number((goalsConceded / totalPlayed).toFixed(2)) : 0,
    winRate: totalPlayed > 0 ? (wins / totalPlayed) * 100 : 0,
  };
};

// Calculate Head-to-Head (H2H) record between any 2 teams
export interface H2HSummary {
  teamA: string;
  teamB: string;
  totalMatches: number;
  teamAWins: number;
  teamBWins: number;
  draws: number;
  teamAGoals: number;
  teamBGoals: number;
  bttsCount: number;
  bttsRate: number;
  over25Count: number;
  matches: EPLMatchEvent[];
}

export const calculateH2H = (teamA: string, teamB: string, matches: EPLMatchEvent[]): H2HSummary => {
  const normTeamA = normalizeTeamName(teamA).toLowerCase();
  const normTeamB = normalizeTeamName(teamB).toLowerCase();

  const h2hMatches = matches.filter((m) => {
    const normHome = normalizeTeamName(m.homeTeam).toLowerCase();
    const normAway = normalizeTeamName(m.awayTeam).toLowerCase();
    return (
      (normHome === normTeamA && normAway === normTeamB) ||
      (normHome === normTeamB && normAway === normTeamA)
    );
  });

  let teamAWins = 0;
  let teamBWins = 0;
  let draws = 0;
  let teamAGoals = 0;
  let teamBGoals = 0;
  let bttsCount = 0;
  let over25Count = 0;

  h2hMatches.forEach((m) => {
    const isTeamAHome = normalizeTeamName(m.homeTeam).toLowerCase() === normTeamA;
    const aScore = isTeamAHome ? m.homeScore : m.awayScore;
    const bScore = isTeamAHome ? m.awayScore : m.homeScore;

    teamAGoals += aScore;
    teamBGoals += bScore;

    if (aScore > bScore) teamAWins++;
    else if (bScore > aScore) teamBWins++;
    else draws++;

    if (m.homeScore > 0 && m.awayScore > 0) bttsCount++;
    if (m.homeScore + m.awayScore > 2.5) over25Count++;
  });

  return {
    teamA: normalizeTeamName(teamA),
    teamB: normalizeTeamName(teamB),
    totalMatches: h2hMatches.length,
    teamAWins,
    teamBWins,
    draws,
    teamAGoals,
    teamBGoals,
    bttsCount,
    bttsRate: h2hMatches.length > 0 ? (bttsCount / h2hMatches.length) * 100 : 0,
    over25Count,
    matches: h2hMatches,
  };
};

export const FACTOR_WEIGHTS: Record<keyof FactorScores, number> = {
  homeAwayPerformance: 25,
  last10Form: 15,
  goalsFor: 10,
  goalsAgainst: 10,
  bttsProfile: 15,
  opponentStrength: 10,
  injuriesSuspensions: 10,
  h2h: 5,
};

export const INITIAL_TEAM_STATS: TeamAnalyzerStats = {
  wins10: '',
  draws10: '',
  losses10: '',
  goalsScored10: '',
  goalsConceded10: '',
  btts10: '',
  failedToScore10: '',
  cleanSheets10: '',
};

export const INITIAL_HOME_AWAY_STRENGTH: HomeAwayStrengthStats = {
  wins: '',
  draws: '',
  losses: '',
  winDraw: '',
  goalsFor: '',
  goalsAgainst: '',
  btts: '',
};

export const INITIAL_BTTS_DEDICATED: BTTSDedicatedStats = {
  overallBttsPercent: '',
  homeAwayBttsPercent: '',
  scoredInLast10: '',
  concededInLast10: '',
  failedToScore10: '',
  cleanSheets10: '',
  avgGoalsScored: '',
  avgGoalsConceded: '',
};

export const INITIAL_H2H_ENTRIES: H2HEntry[] = [
  { match: '', result: '', btts: '', notes: '' },
  { match: '', result: '', btts: '', notes: '' },
  { match: '', result: '', btts: '', notes: '' },
  { match: '', result: '', btts: '', notes: '' },
  { match: '', result: '', btts: '', notes: '' },
];

export const INITIAL_FACTOR_SCORES: FactorScores = {
  homeAwayPerformance: '',
  last10Form: '',
  goalsFor: '',
  goalsAgainst: '',
  bttsProfile: '',
  opponentStrength: '',
  injuriesSuspensions: '',
  h2h: '',
};

export const INITIAL_ODDS: MarketOdds = {
  ah0: '',
  ahPlus05: '',
  oneX: '',
  win: '',
  btts: '',
};

// Storage Key for Saved Analysis Records
const TEAM_ANALYZER_STORAGE_KEY = 'epl_team_analyzer_records_v2';

export const loadSavedAnalyses = (): SavedAnalysisRecord[] => {
  try {
    const data = localStorage.getItem(TEAM_ANALYZER_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load team analyses:', err);
  }
  return [];
};

export const saveAnalysesList = (records: SavedAnalysisRecord[]): void => {
  try {
    localStorage.setItem(TEAM_ANALYZER_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.warn('Failed to save team analyses:', err);
  }
};

export const calculateWeightedScore = (scores: FactorScores): {
  total: number;
  hasAnyScore: boolean;
  isComplete: boolean;
  breakdown: Record<keyof FactorScores, number>;
} => {
  let total = 0;
  let hasAnyScore = false;
  let filledCount = 0;
  const breakdown: any = {};

  const keys = Object.keys(FACTOR_WEIGHTS) as (keyof FactorScores)[];
  keys.forEach((key) => {
    const val = scores[key];
    if (val !== '' && typeof val === 'number' && !isNaN(val)) {
      hasAnyScore = true;
      filledCount++;
      const factorScore = Math.min(100, Math.max(0, val));
      const weighted = (factorScore * FACTOR_WEIGHTS[key]) / 100;
      breakdown[key] = Number(weighted.toFixed(2));
      total += weighted;
    } else {
      breakdown[key] = 0;
    }
  });

  return {
    total: Number(total.toFixed(1)),
    hasAnyScore,
    isComplete: filledCount === keys.length,
    breakdown,
  };
};

export const getScoreInterpretation = (
  totalScore: number,
  hasAnyScore: boolean,
  isComplete: boolean
): 'Strong Candidate' | 'Consider' | 'Watch' | 'Pass' | 'Incomplete' => {
  if (!hasAnyScore) return 'Incomplete';
  if (totalScore >= 80) return 'Strong Candidate';
  if (totalScore >= 70) return 'Consider';
  if (totalScore >= 60) return 'Watch';
  return 'Pass';
};

// Dynamic Red Flags detection based only on actual entered data
export const detectRedFlags = (
  scores: FactorScores,
  bttsStats: BTTSDedicatedStats,
  homeStats: TeamAnalyzerStats,
  awayStats: TeamAnalyzerStats,
  homeAwayStrength: HomeAwayStrengthStats,
  odds: MarketOdds,
  notes: string
): string[] => {
  const flags: string[] = [];

  // Low BTTS frequency
  if (typeof bttsStats.overallBttsPercent === 'number' && bttsStats.overallBttsPercent > 0 && bttsStats.overallBttsPercent < 50) {
    flags.push(`Low Overall BTTS Frequency (${bttsStats.overallBttsPercent}%)`);
  }
  if (typeof bttsStats.homeAwayBttsPercent === 'number' && bttsStats.homeAwayBttsPercent > 0 && bttsStats.homeAwayBttsPercent < 50) {
    flags.push(`Low Home/Away Context BTTS (${bttsStats.homeAwayBttsPercent}%)`);
  }
  if (typeof homeStats.btts10 === 'number' && homeStats.btts10 < 5) {
    flags.push(`Home Team BTTS rate is low (${homeStats.btts10}/10 matches)`);
  }
  if (typeof awayStats.btts10 === 'number' && awayStats.btts10 < 5) {
    flags.push(`Away Team BTTS rate is low (${awayStats.btts10}/10 matches)`);
  }

  // High Failed to score
  if (typeof bttsStats.failedToScore10 === 'number' && bttsStats.failedToScore10 >= 4) {
    flags.push(`High Failed-to-Score Rate (${bttsStats.failedToScore10}/10)`);
  }
  if (typeof homeStats.failedToScore10 === 'number' && homeStats.failedToScore10 >= 4) {
    flags.push(`Home Team failed to score in ${homeStats.failedToScore10}/10 matches`);
  }
  if (typeof awayStats.failedToScore10 === 'number' && awayStats.failedToScore10 >= 4) {
    flags.push(`Away Team failed to score in ${awayStats.failedToScore10}/10 matches`);
  }

  // High Clean Sheet rate
  if (typeof bttsStats.cleanSheets10 === 'number' && bttsStats.cleanSheets10 >= 5) {
    flags.push(`High Clean-Sheet Rate (${bttsStats.cleanSheets10}/10)`);
  }
  if (typeof homeStats.cleanSheets10 === 'number' && homeStats.cleanSheets10 >= 5) {
    flags.push(`Home Team high clean-sheet rate (${homeStats.cleanSheets10}/10)`);
  }
  if (typeof awayStats.cleanSheets10 === 'number' && awayStats.cleanSheets10 >= 5) {
    flags.push(`Away Team high clean-sheet rate (${awayStats.cleanSheets10}/10)`);
  }

  // Weak scoring pattern
  if (typeof bttsStats.avgGoalsScored === 'number' && bttsStats.avgGoalsScored > 0 && bttsStats.avgGoalsScored < 1.0) {
    flags.push(`Low Average Goals Scored (${bttsStats.avgGoalsScored} goals/match)`);
  }

  // Injuries / Suspensions factor score
  if (typeof scores.injuriesSuspensions === 'number' && scores.injuriesSuspensions < 50) {
    flags.push(`High Injury / Suspension Impact (Score: ${scores.injuriesSuspensions}/100)`);
  }

  // Opponent Strength risk
  if (typeof scores.opponentStrength === 'number' && scores.opponentStrength < 50) {
    flags.push(`Difficult Opponent Matchup (Score: ${scores.opponentStrength}/100)`);
  }

  // Poor Odds / Value
  if (typeof odds.btts === 'number' && odds.btts > 0 && odds.btts < 1.45) {
    flags.push(`Low BTTS Odds (${odds.btts.toFixed(2)}) offers poor risk/reward value`);
  }

  // Notes check for injury mentions
  if (notes && (notes.toLowerCase().includes('injury') || notes.toLowerCase().includes('suspended') || notes.toLowerCase().includes('doubtful') || notes.toLowerCase().includes('missing key'))) {
    flags.push('Key Availability Concerns noted in analysis');
  }

  return flags;
};
