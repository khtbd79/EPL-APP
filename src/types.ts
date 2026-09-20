export type MatchResult = 'PENDING' | 'WIN' | 'LOSS' | 'VOID';

export interface MatchRecord {
  id: string;
  dayNumber: number;
  date: string;
  matchTime?: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  market: string;
  selection?: string;
  odds: number;
  stake: number;
  result: MatchResult;
  profit: number; // Positive earnings if WIN, 0 if LOSS
  loss: number;   // Positive lost stake if LOSS, 0 if WIN
  netPnL: number; // profit - loss
  bankrollAfter: number;
  notes?: string;
  matchweek?: number;
}

export type AppLayoutTheme =
  | 'white_red'
  | 'emerald'
  | 'gold'
  | 'sapphire'
  | 'ruby'
  | 'purple'
  | 'teal'
  | 'light'
  | 'sunset'
  | 'glass'
  | 'stealth';

export interface AppSettings {
  currency: string;
  targetPercent: number; // e.g., 5% daily target profit
  stakePercent: number;  // e.g., 5% default stake of current bankroll
  theme: 'dark';
  layoutTheme?: AppLayoutTheme;
  autoFillMarket: string;
  activeMatchweek?: number;
}

// EPL 20-Team Match Result & Stats Model
export interface EPLMatchEvent {
  id: string;
  matchweek: number; // 1 to 38
  date: string;
  matchTime?: string;
  homeTeam: string; // 20 EPL Teams
  awayTeam: string; // 20 EPL Teams
  venue: string; // Stadium / Ground name
  homeScore: number;
  awayScore: number;
  halfTimeHomeScore?: number;
  halfTimeAwayScore?: number;
  winner: 'HOME' | 'AWAY' | 'DRAW';
  totalGoals: number;
  btts: boolean; // Both Teams To Score (true/false)
  over25: boolean; // Total Goals > 2.5
  homeGoalScorers?: string; // e.g. "Haaland 23', 67'"
  awayGoalScorers?: string; // e.g. "Saka 45+2'"
  cleanSheetTeam?: 'HOME' | 'AWAY' | 'BOTH' | 'NONE';
  possessionHome?: number;
  possessionAway?: number;
  shotsOnTargetHome?: number;
  shotsOnTargetAway?: number;
  cornersHome?: number;
  cornersAway?: number;
  yellowCardsHome?: number;
  yellowCardsAway?: number;
  redCardsHome?: number;
  redCardsAway?: number;
  notes?: string;
  createdAt: string;
}

export interface TeamPreMatchNote {
  teamName: string;
  homePerformance: string;      // 1. Performance at Home
  awayPerformance: string;      // 2. Performance at Away
  tacticalStyle: string;        // 3. Tactical Style
  keyStrengths: string;         // 4. Key Strengths
  keyWeaknesses: string;        // 5. Key Weaknesses
  keyPlayers: string;           // 6. Key Players
  bettingAngle?: string;        // Best Tactical Angle / Recommendation
  injurySuspension?: string;    // Injury & Missing Players
  // Legacy support
  keyFactor?: string;
  overallPerformance?: string;
  weakSide?: string;
  lastUpdated?: string;         // ISO timestamp
}

export type PreMatchNotesMap = Record<string, TeamPreMatchNote>;

export interface MarketRecordEntry {
  id: string;
  createdAt: string;
  date: string;
  matchTime?: string;
  matchweek?: number;
  homeTeam: string;
  awayTeam: string;
  venue: string;
  selectedMarkets: string[]; // Multi-markets e.g. ["BTTS YES", "Over 2.5", "Home Win"]
  odds?: number;
  stake?: number;
  potentialReturn?: number;
  potentialProfit?: number;
  result: 'PENDING' | 'WIN' | 'LOSS' | 'VOID';
  notes?: string;
}

export type TierLevel = 'TIER_1' | 'TIER_2' | 'TIER_3';

export interface CategoryRankingItem {
  position: number; // 1 to 20
  teamName: string;
  tier: TierLevel;
  notes?: string;
}

export interface MatchweekCategoryRanking {
  matchweek: number; // 1 to 38
  updatedAt: string;
  rankings: CategoryRankingItem[]; // 20 items (positions 1-20)
  overallNotes?: string;
}

export type CategoryRankingsMap = Record<number, MatchweekCategoryRanking>;

export interface AppState {
  currentDay: number; // Sequence counter (1 to 30)
  currentMatchweek: number; // Matchweek 1 to 38
  matchHistory: MatchRecord[];
  eplMatches: EPLMatchEvent[];
  marketRecords?: MarketRecordEntry[];
  preMatchNotes?: Record<string, TeamPreMatchNote>;
  categoryRankings?: CategoryRankingsMap;
  settings: AppSettings;
}

