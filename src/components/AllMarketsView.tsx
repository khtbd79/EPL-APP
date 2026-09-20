import React, { useState, useMemo, useRef } from 'react';
import { AppState, EPLMatchEvent } from '../types';
import { ALL_EPL_TEAM_NAMES } from '../utils/teamData';
import {
  calculateMarketTrends,
  MarketKey,
  ALL_MARKET_DEFINITIONS,
  MarketTrendSummary,
} from '../utils/marketTrends';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  Sparkles,
  ArrowRight,
  Shield,
  Activity,
  Target
} from 'lucide-react';

interface AllMarketsViewProps {
  state: AppState;
  onNavigateTab?: (tab: any) => void;
}

export const AllMarketsView: React.FC<AllMarketsViewProps> = ({ state, onNavigateTab }) => {
  const matches: EPLMatchEvent[] = state.eplMatches || [];

  const [selectedTeam, setSelectedTeam] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'GOALS' | 'OUTCOMES' | 'DEFENSE'>('ALL');
  const [activeMarketKey, setActiveMarketKey] = useState<MarketKey>('BTTS');
  const [searchQuery, setSearchQuery] = useState('');

  // Compute trends across matches
  const trendData = useMemo(() => {
    return calculateMarketTrends(matches, selectedTeam);
  }, [matches, selectedTeam]);

  const { weeks, weeklyStats, summaries, totalMatchesCount } = trendData;

  // Categorize markets
  const categorizedSummaries = useMemo(() => {
    return summaries.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchLabel = s.label.toLowerCase().includes(q) || s.shortLabel.toLowerCase().includes(q);
        if (!matchLabel) return false;
      }

      if (selectedCategory === 'ALL') return true;
      if (selectedCategory === 'GOALS') {
        return ['BTTS', 'OVER_25', 'UNDER_25', 'OVER_15', 'UNDER_35', 'FIRST_HALF_GOAL'].includes(s.key);
      }
      if (selectedCategory === 'OUTCOMES') {
        return ['HOME_WIN', 'AWAY_WIN', 'DRAW'].includes(s.key);
      }
      if (selectedCategory === 'DEFENSE') {
        return ['CLEAN_SHEET', 'UNDER_25', 'UNDER_35'].includes(s.key);
      }
      return true;
    });
  }, [summaries, selectedCategory, searchQuery]);

  const activeMarket = summaries.find((s) => s.key === activeMarketKey) || summaries[0];

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-red-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
            <Layers className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              All Markets
            </h1>
          </div>
        </div>

        {/* Team Scope Filter */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500">Club:</span>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-extrabold text-slate-900 outline-none cursor-pointer"
            >
              <option value="ALL">All 20 Premier League Teams</option>
              {ALL_EPL_TEAM_NAMES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto text-xs font-bold">
          {(['ALL', 'GOALS', 'OUTCOMES', 'DEFENSE'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`py-2 px-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Markets' : cat === 'GOALS' ? 'Goals & Scoring' : cat === 'OUTCOMES' ? '1X2 Outcomes' : 'Defensive Lines'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search market name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl py-1.5 pl-8 pr-3 outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Grid of All Markets Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categorizedSummaries.map((market) => {
          const isSelected = activeMarketKey === market.key;
          const hitRate = market.overallPercent;
          const fairOdds = hitRate > 0 ? (100 / hitRate).toFixed(2) : '-';

          return (
            <div
              key={market.key}
              onClick={() => setActiveMarketKey(market.key)}
              className={`bg-white rounded-2xl border p-4.5 transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-md ${
                isSelected
                  ? 'border-red-600 ring-2 ring-red-600/10 shadow-sm'
                  : 'border-slate-200 hover:border-red-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {market.shortLabel}
                  </span>
                  <div className="flex items-center space-x-1 font-mono text-[11px] font-black">
                    {market.direction === 'UP' ? (
                      <span className="text-emerald-600 flex items-center gap-0.5">
                        <TrendingUp className="w-3.5 h-3.5" /> Rise
                      </span>
                    ) : market.direction === 'DOWN' ? (
                      <span className="text-rose-600 flex items-center gap-0.5">
                        <TrendingDown className="w-3.5 h-3.5" /> Fall
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-0.5">
                        <Minus className="w-3.5 h-3.5" /> Stable
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-black text-slate-900 tracking-tight leading-tight">
                  {market.label}
                </h3>
              </div>

              {/* Progress & Stat */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black font-mono text-slate-900">
                    {hitRate.toFixed(1)}%
                  </span>
                  <span className="text-xs font-semibold text-slate-500 font-mono">
                    {market.totalOccurrences}/{market.totalEligible || totalMatchesCount || 0} hits
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(5, hitRate))}%`,
                      backgroundColor: market.color || '#dc2626',
                    }}
                  />
                </div>

                {/* Fair Odds indicator */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 font-semibold text-slate-500">
                  <span>Fair Value Odds:</span>
                  <span className="font-mono font-black text-slate-900">@{fairOdds}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Market Deep-Dive Section */}
      {activeMarket && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: activeMarket.color }}
              />
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {activeMarket.label} — Weekly Breakdown
              </h2>
            </div>
            <div className="text-xs font-bold text-slate-500 font-mono">
              Overall Average: <span className="font-black text-slate-900">{activeMarket.overallPercent.toFixed(1)}%</span>
            </div>
          </div>

          {/* Weekly Bar Chart / Cards */}
          {activeMarket.weeklyPoints.length === 0 ? (
            <div className="py-8 text-center text-xs font-bold text-slate-400">
              No weekly match records available. Record matches in Select Match to view week-by-week trend graphs.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 pt-2">
              {activeMarket.weeklyPoints.map((pt) => {
                return (
                  <div key={pt.week} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center space-y-1.5">
                    <div className="text-[10px] font-black uppercase text-slate-500">
                      Week {pt.week}
                    </div>
                    <div className="text-base font-black font-mono text-slate-900">
                      {pt.percent.toFixed(0)}%
                    </div>
                    <div className="text-[10px] font-mono font-bold text-slate-400">
                      {pt.hits}/{pt.total}
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-600 rounded-full"
                        style={{ width: `${pt.percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
