import React, { useState, useEffect } from 'react';
import { AppState, MatchRecord } from '../types';
import { calculateFinancials, formatMoney, generateId } from '../utils/storage';
import { ConfirmActionModal, ConfirmModalConfig } from './ConfirmActionModal';
import {
  Trophy,
  CheckCircle2,
  PlusCircle,
  RefreshCw,
  Zap,
  ChevronDown,
  ArrowUpDown,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { ALL_EPL_20_TEAMS } from '../utils/teamData';
import { BETTING_MARKETS } from './DailyTaskView';

export interface EPLTeam {
  id: string;
  name: string;
  shortName: string;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

const DEFAULT_EPL_TEAMS: EPLTeam[] = ALL_EPL_20_TEAMS.map((t) => ({
  id: t.id,
  name: t.name,
  shortName: t.shortName,
  points: 0,
  form: [],
}));

const LOCAL_POINTS_KEY = 'btts_epl_teams_v2';

interface TeamFormWidgetProps {
  state: AppState;
  onRecordMatch: (match: MatchRecord) => void;
}

export const TeamFormWidget: React.FC<TeamFormWidgetProps> = ({ state, onRecordMatch }) => {
  const fin = calculateFinancials(state);
  const currency = state.settings.currency || '$';
  const [confirmConfig, setConfirmConfig] = useState<ConfirmModalConfig | null>(null);

  // Load team points from localStorage or default
  const [teams, setTeams] = useState<EPLTeam[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_POINTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === DEFAULT_EPL_TEAMS.length) {
          const allMatch = DEFAULT_EPL_TEAMS.every((dt) => parsed.some((p: EPLTeam) => p.id === dt.id));
          if (allMatch) return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load team points:', e);
    }
    return DEFAULT_EPL_TEAMS;
  });

  // Save teams when updated
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_POINTS_KEY, JSON.stringify(teams));
    } catch (e) {
      console.error('Failed to save team points:', e);
    }
  }, [teams]);

  // Form states for quick match selector
  const [homeTeam, setHomeTeam] = useState<string>('Manchester City');
  const [awayTeam, setAwayTeam] = useState<string>('Arsenal');
  const [market, setMarket] = useState<string>(state.settings.autoFillMarket || 'BTTS YES');
  const [oddsStr, setOddsStr] = useState<string>('');
  const [stakeStr, setStakeStr] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleHomeTeamChange = (newHome: string) => {
    setHomeTeam(newHome);
  };

  // Handle points change for a team
  const handlePointsChange = (id: string, newPoints: number) => {
    const validPoints = Math.max(0, isNaN(newPoints) ? 0 : newPoints);
    setTeams((prev) =>
      prev.map((t) => (t.id === id ? { ...t, points: validPoints } : t))
    );
  };

  // Reset points to defaults
  const handleResetPoints = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Reset EPL Points',
      message: 'Are you sure you want to reset the EPL table points to 0?',
      confirmLabel: 'Yes, Reset',
      cancelLabel: 'Cancel',
      variant: 'warning',
      onConfirm: () => {
        setTeams(DEFAULT_EPL_TEAMS);
        setSuccessMsg('Points table has been reset.');
        setTimeout(() => setSuccessMsg(''), 3000);
      },
    });
  };

  const handleFillRecommendedStake = () => {
    if (fin.recommendedStake > 0) {
      setStakeStr(String(fin.recommendedStake));
    }
  };

  const handleAddBet = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!homeTeam || !awayTeam) {
      setErrorMsg('Please select both Home and Away teams.');
      return;
    }

    if (homeTeam === awayTeam) {
      setErrorMsg('Home and Away teams cannot be the same.');
      return;
    }

    const odds = parseFloat(oddsStr);
    if (isNaN(odds) || odds <= 1.0) {
      setErrorMsg('Please enter valid odds greater than 1.00.');
      return;
    }

    const stake = parseFloat(stakeStr);
    if (isNaN(stake) || stake <= 0) {
      setErrorMsg('Please enter a valid stake amount.');
      return;
    }

    const newMatch: MatchRecord = {
      id: generateId(),
      dayNumber: state.currentDay,
      date: new Date().toISOString().split('T')[0],
      matchTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      league: 'Premier League',
      homeTeam,
      awayTeam,
      market,
      selection: `${homeTeam} vs ${awayTeam} • ${market}`,
      odds,
      stake,
      result: 'PENDING',
      profit: 0,
      loss: 0,
      netPnL: 0,
      bankrollAfter: fin.netBettingPnL,
      notes: `MW ${state.currentMatchweek || 1}`,
      matchweek: state.currentMatchweek || 1,
    };

    onRecordMatch(newMatch);
    setSuccessMsg('Match recorded successfully. Status: PENDING');
    setOddsStr('');
    setStakeStr('');

    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  return (
    <div className="space-y-4">
      {/* Quick Match Builder for 20 EPL Teams */}
      <div className="solid-card p-5 sm:p-6 border border-red-100 bg-white rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-red-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-200 shadow-xs">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">EPL Quick Match Builder</h3>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
            Matchweek {state.currentMatchweek || 1}
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleAddBet} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Home Team */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Home Team</label>
              <div className="relative">
                <select
                  value={homeTeam}
                  onChange={(e) => handleHomeTeamChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-2.5 text-xs font-semibold appearance-none focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 cursor-pointer transition-colors shadow-xs"
                >
                  {ALL_EPL_20_TEAMS.map((t) => (
                    <option key={`h-${t.id}`} value={t.name} className="bg-white text-slate-900">
                      {t.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Away Team */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Away Team</label>
              <div className="relative">
                <select
                  value={awayTeam}
                  onChange={(e) => setAwayTeam(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-2.5 text-xs font-semibold appearance-none focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 cursor-pointer transition-colors shadow-xs"
                >
                  {ALL_EPL_20_TEAMS.map((t) => (
                    <option key={`a-${t.id}`} value={t.name} className="bg-white text-slate-900">
                      {t.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Market */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Market</label>
              <div className="relative">
                <select
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-2.5 text-xs font-semibold appearance-none focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 cursor-pointer transition-colors shadow-xs"
                >
                  {BETTING_MARKETS.map((m) => (
                    <option key={m} value={m} className="bg-white text-slate-900">
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Odds */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Odds</label>
              <input
                type="number"
                step="0.01"
                min="1.01"
                placeholder="e.g. 1.85"
                value={oddsStr}
                onChange={(e) => setOddsStr(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-colors shadow-xs"
              />
            </div>

            {/* Stake */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">Stake ({currency})</label>
                <button
                  type="button"
                  onClick={handleFillRecommendedStake}
                  className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                >
                  Auto Fill
                </button>
              </div>
              <input
                type="number"
                min="1"
                placeholder={`e.g. ${fin.recommendedStake > 0 ? fin.recommendedStake : 500}`}
                value={stakeStr}
                onChange={(e) => setStakeStr(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-colors shadow-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>Record Daily Match</span>
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      <ConfirmActionModal
        config={confirmConfig}
        onClose={() => setConfirmConfig(null)}
      />
    </div>
  );
};
