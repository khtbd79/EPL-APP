import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AppState, EPLMatchEvent } from '../types';
import {
  ALL_EPL_20_TEAMS,
  calculateEPLStandings,
  getTeamDetailedProfile,
  calculateH2H,
  getTeamInfo,
  TeamStandingData,
  EPLTeamInfo
} from '../utils/teamData';
import { generateId, getStoredDraft, setStoredDraft } from '../utils/storage';
import { printPdfDocument, buildPrintHtml } from '../utils/pdfGenerator';
import { ConfirmActionModal, ConfirmModalConfig } from './ConfirmActionModal';
import { ReportPreviewModal } from './ReportPreviewModal';
import {
  Trophy,
  Calendar,
  PlusCircle,
  Edit3,
  Trash2,
  Filter,
  CheckCircle2,
  Flame,
  Shield,
  Layers,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Zap,
  ArrowRight,
  TrendingUp,
  X,
  Sparkles,
  Search,
  Users,
  Award,
  BarChart3,
  Swords,
  MapPin,
  Clock,
  ArrowUpDown,
  Printer,
  AlertCircle
} from 'lucide-react';

interface EPLMatchCenterViewProps {
  state: AppState;
  onAddEplMatch?: (match: EPLMatchEvent) => void;
  onUpdateEplMatch?: (match: EPLMatchEvent) => void;
  onDeleteEplMatch?: (id: string) => void;
  onSetCurrentMatchweek?: (week: number) => void;
  onAddMatch?: (match: EPLMatchEvent) => void;
  onUpdateMatch?: (match: EPLMatchEvent) => void;
  onDeleteMatch?: (id: string) => void;
  onSetMatchweek?: (week: number) => void;
}

const EPL_PREFS_KEY = 'btts_epl_match_center_prefs';

interface EPLCenterPrefs {
  activeSubTab?: 'matches' | 'standings' | 'team_hub' | 'h2h';
  selectedWeekFilter?: number | 'ALL';
  selectedTeamProfileId?: string;
  h2hTeamA?: string;
  h2hTeamB?: string;
  standingsMode?: 'overall' | 'home' | 'away';
}

