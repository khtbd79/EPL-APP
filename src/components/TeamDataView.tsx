import React, { useState, useEffect, useMemo } from 'react';
import { AppState, EPLMatchEvent, ActiveTab } from '../types';
import { ALL_EPL_20_TEAMS, normalizeTeamName, calculateEPLStandings } from '../utils/teamData';
import { TeamCrest } from './TeamCrest';
import {
  Trophy,
  Calendar,
  Plus,
  Save,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Database,
  ArrowRight,
  Check,
  Clock,
  Sparkles
} from 'lucide-react';

// Helper to auto-lookup venue for the selected home team
export const getTeamStadium = (teamName: string): string => {
  const norm = normalizeTeamName(teamName).toLowerCase();
  const found = ALL_EPL_20_TEAMS.find(
    (t) => normalizeTeamName(t.name).toLowerCase() === norm
  );
  return found ? `${found.stadium}, ${found.city}` : 'Premier League Ground';
};

interface TeamDataViewProps {
  state: AppState;
  onSaveEplMatch: (match: EPLMatchEvent) => void;
  onDeleteEplMatch: (id: string) => void;
  onBatchSaveEplMatches?: (matches: EPLMatchEvent[]) => void;
  onClearMatchweekMatches?: (matchweek: number) => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

interface EditableMatchRow {
  id: string;
  matchweek: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: string;
  awayScore: string;
  date: string;
  time: string;
  status: 'UPCOMING' | 'FINISHED' | 'POSTPONED';
  isDirty?: boolean;
}

export const TeamDataView: React.FC<TeamDataViewProps> = ({
  state,
  onSaveEplMatch,
  onDeleteEplMatch,
  onBatchSaveEplMatches,
  onClearMatchweekMatches,
  onNavigateTab,
}) => {
  // Selected Matchweek (1 to 38)
  const [selectedWeek, setSelectedWeek] = useState<number>(
    state.currentMatchweek || 1
  );

  // Success toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Dynamic Standings: Ordered 1 to 20 matching the official Standings table
  const standingsTeams = useMemo(() => {
    const standings = calculateEPLStandings(state.eplMatches || []);
    return standings.map((item, index) => ({
      rank: index + 1,
      name: item.team,
      points: item.points,
      played: item.played,
    }));
  }, [state.eplMatches]);

  // Extract all existing saved matches from state for the selected matchweek
  const weekMatchesFromState = useMemo(() => {
    const list = (state.eplMatches || []).filter(
      (m) => Number(m.matchweek) === Number(selectedWeek)
    );
    return list;
  }, [state.eplMatches, selectedWeek]);

  // Working local matches for the active matchweek to allow smooth editing
  const [rows, setRows] = useState<EditableMatchRow[]>([]);

  // Sync rows whenever selectedWeek changes or new matches arrive in state
  useEffect(() => {
    if (weekMatchesFromState.length > 0) {
      setRows(
        weekMatchesFromState.map((m) => ({
          id: m.id,
          matchweek: m.matchweek,
          homeTeam: normalizeTeamName(m.homeTeam),
          awayTeam: normalizeTeamName(m.awayTeam),
          homeScore:
            typeof m.homeScore === 'number' && !isNaN(m.homeScore)
              ? String(m.homeScore)
              : '',
          awayScore:
            typeof m.awayScore === 'number' && !isNaN(m.awayScore)
              ? String(m.awayScore)
              : '',
          date: m.date || new Date().toISOString().split('T')[0],
          time: m.matchTime || '20:00 BST',
          status: m.homeScore != null ? 'FINISHED' : 'UPCOMING',
          isDirty: false,
        }))
      );
    } else {
      setRows([]);
    }
  }, [weekMatchesFromState, selectedWeek]);

  // Helper: check team usage in current week to detect duplicates across rows
  const getTeamUsageMap = useMemo(() => {
    const usage = new Map<string, number[]>();
    rows.forEach((row, idx) => {
      const hKey = normalizeTeamName(row.homeTeam).toLowerCase().trim();
      const aKey = normalizeTeamName(row.awayTeam).toLowerCase().trim();

      if (hKey) {
        const list = usage.get(hKey) || [];
        list.push(idx);
        usage.set(hKey, list);
      }
      if (aKey) {
        const list = usage.get(aKey) || [];
        list.push(idx);
        usage.set(aKey, list);
      }
    });
    return usage;
  }, [rows]);

  // Update a field in a match row
  const updateRow = (index: number, field: keyof EditableMatchRow, val: any) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        const updated = { ...r, [field]: val, isDirty: true };
        if (field === 'homeScore' || field === 'awayScore') {
          const h = field === 'homeScore' ? val : r.homeScore;
          const a = field === 'awayScore' ? val : r.awayScore;
          if (h !== '' && a !== '') {
            updated.status = 'FINISHED';
          } else {
            updated.status = 'UPCOMING';
          }
        }
        return updated;
      })
    );
  };

  // Add a new single match row with standings-based defaults
  const handleAddNewRow = () => {
    const usedTeams = new Set<string>();
    rows.forEach((r) => {
      usedTeams.add(normalizeTeamName(r.homeTeam).toLowerCase());
      usedTeams.add(normalizeTeamName(r.awayTeam).toLowerCase());
    });

    const availableTeams = standingsTeams.filter(
      (t) => !usedTeams.has(t.name.toLowerCase())
    );

    const defaultHome = availableTeams[0]?.name || standingsTeams[0]?.name || 'Arsenal';
    const defaultAway =
      availableTeams[1]?.name ||
      standingsTeams.find((t) => t.name !== defaultHome)?.name ||
      'Chelsea';

    const newRow: EditableMatchRow = {
      id: `mw${selectedWeek}_custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      matchweek: selectedWeek,
      homeTeam: defaultHome,
      awayTeam: defaultAway,
      homeScore: '',
      awayScore: '',
      date: new Date().toISOString().split('T')[0],
      time: '20:00 BST',
      status: 'UPCOMING',
      isDirty: true,
    };

    setRows((prev) => [...prev, newRow]);
    setToastMessage('Match slot added.');
  };

  // Generate 10 empty match slots for this matchweek matching standings pairs
  const handleGenerate10Slots = () => {
    if (
      rows.length > 0 &&
      !window.confirm(
        `Replace existing matches in Matchweek ${selectedWeek} with 10 slots?`
      )
    ) {
      return;
    }

    const new10Rows: EditableMatchRow[] = [];
    const dateStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < 10; i++) {
      const homeTeam = standingsTeams[i * 2]?.name || 'Arsenal';
      const awayTeam = standingsTeams[i * 2 + 1]?.name || 'Chelsea';

      new10Rows.push({
        id: `mw${selectedWeek}_slot_${i + 1}_${Date.now()}`,
        matchweek: selectedWeek,
        homeTeam,
        awayTeam,
        homeScore: '',
        awayScore: '',
        date: dateStr,
        time: '20:00 BST',
        status: 'UPCOMING',
        isDirty: true,
      });
    }

    setRows(new10Rows);
    setToastMessage(`Generated 10 match slots for Matchweek ${selectedWeek}.`);
  };

  // Save single match
  const handleSaveSingleMatch = (row: EditableMatchRow, index: number) => {
    if (!row.homeTeam || !row.awayTeam) {
      alert('Please select both Home and Away teams.');
      return;
    }

    if (
      normalizeTeamName(row.homeTeam).toLowerCase() ===
      normalizeTeamName(row.awayTeam).toLowerCase()
    ) {
      alert('Home and Away teams cannot be the same.');
      return;
    }

    const hScore = row.homeScore.trim() !== '' ? Number(row.homeScore) : 0;
    const aScore = row.awayScore.trim() !== '' ? Number(row.awayScore) : 0;
    const isPlayed = row.homeScore.trim() !== '' && row.awayScore.trim() !== '';

    const winner: 'HOME' | 'AWAY' | 'DRAW' =
      hScore > aScore ? 'HOME' : aScore > hScore ? 'AWAY' : 'DRAW';

    const matchToSave: EPLMatchEvent = {
      id: row.id,
      matchweek: selectedWeek,
      date: row.date,
      matchTime: row.time,
      homeTeam: normalizeTeamName(row.homeTeam),
      awayTeam: normalizeTeamName(row.awayTeam),
      homeScore: hScore,
      awayScore: aScore,
      winner,
      totalGoals: hScore + aScore,
      btts: isPlayed ? hScore > 0 && aScore > 0 : false,
      over25: isPlayed ? hScore + aScore > 2.5 : false,
      venue: getTeamStadium(row.homeTeam),
      createdAt: new Date().toISOString(),
    };

    onSaveEplMatch(matchToSave);

    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, isDirty: false } : r))
    );

    setToastMessage(`Match #${index + 1} (${row.homeTeam} vs ${row.awayTeam}) saved.`);
  };

  // Save all matches in this matchweek
  const handleSaveAllMatches = () => {
    if (rows.length === 0) {
      alert('No matches to save.');
      return;
    }

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (
        normalizeTeamName(r.homeTeam).toLowerCase() ===
        normalizeTeamName(r.awayTeam).toLowerCase()
      ) {
        alert(`Match #${i + 1}: Home and Away teams cannot be the same (${r.homeTeam}).`);
        return;
      }
    }

    const matchesToSave: EPLMatchEvent[] = rows.map((row) => {
      const hScore = row.homeScore.trim() !== '' ? Number(row.homeScore) : 0;
      const aScore = row.awayScore.trim() !== '' ? Number(row.awayScore) : 0;
      const isPlayed = row.homeScore.trim() !== '' && row.awayScore.trim() !== '';

      const winner: 'HOME' | 'AWAY' | 'DRAW' =
        hScore > aScore ? 'HOME' : aScore > hScore ? 'AWAY' : 'DRAW';

      return {
        id: row.id,
        matchweek: selectedWeek,
        date: row.date,
        matchTime: row.time,
        homeTeam: normalizeTeamName(row.homeTeam),
        awayTeam: normalizeTeamName(row.awayTeam),
        homeScore: hScore,
        awayScore: aScore,
        winner,
        totalGoals: hScore + aScore,
        btts: isPlayed ? hScore > 0 && aScore > 0 : false,
        over25: isPlayed ? hScore + aScore > 2.5 : false,
        venue: getTeamStadium(row.homeTeam),
        createdAt: new Date().toISOString(),
      };
    });

    if (onBatchSaveEplMatches) {
      onBatchSaveEplMatches(matchesToSave);
    } else {
      matchesToSave.forEach((m) => onSaveEplMatch(m));
    }

    setRows((prev) => prev.map((r) => ({ ...r, isDirty: false })));
    setToastMessage(`Matchweek ${selectedWeek} matches saved.`);
  };

  // Delete row
  const handleDeleteRow = (id: string, index: number) => {
    onDeleteEplMatch(id);
    setRows((prev) => prev.filter((_, i) => i !== index));
    setToastMessage(`Match #${index + 1} deleted.`);
  };

  // Clear all matches for this matchweek
  const handleClearWeek = () => {
    if (!window.confirm(`Clear all matches for Matchweek ${selectedWeek}?`)) {
      return;
    }

    if (onClearMatchweekMatches) {
      onClearMatchweekMatches(selectedWeek);
    } else {
      rows.forEach((r) => onDeleteEplMatch(r.id));
    }

    setRows([]);
    setToastMessage(`Matchweek ${selectedWeek} matches cleared.`);
  };

  const finishedCount = rows.filter(
    (r) => r.homeScore.trim() !== '' && r.awayScore.trim() !== ''
  ).length;

  return (
    <div className="space-y-6 pb-20 animate-fadeIn text-slate-900 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center space-x-3 text-sm font-semibold animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-red-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/20 shrink-0">
            <Database className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Team Data Entry
            </h1>
          </div>
        </div>

        {/* Top Action Bar */}
        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('standings')}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer border border-slate-200"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Standings</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}

          <button
            onClick={handleSaveAllMatches}
            className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center space-x-2 shadow-md shadow-red-600/20 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Save All Matches</span>
          </button>
        </div>
      </div>

      {/* Matchweek Selector Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <button
            disabled={selectedWeek <= 1}
            onClick={() => setSelectedWeek((prev) => Math.max(1, prev - 1))}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Previous Matchweek"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-xl px-4 py-1.5">
            <Calendar className="w-4 h-4 text-red-600" />
            <span className="text-sm font-black text-red-700">
              Matchweek {selectedWeek}
            </span>
          </div>

          <button
            disabled={selectedWeek >= 38}
            onClick={() => setSelectedWeek((prev) => Math.min(38, prev + 1))}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Next Matchweek"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(Number(e.target.value))}
            className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
          >
            {Array.from({ length: 38 }, (_, i) => i + 1).map((mw) => (
              <option key={mw} value={mw}>
                Matchweek {mw}
              </option>
            ))}
          </select>
        </div>

        {/* Matchweek Quick Status & Actions */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span>Total: <strong className="text-slate-900 font-bold">{rows.length}</strong></span>
            <span>•</span>
            <span>Finished: <strong className="text-emerald-700 font-bold">{finishedCount}</strong></span>
          </div>

          <button
            onClick={handleAddNewRow}
            className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Match</span>
          </button>

          <button
            onClick={handleGenerate10Slots}
            className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
            title="Generate 10 match slots"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate 10 Slots</span>
          </button>

          {rows.length > 0 && (
            <button
              onClick={handleClearWeek}
              className="py-1.5 px-2.5 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
              title="Clear matches"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Match Cards Container */}
      {rows.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-dashed border-slate-300 text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-600">
            <Database className="w-8 h-8 stroke-[1.8]" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base sm:text-lg font-black text-slate-800">
              No Matches in Matchweek {selectedWeek}
            </h3>
          </div>

          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={handleGenerate10Slots}
              className="py-2.5 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-md shadow-red-600/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate 10 Slots</span>
            </button>
            <button
              onClick={handleAddNewRow}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center space-x-2 border border-slate-200 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Single Match</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row, index) => {
            const hNorm = normalizeTeamName(row.homeTeam).toLowerCase().trim();
            const aNorm = normalizeTeamName(row.awayTeam).toLowerCase().trim();
            const isSameTeam = hNorm === aNorm && hNorm !== '';

            const homeMatches = getTeamUsageMap.get(hNorm) || [];
            const awayMatches = getTeamUsageMap.get(aNorm) || [];
            const isHomeDoubleBooked = homeMatches.length > 1;
            const isAwayDoubleBooked = awayMatches.length > 1;

            const isPlayed =
              row.homeScore.trim() !== '' && row.awayScore.trim() !== '';

            return (
              <div
                key={row.id || index}
                className={`bg-white rounded-2xl border transition-all p-4 sm:p-5 shadow-xs ${
                  row.isDirty
                    ? 'border-amber-300 ring-2 ring-amber-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Match Header Bar */}
                <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-100 text-xs gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      Match #{index + 1}
                    </span>

                    {/* Status Badge */}
                    {isPlayed ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Finished</span>
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full font-semibold flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Upcoming</span>
                      </span>
                    )}

                    {row.isDirty && (
                      <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        Unsaved
                      </span>
                    )}
                  </div>

                  {/* Date & Time quick inputs */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={row.date}
                      onChange={(e) => updateRow(index, 'date', e.target.value)}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    <input
                      type="text"
                      value={row.time}
                      onChange={(e) => updateRow(index, 'time', e.target.value)}
                      placeholder="20:00 BST"
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 w-24 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* Team Selection & Score Entry Grid */}
                <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
                  {/* Home Team Side (cols 1-4) - Dropdown ordered by Standings */}
                  <div className="md:col-span-4 flex items-center space-x-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                    <div className="shrink-0 w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-xs border border-slate-200">
                      <TeamCrest teamName={row.homeTeam} size={28} />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Home Team
                      </label>
                      <select
                        value={row.homeTeam}
                        onChange={(e) => updateRow(index, 'homeTeam', e.target.value)}
                        className="w-full text-sm font-black text-slate-900 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                      >
                        {standingsTeams.map((t) => (
                          <option key={t.name} value={t.name}>
                            #{t.rank} {t.name} ({t.points} pts)
                          </option>
                        ))}
                      </select>
                      <span className="text-[10px] text-slate-400 font-medium truncate block">
                        {getTeamStadium(row.homeTeam)}
                      </span>
                    </div>
                  </div>

                  {/* Score Entry Center (cols 5-7) */}
                  <div className="md:col-span-3 flex flex-col items-center justify-center space-y-1 bg-red-50/40 p-3 rounded-2xl border border-red-100">
                    <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                      Score
                    </span>

                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={row.homeScore}
                        onChange={(e) => updateRow(index, 'homeScore', e.target.value)}
                        placeholder="-"
                        className="w-14 h-12 text-center text-xl font-black font-mono bg-white border-2 border-red-200 rounded-xl text-slate-900 focus:outline-none focus:border-red-600 shadow-xs"
                      />
                      <span className="text-xl font-black text-slate-400">:</span>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={row.awayScore}
                        onChange={(e) => updateRow(index, 'awayScore', e.target.value)}
                        placeholder="-"
                        className="w-14 h-12 text-center text-xl font-black font-mono bg-white border-2 border-red-200 rounded-xl text-slate-900 focus:outline-none focus:border-red-600 shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Away Team Side (cols 8-11) - Dropdown ordered by Standings */}
                  <div className="md:col-span-4 flex items-center space-x-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                    <div className="flex-1 min-w-0 space-y-1 text-right md:text-left">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Away Team
                      </label>
                      <select
                        value={row.awayTeam}
                        onChange={(e) => updateRow(index, 'awayTeam', e.target.value)}
                        className="w-full text-sm font-black text-slate-900 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                      >
                        {standingsTeams.map((t) => (
                          <option key={t.name} value={t.name}>
                            #{t.rank} {t.name} ({t.points} pts)
                          </option>
                        ))}
                      </select>
                      <span className="text-[10px] text-slate-400 font-medium truncate block">
                        {getTeamStadium(row.awayTeam)}
                      </span>
                    </div>

                    <div className="shrink-0 w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-xs border border-slate-200">
                      <TeamCrest teamName={row.awayTeam} size={28} />
                    </div>
                  </div>
                </div>

                {/* Warnings / Error Notices */}
                {isSameTeam && (
                  <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-2.5 text-xs text-red-700 flex items-center space-x-2 font-bold">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Home and Away teams cannot be the same.</span>
                  </div>
                )}

                {(isHomeDoubleBooked || isAwayDoubleBooked) && !isSameTeam && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-800 flex items-center space-x-2 font-medium">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Notice: {isHomeDoubleBooked ? row.homeTeam : ''}{' '}
                      {isHomeDoubleBooked && isAwayDoubleBooked ? 'and' : ''}{' '}
                      {isAwayDoubleBooked ? row.awayTeam : ''} selected in multiple matches this week.
                    </span>
                  </div>
                )}

                {/* Card Bottom Controls */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Venue:{' '}
                    <span className="font-semibold text-slate-700">
                      {getTeamStadium(row.homeTeam)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDeleteRow(row.id, index)}
                      className="py-1.5 px-3 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
                      title="Delete Match"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>

                    <button
                      onClick={() => handleSaveSingleMatch(row, index)}
                      className={`py-1.5 px-3.5 rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer ${
                        row.isDirty
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Bottom Action Footer */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-600 font-medium">
              Total: <strong className="text-slate-900">{rows.length} Matches</strong>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleAddNewRow}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Match</span>
              </button>

              <button
                onClick={handleSaveAllMatches}
                className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center space-x-1.5 shadow-md shadow-red-600/20 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save All Matches</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
