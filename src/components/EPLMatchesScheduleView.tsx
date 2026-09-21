import React, { useState, useMemo, useEffect } from 'react';
import { AppState, EPLMatchEvent } from '../types';
import {
  EPL_2026_27_FIXTURES,
  EPLFixture,
  MatchweekSchedule,
  getMatchweekSchedule
} from '../data/eplFixtures2026_27';
import { TeamCrest } from './TeamCrest';
import {
  ALL_EPL_20_TEAMS,
  calculateEPLStandings,
  calculateH2H,
  normalizeTeamName
} from '../utils/teamData';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  Clock,
  MapPin,
  Trophy,
  CheckCircle2,
  Swords,
  ChevronDown,
  X,
  Target,
  Sparkles,
  Edit3,
  Save,
  Plus,
  RotateCcw,
  Trash2,
  Check,
  AlertCircle
} from 'lucide-react';

export const EPL_20_TEAMS_LIST = [
  'Arsenal',
  'Aston Villa',
  'Bournemouth',
  'Brentford',
  'Brighton & Hove Albion',
  'Chelsea',
  'Coventry City',
  'Crystal Palace',
  'Everton',
  'Fulham',
  'Hull City',
  'Ipswich Town',
  'Leeds United',
  'Liverpool',
  'Manchester City',
  'Manchester United',
  'Newcastle United',
  'Nottingham Forest',
  'Sunderland',
  'Tottenham Hotspur'
];

interface CustomFixtureOverride {
  homeTeam?: string;
  awayTeam?: string;
  dateStr?: string;
  fullDate?: string;
  timeBST?: string;
  stadium?: string;
  city?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  status?: 'UPCOMING' | 'LIVE' | 'FINISHED' | 'POSTPONED';
}

const CUSTOM_FIXTURES_KEY = 'btts_epl_custom_fixtures_v2';
const CUSTOM_ADDED_KEY = 'btts_epl_custom_added_fixtures_v2';

// Date format helper: converts YYYY-MM-DD to "Sat 19 Sep"
export const formatDateToDateStr = (isoDate: string): string => {
  if (!isoDate) return '';
  try {
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
    }
  } catch {
    // fallback
  }
  return isoDate;
};

// Time format helper: converts "17:30" to "17:30 BST"
export const formatTimeToBst = (timeStr: string): string => {
  if (!timeStr) return '20:00 BST';
  const clean = timeStr.trim().replace(/bst/i, '').trim();
  return `${clean} BST`;
};

// Team venue helper: auto-fetch stadium & city for home team
export const getTeamVenue = (teamName: string) => {
  const norm = teamName.toLowerCase().trim();
  const team = ALL_EPL_20_TEAMS.find((t) => {
    const tNorm = t.name.toLowerCase().trim();
    const fNorm = t.fullName.toLowerCase().trim();
    return tNorm === norm || fNorm === norm || (norm.includes('bournemouth') && t.id === 'bou');
  });
  if (team) {
    return { stadium: team.stadium, city: team.city };
  }
  return { stadium: `${teamName} Stadium`, city: 'England' };
};

interface EPLMatchesScheduleViewProps {
  state: AppState;
  onNavigateTab?: (tab: any) => void;
  onRecordMatch?: (match: EPLMatchEvent) => void;
  onSaveEplMatch?: (match: EPLMatchEvent) => void;
  onDeleteEplMatch?: (id: string) => void;
}

