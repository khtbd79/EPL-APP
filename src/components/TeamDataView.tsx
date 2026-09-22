import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppState, EPLMatchEvent, ActiveTab } from '../types';
import { ALL_EPL_20_TEAMS, normalizeTeamName, calculateEPLStandings } from '../utils/teamData';
import { getStoredDraft, setStoredDraft } from '../utils/storage';
import { TeamCrest } from './TeamCrest';
import { ConfirmActionModal, ConfirmModalConfig } from './ConfirmActionModal';
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
  ChevronDown,
  Database,
  ArrowRight,
  Check,
  Clock,
  Sparkles,
  CheckCheck,
  Copy
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
  onDeleteEplMatch: (id: string, matchweek?: number, homeTeam?: string, awayTeam?: string) => void;
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
  const [confirmModal, setConfirmModal] = useState<ConfirmModalConfig | null>(null);
  const isLocalActionRef = useRef(false);

  // Sync rows whenever selectedWeek changes or new matches arrive in state, respecting in-progress drafts
  useEffect(() => {
    if (isLocalActionRef.current) {
      isLocalActionRef.current = false;
      return;
    }

    const draftKey = `btts_team_data_draft_week_${selectedWeek}`;
    const storedDraft = getStoredDraft<EditableMatchRow[] | null>(draftKey, null);

    if (storedDraft !== null && Array.isArray(storedDraft)) {
      setRows(storedDraft);
      return;
    }

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

  // Master Date & Time for the active matchweek to easily sync across all 10 slots
  const [masterDate, setMasterDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [masterTime, setMasterTime] = useState<string>('20:00 BST');

  // Keep masterDate & masterTime in sync with the first row when switching matchweeks
  useEffect(() => {
    if (rows.length > 0 && rows[0].date) {
      setMasterDate(rows[0].date);
    }
    if (rows.length > 0 && rows[0].time) {
      setMasterTime(rows[0].time);
    }
  }, [selectedWeek]);

  // Update Master Date and propagate to all match rows in this matchweek
  const handleMasterDateChange = (newDate: string) => {
    setMasterDate(newDate);
    if (rows.length > 0) {
      setRows((prev) =>
        prev.map((r) => ({
          ...r,
          date: newDate,
          isDirty: true,
        }))
      );
      setToastMessage(`Date set to ${newDate} for all ${rows.length} matches.`);
    }
  };

  // Update Master Time and propagate to all match rows in this matchweek
  const handleMasterTimeChange = (newTime: string) => {
    setMasterTime(newTime);
    if (rows.length > 0) {
      setRows((prev) =>
        prev.map((r) => ({
          ...r,
          time: newTime,
          isDirty: true,
        }))
      );
      setToastMessage(`Time set to ${newTime} for all ${rows.length} matches.`);
    }
  };

  // Explicitly apply master date and time to all matches in this week
  const handleApplyMasterDateTimeToAll = (customDate = masterDate, customTime = masterTime) => {
    if (rows.length === 0) {
      setToastMessage('No match slots available. Click "10 Slots" first.');
      return;
    }
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        date: customDate,
        time: customTime,
        isDirty: true,
      }))
    );
    setToastMessage(`Applied ${customDate} ${customTime} to all ${rows.length} matches.`);
  };

  // Copy a specific match's date and time to all other matches in this matchweek
  const copyDateTimeToAllMatches = (sourceDate: string, sourceTime: string, sourceIndex: number) => {
    setMasterDate(sourceDate);
    setMasterTime(sourceTime);
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        date: sourceDate,
        time: sourceTime,
        isDirty: true,
      }))
    );
    setToastMessage(`Match #${sourceIndex + 1}'s Date & Time copied to all 10 matches.`);
  };

  // When rows have unsaved changes, auto-save to draft key so a refresh or restart never loses typing
  useEffect(() => {
    const draftKey = `btts_team_data_draft_week_${selectedWeek}`;
    const hasDirty = rows.some((r) => r.isDirty);
    if (hasDirty && rows.length > 0) {
      setStoredDraft(draftKey, rows);
    } else if (!hasDirty) {
      try {
        localStorage.removeItem(draftKey);
      } catch (_) {}
    }
  }, [rows, selectedWeek]);

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

  // Add or insert a new single match slot at ANY position among the slots
  const handleInsertRowAt = (insertIndex: number = rows.length) => {
    isLocalActionRef.current = true;
    const usedTeams = new Set<string>();
    rows.forEach((r) => {
      if (r.homeTeam) usedTeams.add(normalizeTeamName(r.homeTeam).toLowerCase());
      if (r.awayTeam) usedTeams.add(normalizeTeamName(r.awayTeam).toLowerCase());
    });

    const availableTeams = standingsTeams.filter(
      (t) => !usedTeams.has(t.name.toLowerCase())
    );

    const defaultHome = availableTeams[0]?.name || standingsTeams[0]?.name || 'Arsenal';
    const defaultAway =
      availableTeams[1]?.name ||
      standingsTeams.find((t) => t.name !== defaultHome)?.name ||
      'Chelsea';

    const dateStr = masterDate || new Date().toISOString().split('T')[0];
    const timeStr = masterTime || '20:00 BST';

    const newRow: EditableMatchRow = {
      id: `mw${selectedWeek}_slot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      matchweek: selectedWeek,
      homeTeam: defaultHome,
      awayTeam: defaultAway,
      homeScore: '',
      awayScore: '',
      date: dateStr,
      time: timeStr,
      status: 'UPCOMING',
      isDirty: true,
    };

    setRows((prev) => {
      const next = [...prev];
      const safeIndex = Math.max(0, Math.min(insertIndex, next.length));
      next.splice(safeIndex, 0, newRow);
      const draftKey = `btts_team_data_draft_week_${selectedWeek}`;
      setStoredDraft(draftKey, next);
      return next;
    });

    setToastMessage(`Match slot created at Position #${Math.min(insertIndex + 1, rows.length + 1)}.`);
  };

  const handleAddNewRow = () => {
    handleInsertRowAt(rows.length);
  };

  const generate10SlotsInternal = () => {
    isLocalActionRef.current = true;
    const new10Rows: EditableMatchRow[] = [];
    const dateStr = masterDate || new Date().toISOString().split('T')[0];
    const timeStr = masterTime || '20:00 BST';

    for (let i = 0; i < 10; i++) {
      const homeTeam = standingsTeams[i * 2]?.name || 'Arsenal';
      const awayTeam = standingsTeams[i * 2 + 1]?.name || 'Chelsea';

      new10Rows.push({
        id: `mw${selectedWeek}_slot_${i + 1}_${Date.now()}_${i}`,
        matchweek: selectedWeek,
        homeTeam,
        awayTeam,
        homeScore: '',
        awayScore: '',
        date: dateStr,
        time: timeStr,
        status: 'UPCOMING',
        isDirty: true,
      });
    }

    setRows(new10Rows);
    const draftKey = `btts_team_data_draft_week_${selectedWeek}`;
    setStoredDraft(draftKey, new10Rows);
    setToastMessage(`Generated 10 match slots for Matchweek ${selectedWeek} (${dateStr} ${timeStr}).`);
  };

  // Generate 10 empty match slots for this matchweek matching standings pairs
  const handleGenerate10Slots = () => {
    if (rows.length > 0) {
      setConfirmModal({
        isOpen: true,
        title: 'Generate 10 Slots',
        message: `Replace existing matches in Matchweek ${selectedWeek} with 10 slots?`,
        confirmLabel: 'Generate',
        variant: 'warning',
        onConfirm: generate10SlotsInternal,
      });
      return;
    }
    generate10SlotsInternal();
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

    isLocalActionRef.current = true;
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

    const nextRows = rows.map((r, i) => (i === index ? { ...r, isDirty: false } : r));
    setRows(nextRows);
    const draftKey = `btts_team_data_draft_week_${selectedWeek}`;
    setStoredDraft(draftKey, nextRows);

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

    isLocalActionRef.current = true;
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

    const nextRows = rows.map((r) => ({ ...r, isDirty: false }));
    setRows(nextRows);
    const draftKey = `btts_team_data_draft_week_${selectedWeek}`;
    setStoredDraft(draftKey, nextRows);
    setToastMessage(`Matchweek ${selectedWeek} matches saved.`);
  };

  // Delete row
  const handleDeleteRow = (id: string, index: number) => {
    isLocalActionRef.current = true;
    const rowToDelete = rows[index];

    // 1. Delete from global state
    if (rowToDelete) {
      onDeleteEplMatch(
        id,
        rowToDelete.matchweek,
        rowToDelete.homeTeam,
        rowToDelete.awayTeam
      );
    } else {
      onDeleteEplMatch(id);
    }

    // 2. Remove from local rows
    const nextRows = rows.filter((_, i) => i !== index);
    setRows(nextRows);

    // 3. Immediately sync draft
    const draftKey = `btts_team_data_draft_week_${selectedWeek}`;
    setStoredDraft(draftKey, nextRows);

    // 4. If all rows deleted for this matchweek, also trigger week clear
    if (nextRows.length === 0 && onClearMatchweekMatches) {
      onClearMatchweekMatches(selectedWeek);
    }

    setToastMessage(`Match #${index + 1} deleted.`);
  };

  // Clear all matches for this matchweek
  const handleClearWeek = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset Matchweek',
      message: `Clear all matches for Matchweek ${selectedWeek}?`,
      confirmLabel: 'Reset Week',
      variant: 'danger',
      onConfirm: () => {
        isLocalActionRef.current = true;
        const draftKey = `btts_team_data_draft_week_${selectedWeek}`;
        setStoredDraft(draftKey, []);

        if (onClearMatchweekMatches) {
          onClearMatchweekMatches(selectedWeek);
        } else {
          rows.forEach((r) => onDeleteEplMatch(r.id, r.matchweek, r.homeTeam, r.awayTeam));
        }

        setRows([]);
        setToastMessage(`Matchweek ${selectedWeek} matches cleared.`);
      },
    });
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
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-red-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/20 shrink-0">
            <Database className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">
              Team Data Entry
            </h1>
          </div>
        </div>

        {/* Top Action Bar */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('standings')}
              className="py-2.5 px-3 sm:px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer border border-slate-200 whitespace-nowrap"
            >
              <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Standings</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:inline" />
            </button>
          )}

          <button
            onClick={handleSaveAllMatches}
            className="py-2.5 px-3 sm:px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center justify-center space-x-1.5 shadow-md shadow-red-600/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Check className="w-4 h-4 stroke-[3] shrink-0" />
            <span>Save All Matches</span>
          </button>
        </div>
      </div>

      {/* Matchweek Selector Bar */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xs flex flex-col gap-3">
        {/* Top Row: Clean Prev / Next & Integrated Matchweek Dropdown */}
        <div className="flex items-center justify-between gap-2 w-full">
          <button
            disabled={selectedWeek <= 1}
            onClick={() => setSelectedWeek((prev) => Math.max(1, prev - 1))}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1 shrink-0"
            title="Previous Matchweek"
          >
            <ChevronLeft className="w-5 h-5 shrink-0" />
            <span className="text-xs font-bold hidden sm:inline">Prev</span>
          </button>

          {/* Center Matchweek Picker Badge */}
          <div className="relative flex-1 max-w-xs mx-auto">
            <div className="flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100/80 border border-red-200 rounded-xl px-3 py-2 transition-colors cursor-pointer group">
              <Calendar className="w-4 h-4 text-red-600 shrink-0" />
              <span className="text-xs sm:text-sm font-black text-red-700 whitespace-nowrap">
                Matchweek {selectedWeek} of 38
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-red-600 shrink-0 group-hover:translate-y-0.5 transition-transform" />
            </div>
            {/* Native touch-friendly select overlaid */}
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              aria-label="Select Matchweek"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-base"
            >
              {Array.from({ length: 38 }, (_, i) => i + 1).map((mw) => (
                <option key={mw} value={mw}>
                  Matchweek {mw}
                </option>
              ))}
            </select>
          </div>

          <button
            disabled={selectedWeek >= 38}
            onClick={() => setSelectedWeek((prev) => Math.min(38, prev + 1))}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1 shrink-0"
            title="Next Matchweek"
          >
            <span className="text-xs font-bold hidden sm:inline">Next</span>
            <ChevronRight className="w-5 h-5 shrink-0" />
          </button>
        </div>

        {/* Bottom Row: Matchweek Quick Status & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between sm:justify-start space-x-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span>Total: <strong className="text-slate-900 font-bold">{rows.length}</strong></span>
            <span>•</span>
            <span className="text-emerald-700 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
              <span>Finished: {finishedCount}</span>
            </span>
            <span>•</span>
            <span className="text-amber-700 font-bold">Pending: {rows.length - finishedCount}</span>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleAddNewRow}
              className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap"
              title="Add match slot at end"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Add Match</span>
            </button>

            <div className="flex items-center space-x-1 bg-white border border-slate-300 rounded-xl px-2 py-1 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Insert:</span>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value !== '') {
                    handleInsertRowAt(Number(e.target.value));
                    e.target.value = '';
                  }
                }}
                className="bg-transparent text-xs font-bold text-slate-800 cursor-pointer outline-none"
              >
                <option value="" disabled>Position...</option>
                {Array.from({ length: rows.length + 1 }, (_, i) => (
                  <option key={i} value={i}>
                    {i === 0 ? 'Position #1 (Top)' : i === rows.length ? `Position #${i + 1} (End)` : `Position #${i + 1}`}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerate10Slots}
              className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-xs whitespace-nowrap"
              title="Generate 10 match slots"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>10 Slots</span>
            </button>

            {rows.length > 0 && (
              <button
                onClick={handleClearWeek}
                className="col-span-2 sm:col-span-1 py-1.5 px-3 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 text-xs font-semibold flex items-center justify-center space-x-1 transition-all cursor-pointer whitespace-nowrap"
                title="Clear matches"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span>Reset Week</span>
              </button>
            )}
          </div>
        </div>

        {/* Master Matchweek Schedule (Batch Date & Time Sync Bar) */}
        {rows.length > 0 && (
          <div className="pt-3 border-t border-slate-200/80 flex flex-col gap-2.5">
            <div className="bg-slate-50/90 rounded-2xl p-3 sm:p-3.5 border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-black text-slate-900">
                    Matchweek {selectedWeek} Schedule
                  </span>
                </div>
              </div>

              {/* Master Date, Time, and Apply Controls */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex items-center space-x-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <input
                    type="date"
                    value={masterDate}
                    onChange={(e) => handleMasterDateChange(e.target.value)}
                    className="text-xs text-slate-800 font-bold bg-transparent focus:outline-none cursor-pointer"
                    title="Date"
                  />
                </div>

                <div className="flex items-center space-x-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <input
                    type="text"
                    value={masterTime}
                    onChange={(e) => handleMasterTimeChange(e.target.value)}
                    placeholder="20:00 BST"
                    className="text-xs text-slate-800 font-bold bg-transparent w-24 sm:w-28 focus:outline-none"
                    title="Time"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyMasterDateTimeToAll()}
                  className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer whitespace-nowrap"
                  title="Apply to all matches"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Apply to All</span>
                </button>
              </div>
            </div>

            {/* Quick Kickoff Presets */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs text-slate-500">
              <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">Presets:</span>
              {[
                '12:30 BST',
                '15:00 BST',
                '17:30 BST',
                '14:00 BST',
                '16:30 BST',
                '20:00 BST',
              ].map((presetTime) => (
                <button
                  key={presetTime}
                  type="button"
                  onClick={() => handleMasterTimeChange(presetTime)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                    masterTime === presetTime
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title={presetTime}
                >
                  {presetTime}
                </button>
              ))}
            </div>

            {/* Visual Progress Bar for completed entry slots */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-600">
                  Finished: <strong className="text-slate-900 font-extrabold">{finishedCount} / {rows.length}</strong>
                </span>
                <span className={finishedCount === rows.length && rows.length > 0 ? 'text-emerald-600 font-black' : 'text-amber-600 font-bold'}>
                  {rows.length > 0 ? Math.round((finishedCount / rows.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${rows.length > 0 ? (finishedCount / rows.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        )}
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
            const isPartiallyFilled =
              (row.homeScore.trim() !== '' && row.awayScore.trim() === '') ||
              (row.homeScore.trim() === '' && row.awayScore.trim() !== '');

            return (
              <React.Fragment key={row.id || index}>
                {index === 0 && (
                  <div className="flex items-center justify-center -my-1">
                    <button
                      type="button"
                      onClick={() => handleInsertRowAt(0)}
                      className="px-3 py-1 bg-white hover:bg-red-50 text-slate-500 hover:text-red-700 border border-dashed border-slate-300 hover:border-red-300 rounded-full text-[11px] font-bold flex items-center space-x-1 shadow-2xs transition-all cursor-pointer"
                      title="Insert a match slot at Position #1"
                    >
                      <Plus className="w-3 h-3 text-red-600" />
                      <span>Insert Slot #1 (Top)</span>
                    </button>
                  </div>
                )}

                <div
                  className={`rounded-2xl border transition-all p-4 sm:p-5 shadow-xs border-l-[6px] ${
                    isPlayed
                      ? 'bg-emerald-50/70 border-emerald-400 border-l-emerald-600 ring-2 ring-emerald-200/60'
                      : isPartiallyFilled
                      ? 'bg-amber-50/50 border-amber-300 border-l-amber-500 ring-2 ring-amber-200/50'
                      : row.isDirty
                      ? 'bg-white border-amber-300 border-l-amber-400 ring-2 ring-amber-100'
                      : 'bg-white border-slate-200 hover:border-slate-300 border-l-slate-300'
                  }`}
                >
                {/* Match Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-100 text-xs gap-2">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className={`font-mono font-black px-2.5 py-1 rounded-lg ${
                      isPlayed
                        ? 'bg-emerald-200/80 text-emerald-900'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      Match #{index + 1}
                    </span>

                    {/* Status Badge */}
                    {isPlayed ? (
                      <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-bold flex items-center space-x-1 text-xs shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Finished</span>
                      </span>
                    ) : isPartiallyFilled ? (
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full font-bold flex items-center space-x-1 text-xs">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Partial</span>
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full font-semibold flex items-center space-x-1 text-xs">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Pending</span>
                      </span>
                    )}

                    {row.isDirty && (
                      <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        Unsaved
                      </span>
                    )}
                  </div>

                  {/* Date & Time individual inputs + quick copy to other matches */}
                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap gap-y-1">
                    <input
                      type="date"
                      value={row.date}
                      onChange={(e) => updateRow(index, 'date', e.target.value)}
                      title="Date"
                      className="text-xs bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-red-500 flex-1 sm:flex-none shadow-2xs"
                    />
                    <input
                      type="text"
                      value={row.time}
                      onChange={(e) => updateRow(index, 'time', e.target.value)}
                      placeholder="20:00 BST"
                      title="Time"
                      className="text-xs bg-white border border-slate-300 rounded-lg px-2 py-1 w-24 sm:w-28 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-red-500 shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => copyDateTimeToAllMatches(row.date, row.time, index)}
                      className="text-[11px] font-bold text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg px-2 py-1 flex items-center space-x-1 shadow-2xs transition-colors cursor-pointer"
                      title="Copy to all matches"
                    >
                      <Copy className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="hidden sm:inline">Copy to All</span>
                    </button>
                  </div>
                </div>

                {/* Team Selection & Score Entry Grid */}
                <div className="grid grid-cols-1 md:grid-cols-11 gap-3 sm:gap-4 items-center">
                  {/* Home Team Side (cols 1-4) - Dropdown ordered by Standings */}
                  <div className={`md:col-span-4 flex items-center space-x-3 p-3 rounded-2xl border min-w-0 transition-colors ${
                    isPlayed
                      ? 'bg-white/90 border-emerald-200'
                      : 'bg-slate-50/70 border-slate-100'
                  }`}>
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
                        className="w-full text-xs sm:text-sm font-black text-slate-900 bg-white border border-slate-200 rounded-xl px-2.5 sm:px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer truncate shadow-2xs"
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
                  <div className={`md:col-span-3 flex flex-col items-center justify-center space-y-1 p-2.5 sm:p-3 rounded-2xl border transition-colors ${
                    isPlayed
                      ? 'bg-emerald-100/90 border-2 border-emerald-400'
                      : isPartiallyFilled
                      ? 'bg-amber-100/80 border-2 border-amber-300'
                      : 'bg-red-50/40 border border-red-100'
                  }`}>
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${
                      isPlayed
                        ? 'text-emerald-800'
                        : isPartiallyFilled
                        ? 'text-amber-800'
                        : 'text-red-600'
                    }`}>
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
                        className={`w-14 h-12 text-center text-xl font-black font-mono bg-white rounded-xl focus:outline-none shadow-xs transition-colors ${
                          isPlayed
                            ? 'border-2 border-emerald-500 text-emerald-950 focus:border-emerald-700'
                            : 'border-2 border-red-200 text-slate-900 focus:border-red-600'
                        }`}
                      />
                      <span className="text-xl font-black text-slate-400">:</span>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={row.awayScore}
                        onChange={(e) => updateRow(index, 'awayScore', e.target.value)}
                        placeholder="-"
                        className={`w-14 h-12 text-center text-xl font-black font-mono bg-white rounded-xl focus:outline-none shadow-xs transition-colors ${
                          isPlayed
                            ? 'border-2 border-emerald-500 text-emerald-950 focus:border-emerald-700'
                            : 'border-2 border-red-200 text-slate-900 focus:border-red-600'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Away Team Side (cols 8-11) - Dropdown ordered by Standings */}
                  <div className={`md:col-span-4 flex items-center space-x-3 p-3 rounded-2xl border min-w-0 transition-colors ${
                    isPlayed
                      ? 'bg-white/90 border-emerald-200'
                      : 'bg-slate-50/70 border-slate-100'
                  }`}>
                    <div className="shrink-0 w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-xs border border-slate-200">
                      <TeamCrest teamName={row.awayTeam} size={28} />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1 text-left">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Away Team
                      </label>
                      <select
                        value={row.awayTeam}
                        onChange={(e) => updateRow(index, 'awayTeam', e.target.value)}
                        className="w-full text-xs sm:text-sm font-black text-slate-900 bg-white border border-slate-200 rounded-xl px-2.5 sm:px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer truncate shadow-2xs"
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
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-slate-500 truncate max-w-[220px] sm:max-w-none">
                    Venue:{' '}
                    <span className="font-semibold text-slate-700">
                      {getTeamStadium(row.homeTeam)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleInsertRowAt(index + 1)}
                      className="py-1.5 px-2.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
                      title={`Insert a new slot directly below Match #${index + 1}`}
                    >
                      <Plus className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>Insert Below</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteRow(row.id, index)}
                      className="py-1.5 px-3 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
                      title="Delete Match"
                    >
                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Delete</span>
                    </button>

                    <button
                      type="button"
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

              {/* Insert Divider below this card */}
              <div className="flex items-center justify-center -my-1">
                <button
                  type="button"
                  onClick={() => handleInsertRowAt(index + 1)}
                  className="px-3 py-1 bg-white hover:bg-red-50 text-slate-500 hover:text-red-700 border border-dashed border-slate-300 hover:border-red-300 rounded-full text-[11px] font-bold flex items-center space-x-1 shadow-2xs transition-all cursor-pointer"
                  title={`Insert a match slot at Position #${index + 2}`}
                >
                  <Plus className="w-3 h-3 text-red-600" />
                  <span>Insert Slot #{index + 2}</span>
                </button>
              </div>
            </React.Fragment>
            );
          })}

          {/* Bottom Action Footer */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-600 font-medium">
              Total: <strong className="text-slate-900">{rows.length} Matches</strong>
            </div>

            <div className="flex items-center space-x-2.5 flex-wrap">
              <button
                onClick={handleAddNewRow}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                title="Add match slot at end"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Match</span>
              </button>

              <div className="flex items-center space-x-1 bg-slate-50 border border-slate-300 rounded-xl px-2 py-1 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Insert:</span>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value !== '') {
                      handleInsertRowAt(Number(e.target.value));
                      e.target.value = '';
                    }
                  }}
                  className="bg-transparent text-xs font-bold text-slate-800 cursor-pointer outline-none"
                >
                  <option value="" disabled>Position...</option>
                  {Array.from({ length: rows.length + 1 }, (_, i) => (
                    <option key={i} value={i}>
                      {i === 0 ? 'Position #1 (Top)' : i === rows.length ? `Position #${i + 1} (End)` : `Position #${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>

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

      {/* Confirmation Modal */}
      <ConfirmActionModal
        config={confirmModal}
        onClose={() => setConfirmModal(null)}
      />
    </div>
  );
};
