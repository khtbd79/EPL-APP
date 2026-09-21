import React, { useState, useMemo } from 'react';
import {
  ALL_EPL_20_TEAMS,
  EPLTeamInfo,
  FACTOR_WEIGHTS
} from '../utils/teamData';
import {
  BarChart3,
  ShieldCheck,
  Star,
  CheckCircle2,
  XCircle,
  MinusCircle,
  TrendingUp,
  Percent,
  Check,
  Info,
  ChevronDown,
  Sparkles,
  Award,
  Layers,
  ArrowRight,
  Calculator,
  MapPin,
  Swords
} from 'lucide-react';

export type MarketStatus = 'check' | 'cross' | 'dash';

export interface MarketAnalysisItem {
  id: string;
  name: string;
  description: string;
  status: MarketStatus;
  odds: string;
  probability: string;
}

export const DashboardTeamAnalysisCard: React.FC = () => {
  // 1. Team Selection
  const [selectedTeamId, setSelectedTeamId] = useState<string>('mci');
  const [homeTeamId, setHomeTeamId] = useState<string>('mci');
  const [awayTeamId, setAwayTeamId] = useState<string>('ars');

  // Selected team object
  const selectedTeam: EPLTeamInfo = useMemo(() => {
    return ALL_EPL_20_TEAMS.find((t) => t.id === selectedTeamId) || ALL_EPL_20_TEAMS[0];
  }, [selectedTeamId]);

  const homeTeam = useMemo(() => {
    return ALL_EPL_20_TEAMS.find((t) => t.id === homeTeamId) || ALL_EPL_20_TEAMS[0];
  }, [homeTeamId]);

  const awayTeam = useMemo(() => {
    return ALL_EPL_20_TEAMS.find((t) => t.id === awayTeamId) || ALL_EPL_20_TEAMS[1];
  }, [awayTeamId]);

  // Handle Team change
  const handleTeamChange = (newTeamId: string) => {
    setSelectedTeamId(newTeamId);
  };

  // 2. Factor Scores (0 - 100)
  const [factorScores, setFactorScores] = useState<Record<string, number | ''>>({
    homeAwayPerformance: 85,
    last10Form: 80,
    goalsFor: 90,
    goalsAgainst: 82,
    bttsProfile: 75,
    opponentStrength: 70,
    injuriesSuspensions: 80,
    h2h: 75,
  });

  const handleScoreChange = (factorKey: string, value: string) => {
    if (value === '') {
      setFactorScores((prev) => ({ ...prev, [factorKey]: '' }));
      return;
    }
    const num = Math.min(100, Math.max(0, Number(value)));
    if (!isNaN(num)) {
      setFactorScores((prev) => ({ ...prev, [factorKey]: num }));
    }
  };

  // Automatic Weighted & Overall Score Calculation
  const { totalWeightedScore, scoreBreakdown, hasScores } = useMemo(() => {
    let total = 0;
    let filled = 0;
    let hasAny = false;
    const breakdown: Record<string, number> = {};

    const keys = Object.keys(FACTOR_WEIGHTS);
    keys.forEach((key) => {
      const val = factorScores[key];
      const weight = (FACTOR_WEIGHTS as any)[key] || 0;
      if (typeof val === 'number' && !isNaN(val)) {
        hasAny = true;
        filled++;
        const weighted = (val * weight) / 100;
        breakdown[key] = Number(weighted.toFixed(1));
        total += weighted;
      } else {
        breakdown[key] = 0;
      }
    });

    return {
      totalWeightedScore: Number(total.toFixed(1)),
      scoreBreakdown: breakdown,
      isComplete: filled === keys.length,
      hasScores: hasAny,
    };
  }, [factorScores]);

  // Recommendation Badge based on Overall Score
  const recommendation = useMemo(() => {
    if (!hasScores) {
      return {
        label: 'PASS',
        badgeClass: 'bg-red-500/20 text-red-400 border-red-500/30',
        textClass: 'text-red-400',
        desc: 'No score entered',
      };
    }
    if (totalWeightedScore >= 80) {
      return {
        label: 'STRONG',
        badgeClass: 'bg-red-50 text-red-700 border-red-200 shadow-sm',
        textClass: 'text-red-600',
        desc: 'High Confidence Value Pick',
      };
    }
    if (totalWeightedScore >= 70) {
      return {
        label: 'CONSIDER',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        textClass: 'text-blue-600',
        desc: 'Good Viable Pick',
      };
    }
    if (totalWeightedScore >= 60) {
      return {
        label: 'WATCH',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        textClass: 'text-amber-600',
        desc: 'Borderline / Monitor Lineups',
      };
    }
    return {
      label: 'PASS',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      textClass: 'text-slate-600',
      desc: 'Skip / High Risk',
    };
  }, [totalWeightedScore, hasScores]);

  // 3. Markets Analysis Status (5 Markets: AH 0.0, AH +0.5, 1X, Win, BTTS)
  const [marketStatuses, setMarketStatuses] = useState<Record<string, MarketStatus>>({
    'ah-0': 'check',
    'ah-05': 'check',
    'one-x': 'check',
    'win': 'dash',
    'btts': 'check',
  });

  const [marketOdds, setMarketOdds] = useState<Record<string, string>>({
    'ah-0': '1.55',
    'ah-05': '1.38',
    'one-x': '1.25',
    'win': '1.75',
    'btts': '1.68',
  });

  const handleStatusChange = (marketId: string, status: MarketStatus) => {
    setMarketStatuses((prev) => ({ ...prev, [marketId]: status }));
  };

  const handleOddsChange = (marketId: string, odds: string) => {
    setMarketOdds((prev) => ({ ...prev, [marketId]: odds }));
  };

  const marketsList: MarketAnalysisItem[] = [
    {
      id: 'ah-0',
      name: 'Asian Handicap 0.0 (DNB)',
      description: 'Handicap 0.0 (DNB) • Stake returned if match ends in a draw',
      status: marketStatuses['ah-0'] || 'dash',
      odds: marketOdds['ah-0'] || '1.55',
      probability: '74%',
    },
    {
      id: 'ah-05',
      name: 'Asian Handicap +0.5',
      description: 'Win or Draw yields full win payout',
      status: marketStatuses['ah-05'] || 'dash',
      odds: marketOdds['ah-05'] || '1.38',
      probability: '82%',
    },
    {
      id: 'one-x',
      name: 'Double Chance (1X)',
      description: 'Payout if home team wins or match draws',
      status: marketStatuses['one-x'] || 'dash',
      odds: marketOdds['one-x'] || '1.25',
      probability: '86%',
    },
    {
      id: 'win',
      name: 'Direct Win (Match Odds 1X2)',
      description: 'Requires outright team victory',
      status: marketStatuses['win'] || 'dash',
      odds: marketOdds['win'] || '1.75',
      probability: '65%',
    },
    {
      id: 'btts',
      name: 'Both Teams to Score (BTTS YES)',
      description: 'Both teams score at least 1 goal (1-1, 2-1, 2-2+)',
      status: marketStatuses['btts'] || 'dash',
      odds: marketOdds['btts'] || '1.68',
      probability: '72%',
    },
  ];

  return (
    <div className="p-5 sm:p-6 border border-red-200 bg-white rounded-2xl space-y-6 shadow-sm relative overflow-hidden">
      {/* 1. Header & Live Matchup Match Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-red-600">
            <ShieldCheck className="w-4 h-4" />
            <span>EPL 20 Teams Match Filter & Analyzer</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Match Analysis & Market Selection
          </h2>
        </div>

        {/* Live Match Matchup Selection (Home vs Away) */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-bold text-red-600">Home:</span>
            <select
              value={homeTeamId}
              onChange={(e) => {
                setHomeTeamId(e.target.value);
                setSelectedTeamId(e.target.value);
              }}
              className="bg-white border border-red-200 text-red-700 text-xs font-bold rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-red-400 cursor-pointer shadow-xs"
            >
              {ALL_EPL_20_TEAMS.map((t) => (
                <option key={`home-all-${t.id}`} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <span className="text-slate-400 font-bold text-xs">VS</span>

          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-bold text-blue-600">Away:</span>
            <select
              value={awayTeamId}
              onChange={(e) => setAwayTeamId(e.target.value)}
              className="bg-white border border-blue-200 text-blue-700 text-xs font-bold rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer shadow-xs"
            >
              {ALL_EPL_20_TEAMS.map((t) => (
                <option key={`away-all-${t.id}`} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Primary Team Dropdown & Venue Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Team Dropdown & Info Card */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-2">
              Focus Team Selection (20 Teams):
            </label>
            <div className="relative">
              <select
                value={selectedTeamId}
                onChange={(e) => handleTeamChange(e.target.value)}
                className="w-full bg-white border-2 border-red-300 text-slate-900 font-bold text-base rounded-xl px-4 py-3 appearance-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all cursor-pointer shadow-xs"
              >
                {ALL_EPL_20_TEAMS.map((t) => (
                  <option key={t.id} value={t.id} className="bg-white text-slate-900">
                    {t.name} — {t.priorityLabel}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-red-600">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Team Info Box */}
          <div className="p-3.5 rounded-xl bg-white border border-red-200 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-600" />
                Team City
              </span>
              <span className="text-xs font-bold text-red-700">
                {selectedTeam.city}
              </span>
            </div>
            <div className="text-base font-extrabold text-slate-900">
              {selectedTeam.name}
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
              <span>Class Rating</span>
              <span className="text-red-700 font-mono font-semibold">{selectedTeam.priorityLabel}</span>
            </div>
          </div>
        </div>

        {/* Primary & Secondary Markets Card */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {selectedTeam.name} Market Profiles
              </span>
            </div>
            <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
              {selectedTeam.city}
            </span>
          </div>

          {/* Markets overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white border border-red-200 space-y-2 shadow-xs">
              <div className="text-xs font-bold text-red-600 uppercase tracking-wider">
                ★ Primary Strong Market:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedTeam.primaryMarkets.map((m) => (
                  <span key={m} className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 font-bold text-xs border border-red-200">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-blue-200 space-y-2 shadow-xs">
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                ★ Secondary Market:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedTeam.secondaryMarkets.map((m) => (
                  <span key={m} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Matchup: <strong className="text-red-600">{homeTeam.name}</strong> vs <strong className="text-blue-600">{awayTeam.name}</strong></span>
          </div>
        </div>
      </div>

      {/* 3. Automatic Weighted Score & Overall Score Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-red-200 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2.5">
            <Calculator className="w-5 h-5 text-red-600" />
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              <span className="hidden sm:inline">Analysis Factor Scores & Overall Score (Automatic Weighted Calculation)</span>
              <span className="sm:hidden">Factor Scores & Overall Rating</span>
            </h3>
          </div>

          {/* Overrall Score Badge & Recommendation */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Overall Score</span>
              <div className="text-2xl font-black font-mono text-red-600">
                {totalWeightedScore} <span className="text-xs text-slate-500 font-normal">/ 100</span>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-xl text-center border font-black text-sm tracking-wider ${recommendation.badgeClass}`}>
              <div>{recommendation.label}</div>
              <div className="text-[9px] font-normal opacity-90">{recommendation.desc}</div>
            </div>
          </div>
        </div>

        {/* 8 Factor Sliders / Inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: 'homeAwayPerformance', label: 'Home/Away', weight: 25 },
            { key: 'last10Form', label: 'Last 10 Form', weight: 15 },
            { key: 'goalsFor', label: 'Goals Scored', weight: 10 },
            { key: 'goalsAgainst', label: 'Goals Conceded', weight: 10 },
            { key: 'bttsProfile', label: 'BTTS Profile', weight: 15 },
            { key: 'opponentStrength', label: 'Opponent Diff', weight: 10 },
            { key: 'injuriesSuspensions', label: 'Squad Fitness', weight: 10 },
            { key: 'h2h', label: 'H2H Trend', weight: 5 },
          ].map(({ key, label, weight }) => (
            <div key={key} className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-xs">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-slate-700 truncate">{label}</span>
                <span className="text-[10px] text-slate-400 font-mono">({weight}%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={factorScores[key] ?? ''}
                  onChange={(e) => handleScoreChange(key, e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-900 text-center shadow-xs"
                  placeholder="0-100"
                />
                <span className="text-[10px] text-red-600 font-mono font-bold shrink-0">
                  +{scoreBreakdown[key] || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Five Markets Table (AH 0.0, AH +0.5, 1X, Win, BTTS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              5 Target Markets Analysis (✓ / ✗ / — Dropdown & Value Detection)
            </h3>
          </div>
          <span className="text-xs text-slate-500">Odds & Probability Engine</span>
        </div>

        <div className="space-y-2">
          {marketsList.map((m) => (
            <div
              key={m.id}
              className={`p-3 sm:p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                m.status === 'check'
                  ? 'bg-red-50/40 border-red-200 shadow-xs'
                  : m.status === 'cross'
                  ? 'bg-slate-50/50 border-slate-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              {/* Left Info */}
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-xl border mt-0.5 ${
                    m.status === 'check'
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : m.status === 'cross'
                      ? 'bg-rose-50 text-rose-600 border-rose-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  {m.status === 'check' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : m.status === 'cross' ? (
                    <XCircle className="w-5 h-5" />
                  ) : (
                    <MinusCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm sm:text-base">{m.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        m.status === 'check'
                          ? 'bg-red-100 text-red-800'
                          : m.status === 'cross'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Win Prob: {m.probability}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center space-x-3 self-end md:self-center shrink-0">
                <div className="flex items-center space-x-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Odds:</span>
                  <input
                    type="text"
                    value={m.odds}
                    onChange={(e) => handleOddsChange(m.id, e.target.value)}
                    className="w-14 bg-transparent text-slate-900 font-mono font-bold text-xs text-center focus:outline-none"
                    placeholder="1.60"
                  />
                </div>

                <div className="relative">
                  <select
                    value={m.status}
                    onChange={(e) => handleStatusChange(m.id, e.target.value as MarketStatus)}
                    className={`font-bold text-xs rounded-xl px-3 py-2 border appearance-none pr-7 cursor-pointer transition-all ${
                      m.status === 'check'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : m.status === 'cross'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <option value="check" className="bg-white text-red-600">✓ YES (Select)</option>
                    <option value="cross" className="bg-white text-rose-600">✗ NO (Avoid)</option>
                    <option value="dash" className="bg-white text-slate-600">— NEUTRAL</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-70" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