export const EPLMatchesScheduleView: React.FC<EPLMatchesScheduleViewProps> = ({
  state,
  onNavigateTab,
  onRecordMatch,
  onSaveEplMatch,
  onDeleteEplMatch
}) => {
  const triggerSaveMatch = onSaveEplMatch || onRecordMatch || (() => {});
  const triggerDeleteMatch = onDeleteEplMatch || (() => {});

  // Sub-tabs: Matches | Standings | Head to Head
  const [activeSubTab, setActiveSubTab] = useState<'matches' | 'standings' | 'h2h'>('matches');

  // Matchweek selector (1 to 38)
  const [selectedWeek, setSelectedWeek] = useState<number>(state.currentMatchweek || 1);

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected team filter
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('ALL');

  // Match detail preview modal
  const [selectedMatchModal, setSelectedMatchModal] = useState<EPLFixture | null>(null);

  // H2H state inside view
  const [h2hTeam1, setH2hTeam1] = useState<string>('Arsenal');
  const [h2hTeam2, setH2hTeam2] = useState<string>('Manchester City');

  // Custom fixture overrides loaded from LocalStorage
  const [customOverrides, setCustomOverrides] = useState<Record<string, CustomFixtureOverride>>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_FIXTURES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Custom added fixtures loaded from LocalStorage
  const [customAddedFixtures, setCustomAddedFixtures] = useState<EPLFixture[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_ADDED_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Inline Goal inputs state: matchId -> { homeScore: string, awayScore: string }
  const [scoresInputState, setScoresInputState] = useState<Record<string, { homeScore: string; awayScore: string }>>({});

  // Active editing match ID (for full dropdown & picker panel)
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    homeTeam: string;
    awayTeam: string;
    fullDate: string;
    timeOnly: string;
    homeScore: string;
    awayScore: string;
    status: 'UPCOMING' | 'LIVE' | 'FINISHED';
  }>({
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    fullDate: '2026-08-15',
    timeOnly: '20:00',
    homeScore: '',
    awayScore: '',
    status: 'UPCOMING'
  });

  // Add New Match panel open state
  const [isAddMatchOpen, setIsAddMatchOpen] = useState<boolean>(false);
  const [newMatchForm, setNewMatchForm] = useState<{
    matchweek: number;
    homeTeam: string;
    awayTeam: string;
    fullDate: string;
    timeOnly: string;
    homeScore: string;
    awayScore: string;
    status: 'UPCOMING' | 'LIVE' | 'FINISHED';
  }>({
    matchweek: selectedWeek,
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    fullDate: new Date().toISOString().split('T')[0],
    timeOnly: '20:00',
    homeScore: '',
    awayScore: '',
    status: 'UPCOMING'
  });

  // Toast feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Keep new match matchweek in sync with selectedWeek
  useEffect(() => {
    setNewMatchForm((prev) => ({ ...prev, matchweek: selectedWeek }));
  }, [selectedWeek]);

  // Save custom overrides to LocalStorage
  const saveCustomOverride = (id: string, override: CustomFixtureOverride) => {
    setCustomOverrides((prev) => {
      const next = { ...prev, [id]: { ...(prev[id] || {}), ...override } };
      try {
        localStorage.setItem(CUSTOM_FIXTURES_KEY, JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save custom fixture override:', err);
      }
      return next;
    });
  };

  // Revert custom override
  const resetCustomOverride = (id: string) => {
    setCustomOverrides((prev) => {
      const next = { ...prev };
      delete next[id];
      try {
        localStorage.setItem(CUSTOM_FIXTURES_KEY, JSON.stringify(next));
      } catch (err) {
        console.error('Failed to clear custom fixture override:', err);
      }
      return next;
    });
    setEditingMatchId(null);
    setToastMessage('Match reset to default schedule.');
  };

  // Save custom added fixtures to LocalStorage
  const saveCustomAddedFixtures = (newList: EPLFixture[]) => {
    setCustomAddedFixtures(newList);
    try {
      localStorage.setItem(CUSTOM_ADDED_KEY, JSON.stringify(newList));
    } catch (err) {
      console.error('Failed to save added fixtures:', err);
    }
  };

  // Delete custom added match
  const handleDeleteCustomMatch = (id: string) => {
    const updated = customAddedFixtures.filter((m) => m.id !== id);
    saveCustomAddedFixtures(updated);
    triggerDeleteMatch(id);
    setToastMessage('Match removed from schedule and Match Center.');
  };

  // Current matchweek schedule merged with custom overrides and state.eplMatches
  const currentSchedule = useMemo(() => {
    const baseSchedule = getMatchweekSchedule(selectedWeek) || EPL_2026_27_FIXTURES[0];
    const baseMatches = baseSchedule ? [...baseSchedule.matches] : [];

    // Add any custom created matches for this week
    const addedForThisWeek = customAddedFixtures.filter((m) => m.matchweek === selectedWeek);
    const combined = [...baseMatches, ...addedForThisWeek];

    // Overlay custom overrides & state.eplMatches results
    const eplMatches = state.eplMatches || [];

    const finalMatches = combined.map((match) => {
      const override = customOverrides[match.id];
      const merged: EPLFixture = {
        ...match,
        ...(override || {})
      };

      // If user altered date, compute dateStr
      if (override?.fullDate && !override.dateStr) {
        merged.dateStr = formatDateToDateStr(override.fullDate);
      }

      // Check if result exists in state.eplMatches
      const recordedMatch = eplMatches.find(
        (m) =>
          m.id === match.id ||
          (m.matchweek === merged.matchweek &&
            normalizeTeamName(m.homeTeam).toLowerCase().trim() === normalizeTeamName(merged.homeTeam).toLowerCase().trim() &&
            normalizeTeamName(m.awayTeam).toLowerCase().trim() === normalizeTeamName(merged.awayTeam).toLowerCase().trim())
      );

      if (recordedMatch) {
        merged.homeScore = recordedMatch.homeScore;
        merged.awayScore = recordedMatch.awayScore;
        merged.status = 'FINISHED';
      } else if (override && override.homeScore !== undefined && override.homeScore !== null) {
        merged.homeScore = Number(override.homeScore);
        merged.awayScore = Number(override.awayScore);
        merged.status = override.status || 'FINISHED';
      }

      return merged;
    });

    return {
      matchweek: selectedWeek,
      dateRange: baseSchedule?.dateRange || `Week ${selectedWeek}`,
      matches: finalMatches
    };
  }, [selectedWeek, customOverrides, customAddedFixtures, state.eplMatches]);

  // Group matches by Date String (e.g. 'Sat 19 Sep', 'Sun 20 Sep')
  const groupedMatches = useMemo(() => {
    if (!currentSchedule) return [];

    let filtered = currentSchedule.matches;

    // Filter by team if selected
    if (selectedTeamFilter !== 'ALL') {
      const q = selectedTeamFilter.toLowerCase().trim();
      filtered = filtered.filter(
        (m) => m.homeTeam.toLowerCase().trim() === q || m.awayTeam.toLowerCase().trim() === q
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (m) =>
          m.homeTeam.toLowerCase().includes(q) ||
          m.awayTeam.toLowerCase().includes(q) ||
          m.stadium.toLowerCase().includes(q) ||
          m.city.toLowerCase().includes(q) ||
          m.dateStr.toLowerCase().includes(q)
      );
    }

    // Grouping by dateStr preserving schedule order
    const groups: { date: string; fullDate: string; matches: EPLFixture[] }[] = [];
    filtered.forEach((match) => {
      const existing = groups.find((g) => g.date === match.dateStr);
      if (existing) {
        existing.matches.push(match);
      } else {
        groups.push({
          date: match.dateStr,
          fullDate: match.fullDate,
          matches: [match]
        });
      }
    });

    return groups;
  }, [currentSchedule, selectedTeamFilter, searchQuery]);

  // Standings calculation based on state matches
  const standings = useMemo(() => {
    return calculateEPLStandings(state.eplMatches || []);
  }, [state.eplMatches]);

  // H2H calculation
  const h2hData = useMemo(() => {
    return calculateH2H(h2hTeam1, h2hTeam2, state.eplMatches || []);
  }, [h2hTeam1, h2hTeam2, state.eplMatches]);

  // Open Edit Panel for a match
  const handleOpenEdit = (match: EPLFixture) => {
    setEditingMatchId(match.id);
    const timeClean = match.timeBST.replace(/bst/i, '').trim();
    setEditForm({
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      fullDate: match.fullDate || '2026-08-15',
      timeOnly: timeClean || '20:00',
      homeScore: match.homeScore !== undefined ? String(match.homeScore) : '',
      awayScore: match.awayScore !== undefined ? String(match.awayScore) : '',
      status: match.status === 'FINISHED' ? 'FINISHED' : match.status === 'LIVE' ? 'LIVE' : 'UPCOMING'
    });
  };

  // Save the full Edit Form
  const handleSaveEditForm = (matchId: string) => {
    const venue = getTeamVenue(editForm.homeTeam);
    const dateStr = formatDateToDateStr(editForm.fullDate);
    const timeBST = formatTimeToBst(editForm.timeOnly);

    const hasScores = editForm.homeScore.trim() !== '' && editForm.awayScore.trim() !== '';
    const hScore = hasScores ? Math.max(0, parseInt(editForm.homeScore, 10) || 0) : null;
    const aScore = hasScores ? Math.max(0, parseInt(editForm.awayScore, 10) || 0) : null;
    const status = hasScores ? 'FINISHED' : editForm.status;

    // 1. Update Custom Overrides
    saveCustomOverride(matchId, {
      homeTeam: editForm.homeTeam,
      awayTeam: editForm.awayTeam,
      fullDate: editForm.fullDate,
      dateStr,
      timeBST,
      stadium: venue.stadium,
      city: venue.city,
      homeScore: hScore,
      awayScore: aScore,
      status
    });

    // 2. If finished or score provided, automatically sync into Match Center (state.eplMatches)
    if (hasScores && hScore !== null && aScore !== null) {
      const winner = hScore > aScore ? 'HOME' : aScore > hScore ? 'AWAY' : 'DRAW';
      const totalGoals = hScore + aScore;
      const btts = hScore > 0 && aScore > 0;
      const over25 = totalGoals > 2.5;

      const event: EPLMatchEvent = {
        id: matchId,
        matchweek: selectedWeek,
        date: editForm.fullDate,
        matchTime: timeBST,
        homeTeam: normalizeTeamName(editForm.homeTeam),
        awayTeam: normalizeTeamName(editForm.awayTeam),
        venue: venue.stadium,
        homeScore: hScore,
        awayScore: aScore,
        winner,
        totalGoals,
        btts,
        over25,
        cleanSheetTeam: aScore === 0 && hScore === 0 ? 'BOTH' : aScore === 0 ? 'HOME' : hScore === 0 ? 'AWAY' : 'NONE',
        createdAt: new Date().toISOString()
      };

      triggerSaveMatch(event);
      setToastMessage(`✓ Result saved to Match Center: ${editForm.homeTeam} ${hScore} - ${aScore} ${editForm.awayTeam}`);
    } else {
      setToastMessage('✓ Match details updated successfully!');
    }

    setEditingMatchId(null);
  };

  // Direct Inline Score Save
  const handleSaveInlineScore = (match: EPLFixture) => {
    const scoreState = scoresInputState[match.id];
    const rawHome = scoreState ? scoreState.homeScore : String(match.homeScore ?? '');
    const rawAway = scoreState ? scoreState.awayScore : String(match.awayScore ?? '');

    if (rawHome.trim() === '' || rawAway.trim() === '') {
      setToastMessage('Please enter valid scores for both teams.');
      return;
    }

    const hScore = Math.max(0, parseInt(rawHome, 10) || 0);
    const aScore = Math.max(0, parseInt(rawAway, 10) || 0);

    const winner = hScore > aScore ? 'HOME' : aScore > hScore ? 'AWAY' : 'DRAW';
    const totalGoals = hScore + aScore;
    const btts = hScore > 0 && aScore > 0;
    const over25 = totalGoals > 2.5;

    const event: EPLMatchEvent = {
      id: match.id,
      matchweek: match.matchweek || selectedWeek,
      date: match.fullDate || match.dateStr,
      matchTime: match.timeBST,
      homeTeam: normalizeTeamName(match.homeTeam),
      awayTeam: normalizeTeamName(match.awayTeam),
      venue: match.stadium || `${match.homeTeam} Stadium`,
      homeScore: hScore,
      awayScore: aScore,
      winner,
      totalGoals,
      btts,
      over25,
      cleanSheetTeam: aScore === 0 && hScore === 0 ? 'BOTH' : aScore === 0 ? 'HOME' : hScore === 0 ? 'AWAY' : 'NONE',
      createdAt: new Date().toISOString()
    };

    // Save to centralized state.eplMatches
    triggerSaveMatch(event);

    // Save to local custom overrides
    saveCustomOverride(match.id, {
      homeScore: hScore,
      awayScore: aScore,
      status: 'FINISHED'
    });

    setToastMessage(`✓ Result saved: ${match.homeTeam} ${hScore} - ${aScore} ${match.awayTeam}`);
  };

  // Clear / Reset match score
  const handleClearScore = (match: EPLFixture) => {
    triggerDeleteMatch(match.id);
    saveCustomOverride(match.id, {
      homeScore: null,
      awayScore: null,
      status: 'UPCOMING'
    });
    setScoresInputState((prev) => {
      const next = { ...prev };
      delete next[match.id];
      return next;
    });
    setToastMessage(`Result cleared: ${match.homeTeam} vs ${match.awayTeam}`);
  };

  // Add a brand new custom match
  const handleCreateNewMatch = () => {
    if (newMatchForm.homeTeam === newMatchForm.awayTeam) {
      setToastMessage('Home and away teams cannot be the same.');
      return;
    }

    const venue = getTeamVenue(newMatchForm.homeTeam);
    const dateStr = formatDateToDateStr(newMatchForm.fullDate);
    const timeBST = formatTimeToBst(newMatchForm.timeOnly);

    const hasScores = newMatchForm.homeScore.trim() !== '' && newMatchForm.awayScore.trim() !== '';
    const hScore = hasScores ? Math.max(0, parseInt(newMatchForm.homeScore, 10) || 0) : undefined;
    const aScore = hasScores ? Math.max(0, parseInt(newMatchForm.awayScore, 10) || 0) : undefined;
    const status = hasScores ? 'FINISHED' : newMatchForm.status;

    const newId = `custom-mw${newMatchForm.matchweek}-${Date.now()}`;

    const newFixture: EPLFixture = {
      id: newId,
      matchweek: newMatchForm.matchweek,
      dateStr,
      fullDate: newMatchForm.fullDate,
      timeBST,
      homeTeam: newMatchForm.homeTeam,
      awayTeam: newMatchForm.awayTeam,
      stadium: venue.stadium,
      city: venue.city,
      homeScore: hScore,
      awayScore: aScore,
      status
    };

    saveCustomAddedFixtures([...customAddedFixtures, newFixture]);

    // If score provided, also sync directly to Match Center
    if (hasScores && hScore !== undefined && aScore !== undefined) {
      const winner = hScore > aScore ? 'HOME' : aScore > hScore ? 'AWAY' : 'DRAW';
      const totalGoals = hScore + aScore;
      const btts = hScore > 0 && aScore > 0;
      const over25 = totalGoals > 2.5;

      const event: EPLMatchEvent = {
        id: newId,
        matchweek: newMatchForm.matchweek,
        date: newMatchForm.fullDate,
        matchTime: timeBST,
        homeTeam: newMatchForm.homeTeam,
        awayTeam: newMatchForm.awayTeam,
        venue: venue.stadium,
        homeScore: hScore,
        awayScore: aScore,
        winner,
        totalGoals,
        btts,
        over25,
        cleanSheetTeam: aScore === 0 && hScore === 0 ? 'BOTH' : aScore === 0 ? 'HOME' : hScore === 0 ? 'AWAY' : 'NONE',
        createdAt: new Date().toISOString()
      };

      triggerSaveMatch(event);
      setToastMessage(`✓ Match created and result saved: ${newMatchForm.homeTeam} ${hScore} - ${aScore} ${newMatchForm.awayTeam}`);
    } else {
      setToastMessage(`✓ New match added to Matchweek ${newMatchForm.matchweek}!`);
    }

    setIsAddMatchOpen(false);
  };

  const handleSelectMatch = (match: EPLFixture) => {
    setSelectedMatchModal(match);
    setH2hTeam1(match.homeTeam);
    setH2hTeam2(match.awayTeam);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-red-500/50 flex items-center space-x-3 animate-slideDown">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP HEADER: PREMIER LEAGUE 2026/27 BRANDING & TABS */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-red-200 shadow-sm relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-8 bottom-2 opacity-5 pointer-events-none hidden md:block">
          <Trophy className="w-48 h-48 text-red-600" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 shrink-0">
              <Trophy className="w-8 h-8 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  {state.eplMatches?.length || 0} Results Synced
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                Matches & Fixtures Manager
              </h1>
            </div>
          </div>

          {/* Sub-Tabs: Matches | Standings | Head to Head */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto">
            <button
              onClick={() => setActiveSubTab('matches')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center space-x-2 ${
                activeSubTab === 'matches'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Matches ({currentSchedule?.matches.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('standings')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center space-x-2 ${
                activeSubTab === 'standings'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Standings Table</span>
            </button>
            <button
              onClick={() => setActiveSubTab('h2h')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center space-x-2 ${
                activeSubTab === 'h2h'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>Head to Head</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          SUBTAB 1: MATCHES LIST WITH DROPDOWNS & SCORE BOXES
      ======================================================== */}
      {activeSubTab === 'matches' && (
        <div className="space-y-6">
          {/* MATCHWEEK NAVIGATION & TOP ACTIONS */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-red-200 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Stepper with Arrows */}
              <div className="flex items-center justify-between w-full md:w-auto space-x-4">
                <button
                  onClick={() => setSelectedWeek((w) => Math.max(1, w - 1))}
                  disabled={selectedWeek <= 1}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all cursor-pointer ${
                    selectedWeek <= 1
                      ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-slate-800 border-slate-300 hover:border-red-500 hover:text-red-600 hover:bg-red-50 shadow-xs active:scale-95'
                  }`}
                  title="Previous Matchweek"
                >
                  <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                </button>

                <div className="text-center px-3 min-w-[200px]">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Matchweek {selectedWeek}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-red-600 tracking-wide mt-0.5">
                    {currentSchedule?.dateRange || `Week ${selectedWeek}`}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedWeek((w) => Math.min(38, w + 1))}
                  disabled={selectedWeek >= 38}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all cursor-pointer ${
                    selectedWeek >= 38
                      ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-slate-800 border-slate-300 hover:border-red-500 hover:text-red-600 hover:bg-red-50 shadow-xs active:scale-95'
                  }`}
                  title="Next Matchweek"
                >
                  <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                </button>
              </div>

              {/* Direct Matchweek Dropdown & Add Custom Match Button */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
                <div className="relative flex-1 sm:flex-initial">
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(Number(e.target.value))}
                    className="w-full sm:w-auto bg-slate-50 border border-slate-300 text-slate-900 font-extrabold text-xs sm:text-sm rounded-2xl py-2.5 pl-3.5 pr-9 outline-none focus:ring-2 focus:ring-red-500 focus:bg-white cursor-pointer shadow-xs transition-colors"
                  >
                    {Array.from({ length: 38 }, (_, i) => i + 1).map((mw) => (
                      <option key={mw} value={mw} className="text-slate-900 font-bold">
                        Matchweek {mw} {mw === selectedWeek ? '★' : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <button
                  onClick={() => setIsAddMatchOpen(!isAddMatchOpen)}
                  className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-red-600 text-white shadow-md shadow-red-600/25 hover:bg-red-700 transition-all cursor-pointer flex items-center space-x-1.5 active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add Match</span>
                </button>
              </div>
            </div>

            {/* Quick Horizontal Matchweek Slider Pills (1 to 38) */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-thin">
              <span className="text-[11px] font-bold text-slate-500 uppercase shrink-0 pr-1">Week:</span>
              {Array.from({ length: 38 }, (_, i) => i + 1).map((mw) => (
                <button
                  key={mw}
                  onClick={() => setSelectedWeek(mw)}
                  className={`shrink-0 h-8 min-w-[34px] px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    selectedWeek === mw
                      ? 'bg-red-600 text-white shadow-sm shadow-red-600/30 scale-105'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {mw}
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================
              ADD CUSTOM MATCH CARD (IF OPENED)
          ======================================================== */}
          {isAddMatchOpen && (
            <div className="bg-gradient-to-br from-red-50 to-white rounded-3xl p-5 sm:p-6 border-2 border-red-300 shadow-md space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between border-b border-red-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-red-600" />
                  <h3 className="text-base font-black text-slate-900">
                    Create New Match
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddMatchOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Matchweek */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Matchweek</label>
                  <select
                    value={newMatchForm.matchweek}
                    onChange={(e) => setNewMatchForm({ ...newMatchForm, matchweek: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900"
                  >
                    {Array.from({ length: 38 }, (_, i) => i + 1).map((w) => (
                      <option key={w} value={w}>
                        Matchweek {w}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Home Team Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">🏠 Home Team</label>
                  <select
                    value={newMatchForm.homeTeam}
                    onChange={(e) => setNewMatchForm({ ...newMatchForm, homeTeam: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900"
                  >
                    {EPL_20_TEAMS_LIST.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Away Team Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">✈️ Away Team</label>
                  <select
                    value={newMatchForm.awayTeam}
                    onChange={(e) => setNewMatchForm({ ...newMatchForm, awayTeam: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900"
                  >
                    {EPL_20_TEAMS_LIST.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={newMatchForm.status}
                    onChange={(e) => setNewMatchForm({ ...newMatchForm, status: e.target.value as any })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="LIVE">Live</option>
                    <option value="FINISHED">Finished (FT)</option>
                  </select>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-red-600" />
                    <span>Date</span>
                  </label>
                  <input
                    type="date"
                    value={newMatchForm.fullDate}
                    onChange={(e) => setNewMatchForm({ ...newMatchForm, fullDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Time Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-red-600" />
                    <span>Time (BST)</span>
                  </label>
                  <input
                    type="time"
                    value={newMatchForm.timeOnly}
                    onChange={(e) => setNewMatchForm({ ...newMatchForm, timeOnly: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Home Score */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Home Goals (Optional)</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    placeholder="0"
                    value={newMatchForm.homeScore}
                    onChange={(e) => setNewMatchForm({ ...newMatchForm, homeScore: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-black font-mono text-slate-900 outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Away Score */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Away Goals (Optional)</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    placeholder="0"
                    value={newMatchForm.awayScore}
                    onChange={(e) => setNewMatchForm({ ...newMatchForm, awayScore: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-black font-mono text-slate-900 outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setIsAddMatchOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNewMatch}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 text-white shadow-md shadow-red-600/25 hover:bg-red-700 flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save to Match Center</span>
                </button>
              </div>
            </div>
          )}

          {/* SEARCH & TEAM FILTER BAR */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search club or venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-xl py-2 pl-9 pr-8 outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <span className="text-xs font-bold text-slate-500 shrink-0">Filter Club:</span>
              <select
                value={selectedTeamFilter}
                onChange={(e) => setSelectedTeamFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
              >
                <option value="ALL">All 20 Teams</option>
                {EPL_20_TEAMS_LIST.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ========================================================
              MATCH LIST GROUPED BY DATE WITH INLINE GOAL BOXES
          ======================================================== */}
          {groupedMatches.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No matches found</h3>
              <p className="text-xs text-slate-500 mt-1">Try clearing your search query or team filter.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTeamFilter('ALL');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            groupedMatches.map((group) => (
              <div
                key={group.date}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden"
              >
                {/* DATE HEADER */}
                <div className="bg-slate-50/80 px-5 sm:px-7 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
                    <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                      {group.date}
                    </h2>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-700 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-red-600" />
                    <span>Time (BST, UTC+6)</span>
                  </div>
                </div>

                {/* MATCH ROWS */}
                <div className="divide-y divide-slate-100">
                  {group.matches.map((match) => {
                    const isFinished = match.status === 'FINISHED' && match.homeScore !== undefined && match.awayScore !== undefined;
                    const isLive = match.status === 'LIVE';
                    const isCustomMatch = match.id.startsWith('custom-');
                    const isEditing = editingMatchId === match.id;

                    const scoreState = scoresInputState[match.id] || {
                      homeScore: match.homeScore !== undefined ? String(match.homeScore) : '',
                      awayScore: match.awayScore !== undefined ? String(match.awayScore) : ''
                    };

                    return (
                      <div key={match.id} className="transition-all">
                        {/* MAIN ROW */}
                        <div className={`p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-3.5 ${
                          isFinished ? 'bg-slate-50/40' : 'hover:bg-slate-50/70'
                        }`}>
                          {/* Stadium on mobile */}
                          <div className="md:hidden text-[11px] font-bold text-slate-400 flex items-center space-x-1 self-start">
                            <MapPin className="w-3 h-3 text-red-500" />
                            <span>{match.stadium}</span>
                          </div>

                          {/* HOME TEAM SIDE (Home Team, Crest, & Goal Input Box) */}
                          <div className="flex items-center justify-end flex-1 w-full md:w-auto space-x-2 sm:space-x-3 min-w-0">
                            <span className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 text-right whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
                              {match.homeTeam}
                            </span>
                            <div className="shrink-0 drop-shadow-xs">
                              <TeamCrest teamName={match.homeTeam} className="w-6 h-6 sm:w-8 sm:h-8" size={32} />
                            </div>

                            {/* HOME TEAM GOAL BOX */}
                            <div className="shrink-0 flex items-center space-x-1 pl-1">
                              <input
                                type="number"
                                min="0"
                                max="99"
                                placeholder="0"
                                value={scoreState.homeScore}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setScoresInputState((prev) => ({
                                    ...prev,
                                    [match.id]: {
                                      ...(prev[match.id] || { homeScore: '', awayScore: '' }),
                                      homeScore: val
                                    }
                                  }));
                                }}
                                title="Home Team Goals"
                                className="w-12 h-10 text-center font-mono font-black text-base bg-white border-2 border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 rounded-xl outline-none transition-all shadow-xs text-slate-900"
                              />
                            </div>
                          </div>

                          {/* CENTER BADGE & TIME / STATUS */}
                          <div className="shrink-0 flex flex-col items-center px-1">
                            {isFinished ? (
                              <div className="flex items-center space-x-2">
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-black font-mono">
                                  FT: {match.homeScore} - {match.awayScore}
                                </span>
                              </div>
                            ) : isLive ? (
                              <div className="px-3 py-1 bg-red-600 text-white rounded-xl text-xs font-black animate-pulse flex items-center space-x-1">
                                <span className="w-2 h-2 rounded-full bg-white inline-block" />
                                <span>LIVE</span>
                              </div>
                            ) : (
                              <div className="min-w-[80px] py-1.5 px-3 bg-white border-2 border-slate-200 rounded-xl shadow-xs text-center">
                                <span className="text-xs sm:text-sm font-black font-mono text-slate-900">
                                  {match.timeBST}
                                </span>
                              </div>
                            )}

                            {/* Save Result Quick Button */}
                            <div className="flex items-center space-x-1.5 mt-1.5">
                              <button
                                onClick={() => handleSaveInlineScore(match)}
                                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black rounded-lg shadow-xs transition-transform active:scale-95 flex items-center space-x-1 cursor-pointer"
                                title="Save Result to Match Center"
                              >
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>Save</span>
                              </button>

                              {isFinished && (
                                <button
                                  onClick={() => handleClearScore(match)}
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                                  title="Clear result"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                          </div>

                          {/* AWAY TEAM SIDE (Goal Input Box, Crest, & Away Team Name) */}
                          <div className="flex items-center justify-start flex-1 w-full md:w-auto space-x-2 sm:space-x-3 min-w-0">
                            {/* AWAY TEAM GOAL BOX */}
                            <div className="shrink-0 flex items-center space-x-1 pr-1">
                              <input
                                type="number"
                                min="0"
                                max="99"
                                placeholder="0"
                                value={scoreState.awayScore}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setScoresInputState((prev) => ({
                                    ...prev,
                                    [match.id]: {
                                      ...(prev[match.id] || { homeScore: '', awayScore: '' }),
                                      awayScore: val
                                    }
                                  }));
                                }}
                                title="Away Team Goals"
                                className="w-12 h-10 text-center font-mono font-black text-base bg-white border-2 border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 rounded-xl outline-none transition-all shadow-xs text-slate-900"
                              />
                            </div>

                            <div className="shrink-0 drop-shadow-xs">
                              <TeamCrest teamName={match.awayTeam} className="w-6 h-6 sm:w-8 sm:h-8" size={32} />
                            </div>
                            <span className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 text-left whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
                              {match.awayTeam}
                            </span>
                          </div>

                          {/* ACTIONS & VENUE */}
                          <div className="flex items-center space-x-2 shrink-0 justify-end w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                            {/* Edit / Set Match Button */}
                            <button
                              onClick={() => {
                                if (isEditing) {
                                  setEditingMatchId(null);
                                } else {
                                  handleOpenEdit(match);
                                }
                              }}
                              className={`p-2 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                                isEditing
                                  ? 'bg-red-600 text-white border-red-600'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                              title="Edit match details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>

                            {/* View info */}
                            <button
                              onClick={() => handleSelectMatch(match)}
                              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                              title="Match Details"
                            >
                              <Target className="w-3.5 h-3.5 text-red-600" />
                            </button>

                            {/* Delete button if custom match */}
                            {isCustomMatch && (
                              <button
                                onClick={() => handleDeleteCustomMatch(match.id)}
                                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                                title="Delete Match"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* ========================================================
                            EXPANDED EDIT PANEL (DROPDOWNS, DATE & TIME PICKERS)
                        ======================================================== */}
                        {isEditing && (
                          <div className="bg-red-50/50 p-4 sm:p-5 border-t border-b border-red-200 space-y-4 animate-scaleUp">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                                <Edit3 className="w-4 h-4" />
                                <span>Edit Match Details</span>
                              </span>
                              <button
                                onClick={() => setEditingMatchId(null)}
                                className="text-slate-400 hover:text-slate-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                              {/* HOME TEAM DROPDOWN */}
                              <div>
                                <label className="block text-[11px] font-black text-slate-700 mb-1">
                                  🏠 Home Team
                                </label>
                                <select
                                  value={editForm.homeTeam}
                                  onChange={(e) => setEditForm({ ...editForm, homeTeam: e.target.value })}
                                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-red-500"
                                >
                                  {EPL_20_TEAMS_LIST.map((t) => (
                                    <option key={t} value={t}>
                                      {t}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* AWAY TEAM DROPDOWN */}
                              <div>
                                <label className="block text-[11px] font-black text-slate-700 mb-1">
                                  ✈️ Away Team
                                </label>
                                <select
                                  value={editForm.awayTeam}
                                  onChange={(e) => setEditForm({ ...editForm, awayTeam: e.target.value })}
                                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-red-500"
                                >
                                  {EPL_20_TEAMS_LIST.map((t) => (
                                    <option key={t} value={t}>
                                      {t}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* DATE PICKER */}
                              <div>
                                <label className="block text-[11px] font-black text-slate-700 mb-1 flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-red-600" />
                                  <span>Date</span>
                                </label>
                                <input
                                  type="date"
                                  value={editForm.fullDate}
                                  onChange={(e) => setEditForm({ ...editForm, fullDate: e.target.value })}
                                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-red-500"
                                />
                              </div>

                              {/* TIME PICKER */}
                              <div>
                                <label className="block text-[11px] font-black text-slate-700 mb-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-red-600" />
                                  <span>Time (BST)</span>
                                </label>
                                <input
                                  type="time"
                                  value={editForm.timeOnly}
                                  onChange={(e) => setEditForm({ ...editForm, timeOnly: e.target.value })}
                                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-red-500"
                                />
                              </div>

                              {/* HOME GOAL BOX */}
                              <div>
                                <label className="block text-[11px] font-black text-slate-700 mb-1">
                                  Home Goals
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="99"
                                  placeholder="0"
                                  value={editForm.homeScore}
                                  onChange={(e) => setEditForm({ ...editForm, homeScore: e.target.value })}
                                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-black font-mono text-slate-900"
                                />
                              </div>

                              {/* AWAY GOAL BOX */}
                              <div>
                                <label className="block text-[11px] font-black text-slate-700 mb-1">
                                  Away Goals
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="99"
                                  placeholder="0"
                                  value={editForm.awayScore}
                                  onChange={(e) => setEditForm({ ...editForm, awayScore: e.target.value })}
                                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-black font-mono text-slate-900"
                                />
                              </div>

                              {/* STATUS */}
                              <div>
                                <label className="block text-[11px] font-black text-slate-700 mb-1">
                                  Status
                                </label>
                                <select
                                  value={editForm.status}
                                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-900"
                                >
                                  <option value="UPCOMING">Upcoming</option>
                                  <option value="LIVE">Live</option>
                                  <option value="FINISHED">Finished (FT)</option>
                                </select>
                              </div>

                              {/* ACTIONS */}
                              <div className="flex items-end space-x-2">
                                <button
                                  onClick={() => handleSaveEditForm(match.id)}
                                  className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm shadow-red-600/20"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                  <span>Save</span>
                                </button>
                                <button
                                  onClick={() => resetCustomOverride(match.id)}
                                  className="py-2 px-2.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 rounded-xl text-xs font-bold"
                                  title="Reset"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================
          SUBTAB 2: EPL STANDINGS TABLE
      ======================================================== */}
      {activeSubTab === 'standings' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
          <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">Premier League Table 2026/27</h2>
              <p className="text-xs font-semibold text-slate-500">
                Live standings calculated from recorded match results
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block" /> Champions League
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-600 inline-block" /> Relegation
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-3.5 text-center w-12">Pos</th>
                  <th className="py-3 px-4">Club</th>
                  <th className="py-3 px-2.5 text-center">Pl</th>
                  <th className="py-3 px-2.5 text-center">W</th>
                  <th className="py-3 px-2.5 text-center">D</th>
                  <th className="py-3 px-2.5 text-center">L</th>
                  <th className="py-3 px-2.5 text-center hidden sm:table-cell">GF</th>
                  <th className="py-3 px-2.5 text-center hidden sm:table-cell">GA</th>
                  <th className="py-3 px-2.5 text-center font-mono">GD</th>
                  <th className="py-3 px-3.5 text-center font-black text-slate-900">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-semibold text-slate-700">
                {standings.map((team, idx) => {
                  const pos = idx + 1;
                  const isUcl = pos <= 4;
                  const isUel = pos === 5;
                  const isRel = pos >= 18;

                  return (
                    <tr key={team.team} className="hover:bg-red-50/20 transition-colors">
                      <td className="py-3 px-3.5 text-center font-bold font-mono">
                        <span
                          className={`inline-block w-6 h-6 leading-6 rounded-md text-xs font-black ${
                            isUcl
                              ? 'bg-blue-100 text-blue-800'
                              : isUel
                              ? 'bg-amber-100 text-amber-800'
                              : isRel
                              ? 'bg-red-100 text-red-800'
                              : 'text-slate-600'
                          }`}
                        >
                          {pos}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <TeamCrest teamName={team.team} className="w-6 h-6 shrink-0" size={24} />
                          <span className="font-extrabold text-slate-900 truncate">{team.team}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2.5 text-center font-mono">{team.played}</td>
                      <td className="py-3 px-2.5 text-center font-mono">{team.won}</td>
                      <td className="py-3 px-2.5 text-center font-mono">{team.drawn}</td>
                      <td className="py-3 px-2.5 text-center font-mono">{team.lost}</td>
                      <td className="py-3 px-2.5 text-center font-mono hidden sm:table-cell">{team.goalsFor}</td>
                      <td className="py-3 px-2.5 text-center font-mono hidden sm:table-cell">{team.goalsAgainst}</td>
                      <td className="py-3 px-2.5 text-center font-mono font-bold">
                        <span className={team.goalDifference > 0 ? 'text-emerald-600' : team.goalDifference < 0 ? 'text-red-600' : 'text-slate-500'}>
                          {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-center font-black font-mono text-slate-900 text-sm">
                        {team.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          SUBTAB 3: HEAD-TO-HEAD CALCULATOR
      ======================================================== */}
      {activeSubTab === 'h2h' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-xl font-black text-slate-900">Head-to-Head Comparison</h2>
              <p className="text-xs font-semibold text-slate-500">Historical & Season Performance Analysis</p>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={h2hTeam1}
                onChange={(e) => setH2hTeam1(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs rounded-xl p-2"
              >
                {EPL_20_TEAMS_LIST.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <span className="font-black text-red-600 text-sm">VS</span>
              <select
                value={h2hTeam2}
                onChange={(e) => setH2hTeam2(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs rounded-xl p-2"
              >
                {EPL_20_TEAMS_LIST.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <div className="flex flex-col items-center text-center space-y-2">
              <TeamCrest teamName={h2hTeam1} className="w-16 h-16" size={64} />
              <div className="font-black text-base text-slate-900">{h2hTeam1}</div>
              <div className="text-xs text-slate-500">Wins: {h2hData.teamAWins}</div>
            </div>

            <div className="text-center space-y-3">
              <div className="text-xs font-black uppercase text-red-600 tracking-wider">
                Total Meetings: {h2hData.totalMatches}
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {h2hData.teamAWins} - {h2hData.draws} - {h2hData.teamBWins}
              </div>
              <div className="text-xs text-slate-500 font-semibold">
                Draws: {h2hData.draws} • BTTS: {h2hData.bttsCount}
              </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-2">
              <TeamCrest teamName={h2hTeam2} className="w-16 h-16" size={64} />
              <div className="font-black text-base text-slate-900">{h2hTeam2}</div>
              <div className="text-xs text-slate-500">Wins: {h2hData.teamBWins}</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MATCH DETAILS MODAL
      ======================================================== */}
      {selectedMatchModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedMatchModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-5 animate-scaleUp relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMatchModal(null)}
              className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase bg-red-100 text-red-700 border border-red-200 font-mono">
                Matchweek {selectedMatchModal.matchweek}
              </span>
              <span className="text-xs font-bold text-slate-500">
                {selectedMatchModal.dateStr}
              </span>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex items-center justify-between">
              <div className="flex flex-col items-center text-center flex-1">
                <TeamCrest teamName={selectedMatchModal.homeTeam} className="w-12 h-12 mb-2" size={48} />
                <span className="font-extrabold text-sm text-slate-900">{selectedMatchModal.homeTeam}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Home</span>
              </div>

              <div className="text-center px-4">
                {selectedMatchModal.homeScore !== undefined && selectedMatchModal.awayScore !== undefined ? (
                  <>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">Full Time</div>
                    <div className="text-3xl font-black font-mono text-slate-900 mt-0.5">
                      {selectedMatchModal.homeScore} - {selectedMatchModal.awayScore}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Kick-off</div>
                    <div className="text-2xl font-black font-mono text-red-600 mt-0.5">
                      {selectedMatchModal.timeBST}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500">BST (UTC+6)</div>
                  </>
                )}
              </div>

              <div className="flex flex-col items-center text-center flex-1">
                <TeamCrest teamName={selectedMatchModal.awayTeam} className="w-12 h-12 mb-2" size={48} />
                <span className="font-extrabold text-sm text-slate-900">{selectedMatchModal.awayTeam}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Away</span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-medium text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-600" /> Stadium:
                </span>
                <span className="font-bold text-slate-900">{selectedMatchModal.stadium}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-red-600" /> City & Date:
                </span>
                <span className="font-bold text-slate-900">{selectedMatchModal.city}, {selectedMatchModal.fullDate}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedMatchModal(null);
                  if (onNavigateTab) onNavigateTab('match_select');
                }}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Target className="w-4 h-4 text-red-600" />
                <span>Analyze Signal</span>
              </button>

              <button
                onClick={() => {
                  setSelectedMatchModal(null);
                  if (onNavigateTab) onNavigateTab('daily_task');
                }}
                className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Go to Match Center</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