export const EPLMatchCenterView: React.FC<EPLMatchCenterViewProps> = ({
  state,
  onAddEplMatch,
  onUpdateEplMatch,
  onDeleteEplMatch,
  onSetCurrentMatchweek,
  onAddMatch,
  onUpdateMatch,
  onDeleteMatch,
  onSetMatchweek,
}) => {
  const triggerAddMatch = onAddEplMatch || onAddMatch || (() => {});
  const triggerUpdateMatch = onUpdateEplMatch || onUpdateMatch || (() => {});
  const triggerDeleteMatch = onDeleteEplMatch || onDeleteMatch || (() => {});
  const triggerSetCurrentMatchweek = onSetCurrentMatchweek || onSetMatchweek || (() => {});

  const initialPrefs = getStoredDraft<EPLCenterPrefs>(EPL_PREFS_KEY, {});

  // Navigation tabs within EPL Match Center
  const [activeSubTab, setActiveSubTab] = useState<'matches' | 'standings' | 'team_hub' | 'h2h'>(
    initialPrefs.activeSubTab || 'matches'
  );

  // Matchweek filter
  const currentWeek = state.currentMatchweek || 1;
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<number | 'ALL'>(
    initialPrefs.selectedWeekFilter !== undefined ? initialPrefs.selectedWeekFilter : currentWeek
  );

  // Match Outcome filter within active view
  const [matchOutcomeFilter, setMatchOutcomeFilter] = useState<'ALL' | 'HOME' | 'AWAY' | 'DRAW' | 'BTTS' | 'OVER25'>('ALL');

  // Search & Filter
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [selectedTeamProfileId, setSelectedTeamProfileId] = useState<string>(
    initialPrefs.selectedTeamProfileId || 'mci'
  );

  // H2H Selector
  const [h2hTeamA, setH2hTeamA] = useState<string>(initialPrefs.h2hTeamA || 'Manchester City');
  const [h2hTeamB, setH2hTeamB] = useState<string>(initialPrefs.h2hTeamB || 'Arsenal');

  // Standings view mode: 'overall' | 'home' | 'away'
  const [standingsMode, setStandingsMode] = useState<'overall' | 'home' | 'away'>(
    initialPrefs.standingsMode || 'overall'
  );

  // Custom Confirmation & Report Modals
  const [confirmConfig, setConfirmConfig] = useState<ConfirmModalConfig | null>(null);
  const [reportModalData, setReportModalData] = useState<{
    isOpen: boolean;
    title: string;
    htmlContent: string;
    downloadFilename: string;
  } | null>(null);

  const handleDeleteMatchPrompt = (matchId: string, homeTeam: string, awayTeam: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Match Result',
      message: `Are you sure you want to delete the result for "${homeTeam} vs ${awayTeam}"?`,
      confirmLabel: 'Yes, Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
      onConfirm: () => triggerDeleteMatch(matchId),
    });
  };

  const handleOpenPdfReport = () => {
    const html = buildPrintHtml(state, 'epl');
    setReportModalData({
      isOpen: true,
      title: 'EPL Season Matchweek Tracker & Standings',
      htmlContent: html,
      downloadFilename: `EPL_Match_Center_${new Date().toISOString().split('T')[0]}.html`,
    });
  };

  // Persist user view preferences
  useEffect(() => {
    setStoredDraft(EPL_PREFS_KEY, {
      activeSubTab,
      selectedWeekFilter,
      selectedTeamProfileId,
      h2hTeamA,
      h2hTeamB,
      standingsMode,
    });
  }, [activeSubTab, selectedWeekFilter, selectedTeamProfileId, h2hTeamA, h2hTeamB, standingsMode]);

  // Modal State for Match Entry / Edit
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);

  // Lock body scroll when modal is open so background never scrolls
  useEffect(() => {
    if (isMatchModalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isMatchModalOpen]);

  // Form Fields for Match Input
  const [formMatchweek, setFormMatchweek] = useState<number>(currentWeek);
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState<string>('20:00');
  const [formHomeTeam, setFormHomeTeam] = useState<string>('Arsenal');
  const [formAwayTeam, setFormAwayTeam] = useState<string>('Chelsea');
  const [formVenue, setFormVenue] = useState<string>('');
  const [formHomeScore, setFormHomeScore] = useState<number | ''>(2);
  const [formAwayScore, setFormAwayScore] = useState<number | ''>(1);
  const [formHtHome, setFormHtHome] = useState<number | ''>('');
  const [formHtAway, setFormHtAway] = useState<number | ''>('');
  const [formHomeScorers, setFormHomeScorers] = useState<string>('');
  const [formAwayScorers, setFormAwayScorers] = useState<string>('');
  const [formPossessionHome, setFormPossessionHome] = useState<number | ''>('');
  const [formPossessionAway, setFormPossessionAway] = useState<number | ''>('');
  const [formShotsHome, setFormShotsHome] = useState<number | ''>('');
  const [formShotsAway, setFormShotsAway] = useState<number | ''>('');
  const [formCornersHome, setFormCornersHome] = useState<number | ''>('');
  const [formCornersAway, setFormCornersAway] = useState<number | ''>('');
  const [formYellowHome, setFormYellowHome] = useState<number | ''>('');
  const [formYellowAway, setFormYellowAway] = useState<number | ''>('');
  const [formRedHome, setFormRedHome] = useState<number | ''>('');
  const [formRedAway, setFormRedAway] = useState<number | ''>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [modalErrorMsg, setModalErrorMsg] = useState<string>('');
  const [successToastMsg, setSuccessToastMsg] = useState<string>('');

  // When Home team changes
  const handleHomeTeamChange = (teamName: string) => {
    setFormHomeTeam(teamName);
    if (modalErrorMsg) setModalErrorMsg('');
  };

  // Open Modal for New Match
  const openNewMatchModal = (weekNum?: number) => {
    setEditingMatchId(null);
    setFormMatchweek(weekNum || currentWeek);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTime('20:00');
    setFormHomeTeam('Arsenal');
    setFormAwayTeam('Chelsea');
    setFormVenue('');
    setFormHomeScore(0);
    setFormAwayScore(0);
    setFormHtHome('');
    setFormHtAway('');
    setFormHomeScorers('');
    setFormAwayScorers('');
    setFormPossessionHome('');
    setFormPossessionAway('');
    setFormShotsHome('');
    setFormShotsAway('');
    setFormCornersHome('');
    setFormCornersAway('');
    setFormYellowHome('');
    setFormYellowAway('');
    setFormRedHome('');
    setFormRedAway('');
    setFormNotes('');
    setModalErrorMsg('');
    setIsMatchModalOpen(true);
  };

  // Open Modal to Edit existing match
  const openEditMatchModal = (match: EPLMatchEvent) => {
    setEditingMatchId(match.id);
    setFormMatchweek(match.matchweek);
    setFormDate(match.date);
    setFormTime(match.matchTime || '20:00');
    setFormHomeTeam(match.homeTeam);
    setFormAwayTeam(match.awayTeam);
    setFormVenue(match.venue || '');
    setFormHomeScore(match.homeScore);
    setFormAwayScore(match.awayScore);
    setFormHtHome(match.halfTimeHomeScore !== undefined ? match.halfTimeHomeScore : '');
    setFormHtAway(match.halfTimeAwayScore !== undefined ? match.halfTimeAwayScore : '');
    setFormHomeScorers(match.homeGoalScorers || '');
    setFormAwayScorers(match.awayGoalScorers || '');
    setFormPossessionHome(match.possessionHome !== undefined ? match.possessionHome : '');
    setFormPossessionAway(match.possessionAway !== undefined ? match.possessionAway : '');
    setFormShotsHome(match.shotsOnTargetHome !== undefined ? match.shotsOnTargetHome : '');
    setFormShotsAway(match.shotsOnTargetAway !== undefined ? match.shotsOnTargetAway : '');
    setFormCornersHome(match.cornersHome !== undefined ? match.cornersHome : '');
    setFormCornersAway(match.cornersAway !== undefined ? match.cornersAway : '');
    setFormYellowHome(match.yellowCardsHome !== undefined ? match.yellowCardsHome : '');
    setFormYellowAway(match.yellowCardsAway !== undefined ? match.yellowCardsAway : '');
    setFormRedHome(match.redCardsHome !== undefined ? match.redCardsHome : '');
    setFormRedAway(match.redCardsAway !== undefined ? match.redCardsAway : '');
    setFormNotes(match.notes || '');
    setModalErrorMsg('');
    setIsMatchModalOpen(true);
  };

  // Save Match Form
  const handleSaveMatch = (e: React.FormEvent) => {
    e.preventDefault();
    setModalErrorMsg('');

    if (!formHomeTeam || !formAwayTeam) {
      setModalErrorMsg('Please select both Home and Away teams.');
      return;
    }

    if (formHomeTeam === formAwayTeam) {
      setModalErrorMsg('Home team and Away team cannot be the same. Please select different teams.');
      return;
    }

    const homeScoreNum = typeof formHomeScore === 'number' ? formHomeScore : (parseInt(String(formHomeScore), 10) || 0);
    const awayScoreNum = typeof formAwayScore === 'number' ? formAwayScore : (parseInt(String(formAwayScore), 10) || 0);

    let winner: 'HOME' | 'AWAY' | 'DRAW' = 'DRAW';
    if (homeScoreNum > awayScoreNum) winner = 'HOME';
    else if (awayScoreNum > homeScoreNum) winner = 'AWAY';

    const totalGoals = homeScoreNum + awayScoreNum;
    const btts = homeScoreNum > 0 && awayScoreNum > 0;
    const over25 = totalGoals > 2.5;

    let cleanSheetTeam: 'HOME' | 'AWAY' | 'BOTH' | 'NONE' = 'NONE';
    if (awayScoreNum === 0 && homeScoreNum === 0) cleanSheetTeam = 'BOTH';
    else if (awayScoreNum === 0) cleanSheetTeam = 'HOME';
    else if (homeScoreNum === 0) cleanSheetTeam = 'AWAY';

    const matchData: EPLMatchEvent = {
      id: editingMatchId || generateId(),
      matchweek: formMatchweek || currentWeek || 1,
      date: formDate || new Date().toISOString().split('T')[0],
      matchTime: formTime || '20:00',
      homeTeam: formHomeTeam,
      awayTeam: formAwayTeam,
      venue: formVenue.trim(),
      homeScore: homeScoreNum,
      awayScore: awayScoreNum,
      halfTimeHomeScore: typeof formHtHome === 'number' ? formHtHome : (formHtHome !== '' ? parseInt(String(formHtHome), 10) : undefined),
      halfTimeAwayScore: typeof formHtAway === 'number' ? formHtAway : (formHtAway !== '' ? parseInt(String(formHtAway), 10) : undefined),
      winner,
      totalGoals,
      btts,
      over25,
      homeGoalScorers: formHomeScorers.trim() || undefined,
      awayGoalScorers: formAwayScorers.trim() || undefined,
      cleanSheetTeam,
      possessionHome: typeof formPossessionHome === 'number' ? formPossessionHome : undefined,
      possessionAway: typeof formPossessionAway === 'number' ? formPossessionAway : undefined,
      shotsOnTargetHome: typeof formShotsHome === 'number' ? formShotsHome : undefined,
      shotsOnTargetAway: typeof formShotsAway === 'number' ? formShotsAway : undefined,
      cornersHome: typeof formCornersHome === 'number' ? formCornersHome : undefined,
      cornersAway: typeof formCornersAway === 'number' ? formCornersAway : undefined,
      yellowCardsHome: typeof formYellowHome === 'number' ? formYellowHome : undefined,
      yellowCardsAway: typeof formYellowAway === 'number' ? formYellowAway : undefined,
      redCardsHome: typeof formRedHome === 'number' ? formRedHome : undefined,
      redCardsAway: typeof formRedAway === 'number' ? formRedAway : undefined,
      notes: formNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    if (editingMatchId) {
      triggerUpdateMatch(matchData);
      setSuccessToastMsg(`MW ${matchData.matchweek}: ${matchData.homeTeam} vs ${matchData.awayTeam} match updated successfully!`);
    } else {
      triggerAddMatch(matchData);
      setSuccessToastMsg(`MW ${matchData.matchweek}: ${matchData.homeTeam} (${homeScoreNum}) - (${awayScoreNum}) ${matchData.awayTeam} match saved successfully!`);
    }

    setIsMatchModalOpen(false);
    setTimeout(() => {
      setSuccessToastMsg('');
    }, 4500);
  };

  // Filter matches based on selected week, outcome filter, and search
  const filteredMatches = useMemo(() => {
    let list = [...(state.eplMatches || [])];

    if (selectedWeekFilter !== 'ALL') {
      list = list.filter((m) => m.matchweek === selectedWeekFilter);
    }

    if (matchOutcomeFilter === 'HOME') {
      list = list.filter((m) => m.winner === 'HOME');
    } else if (matchOutcomeFilter === 'AWAY') {
      list = list.filter((m) => m.winner === 'AWAY');
    } else if (matchOutcomeFilter === 'DRAW') {
      list = list.filter((m) => m.winner === 'DRAW');
    } else if (matchOutcomeFilter === 'BTTS') {
      list = list.filter((m) => m.btts === true);
    } else if (matchOutcomeFilter === 'OVER25') {
      list = list.filter((m) => m.over25 === true);
    }

    if (teamSearchQuery.trim()) {
      const q = teamSearchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.homeTeam.toLowerCase().includes(q) ||
          m.awayTeam.toLowerCase().includes(q) ||
          m.venue.toLowerCase().includes(q) ||
          (m.homeGoalScorers && m.homeGoalScorers.toLowerCase().includes(q)) ||
          (m.awayGoalScorers && m.awayGoalScorers.toLowerCase().includes(q))
      );
    }

    // Sort: newest matchweek / date first
    return list.sort((a, b) => {
      if (b.matchweek !== a.matchweek) return b.matchweek - a.matchweek;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [state.eplMatches, selectedWeekFilter, matchOutcomeFilter, teamSearchQuery]);

  // Selected Matchweek stats
  const activeViewStats = useMemo(() => {
    const allMatches = state.eplMatches || [];
    const weekMatches = selectedWeekFilter === 'ALL'
      ? allMatches
      : allMatches.filter((m) => m.matchweek === selectedWeekFilter);

    const count = weekMatches.length;
    const homeWins = weekMatches.filter((m) => m.winner === 'HOME').length;
    const awayWins = weekMatches.filter((m) => m.winner === 'AWAY').length;
    const draws = weekMatches.filter((m) => m.winner === 'DRAW').length;
    const bttsCount = weekMatches.filter((m) => m.btts).length;
    const over25Count = weekMatches.filter((m) => m.over25).length;
    const totalGoals = weekMatches.reduce((sum, m) => sum + (m.totalGoals || 0), 0);

    return {
      count,
      homeWins,
      awayWins,
      draws,
      bttsCount,
      bttsPct: count > 0 ? Math.round((bttsCount / count) * 100) : 0,
      over25Count,
      over25Pct: count > 0 ? Math.round((over25Count / count) * 100) : 0,
      totalGoals,
      avgGoals: count > 0 ? (totalGoals / count).toFixed(1) : '0.0',
    };
  }, [state.eplMatches, selectedWeekFilter]);

  // Standings table
  const standings = useMemo(() => {
    return calculateEPLStandings(state.eplMatches || []);
  }, [state.eplMatches]);

  // Team profile
  const selectedTeamProfile = useMemo(() => {
    const teamObj = ALL_EPL_20_TEAMS.find((t) => t.id === selectedTeamProfileId) || ALL_EPL_20_TEAMS[0];
    return getTeamDetailedProfile(teamObj.name, state.eplMatches || []);
  }, [selectedTeamProfileId, state.eplMatches]);

  // H2H summary
  const h2hSummary = useMemo(() => {
    return calculateH2H(h2hTeamA, h2hTeamB, state.eplMatches || []);
  }, [h2hTeamA, h2hTeamB, state.eplMatches]);

  // Matchweek summary stats
  const matchweekStats = useMemo(() => {
    const totalRecorded = (state.eplMatches || []).length;
    const currentWeekMatches = (state.eplMatches || []).filter((m) => m.matchweek === currentWeek);
    const bttsCount = (state.eplMatches || []).filter((m) => m.btts).length;
    const over25Count = (state.eplMatches || []).filter((m) => m.over25).length;
    const totalGoalsScored = (state.eplMatches || []).reduce((sum, m) => sum + m.totalGoals, 0);

    return {
      totalRecorded,
      currentWeekMatchesCount: currentWeekMatches.length,
      bttsPercent: totalRecorded > 0 ? ((bttsCount / totalRecorded) * 100).toFixed(1) : '0',
      over25Percent: totalRecorded > 0 ? ((over25Count / totalRecorded) * 100).toFixed(1) : '0',
      avgGoalsPerMatch: totalRecorded > 0 ? (totalGoalsScored / totalRecorded).toFixed(2) : '0',
    };
  }, [state.eplMatches, currentWeek]);

  return (
    <div className="space-y-5 animate-fadeIn pb-36 sm:pb-40">
      {/* Global Success Notification Banner */}
      {successToastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-sm font-bold flex items-center space-x-3 animate-fadeIn shadow-lg shadow-emerald-950/50">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successToastMsg}</span>
        </div>
      )}

      {/* Top Banner: EPL Season Hub & Matchweek Tracker */}
      <div className="p-5 sm:p-6 border border-red-200 bg-white rounded-2xl shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-3.5 bg-red-600 rounded-2xl text-white shadow-md shadow-red-600/20 shrink-0">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                EPL Match Center
              </h1>
            </div>
          </div>

          {/* Current Matchweek Controller */}
          <div className="flex flex-wrap items-center gap-3 bg-red-50/70 p-3 rounded-2xl border border-red-100 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-red-100 text-red-600">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Current Matchweek</div>
                <div className="text-sm font-extrabold text-red-600 font-mono">
                  Matchweek {String(currentWeek).padStart(2, '0')} <span className="text-slate-500 font-normal text-xs">/ 38</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={currentWeek}
                onChange={(e) => triggerSetCurrentMatchweek(Number(e.target.value))}
                className="bg-white border border-red-200 text-slate-800 font-bold text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 cursor-pointer shadow-sm"
                title="Change Current Matchweek"
              >
                {Array.from({ length: 38 }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    MW {w}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleOpenPdfReport}
                className="py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1.5 active:scale-95 transition-all shadow-sm cursor-pointer"
                title="Save EPL match results as PDF / Print"
              >
                <Printer className="w-4 h-4 text-red-600" />
                <span>Print PDF</span>
              </button>

              <button
                type="button"
                onClick={() => openNewMatchModal(currentWeek)}
                className="py-2 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 flex items-center space-x-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Match Result</span>
              </button>
            </div>
          </div>
        </div>

        {/* Season Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 mt-4 border-t border-slate-100 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600">Total Recorded:</span>
            <span className="font-mono font-bold text-slate-900">{matchweekStats.totalRecorded} matches</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600">Avg Goals/Match:</span>
            <span className="font-mono font-bold text-red-600">{matchweekStats.avgGoalsPerMatch}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600">BTTS Rate:</span>
            <span className="font-mono font-bold text-red-600">{matchweekStats.bttsPercent}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600">Over 2.5 Rate:</span>
            <span className="font-mono font-bold text-red-600">{matchweekStats.over25Percent}%</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('matches')}
          className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all ${
            activeSubTab === 'matches'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20 font-extrabold'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Match Results</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${activeSubTab === 'matches' ? 'bg-red-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
            {state.eplMatches?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('standings')}
          className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all ${
            activeSubTab === 'standings'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20 font-extrabold'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Standings</span>
        </button>

        <button
          onClick={() => setActiveSubTab('team_hub')}
          className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all ${
            activeSubTab === 'team_hub'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20 font-extrabold'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Team Profiles</span>
        </button>

        <button
          onClick={() => setActiveSubTab('h2h')}
          className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all ${
            activeSubTab === 'h2h'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20 font-extrabold'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>Head-to-Head</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: MATCH RESULTS & MATCHWEEK FILTER (CLEAN & ORGANIZED)
      ======================================================== */}
      {activeSubTab === 'matches' && (
        <div className="space-y-4">
          {/* Matchweek Navigator Bar */}
          <div className="p-4 space-y-3.5 border border-red-100 bg-white rounded-2xl shadow-sm">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Left: Previous / Next & Matchweek Selector */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Previous Week Button */}
                <button
                  onClick={() => {
                    if (selectedWeekFilter === 'ALL') {
                      setSelectedWeekFilter(Math.max(1, currentWeek - 1));
                    } else if (typeof selectedWeekFilter === 'number' && selectedWeekFilter > 1) {
                      setSelectedWeekFilter(selectedWeekFilter - 1);
                    }
                  }}
                  disabled={selectedWeekFilter === 1}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all ${
                    selectedWeekFilter === 1
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 active:scale-95'
                  }`}
                  title="Previous Matchweek"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev MW</span>
                </button>

                {/* Matchweek Selector Dropdown */}
                <div className="relative">
                  <select
                    value={selectedWeekFilter}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedWeekFilter(val === 'ALL' ? 'ALL' : Number(val));
                    }}
                    className="bg-white border-2 border-red-200 text-slate-800 font-extrabold text-xs sm:text-sm rounded-xl py-2 pl-3 pr-8 outline-none focus:ring-2 focus:ring-red-500 cursor-pointer appearance-none shadow-sm"
                  >
                    <option value="ALL" className="bg-white text-slate-900 font-bold">
                      🏆 All Season Matches (38 Matchweeks)
                    </option>
                    {Array.from({ length: 38 }, (_, i) => i + 1).map((w) => {
                      const count = (state.eplMatches || []).filter((m) => m.matchweek === w).length;
                      return (
                        <option key={w} value={w} className="bg-white text-slate-800 font-bold">
                          Matchweek {w} {count > 0 ? `(${count} recorded)` : '(0 matches)'}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="w-4 h-4 text-red-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Next Week Button */}
                <button
                  onClick={() => {
                    if (selectedWeekFilter === 'ALL') {
                      setSelectedWeekFilter(Math.min(38, currentWeek + 1));
                    } else if (typeof selectedWeekFilter === 'number' && selectedWeekFilter < 38) {
                      setSelectedWeekFilter(selectedWeekFilter + 1);
                    }
                  }}
                  disabled={selectedWeekFilter === 38}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all ${
                    selectedWeekFilter === 38
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 active:scale-95'
                  }`}
                  title="Next Matchweek"
                >
                  <span>Next MW</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Shortcut: Jump to Current Active Matchweek */}
                {selectedWeekFilter !== currentWeek && (
                  <button
                    onClick={() => setSelectedWeekFilter(currentWeek)}
                    className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold flex items-center space-x-1.5 transition-all active:scale-95"
                    title={`Jump to Active Matchweek ${currentWeek}`}
                  >
                    <Zap className="w-3.5 h-3.5 text-red-600" />
                    <span>Jump to Active MW {currentWeek}</span>
                  </button>
                )}
              </div>

              {/* Right: Quick View Toggle & New Match Action */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedWeekFilter(currentWeek)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    selectedWeekFilter !== 'ALL'
                      ? 'bg-red-600 text-white shadow-sm font-extrabold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Single MW View
                </button>
                <button
                  onClick={() => setSelectedWeekFilter('ALL')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    selectedWeekFilter === 'ALL'
                      ? 'bg-red-600 text-white shadow-sm font-extrabold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All 38 Weeks
                </button>
                <button
                  onClick={() => openNewMatchModal(selectedWeekFilter === 'ALL' ? currentWeek : selectedWeekFilter)}
                  className="py-2 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center space-x-1.5 shrink-0 active:scale-95 transition-all shadow-md shadow-red-600/20 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Match</span>
                </button>
              </div>
            </div>

            {/* Matchweek Summary Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-red-100 text-red-600 shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Matches Recorded</div>
                  <div className="text-sm font-black font-mono text-slate-900">
                    {activeViewStats.count} {selectedWeekFilter !== 'ALL' && <span className="text-slate-500 text-xs font-normal">/ 10</span>}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                  <Trophy className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Goals Scored</div>
                  <div className="text-sm font-black font-mono text-slate-900">
                    {activeViewStats.totalGoals} <span className="text-slate-500 text-[11px] font-normal">({activeViewStats.avgGoals}/m)</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">BTTS YES Rate</div>
                  <div className="text-sm font-black font-mono text-emerald-700">
                    {activeViewStats.bttsPct}% <span className="text-slate-500 text-[11px] font-normal">({activeViewStats.bttsCount}/{activeViewStats.count})</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-700 shrink-0">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Over 2.5 Goals</div>
                  <div className="text-sm font-black font-mono text-purple-700">
                    {activeViewStats.over25Pct}% <span className="text-slate-500 text-[11px] font-normal">({activeViewStats.over25Count}/{activeViewStats.count})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Outcome Filter Toolbar */}
          <div className="p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border border-red-100 bg-white rounded-2xl shadow-sm">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search team, venue, or goalscorer..."
                value={teamSearchQuery}
                onChange={(e) => setTeamSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl pl-9 pr-8 py-2 text-xs outline-none focus:border-red-500 transition-colors"
              />
              {teamSearchQuery && (
                <button
                  onClick={() => setTeamSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Outcome Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full">
              <button
                onClick={() => setMatchOutcomeFilter('ALL')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  matchOutcomeFilter === 'ALL'
                    ? 'bg-red-600 text-white font-black shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All ({activeViewStats.count})
              </button>

              <button
                onClick={() => setMatchOutcomeFilter('HOME')}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  matchOutcomeFilter === 'HOME'
                    ? 'bg-red-600 text-white font-black shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Home Wins ({activeViewStats.homeWins})
              </button>

              <button
                onClick={() => setMatchOutcomeFilter('DRAW')}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  matchOutcomeFilter === 'DRAW'
                    ? 'bg-amber-600 text-white font-black shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Draws ({activeViewStats.draws})
              </button>

              <button
                onClick={() => setMatchOutcomeFilter('AWAY')}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  matchOutcomeFilter === 'AWAY'
                    ? 'bg-blue-600 text-white font-black shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Away Wins ({activeViewStats.awayWins})
              </button>

              <button
                onClick={() => setMatchOutcomeFilter('BTTS')}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  matchOutcomeFilter === 'BTTS'
                    ? 'bg-emerald-600 text-white font-black shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                BTTS Yes ({activeViewStats.bttsCount})
              </button>

              <button
                onClick={() => setMatchOutcomeFilter('OVER25')}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  matchOutcomeFilter === 'OVER25'
                    ? 'bg-purple-600 text-white font-black shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Over 2.5 ({activeViewStats.over25Count})
              </button>
            </div>
          </div>

          {/* Matches List Grid (Clean, High-Contrast Scoreboards) */}
          {filteredMatches.length === 0 ? (
            <div className="p-10 text-center space-y-4 border border-red-100 bg-white rounded-2xl shadow-sm">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedWeekFilter === 'ALL'
                    ? 'No match results recorded yet'
                    : `No matches found for Matchweek ${selectedWeekFilter}`}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Click "Add Match" to record scores, goalscorers, and venue for home and away teams.
                </p>
              </div>
              <button
                onClick={() => openNewMatchModal(selectedWeekFilter === 'ALL' ? currentWeek : selectedWeekFilter)}
                className="py-2.5 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs inline-flex items-center space-x-2 shadow-md shadow-red-600/20 active:scale-95 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Input Match Result</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMatches.map((match) => {
                const homeInfo = getTeamInfo(match.homeTeam);
                const awayInfo = getTeamInfo(match.awayTeam);

                const isHomeWin = match.winner === 'HOME';
                const isAwayWin = match.winner === 'AWAY';
                const isDraw = match.winner === 'DRAW';

                return (
                  <div
                    key={match.id}
                    className="p-4 sm:p-5 border border-red-100 hover:border-red-300 bg-white rounded-2xl transition-all space-y-3.5 relative group shadow-sm"
                  >
                    {/* Header: MW, Date, Venue, and Actions */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 text-xs text-slate-500">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-lg bg-red-50 text-red-700 font-mono font-bold border border-red-200">
                          MW {match.matchweek}
                        </span>
                        <span className="text-slate-700 font-semibold">{match.date}</span>
                        {match.matchTime && <span className="text-slate-400 font-mono">• {match.matchTime}</span>}
                      </div>

                      {/* Edit / Delete action buttons */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openEditMatchModal(match)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Edit Match"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMatchPrompt(match.id, match.homeTeam, match.awayTeam)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Match"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Main Scoreboard Display (Clean 3-Column Layout) */}
                    <div className="grid grid-cols-11 items-center gap-2 py-1">
                      {/* Home Team */}
                      <div className="col-span-4 text-right space-y-1">
                        <div className="flex items-center justify-end">
                          <span className={`text-sm sm:text-base font-bold ${isHomeWin ? 'text-red-600 font-black' : 'text-slate-900'}`}>
                            {match.homeTeam}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Home</span>
                      </div>

                      {/* Score Badge */}
                      <div className="col-span-3 text-center">
                        <div className="inline-flex items-center justify-center px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 font-mono text-lg sm:text-xl font-black text-slate-900 tracking-widest shadow-xs">
                          <span className={isHomeWin ? 'text-red-600' : 'text-slate-900'}>{match.homeScore}</span>
                          <span className="mx-1.5 text-slate-400">-</span>
                          <span className={isAwayWin ? 'text-red-600' : 'text-slate-900'}>{match.awayScore}</span>
                        </div>
                        {match.halfTimeHomeScore !== undefined && match.halfTimeAwayScore !== undefined && (
                          <div className="text-[10px] text-slate-500 mt-1 font-mono">
                            HT: {match.halfTimeHomeScore}-{match.halfTimeAwayScore}
                          </div>
                        )}
                      </div>

                      {/* Away Team */}
                      <div className="col-span-4 text-left space-y-1">
                        <div className="flex items-center justify-start">
                          <span className={`text-sm sm:text-base font-bold ${isAwayWin ? 'text-red-600 font-black' : 'text-slate-900'}`}>
                            {match.awayTeam}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Away</span>
                      </div>
                    </div>

                    {/* Goalscorers Timeline */}
                    {(match.homeGoalScorers || match.awayGoalScorers) && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1 text-xs">
                        {match.homeGoalScorers && (
                          <div className="flex items-start space-x-2">
                            <span className="text-[10px] font-bold text-red-600 shrink-0 mt-0.5">⚽ {match.homeTeam}:</span>
                            <span className="text-slate-700 font-medium">{match.homeGoalScorers}</span>
                          </div>
                        )}
                        {match.awayGoalScorers && (
                          <div className="flex items-start space-x-2">
                            <span className="text-[10px] font-bold text-blue-600 shrink-0 mt-0.5">⚽ {match.awayTeam}:</span>
                            <span className="text-slate-700 font-medium">{match.awayGoalScorers}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Outcome & Insight Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <span className={`px-2 py-0.5 rounded-md font-bold ${
                          isHomeWin
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : isAwayWin
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {isHomeWin ? `${match.homeTeam} Won` : isAwayWin ? `${match.awayTeam} Won` : 'Draw'}
                        </span>

                        <span className={`px-2 py-0.5 rounded-md font-bold font-mono ${
                          match.btts ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          BTTS: {match.btts ? 'YES' : 'NO'}
                        </span>

                        <span className={`px-2 py-0.5 rounded-md font-bold font-mono ${
                          match.over25 ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {match.over25 ? 'Over 2.5' : 'Under 2.5'}
                        </span>
                      </div>

                      {match.cleanSheetTeam !== 'NONE' && (
                        <span className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>CS: {match.cleanSheetTeam === 'BOTH' ? 'Both' : match.cleanSheetTeam === 'HOME' ? match.homeTeam : match.awayTeam}</span>
                        </span>
                      )}
                    </div>

                    {/* Match Notes */}
                    {match.notes && (
                      <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                        "{match.notes}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: LIVE 20-TEAM EPL STANDINGS TABLE
      ======================================================== */}
      {activeSubTab === 'standings' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 space-y-4 border border-red-100 bg-white rounded-2xl shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span>English Premier League 20 Teams Standings</span>
                </h3>
              </div>

              {/* View filter: Overall / Home / Away */}
              <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  onClick={() => setStandingsMode('overall')}
                  className={`py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                    standingsMode === 'overall' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Overall
                </button>
                <button
                  onClick={() => setStandingsMode('home')}
                  className={`py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                    standingsMode === 'home' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => setStandingsMode('away')}
                  className={`py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                    standingsMode === 'away' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Away
                </button>
              </div>
            </div>

            {/* Standings Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider bg-slate-50/60">
                    <th className="py-2.5 px-2 text-center w-8">#</th>
                    <th className="py-2.5 px-3">Team</th>
                    <th className="py-2.5 px-2 text-center">MP</th>
                    <th className="py-2.5 px-2 text-center">W</th>
                    <th className="py-2.5 px-2 text-center">D</th>
                    <th className="py-2.5 px-2 text-center">L</th>
                    <th className="py-2.5 px-2 text-center">GF</th>
                    <th className="py-2.5 px-2 text-center">GA</th>
                    <th className="py-2.5 px-2 text-center">GD</th>
                    <th className="py-2.5 px-3 text-center font-black text-slate-900">PTS</th>
                    <th className="py-2.5 px-3 text-center">Form</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {standings.map((row, idx) => {
                    const isTop4 = idx < 4;
                    const isRelegation = idx >= 17;

                    const played = standingsMode === 'home' ? row.homePlayed : standingsMode === 'away' ? row.awayPlayed : row.played;
                    const won = standingsMode === 'home' ? row.homeWon : standingsMode === 'away' ? row.awayWon : row.won;
                    const drawn = standingsMode === 'home' ? row.homeDrawn : standingsMode === 'away' ? row.awayDrawn : row.drawn;
                    const lost = standingsMode === 'home' ? row.homeLost : standingsMode === 'away' ? row.awayLost : row.lost;
                    const gf = standingsMode === 'home' ? row.homeGF : standingsMode === 'away' ? row.awayGF : row.goalsFor;
                    const ga = standingsMode === 'home' ? row.homeGA : standingsMode === 'away' ? row.awayGA : row.goalsAgainst;
                    const gd = gf - ga;
                    const pts = won * 3 + drawn;

                    return (
                      <tr
                        key={row.team}
                        onClick={() => {
                          const teamObj = ALL_EPL_20_TEAMS.find((t) => t.name === row.team);
                          if (teamObj) setSelectedTeamProfileId(teamObj.id);
                          setActiveSubTab('team_hub');
                        }}
                        className="hover:bg-red-50/50 cursor-pointer transition-colors"
                      >
                        {/* Position */}
                        <td className="py-2.5 px-2 text-center font-mono font-bold">
                          <span
                            className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[11px] ${
                              isTop4
                                ? 'bg-blue-50 text-blue-700 font-black border border-blue-200'
                                : isRelegation
                                ? 'bg-red-50 text-red-700 font-black border border-red-200'
                                : 'text-slate-600'
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>

                        {/* Team Name */}
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          <span>{row.team}</span>
                        </td>

                        {/* Match Stats */}
                        <td className="py-2.5 px-2 text-center font-mono text-slate-700">{played}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-emerald-700 font-bold">{won}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-amber-700">{drawn}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-red-600">{lost}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-700">{gf}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-500">{ga}</td>
                        <td className="py-2.5 px-2 text-center font-mono font-semibold">
                          <span className={gd > 0 ? 'text-emerald-700' : gd < 0 ? 'text-red-600' : 'text-slate-500'}>
                            {gd > 0 ? `+${gd}` : gd}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-black text-sm text-red-600">
                          {pts}
                        </td>

                        {/* Form Badges */}
                        <td className="py-2.5 px-3 text-center">
                          {row.form.length === 0 ? (
                            <span className="text-[10px] text-slate-400">-</span>
                          ) : (
                            <div className="flex items-center justify-center space-x-1">
                              {row.form.map((f, fi) => (
                                <span
                                  key={fi}
                                  data-form={f}
                                  className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center font-mono ${
                                    f === 'W'
                                      ? 'form-badge-w bg-green-600 text-white'
                                      : f === 'D'
                                      ? 'form-badge-d bg-orange-500 text-white'
                                      : 'form-badge-l bg-red-600 text-white'
                                  }`}
                                >
                                  {f}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500"></span>
                  <span>Champions League (Top 4)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded bg-red-500"></span>
                  <span>Relegation Zone (Bottom 3)</span>
                </span>
              </div>
              <span>Click on any team to view full stats and profile</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: 20 TEAMS DETAILED PROFILE & STATS HUB
      ======================================================== */}
      {activeSubTab === 'team_hub' && (
        <div className="space-y-4">
          {/* Team Selection Ribbon */}
          <div className="p-4 space-y-2 border border-red-100 bg-white rounded-2xl shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Select Team Profile:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2">
              {ALL_EPL_20_TEAMS.map((team) => {
                const isSelected = selectedTeamProfileId === team.id;
                const teamMatchesCount = (state.eplMatches || []).filter(
                  (m) => m.homeTeam === team.name || m.awayTeam === team.name
                ).length;

                return (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeamProfileId(team.id)}
                    className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                      isSelected
                        ? 'bg-red-600 text-white border-red-600 font-extrabold shadow-sm ring-2 ring-red-400'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className={`text-[10px] font-semibold ${isSelected ? 'text-red-100' : 'text-red-600'}`}>{team.city}</span>
                    <span className="text-xs font-bold truncate w-full">{team.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${isSelected ? 'bg-red-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {teamMatchesCount} matches
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Team Profile Details Card */}
          <div className="p-5 sm:p-6 space-y-5 border border-red-100 bg-white rounded-2xl shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/20">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">{selectedTeamProfile.info.name}</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>City: {selectedTeamProfile.info.city}</span>
                  </div>
                </div>
              </div>

              {/* Quick Standings Snapshot */}
              {selectedTeamProfile.standing && (
                <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="text-center px-2">
                    <div className="text-[10px] text-slate-500 uppercase">Position</div>
                    <div className="text-lg font-mono font-black text-slate-900">#{selectedTeamProfile.standing.position}</div>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="text-center px-2">
                    <div className="text-[10px] text-slate-500 uppercase">Points</div>
                    <div className="text-lg font-mono font-black text-red-600">{selectedTeamProfile.standing.points}</div>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="text-center px-2">
                    <div className="text-[10px] text-slate-500 uppercase">Played</div>
                    <div className="text-lg font-mono font-black text-slate-700">{selectedTeamProfile.standing.played}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Performance Stats Breakdown: Home vs Away vs Goal Profiles */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <div className="text-[10px] text-slate-500 uppercase">Home (W-D-L)</div>
                <div className="text-base font-mono font-bold text-slate-900">
                  {selectedTeamProfile.standing ? `${selectedTeamProfile.standing.homeWon}-${selectedTeamProfile.standing.homeDrawn}-${selectedTeamProfile.standing.homeLost}` : '0-0-0'}
                </div>
                <div className="text-[10px] text-slate-500">
                  Goals: {selectedTeamProfile.standing ? `${selectedTeamProfile.standing.homeGF} scored, ${selectedTeamProfile.standing.homeGA} con` : '0-0'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <div className="text-[10px] text-slate-500 uppercase">Away (W-D-L)</div>
                <div className="text-base font-mono font-bold text-slate-900">
                  {selectedTeamProfile.standing ? `${selectedTeamProfile.standing.awayWon}-${selectedTeamProfile.standing.awayDrawn}-${selectedTeamProfile.standing.awayLost}` : '0-0-0'}
                </div>
                <div className="text-[10px] text-slate-500">
                  Goals: {selectedTeamProfile.standing ? `${selectedTeamProfile.standing.awayGF} scored, ${selectedTeamProfile.standing.awayGA} con` : '0-0'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <div className="text-[10px] text-slate-500 uppercase">BTTS Rate</div>
                <div className="text-base font-mono font-bold text-amber-600">
                  {selectedTeamProfile.bttsRate.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500">
                  {selectedTeamProfile.matches.filter((m) => m.btts).length}/{selectedTeamProfile.matches.length} matches
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <div className="text-[10px] text-slate-500 uppercase">Over 2.5 Rate</div>
                <div className="text-base font-mono font-bold text-purple-600">
                  {selectedTeamProfile.over25Rate.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500">
                  {selectedTeamProfile.matches.filter((m) => m.over25).length}/{selectedTeamProfile.matches.length} matches
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <div className="text-[10px] text-slate-500 uppercase">Clean Sheets</div>
                <div className="text-base font-mono font-bold text-emerald-600">
                  {selectedTeamProfile.cleanSheetRate.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500">
                  Total: {selectedTeamProfile.standing?.cleanSheets || 0}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <div className="text-[10px] text-slate-500 uppercase">Avg Goals/Match</div>
                <div className="text-base font-mono font-bold text-slate-900">
                  {selectedTeamProfile.avgGoalsScored}
                </div>
                <div className="text-[10px] text-slate-500">
                  Conceded: {selectedTeamProfile.avgGoalsConceded}
                </div>
              </div>
            </div>

            {/* This team's full match history log */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>{selectedTeamProfile.info.name} - Match Results History:</span>
                <span className="text-xs text-slate-500 font-normal">Total {selectedTeamProfile.matches.length} matches</span>
              </h4>

              {selectedTeamProfile.matches.length === 0 ? (
                <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  No match results recorded yet for {selectedTeamProfile.info.name}.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedTeamProfile.matches.map((m) => {
                    const isHome = m.homeTeam.toLowerCase() === selectedTeamProfile.info.name.toLowerCase();
                    const teamScore = isHome ? m.homeScore : m.awayScore;
                    const oppScore = isHome ? m.awayScore : m.homeScore;
                    const oppTeam = isHome ? m.awayTeam : m.homeTeam;

                    let outcome: 'W' | 'D' | 'L' = 'D';
                    if (teamScore > oppScore) outcome = 'W';
                    else if (teamScore < oppScore) outcome = 'L';

                    return (
                      <div
                        key={m.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center space-x-3">
                          <span
                            data-form={outcome}
                            className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center font-mono shrink-0 ${
                              outcome === 'W'
                                ? 'form-badge-w bg-green-600 text-white'
                                : outcome === 'D'
                                ? 'form-badge-d bg-orange-500 text-white'
                                : 'form-badge-l bg-red-600 text-white'
                            }`}
                          >
                            {outcome}
                          </span>

                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-900">
                                {isHome ? `${m.homeTeam} (Home)` : `${m.awayTeam} (Away)`} vs {oppTeam}
                              </span>
                              <span className="font-mono font-extrabold text-slate-900 px-2 py-0.5 rounded bg-white border border-slate-200 shadow-xs">
                                {m.homeScore} - {m.awayScore}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              MW {m.matchweek} • {m.date}
                            </div>
                          </div>
                        </div>

                        {/* Scorers / quick note */}
                        <div className="text-right text-[11px] text-slate-600">
                          {m.homeGoalScorers && isHome && (
                            <div className="text-red-600 font-medium">⚽ {m.homeGoalScorers}</div>
                          )}
                          {m.awayGoalScorers && !isHome && (
                            <div className="text-blue-600 font-medium">⚽ {m.awayGoalScorers}</div>
                          )}
                          <div className="text-slate-400 text-[10px]">
                            BTTS: {m.btts ? 'YES' : 'NO'} • {m.totalGoals} Goals
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: HEAD TO HEAD (H2H) COMPARATOR
      ======================================================== */}
      {activeSubTab === 'h2h' && (
        <div className="space-y-4">
          <div className="p-5 sm:p-6 space-y-5 border border-red-100 bg-white rounded-2xl shadow-sm">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Swords className="w-5 h-5 text-red-600" />
                <span>Head-to-Head (H2H) Statistics Comparison</span>
              </h3>
              <p className="text-xs text-slate-500">Select any 2 teams to compare their past match results and goal statistics</p>
            </div>

            {/* Team Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-red-600">Team A:</label>
                <select
                  value={h2hTeamA}
                  onChange={(e) => setH2hTeamA(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-red-500 cursor-pointer shadow-xs"
                >
                  {ALL_EPL_20_TEAMS.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-blue-600">Team B:</label>
                <select
                  value={h2hTeamB}
                  onChange={(e) => setH2hTeamB(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-blue-500 cursor-pointer shadow-xs"
                >
                  {ALL_EPL_20_TEAMS.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* H2H Result Summary Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="grid grid-cols-3 items-center text-center gap-2">
                <div className="space-y-1">
                  <div className="text-base sm:text-lg font-black text-red-600">{h2hSummary.teamA}</div>
                  <div className="text-2xl font-black font-mono text-slate-900">{h2hSummary.teamAWins} <span className="text-xs font-normal text-slate-500">Wins</span></div>
                  <div className="text-[11px] text-slate-500">Goals: {h2hSummary.teamAGoals}</div>
                </div>

                <div className="space-y-1 border-x border-slate-200 px-2">
                  <div className="text-xs text-slate-500 uppercase font-bold">Matches: {h2hSummary.totalMatches}</div>
                  <div className="text-xl font-black font-mono text-amber-600">{h2hSummary.draws} <span className="text-xs font-normal text-slate-500">Draws</span></div>
                  <div className="text-[11px] text-slate-500">BTTS: {h2hSummary.bttsRate.toFixed(0)}% ({h2hSummary.bttsCount})</div>
                </div>

                <div className="space-y-1">
                  <div className="text-base sm:text-lg font-black text-blue-600">{h2hSummary.teamB}</div>
                  <div className="text-2xl font-black font-mono text-slate-900">{h2hSummary.teamBWins} <span className="text-xs font-normal text-slate-500">Wins</span></div>
                  <div className="text-[11px] text-slate-500">Goals: {h2hSummary.teamBGoals}</div>
                </div>
              </div>

              {/* H2H Match List */}
              <div className="space-y-2 pt-3 border-t border-slate-200">
                <div className="text-xs font-bold text-slate-700">Previous Head-to-Head Matches:</div>
                {h2hSummary.matches.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-xs italic">
                    No recorded matches found between these two teams yet.
                  </div>
                ) : (
                  h2hSummary.matches.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">
                          {m.homeTeam} {m.homeScore} - {m.awayScore} {m.awayTeam}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          MW {m.matchweek} • {m.date}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          m.btts ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          BTTS: {m.btts ? 'YES' : 'NO'}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {m.totalGoals} Goals
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: MATCH RESULT ENTRY / EDIT FORM
      ======================================================== */}
      {isMatchModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => setIsMatchModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl my-auto p-5 sm:p-6 bg-white border border-red-200 rounded-2xl sm:rounded-3xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-200">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {editingMatchId ? 'Edit Match Result' : 'Add Match Result & Stats'}
                  </h3>
                  <p className="text-xs text-slate-500">Record home/away teams, scoreline, goalscorers, and match venue</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMatchModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMatch} className="space-y-4">
              {/* Error Notification inside Modal */}
              {modalErrorMsg && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center space-x-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{modalErrorMsg}</span>
                </div>
              )}

              {/* Row 1: Matchweek, Date, Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Matchweek (MW):</label>
                  <select
                    value={formMatchweek}
                    onChange={(e) => setFormMatchweek(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-red-500 cursor-pointer shadow-xs"
                  >
                    {Array.from({ length: 38 }, (_, i) => i + 1).map((w) => (
                      <option key={w} value={w}>
                        Matchweek {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Match Date:</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        (e.currentTarget as HTMLInputElement).showPicker?.();
                      } catch (_) {}
                    }}
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs outline-none focus:border-red-500 cursor-pointer shadow-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Match Time:</label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    onClick={(e) => {
                      try {
                        (e.currentTarget as HTMLInputElement).showPicker?.();
                      } catch (_) {}
                    }}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs outline-none focus:border-red-500 cursor-pointer shadow-xs"
                  />
                </div>
              </div>

              {/* Row 2: Home Team & Away Team Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-red-600 flex items-center gap-1">
                    <span>Home Team:</span>
                  </label>
                  <select
                    value={formHomeTeam}
                    onChange={(e) => handleHomeTeamChange(e.target.value)}
                    className="w-full bg-white border border-red-200 text-red-700 font-bold rounded-xl px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-red-400 cursor-pointer shadow-xs"
                  >
                    {ALL_EPL_20_TEAMS.map((t) => (
                      <option key={t.id} value={t.name}>
                        ⚽ {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-blue-600 flex items-center gap-1">
                    <span>Away Team:</span>
                  </label>
                  <select
                    value={formAwayTeam}
                    onChange={(e) => setFormAwayTeam(e.target.value)}
                    className="w-full bg-white border border-blue-200 text-blue-700 font-bold rounded-xl px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-xs"
                  >
                    {ALL_EPL_20_TEAMS.map((t) => (
                      <option key={t.id} value={t.name}>
                        ⚽ {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4: Final Scores */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-700">Full Time Score:</div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-red-600">{formHomeTeam} FT Goals</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={formHomeScore}
                      onChange={(e) => setFormHomeScore(e.target.value === '' ? '' : Number(e.target.value))}
                      required
                      className="w-full bg-white border border-red-200 text-center font-mono font-black text-lg text-slate-900 rounded-xl py-2 outline-none focus:border-red-500 shadow-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-blue-600">{formAwayTeam} FT Goals</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={formAwayScore}
                      onChange={(e) => setFormAwayScore(e.target.value === '' ? '' : Number(e.target.value))}
                      required
                      className="w-full bg-white border border-blue-200 text-center font-mono font-black text-lg text-slate-900 rounded-xl py-2 outline-none focus:border-blue-500 shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Row 6: Match Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Match Notes & Observations:</label>
                <textarea
                  rows={2}
                  placeholder="e.g., Red card in 65th minute, late penalty winner, key player injured..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl px-3 py-2 text-xs outline-none focus:border-red-500 resize-none shadow-xs"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMatchModalOpen(false)}
                  className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  {editingMatchId ? 'Update Match' : 'Save Match'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      {/* Confirmation Modal */}
      <ConfirmActionModal
        config={confirmConfig}
        onClose={() => setConfirmConfig(null)}
      />

      {/* Report Preview Modal */}
      {reportModalData && (
        <ReportPreviewModal
          isOpen={reportModalData.isOpen}
          title={reportModalData.title}
          htmlContent={reportModalData.htmlContent}
          downloadFilename={reportModalData.downloadFilename}
          onClose={() => setReportModalData(null)}
        />
      )}
    </div>
  );
};