export interface TeamAnalyzerStats {
  wins10: number | '';
  draws10: number | '';
  losses10: number | '';
  goalsScored10: number | '';
  goalsConceded10: number | '';
  btts10: number | '';
  failedToScore10: number | '';
  cleanSheets10: number | '';
}

export interface HomeAwayStrengthStats {
  wins: number | '';
  draws: number | '';
  losses: number | '';
  winDraw: number | '';
  goalsFor: number | '';
  goalsAgainst: number | '';
  btts: number | '';
}

export interface BTTSDedicatedStats {
  overallBttsPercent: number | '';
  homeAwayBttsPercent: number | '';
  scoredInLast10: number | '';
  concededInLast10: number | '';
  failedToScore10: number | '';
  cleanSheets10: number | '';
  avgGoalsScored: number | '';
  avgGoalsConceded: number | '';
}

export interface H2HEntry {
  match: string;
  result: string;
  btts: 'YES' | 'NO' | '';
  notes: string;
}

export interface FactorScores {
  homeAwayPerformance: number | ''; // weight 25
  last10Form: number | '';          // weight 15
  goalsFor: number | '';            // weight 10
  goalsAgainst: number | '';        // weight 10
  bttsProfile: number | '';         // weight 15
  opponentStrength: number | '';    // weight 10
  injuriesSuspensions: number | ''; // weight 10
  h2h: number | '';                 // weight 5
}

export interface MarketOdds {
  ah0: number | '';
  ahPlus05: number | '';
  oneX: number | '';
  win: number | '';
  btts: number | '';
}

export interface SavedAnalysisRecord {
  id: string;
  createdAt: string;
  date: string;
  selectedTeam: string;
  opponentTeam: string;
  homeTeam: string;
  awayTeam: string;
  isHome: boolean;
  odds: MarketOdds;
  homeStats: TeamAnalyzerStats;
  awayStats: TeamAnalyzerStats;
  homeAwayStrength: HomeAwayStrengthStats;
  bttsStats: BTTSDedicatedStats;
  h2hEntries: H2HEntry[];
  scores: FactorScores;
  totalWeightedScore: number;
  scoreInterpretation: 'Strong Candidate' | 'Consider' | 'Watch' | 'Pass' | 'Incomplete';
  bttsDecision: 'QUALIFIED' | 'PASS' | 'INSUFFICIENT DATA';
  redFlags: string[];
  notes: string;
}

export interface ValueBetRecord {
  id: string;
  createdAt: string;
  eventName: string;
  marketName: string;
  bookmakerOdds: number;
  trueProbability: number;
  impliedProbability: number;
  fairOdds: number;
  edgePercent: number;
  stake: number;
  expectedValue: number;
  potentialProfit: number;
  status: 'PENDING' | 'WON' | 'LOST' | 'VOID';
  notes?: string;
}

export type ActiveTab = 
  | 'dashboard'
  | 'standings'
  | 'team_data'
  | 'all_markets'
  | 'demo_match'
  | 'select_match'
  | 'report'
  | 'settings'
  // Legacy & alias mappings
  | 'top_teams'
  | 'market_trends'
  | 'match_select'
  | 'daily_task'
  | 'saved_ledger'
  | 'history'
  | 'reports'
  | 'backup'
  | 'compounding';

export interface TopTeamAnalysis {
  rank: number;
  teamName: string;
  shortName: string;
  stadium: string;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  winRate: number;
  bttsRate: number;
  cleanSheetRate: number;
  over25Rate: number;
  homeWinRate: number;
  awayWinRate: number;
  avgGoalsScored: number;
  avgGoalsConceded: number;
  bestAspectTitle: string;        // e.g. "Lethal Attack & Goal Scoring"
  bestAspectTitleEn: string;      // e.g. "Lethal Attack & Goal Scoring"
  bestAspectSummary: string;      // Concise analytical reasoning
  bestAspectTag: 'ATTACK' | 'DEFENSE' | 'HOME_FORTRESS' | 'BTTS_HIGH_SCORING' | 'FORM_CONTROL';
  userKeyStrengths?: string;      // From user pre-match notes
  userBettingAngle?: string;      // From user pre-match notes
  tacticalStyle?: string;
  recommendedMarkets: string[];
  topMarket?: string;             // Market with highest recorded occurrence rate
  topMarketRate?: number;         // Occurrence percentage of the top market
  tier?: TierLevel;
  categoryPosition?: number;
  compositeScore: number;
  hasData?: boolean;
}

export interface TopTeamsAnalysisReport {
  generatedAt: string;
  currentMatchweek: number;
  totalMatchesAnalyzed: number;
  totalTeamsRanked: number;
  topTeams: TopTeamAnalysis[];
  executiveSummary: string;
}


