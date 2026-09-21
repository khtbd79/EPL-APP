import React, { useState, useMemo } from 'react';
import { AppState } from '../types';
import { calculateEPLStandings, ALL_EPL_20_TEAMS } from '../utils/teamData';
import { TeamCrest } from './TeamCrest';
import {
  Trophy,
  Search,
  ChevronDown,
  Shield,
  Activity,
  X,
  ExternalLink,
  Database
} from 'lucide-react';

interface StandingsViewProps {
  state: AppState;
  onNavigateTab?: (tab: any) => void;
}

export const StandingsView: React.FC<StandingsViewProps> = ({ state, onNavigateTab }) => {
  const [filterMode, setFilterMode] = useState<'overall' | 'home' | 'away'>('overall');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate live 20-team standings based on state.eplMatches
  const rawStandings = useMemo(() => {
    return calculateEPLStandings(state.eplMatches || []);
  }, [state.eplMatches]);

  const filteredStandings = useMemo(() => {
    let list = [...rawStandings];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => item.team.toLowerCase().includes(q));
    }

    return list;
  }, [rawStandings, searchQuery]);

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-red-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/20 shrink-0">
            <Trophy className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Premier League Standing
            </h1>
          </div>
        </div>

        {/* View Mode Filters: Overall / Home / Away */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('team_data')}
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer border border-slate-200 whitespace-nowrap"
            >
              <Database className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>Enter Scores</span>
            </button>
          )}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setFilterMode('overall')}
              className={`py-1.5 px-3 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                filterMode === 'overall'
                  ? 'bg-red-600 text-white shadow-sm shadow-red-600/30 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overall
            </button>
            <button
              onClick={() => setFilterMode('home')}
              className={`py-1.5 px-3 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                filterMode === 'home'
                  ? 'bg-red-600 text-white shadow-sm shadow-red-600/30 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setFilterMode('away')}
              className={`py-1.5 px-3 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                filterMode === 'away'
                  ? 'bg-red-600 text-white shadow-sm shadow-red-600/30 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Away
            </button>
          </div>
        </div>
      </div>

      {/* Search & Zone Legend Bar */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Premier League club..."
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
      </div>

      {/* Main 20-Team Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-3 text-center w-10 sm:w-12">#</th>
                <th className="py-3.5 px-3 sm:px-4 min-w-[140px] sm:min-w-[200px]">Club</th>
                <th className="py-3.5 px-2.5 text-center">MP</th>
                <th className="py-3.5 px-2.5 text-center">W</th>
                <th className="py-3.5 px-2.5 text-center">D</th>
                <th className="py-3.5 px-2.5 text-center">L</th>
                <th className="py-3.5 px-2.5 text-center hidden sm:table-cell">GF</th>
                <th className="py-3.5 px-2.5 text-center hidden sm:table-cell">GA</th>
                <th className="py-3.5 px-2.5 text-center font-mono">GD</th>
                <th className="py-3.5 px-3.5 text-center font-black text-slate-900">PTS</th>
                <th className="py-3.5 px-3.5 text-center">Recent Form</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-semibold text-slate-700">
              {filteredStandings.map((row, idx) => {
                const pos = idx + 1;
                const isTier1 = pos <= 4;
                const isSpecial = pos === 5;
                const isTier2 = pos >= 6 && pos <= 12;
                const isTier3 = pos >= 13;

                const played = filterMode === 'home' ? row.homePlayed : filterMode === 'away' ? row.awayPlayed : row.played;
                const won = filterMode === 'home' ? row.homeWon : filterMode === 'away' ? row.awayWon : row.won;
                const drawn = filterMode === 'home' ? row.homeDrawn : filterMode === 'away' ? row.awayDrawn : row.drawn;
                const lost = filterMode === 'home' ? row.homeLost : filterMode === 'away' ? row.awayLost : row.lost;
                const gf = filterMode === 'home' ? row.homeGF : filterMode === 'away' ? row.awayGF : row.goalsFor;
                const ga = filterMode === 'home' ? row.homeGA : filterMode === 'away' ? row.awayGA : row.goalsAgainst;
                const gd = gf - ga;
                const pts = won * 3 + drawn;

                // Determine single colored divider line class on the row
                const rowBorderClass = pos === 4
                  ? 'border-b-2 border-emerald-500'
                  : pos === 5
                  ? 'border-b-2 border-purple-500'
                  : pos === 12
                  ? 'border-b-2 border-orange-500'
                  : pos === 20
                  ? 'border-b-2 border-red-500'
                  : '';

                return (
                  <tr
                    key={row.team}
                    className={`hover:bg-slate-50 transition-colors ${rowBorderClass}`}
                  >
                    <td className="py-3.5 px-3 text-center font-bold font-mono">
                      <span
                        className={`inline-block w-6 h-6 leading-6 rounded-md text-xs font-black shadow-xs ${
                          isTier1
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isSpecial
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : isTier2
                            ? 'bg-orange-100 text-orange-800 border border-orange-300'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}
                      >
                        {pos}
                      </span>
                    </td>
                    <td className="py-2.5 sm:py-3.5 px-2.5 sm:px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <TeamCrest teamName={row.team} className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" size={26} />
                        <span className="font-black text-slate-900 text-xs sm:text-sm whitespace-nowrap">{row.team}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-2.5 text-center font-mono text-slate-800">{played}</td>
                    <td className="py-3.5 px-2.5 text-center font-mono text-emerald-600 font-bold">{won}</td>
                    <td className="py-3.5 px-2.5 text-center font-mono text-orange-600 font-bold">{drawn}</td>
                    <td className="py-3.5 px-2.5 text-center font-mono text-red-600 font-bold">{lost}</td>
                    <td className="py-3.5 px-2.5 text-center font-mono hidden sm:table-cell text-slate-600">{gf}</td>
                    <td className="py-3.5 px-2.5 text-center font-mono hidden sm:table-cell text-slate-600">{ga}</td>
                    <td className="py-3.5 px-2.5 text-center font-mono font-bold">
                      <span className={gd > 0 ? 'text-emerald-600' : gd < 0 ? 'text-red-600' : 'text-slate-400'}>
                        {gd > 0 ? `+${gd}` : gd}
                      </span>
                    </td>
                    <td className="py-3.5 px-3.5 text-center font-black font-mono text-slate-900 text-base">
                      {pts}
                    </td>
                    <td className="py-3.5 px-3.5 text-center">
                      {row.form.length === 0 ? (
                        <span className="text-xs text-slate-300 font-mono">-</span>
                      ) : (
                        <div className="flex items-center justify-center space-x-1">
                          {row.form.map((f, i) => (
                            <span
                              key={i}
                              data-form={f}
                              className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center text-white font-mono shadow-xs ${
                                f === 'W'
                                  ? 'form-badge-w bg-green-600'
                                  : f === 'D'
                                  ? 'form-badge-d bg-orange-500'
                                  : 'form-badge-l bg-red-600'
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
      </div>
    </div>
  );
};
