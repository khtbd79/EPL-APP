import React, { useState, useMemo, useEffect } from 'react';
import { AppState, EPLMatchEvent, ActiveTab } from '../types';
import {
  EPL_2026_27_FIXTURES,
  EPLFixture,
  getMatchweekSchedule
} from '../data/eplFixtures2026_27';
import { TeamCrest } from './TeamCrest';
import { ALL_EPL_20_TEAMS } from '../utils/teamData';
import {
  Database,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Clock,
  MapPin,
  Trophy,
  CheckCircle2,
  X,
  Edit3,
  Save,
  Plus,
  RotateCcw,
  Trash2,
  Filter,
  Check
} from 'lucide-react';

export const EPL_20_TEAMS_LIST = [
  'AFC Bournemouth',
  'Arsenal',
  'Aston Villa',
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

const CUSTOM_FIXTURES_KEY = 'btts_team_data_custom_fixtures_v3';
const CUSTOM_ADDED_KEY = 'btts_team_data_custom_added_v3';

// Date format helper: converts YYYY-MM-DD to "Sat 22 Aug"
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

interface TeamDataViewProps {
  state: AppState;
  onSaveEplMatch: (match: EPLMatchEvent) => void;
  onDeleteEplMatch: (id: string) => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const TeamDataView: React.FC<TeamDataViewProps> = ({
  state,
  onSaveEplMatch,
  onDeleteEplMatch,
  onNavigateTab
}) => {
  // Current Matchweek (1 to 38)
  const [selectedWeek, setSelectedWeek] = useState<number>(state.currentMatchweek || 1);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FINISHED' | 'UPCOMING'>('ALL');

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

  // Local inputs state for immediate goal changes
  const [scoresInputState, setScoresInputState] = useState<Record<string, { homeScore: string; awayScore: string }>>({});

  // Active editing match for custom team/date/time dropdowns
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
    fullDate: '2026-08-22',
    timeOnly: '20:00',
    homeScore: '',
    awayScore: '',
    status: 'UPCOMING'
  });

  // Add Custom Match panel toggle & state
  const [isAddMatchOpen, setIsAddMatchOpen] = useState<boolean>(false);
  const [newMatchForm, setNewMatchForm] = useState<{
    matchweek: number;
    homeTeam: string;
    awayTeam: string;
    fullDate: string;
    timeOnly: string;
    homeScore: string;
    awayScore: string;
  }>({
    matchweek: selectedWeek,
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    fullDate: new Date().toISOString().split('T')[0],
    timeOnly: '20:00',
    homeScore: '',
    awayScore: ''
  });

  // Toast feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    setNewMatchForm((prev) => ({ ...prev, matchweek: selectedWeek }));
  }, [selectedWeek]);

  // Save custom override to LocalStorage
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
    setToastMessage('Match restored to original fixture.');
  };

  // Save custom added fixtures
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
    onDeleteEplMatch(id);
    setToastMessage('Match removed from schedule and standings.');
  };

  // Merge official fixtures, custom overrides, and state.eplMatches
  const currentSchedule = useMemo(() => {
    const baseSchedule = getMatchweekSchedule(selectedWeek) || EPL_2026_27_FIXTURES[0];
    const baseMatches = baseSchedule ? [...baseSchedule.matches] : [];

    const addedForThisWeek = customAddedFixtures.filter((m) => m.matchweek === selectedWeek);
    const combined = [...baseMatches, ...addedForThisWeek];

    const eplMatches = state.eplMatches || [];

    const finalMatches = combined.map((match) => {
      const override = customOverrides[match.id];
      const merged: EPLFixture = {
        ...match,
        ...(override || {})
      };

      if (override?.fullDate && !override.dateStr) {
        merged.dateStr = formatDateToDateStr(override.fullDate);
      }

      // Check if match result exists in state.eplMatches
      const recordedMatch = eplMatches.find(
        (m) =>
          m.id === match.id ||
          (m.matchweek === merged.matchweek &&
            m.homeTeam.toLowerCase().trim() === merged.homeTeam.toLowerCase().trim() &&
            m.awayTeam.toLowerCase().trim() === merged.awayTeam.toLowerCase().trim())
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

  // Group matches by Date String
  const groupedMatches = useMemo(() => {
    if (!currentSchedule) return [];

    let filtered = currentSchedule.matches;

    // Filter by team
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
          (m.stadium && m.stadium.toLowerCase().includes(q))
      );
    }

    // Filter by status
    if (statusFilter === 'FINISHED') {
      filtered = filtered.filter((m) => m.status === 'FINISHED' || (m.homeScore !== undefined && m.homeScore !== null));
    } else if (statusFilter === 'UPCOMING') {
      filtered = filtered.filter((m) => m.status !== 'FINISHED' && (m.homeScore === undefined || m.homeScore === null));
    }

    // Group by dateStr
    const groups: { dateStr: string; matches: EPLFixture[] }[] = [];
    filtered.forEach((match) => {
      const groupKey = match.dateStr || 'Fixtures';
      let existing = groups.find((g) => g.dateStr === groupKey);
      if (!existing) {
        existing = { dateStr: groupKey, matches: [] };
        groups.push(existing);
      }
      existing.matches.push(match);
    });

    return groups;
  }, [currentSchedule, selectedTeamFilter, searchQuery, statusFilter]);

  // Week KPI metrics
  const weekStats = useMemo(() => {
    const matches = currentSchedule?.matches || [];
    const total = matches.length;
    const finished = matches.filter((m) => m.homeScore !== undefined && m.homeScore !== null);
    const finishedCount = finished.length;
    const totalGoals = finished.reduce((acc, m) => acc + (m.homeScore || 0) + (m.awayScore || 0), 0);
    const bttsCount = finished.filter((m) => (m.homeScore || 0) > 0 && (m.awayScore || 0) > 0).length;
    const over25Count = finished.filter((m) => ((m.homeScore || 0) + (m.awayScore || 0)) > 2.5).length;

    const bttsRate = finishedCount > 0 ? (bttsCount / finishedCount) * 100 : 0;
    const over25Rate = finishedCount > 0 ? (over25Count / finishedCount) * 100 : 0;

    return {
      total,
      finishedCount,
      totalGoals,
      bttsRate,
      over25Rate
    };
  }, [currentSchedule]);

  // Save direct goal input (instant sync)
  const handleSaveGoalScore = (match: EPLFixture, hScoreVal: number, aScoreVal: number) => {
    const hScore = Math.max(0, hScoreVal);
    const aScore = Math.max(0, aScoreVal);

    const winner = hScore > aScore ? 'HOME' : aScore > hScore ? 'AWAY' : 'DRAW';
    const totalGoals = hScore + aScore;
    const btts = hScore > 0 && aScore > 0;
    const over25 = totalGoals > 2.5;

    const event: EPLMatchEvent = {
      id: match.id,
      matchweek: match.matchweek || selectedWeek,
      date: match.fullDate || match.dateStr,
      matchTime: match.timeBST,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
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

    // Save to AppState (which automatically persists and updates Standings, Dashboard, All Markets, Demo Match)
    onSaveEplMatch(event);

    // Save to local custom overrides
    saveCustomOverride(match.id, {
      homeScore: hScore,
      awayScore: aScore,
      status: 'FINISHED'
    });

    setToastMessage(`✓ Saved: ${match.homeTeam} ${hScore} - ${aScore} ${match.awayTeam}`);
  };

  // Single Save function for the entire Matchweek
  const handleSaveMatchweekScores = () => {
    const matches = currentSchedule?.matches || [];
    let savedCount = 0;

    matches.forEach((match) => {
      const scoreState = scoresInputState[match.id];
      const hStr = scoreState?.homeScore !== undefined
        ? scoreState.homeScore
        : (match.homeScore !== undefined && match.homeScore !== null ? String(match.homeScore) : '');
      const aStr = scoreState?.awayScore !== undefined
        ? scoreState.awayScore
        : (match.awayScore !== undefined && match.awayScore !== null ? String(match.awayScore) : '');

      if (hStr.trim() !== '' && aStr.trim() !== '') {
        const hScore = Math.max(0, parseInt(hStr, 10) || 0);
        const aScore = Math.max(0, parseInt(aStr, 10) || 0);

        const winner = hScore > aScore ? 'HOME' : aScore > hScore ? 'AWAY' : 'DRAW';
        const totalGoals = hScore + aScore;
        const btts = hScore > 0 && aScore > 0;
        const over25 = totalGoals > 2.5;

        const event: EPLMatchEvent = {
          id: match.id,
          matchweek: match.matchweek || selectedWeek,
          date: match.fullDate || match.dateStr,
          matchTime: match.timeBST,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
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

        onSaveEplMatch(event);

        saveCustomOverride(match.id, {
          homeScore: hScore,
          awayScore: aScore,
          status: 'FINISHED'
        });

        savedCount++;
      }
    });

    if (savedCount > 0) {
      setToastMessage(`✓ Matchweek ${selectedWeek}: ${savedCount} match result${savedCount > 1 ? 's' : ''} saved & synced successfully!`);
    } else {
      setToastMessage(`Please enter scores for matches in Matchweek ${selectedWeek} before saving.`);
    }
  };

  // Clear match score
  const handleClearScore = (match: EPLFixture) => {
    onDeleteEplMatch(match.id);
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
    setToastMessage(`Score cleared for ${match.homeTeam} vs ${match.awayTeam}`);
  };

  // Open inline edit panel
  const handleStartEditing = (match: EPLFixture) => {
    setEditingMatchId(match.id);
    const timeClean = (match.timeBST || '20:00').replace(/bst/i, '').trim();
    setEditForm({
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      fullDate: match.fullDate || '2026-08-22',
      timeOnly: timeClean,
      homeScore: match.homeScore !== undefined && match.homeScore !== null ? String(match.homeScore) : '',
      awayScore: match.awayScore !== undefined && match.awayScore !== null ? String(match.awayScore) : '',
      status: match.status === 'FINISHED' ? 'FINISHED' : 'UPCOMING'
    });
  };

  // Save inline edit form
  const handleSaveEditForm = (matchId: string) => {
    if (editForm.homeTeam === editForm.awayTeam) {
      setToastMessage('Home team and Away team cannot be identical.');
      return;
    }

    const venue = getTeamVenue(editForm.homeTeam);
    const dateStr = formatDateToDateStr(editForm.fullDate);
    const timeBST = formatTimeToBst(editForm.timeOnly);

    const hasScores = editForm.homeScore.trim() !== '' && editForm.awayScore.trim() !== '';
    const hScore = hasScores ? Math.max(0, parseInt(editForm.homeScore, 10) || 0) : undefined;
    const aScore = hasScores ? Math.max(0, parseInt(editForm.awayScore, 10) || 0) : undefined;

    const override: CustomFixtureOverride = {
      homeTeam: editForm.homeTeam,
      awayTeam: editForm.awayTeam,
      fullDate: editForm.fullDate,
      dateStr,
      timeBST,
      stadium: venue.stadium,
      city: venue.city,
      homeScore: hScore !== undefined ? hScore : null,
      awayScore: aScore !== undefined ? aScore : null,
      status: hasScores ? 'FINISHED' : editForm.status
    };

    saveCustomOverride(matchId, override);

    if (hasScores && hScore !== undefined && aScore !== undefined) {
      const winner = hScore > aScore ? 'HOME' : aScore > hScore ? 'AWAY' : 'DRAW';
      const totalGoals = hScore + aScore;
      const btts = hScore > 0 && aScore > 0;
      const over25 = totalGoals > 2.5;

      const event: EPLMatchEvent = {
        id: matchId,
        matchweek: selectedWeek,
        date: editForm.fullDate,
        matchTime: timeBST,
        homeTeam: editForm.homeTeam,
        awayTeam: editForm.awayTeam,
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

      onSaveEplMatch(event);
      setToastMessage(`✓ Result updated: ${editForm.homeTeam} ${hScore} - ${aScore} ${editForm.awayTeam}`);
    } else {
      setToastMessage('✓ Match details updated.');
    }

    setEditingMatchId(null);
  };

  // Add brand new custom match
  const handleCreateNewMatch = () => {
    if (newMatchForm.homeTeam === newMatchForm.awayTeam) {
      setToastMessage('Home team and Away team cannot be identical.');
      return;
    }

    const venue = getTeamVenue(newMatchForm.homeTeam);
    const dateStr = formatDateToDateStr(newMatchForm.fullDate);
    const timeBST = formatTimeToBst(newMatchForm.timeOnly);

    const hasScores = newMatchForm.homeScore.trim() !== '' && newMatchForm.awayScore.trim() !== '';
    const hScore = hasScores ? Math.max(0, parseInt(newMatchForm.homeScore, 10) || 0) : undefined;
    const aScore = hasScores ? Math.max(0, parseInt(newMatchForm.awayScore, 10) || 0) : undefined;

    const newId = `epl-custom-${Date.now()}`;
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
      status: hasScores ? 'FINISHED' : 'UPCOMING'
    };

    const updated = [...customAddedFixtures, newFixture];
    saveCustomAddedFixtures(updated);

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

      onSaveEplMatch(event);
      setToastMessage(`✓ Match created & synced: ${newMatchForm.homeTeam} ${hScore} - ${aScore} ${newMatchForm.awayTeam}`);
    } else {
      setToastMessage(`✓ New match added to Matchweek ${newMatchForm.matchweek}!`);
    }

    setIsAddMatchOpen(false);
    setNewMatchForm({
      matchweek: selectedWeek,
      homeTeam: 'Arsenal',
      awayTeam: 'Chelsea',
      fullDate: new Date().toISOString().split('T')[0],
      timeOnly: '20:00',
      homeScore: '',
      awayScore: ''
    });
  };

  const totalRecordedCount = (state.eplMatches || []).length;

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-red-500/50 flex items-center space-x-3 animate-slideDown">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-red-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/20 shrink-0">
              <Database className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  {totalRecordedCount} Results Synced
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5 sm:mt-1">
                TEAM DATA
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start md:self-auto">
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('standings')}
                className="py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer border border-slate-200"
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>View Standings</span>
              </button>
            )}
            <button
              onClick={() => setIsAddMatchOpen(!isAddMatchOpen)}
              className="py-2 sm:py-2.5 px-3.5 sm:px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center space-x-1.5 transition-all shadow-md shadow-red-600/20 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Match</span>
            </button>
          </div>
        </div>
      </div>

      {/* MATCHWEEK NAVIGATION & METRICS */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-red-100 shadow-sm space-y-4 sm:space-y-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Week Stepper */}
          <div className="flex items-center justify-between w-full md:w-auto space-x-2 sm:space-x-4">
            <button
              onClick={() => setSelectedWeek((w) => Math.max(1, w - 1))}
              disabled={selectedWeek <= 1}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                selectedWeek <= 1
                  ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                  : 'bg-white text-slate-800 border-slate-300 hover:border-red-500 hover:text-red-600 hover:bg-red-50 shadow-xs active:scale-95'
              }`}
              title="Previous Matchweek"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>

            <div className="text-center px-2 flex-1 min-w-0">
              <div className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight whitespace-nowrap">
                Matchweek {selectedWeek}
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-red-600 tracking-wide mt-0.5 truncate">
                {currentSchedule?.dateRange || `Week ${selectedWeek}`}
              </div>
            </div>

            <button
              onClick={() => setSelectedWeek((w) => Math.min(38, w + 1))}
              disabled={selectedWeek >= 38}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                selectedWeek >= 38
                  ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                  : 'bg-white text-slate-800 border-slate-300 hover:border-red-500 hover:text-red-600 hover:bg-red-50 shadow-xs active:scale-95'
              }`}
              title="Next Matchweek"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Quick Matchweek Select Dropdown & Matchweek Save Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-48 md:w-56">
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-extrabold text-xs sm:text-sm rounded-2xl py-2 sm:py-2.5 pl-3.5 pr-8 outline-none focus:ring-2 focus:ring-red-500 focus:bg-white cursor-pointer shadow-xs transition-colors"
              >
                {Array.from({ length: 38 }, (_, i) => i + 1).map((mw) => (
                  <option key={mw} value={mw}>
                    Matchweek {mw}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={handleSaveMatchweekScores}
              className="w-full sm:w-auto py-2 sm:py-2.5 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-black flex items-center justify-center space-x-2 shadow-md shadow-red-600/20 transition-all cursor-pointer active:scale-95 shrink-0"
              title={`Save all results for Matchweek ${selectedWeek}`}
            >
              <Save className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Save Matchweek {selectedWeek}</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats for this week */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="text-[10px] font-black uppercase text-slate-400">Fixtures in Week</div>
            <div className="text-lg font-black font-mono text-slate-900 mt-0.5">
              {weekStats.finishedCount}/{weekStats.total} <span className="text-xs font-semibold text-slate-500">Recorded</span>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="text-[10px] font-black uppercase text-slate-400">Total Goals</div>
            <div className="text-lg font-black font-mono text-slate-900 mt-0.5">
              {weekStats.totalGoals} <span className="text-xs font-semibold text-slate-500">Goals</span>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="text-[10px] font-black uppercase text-slate-400">BTTS Yes Rate</div>
            <div className="text-lg font-black font-mono text-red-600 mt-0.5">
              {weekStats.bttsRate.toFixed(0)}%
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="text-[10px] font-black uppercase text-slate-400">Over 2.5 Rate</div>
            <div className="text-lg font-black font-mono text-slate-900 mt-0.5">
              {weekStats.over25Rate.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* ADD CUSTOM MATCH PANEL */}
      {isAddMatchOpen && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-red-500 shadow-md animate-fadeIn space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Plus className="w-5 h-5 text-red-600 stroke-[2.5]" />
              <h2 className="text-base font-black text-slate-900">
                Add Match to Matchweek {newMatchForm.matchweek}
              </h2>
            </div>
            <button
              onClick={() => setIsAddMatchOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Matchweek */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Matchweek</label>
              <select
                value={newMatchForm.matchweek}
                onChange={(e) => setNewMatchForm((prev) => ({ ...prev, matchweek: Number(e.target.value) }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-red-500"
              >
                {Array.from({ length: 38 }, (_, i) => i + 1).map((mw) => (
                  <option key={mw} value={mw}>
                    Matchweek {mw}
                  </option>
                ))}
              </select>
            </div>

            {/* Home Team Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Home Team</label>
              <select
                value={newMatchForm.homeTeam}
                onChange={(e) => setNewMatchForm((prev) => ({ ...prev, homeTeam: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-red-500"
              >
                {EPL_20_TEAMS_LIST.map((tm) => (
                  <option key={tm} value={tm}>
                    {tm}
                  </option>
                ))}
              </select>
            </div>

            {/* Away Team Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Away Team</label>
              <select
                value={newMatchForm.awayTeam}
                onChange={(e) => setNewMatchForm((prev) => ({ ...prev, awayTeam: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-red-500"
              >
                {EPL_20_TEAMS_LIST.map((tm) => (
                  <option key={tm} value={tm}>
                    {tm}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={newMatchForm.fullDate}
                onChange={(e) => setNewMatchForm((prev) => ({ ...prev, fullDate: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Time Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Time (BST)</label>
              <input
                type="time"
                value={newMatchForm.timeOnly}
                onChange={(e) => setNewMatchForm((prev) => ({ ...prev, timeOnly: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Home Goals */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Home Goals (Optional)</label>
              <input
                type="number"
                min="0"
                max="20"
                placeholder="e.g. 2"
                value={newMatchForm.homeScore}
                onChange={(e) => setNewMatchForm((prev) => ({ ...prev, homeScore: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Away Goals */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Away Goals (Optional)</label>
              <input
                type="number"
                min="0"
                max="20"
                placeholder="e.g. 1"
                value={newMatchForm.awayScore}
                onChange={(e) => setNewMatchForm((prev) => ({ ...prev, awayScore: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => setIsAddMatchOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateNewMatch}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md cursor-pointer transition-all"
            >
              Add Match & Sync
            </button>
          </div>
        </div>
      )}

      {/* FILTER AND SEARCH BAR */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-red-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search teams or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Team Dropdown Filter */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={selectedTeamFilter}
              onChange={(e) => setSelectedTeamFilter(e.target.value)}
              className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-xl py-2 pl-3 pr-8 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
            >
              <option value="ALL">All 20 Clubs</option>
              {EPL_20_TEAMS_LIST.map((tm) => (
                <option key={tm} value={tm}>
                  {tm}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('FINISHED')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'FINISHED' ? 'bg-white text-red-600 shadow-xs font-black' : 'text-slate-600'
              }`}
            >
              Finished
            </button>
            <button
              onClick={() => setStatusFilter('UPCOMING')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'UPCOMING' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Pending
            </button>
          </div>
        </div>
      </div>

      {/* MATCHES LIST HEADER WITH MATCHWEEK SAVE OPTION */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-red-600" />
          <span className="text-xs sm:text-sm font-black text-slate-900">
            Matchweek {selectedWeek} Fixtures ({currentSchedule?.matches?.length || 0})
          </span>
        </div>
        <button
          onClick={handleSaveMatchweekScores}
          className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
          title={`Save all results for Matchweek ${selectedWeek}`}
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Matchweek {selectedWeek}</span>
        </button>
      </div>

      {/* MATCHES LIST */}
      {groupedMatches.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-red-100 shadow-sm space-y-3">
          <Database className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No matches found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No fixtures match your current filter in Matchweek {selectedWeek}.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedMatches.map((group) => (
            <div key={group.dateStr} className="space-y-3">
              {/* Date Header */}
              <div className="flex items-center space-x-2 px-1">
                <Calendar className="w-4 h-4 text-red-600" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  {group.dateStr}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  • {group.matches.length} {group.matches.length === 1 ? 'match' : 'matches'}
                </span>
              </div>

              {/* Match Rows */}
              <div className="space-y-3">
                {group.matches.map((match) => {
                  const isEditing = editingMatchId === match.id;
                  const isCustom = match.id.startsWith('epl-custom-');
                  const isFinished = match.homeScore !== undefined && match.homeScore !== null;
                  const scoreState = scoresInputState[match.id];
                  const currentHome = scoreState ? scoreState.homeScore : (match.homeScore !== undefined && match.homeScore !== null ? String(match.homeScore) : '');
                  const currentAway = scoreState ? scoreState.awayScore : (match.awayScore !== undefined && match.awayScore !== null ? String(match.awayScore) : '');

                  return (
                    <div
                      key={match.id}
                      className={`bg-white rounded-2xl border transition-all ${
                        isFinished
                          ? 'border-red-200 shadow-xs'
                          : 'border-slate-200 hover:border-red-200 shadow-xs'
                      }`}
                    >
                      {/* INLINE EDIT MODE */}
                      {isEditing ? (
                        <div className="p-4 sm:p-5 space-y-4 bg-red-50/30 rounded-2xl border border-red-200">
                          <div className="flex items-center justify-between border-b border-red-100 pb-2">
                            <span className="text-xs font-black text-slate-900 flex items-center space-x-1.5">
                              <Edit3 className="w-4 h-4 text-red-600" />
                              <span>Edit Match Details & Dropdowns</span>
                            </span>
                            <button
                              onClick={() => setEditingMatchId(null)}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* Home Team Dropdown */}
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Home Team</label>
                              <select
                                value={editForm.homeTeam}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, homeTeam: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-900"
                              >
                                {EPL_20_TEAMS_LIST.map((tm) => (
                                  <option key={tm} value={tm}>
                                    {tm}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Away Team Dropdown */}
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Away Team</label>
                              <select
                                value={editForm.awayTeam}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, awayTeam: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-900"
                              >
                                {EPL_20_TEAMS_LIST.map((tm) => (
                                  <option key={tm} value={tm}>
                                    {tm}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Date Picker */}
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Date</label>
                              <input
                                type="date"
                                value={editForm.fullDate}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, fullDate: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-900"
                              />
                            </div>

                            {/* Time Picker */}
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Time (BST)</label>
                              <input
                                type="time"
                                value={editForm.timeOnly}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, timeOnly: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-900"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <button
                              onClick={() => resetCustomOverride(match.id)}
                              className="text-xs font-bold text-slate-500 hover:text-red-600 flex items-center space-x-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reset to Default</span>
                            </button>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setEditingMatchId(null)}
                                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEditForm(match.id)}
                                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-sm cursor-pointer"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* NORMAL VIEW ROW WITH DIRECT GOALS ENTRY */
                        <div className="p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4">
                          {/* Match Info & Venue */}
                          <div className="flex items-center justify-between w-full md:w-auto gap-2 pb-1.5 md:pb-0 border-b border-slate-100 md:border-b-0">
                            <div className="flex items-center space-x-2 min-w-0">
                              <div className="text-center bg-slate-100/80 px-2 py-1 rounded-lg border border-slate-200 shrink-0">
                                <div className="text-[11px] sm:text-xs font-mono font-black text-slate-900 flex items-center justify-center space-x-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>{match.timeBST || '20:00'}</span>
                                </div>
                              </div>
                              <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 truncate">
                                {match.dateStr}
                              </div>
                              <div className="text-[10px] sm:text-xs text-slate-400 hidden xs:flex items-center space-x-1 truncate max-w-[130px] sm:max-w-[180px]">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{match.stadium || `${match.homeTeam} Stadium`}</span>
                              </div>
                            </div>

                            {/* Mobile-only Action Controls */}
                            <div className="flex md:hidden items-center space-x-1 shrink-0">
                              {isFinished && (
                                <button
                                  onClick={() => handleClearScore(match)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-all cursor-pointer"
                                  title="Clear Score"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleStartEditing(match)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-all cursor-pointer"
                                title="Edit Match"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {isCustom && (
                                <button
                                  onClick={() => handleDeleteCustomMatch(match.id)}
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                                  title="Delete Match"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Teams & Goals Center Arena */}
                          <div className="flex items-center justify-between space-x-1 sm:space-x-3 w-full md:flex-1 max-w-xl">
                            {/* HOME TEAM */}
                            <div className="flex items-center justify-end space-x-1.5 sm:space-x-2 flex-1 min-w-0 text-right">
                              <span 
                                className="text-[11px] sm:text-xs md:text-sm font-black text-slate-900 leading-tight whitespace-nowrap overflow-hidden text-ellipsis block min-w-0" 
                                title={match.homeTeam}
                              >
                                {match.homeTeam}
                              </span>
                              <div className="shrink-0">
                                <TeamCrest teamName={match.homeTeam} size={22} className="w-5 h-5 sm:w-6 sm:h-6" />
                              </div>
                            </div>

                            {/* GOALS ENTRY BOXES */}
                            <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0 bg-slate-100/90 p-1 sm:p-1.5 rounded-xl border border-slate-200 mx-0.5">
                              {/* Home Goal Input */}
                              <input
                                type="number"
                                min="0"
                                max="20"
                                placeholder="-"
                                value={currentHome}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setScoresInputState((prev) => ({
                                    ...prev,
                                    [match.id]: { homeScore: val, awayScore: currentAway }
                                  }));
                                }}
                                className="w-8.5 h-8 sm:w-11 sm:h-10 text-center font-mono font-black text-xs sm:text-base bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-slate-900 shadow-xs"
                              />

                              <span className="text-xs font-black text-slate-400">:</span>

                              {/* Away Goal Input */}
                              <input
                                type="number"
                                min="0"
                                max="20"
                                placeholder="-"
                                value={currentAway}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setScoresInputState((prev) => ({
                                    ...prev,
                                    [match.id]: { homeScore: currentHome, awayScore: val }
                                  }));
                                }}
                                className="w-8.5 h-8 sm:w-11 sm:h-10 text-center font-mono font-black text-xs sm:text-base bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-slate-900 shadow-xs"
                              />
                            </div>

                            {/* AWAY TEAM */}
                            <div className="flex items-center justify-start space-x-1.5 sm:space-x-2 flex-1 min-w-0 text-left">
                              <div className="shrink-0">
                                <TeamCrest teamName={match.awayTeam} size={22} className="w-5 h-5 sm:w-6 sm:h-6" />
                              </div>
                              <span 
                                className="text-[11px] sm:text-xs md:text-sm font-black text-slate-900 leading-tight whitespace-nowrap overflow-hidden text-ellipsis block min-w-0" 
                                title={match.awayTeam}
                              >
                                {match.awayTeam}
                              </span>
                            </div>
                          </div>

                          {/* Desktop Action Controls & Badges */}
                          <div className="hidden md:flex items-center space-x-1.5 shrink-0 justify-end">
                            {/* Clear score */}
                            {isFinished && (
                              <button
                                onClick={() => handleClearScore(match)}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-all cursor-pointer"
                                title="Clear Score"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}

                            {/* Edit dropdowns / details */}
                            <button
                              onClick={() => handleStartEditing(match)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-all cursor-pointer"
                              title="Edit Date, Time & Teams"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete custom fixture */}
                            {isCustom && (
                              <button
                                onClick={() => handleDeleteCustomMatch(match.id)}
                                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                                title="Delete Match"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
