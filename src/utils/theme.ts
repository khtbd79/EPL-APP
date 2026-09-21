import { AppLayoutTheme } from '../types';

export interface ThemeDefinition {
  id: AppLayoutTheme;
  name: string;
  isDark?: boolean;

  // Palette hex values
  primaryColor: string;
  primaryHover: string;
  primaryDark: string;
  primaryLight: string;
  borderHex: string;
  swatchHex: string;
  secondarySwatchHex: string;
  surfaceBgHex: string;
  cardBgHex: string;

  // Tailwind class helpers
  headerBgClass: string;
  headerUnderlineClass: string;
  bgClass: string;
  textClass: string;
  cardBg: string;
  cardBorder: string;
  accentBtn: string;
  accentText: string;
  badgeTag: string;
  activeNavBtn: string;

  // Legacy & descriptor props
  badgeBg: string;
  sidebarBg: string;
  cardBgStyle: string;
  cardBorderStyle: string;
  archetype: string;
  accentColorName: string;
  description: string;
}

export const THEME_WHITE_RED: ThemeDefinition = {
  id: 'white_red',
  name: 'Classic Red & White',
  isDark: false,
  primaryColor: '#dc2626',
  primaryHover: '#b91c1c',
  primaryDark: '#991b1b',
  primaryLight: '#fef2f2',
  borderHex: '#fecaca',
  swatchHex: '#dc2626',
  secondarySwatchHex: '#ffffff',
  surfaceBgHex: '#faf5f5',
  cardBgHex: '#ffffff',
  headerBgClass: 'bg-red-600',
  headerUnderlineClass: 'bg-red-800',
  bgClass: 'bg-[#faf5f5]',
  textClass: 'text-slate-900',
  cardBg: 'bg-white',
  cardBorder: 'border-red-200',
  cardBgStyle: '#ffffff',
  cardBorderStyle: '#fecaca',
  badgeBg: 'bg-red-600',
  sidebarBg: 'bg-white',
  accentBtn: 'bg-red-600 hover:bg-red-700 text-white font-black shadow-md shadow-red-600/20',
  accentText: 'text-red-600',
  badgeTag: 'bg-red-50 text-red-700 border border-red-200 font-bold',
  activeNavBtn: 'bg-red-600 text-white shadow-md shadow-red-600/25',
  archetype: 'EPL Crimson Red',
  accentColorName: 'Crimson Red',
  description: 'Crimson red topbar with white canvas',
};

export const THEME_SAPPHIRE: ThemeDefinition = {
  id: 'sapphire',
  name: 'Royal Sapphire Blue',
  isDark: false,
  primaryColor: '#2563eb',
  primaryHover: '#1d4ed8',
  primaryDark: '#1e40af',
  primaryLight: '#eff6ff',
  borderHex: '#bfdbfe',
  swatchHex: '#2563eb',
  secondarySwatchHex: '#93c5fd',
  surfaceBgHex: '#eff6ff',
  cardBgHex: '#f8fbff',
  headerBgClass: 'bg-blue-600',
  headerUnderlineClass: 'bg-blue-800',
  bgClass: 'bg-[#eff6ff]',
  textClass: 'text-slate-900',
  cardBg: 'bg-[#f8fbff]',
  cardBorder: 'border-blue-200',
  cardBgStyle: '#f8fbff',
  cardBorderStyle: '#bfdbfe',
  badgeBg: 'bg-blue-600',
  sidebarBg: 'bg-[#f8fbff]',
  accentBtn: 'bg-blue-600 hover:bg-blue-700 text-white font-black shadow-md shadow-blue-600/20',
  accentText: 'text-blue-600',
  badgeTag: 'bg-blue-50 text-blue-700 border border-blue-200 font-bold',
  activeNavBtn: 'bg-blue-600 text-white shadow-md shadow-blue-600/25',
  archetype: 'Royal Blue',
  accentColorName: 'Sapphire Blue',
  description: 'Deep royal sapphire blue with sky accents',
};

export const THEME_EMERALD: ThemeDefinition = {
  id: 'emerald',
  name: 'Emerald Stadium Pitch',
  isDark: false,
  primaryColor: '#059669',
  primaryHover: '#047857',
  primaryDark: '#065f46',
  primaryLight: '#ecfdf5',
  borderHex: '#a7f3d0',
  swatchHex: '#059669',
  secondarySwatchHex: '#6ee7b7',
  surfaceBgHex: '#ecfdf5',
  cardBgHex: '#f6fef9',
  headerBgClass: 'bg-emerald-600',
  headerUnderlineClass: 'bg-emerald-800',
  bgClass: 'bg-[#ecfdf5]',
  textClass: 'text-slate-900',
  cardBg: 'bg-[#f6fef9]',
  cardBorder: 'border-emerald-200',
  cardBgStyle: '#f6fef9',
  cardBorderStyle: '#a7f3d0',
  badgeBg: 'bg-emerald-600',
  sidebarBg: 'bg-[#f6fef9]',
  accentBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md shadow-emerald-600/20',
  accentText: 'text-emerald-600',
  badgeTag: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold',
  activeNavBtn: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25',
  archetype: 'Stadium Pitch',
  accentColorName: 'Emerald Green',
  description: 'Lush football pitch emerald green',
};

export const THEME_PURPLE: ThemeDefinition = {
  id: 'purple',
  name: 'Imperial EPL Trophy',
  isDark: false,
  primaryColor: '#7e22ce',
  primaryHover: '#6b21a8',
  primaryDark: '#581c87',
  primaryLight: '#faf5ff',
  borderHex: '#e9d5ff',
  swatchHex: '#7e22ce',
  secondarySwatchHex: '#d8b4fe',
  surfaceBgHex: '#f5f3ff',
  cardBgHex: '#faf5ff',
  headerBgClass: 'bg-purple-700',
  headerUnderlineClass: 'bg-purple-950',
  bgClass: 'bg-[#f5f3ff]',
  textClass: 'text-slate-900',
  cardBg: 'bg-[#faf5ff]',
  cardBorder: 'border-purple-200',
  cardBgStyle: '#faf5ff',
  cardBorderStyle: '#e9d5ff',
  badgeBg: 'bg-purple-700',
  sidebarBg: 'bg-[#faf5ff]',
  accentBtn: 'bg-purple-700 hover:bg-purple-800 text-white font-black shadow-md shadow-purple-700/20',
  accentText: 'text-purple-700',
  badgeTag: 'bg-purple-50 text-purple-700 border border-purple-200 font-bold',
  activeNavBtn: 'bg-purple-700 text-white shadow-md shadow-purple-700/25',
  archetype: 'Premier League Purple',
  accentColorName: 'Royal Violet',
  description: 'Trophy royal purple violet',
};

export const THEME_GOLD: ThemeDefinition = {
  id: 'gold',
  name: 'Champions Gold & Amber',
  isDark: false,
  primaryColor: '#d97706',
  primaryHover: '#b45309',
  primaryDark: '#92400e',
  primaryLight: '#fffbeb',
  borderHex: '#fde68a',
  swatchHex: '#d97706',
  secondarySwatchHex: '#fcd34d',
  surfaceBgHex: '#fefce8',
  cardBgHex: '#fffdf5',
  headerBgClass: 'bg-amber-600',
  headerUnderlineClass: 'bg-amber-800',
  bgClass: 'bg-[#fefce8]',
  textClass: 'text-slate-900',
  cardBg: 'bg-[#fffdf5]',
  cardBorder: 'border-amber-200',
  cardBgStyle: '#fffdf5',
  cardBorderStyle: '#fde68a',
  badgeBg: 'bg-amber-600',
  sidebarBg: 'bg-[#fffdf5]',
  accentBtn: 'bg-amber-600 hover:bg-amber-700 text-white font-black shadow-md shadow-amber-600/20',
  accentText: 'text-amber-600',
  badgeTag: 'bg-amber-50 text-amber-700 border border-amber-200 font-bold',
  activeNavBtn: 'bg-amber-600 text-white shadow-md shadow-amber-600/25',
  archetype: 'Champions Gold',
  accentColorName: 'Golden Amber',
  description: 'Victorious gold with warm amber',
};

export const THEME_TEAL: ThemeDefinition = {
  id: 'teal',
  name: 'Teal Horizon & Cyan',
  isDark: false,
  primaryColor: '#0d9488',
  primaryHover: '#0f766e',
  primaryDark: '#115e59',
  primaryLight: '#f0fdfa',
  borderHex: '#99f6e4',
  swatchHex: '#0d9488',
  secondarySwatchHex: '#5eead4',
  surfaceBgHex: '#f0fdfa',
  cardBgHex: '#f4fbf9',
  headerBgClass: 'bg-teal-600',
  headerUnderlineClass: 'bg-teal-800',
  bgClass: 'bg-[#f0fdfa]',
  textClass: 'text-slate-900',
  cardBg: 'bg-[#f4fbf9]',
  cardBorder: 'border-teal-200',
  cardBgStyle: '#f4fbf9',
  cardBorderStyle: '#99f6e4',
  badgeBg: 'bg-teal-600',
  sidebarBg: 'bg-[#f4fbf9]',
  accentBtn: 'bg-teal-600 hover:bg-teal-700 text-white font-black shadow-md shadow-teal-600/20',
  accentText: 'text-teal-600',
  badgeTag: 'bg-teal-50 text-teal-700 border border-teal-200 font-bold',
  activeNavBtn: 'bg-teal-600 text-white shadow-md shadow-teal-600/25',
  archetype: 'Oceanic Teal',
  accentColorName: 'Deep Teal',
  description: 'Oceanic teal with mint highlights',
};

export const THEME_SUNSET: ThemeDefinition = {
  id: 'sunset',
  name: 'Sunset Coral Flame',
  isDark: false,
  primaryColor: '#ea580c',
  primaryHover: '#c2410c',
  primaryDark: '#9a3412',
  primaryLight: '#fff7ed',
  borderHex: '#fed7aa',
  swatchHex: '#ea580c',
  secondarySwatchHex: '#fdba74',
  surfaceBgHex: '#fff7ed',
  cardBgHex: '#fffaf5',
  headerBgClass: 'bg-orange-600',
  headerUnderlineClass: 'bg-orange-800',
  bgClass: 'bg-[#fff7ed]',
  textClass: 'text-slate-900',
  cardBg: 'bg-[#fffaf5]',
  cardBorder: 'border-orange-200',
  cardBgStyle: '#fffaf5',
  cardBorderStyle: '#fed7aa',
  badgeBg: 'bg-orange-600',
  sidebarBg: 'bg-[#fffaf5]',
  accentBtn: 'bg-orange-600 hover:bg-orange-700 text-white font-black shadow-md shadow-orange-600/20',
  accentText: 'text-orange-600',
  badgeTag: 'bg-orange-50 text-orange-700 border border-orange-200 font-bold',
  activeNavBtn: 'bg-orange-600 text-white shadow-md shadow-orange-600/25',
  archetype: 'Sunset Coral',
  accentColorName: 'Coral Orange',
  description: 'Sunset orange with dynamic contrast',
};

export const THEME_ROSE: ThemeDefinition = {
  id: 'rose',
  name: 'Berry Rose Velvet',
  isDark: false,
  primaryColor: '#e11d48',
  primaryHover: '#be123c',
  primaryDark: '#9f1239',
  primaryLight: '#fff1f2',
  borderHex: '#fecdd3',
  swatchHex: '#e11d48',
  secondarySwatchHex: '#fda4af',
  surfaceBgHex: '#fff1f2',
  cardBgHex: '#fff8f9',
  headerBgClass: 'bg-rose-600',
  headerUnderlineClass: 'bg-rose-800',
  bgClass: 'bg-[#fff1f2]',
  textClass: 'text-slate-900',
  cardBg: 'bg-[#fff8f9]',
  cardBorder: 'border-rose-200',
  cardBgStyle: '#fff8f9',
  cardBorderStyle: '#fecdd3',
  badgeBg: 'bg-rose-600',
  sidebarBg: 'bg-[#fff8f9]',
  accentBtn: 'bg-rose-600 hover:bg-rose-700 text-white font-black shadow-md shadow-rose-600/20',
  accentText: 'text-rose-600',
  badgeTag: 'bg-rose-50 text-rose-700 border border-rose-200 font-bold',
  activeNavBtn: 'bg-rose-600 text-white shadow-md shadow-rose-600/25',
  archetype: 'Velvet Rose',
  accentColorName: 'Berry Rose',
  description: 'Velvet magenta rose with high elegance',
};

export const THEME_SLATE: ThemeDefinition = {
  id: 'slate',
  name: 'Steel Slate Monochrome',
  isDark: false,
  primaryColor: '#334155',
  primaryHover: '#1e293b',
  primaryDark: '#0f172a',
  primaryLight: '#f1f5f9',
  borderHex: '#cbd5e1',
  swatchHex: '#334155',
  secondarySwatchHex: '#94a3b8',
  surfaceBgHex: '#f1f5f9',
  cardBgHex: '#f8fafc',
  headerBgClass: 'bg-slate-700',
  headerUnderlineClass: 'bg-slate-900',
  bgClass: 'bg-[#f1f5f9]',
  textClass: 'text-slate-900',
  cardBg: 'bg-[#f8fafc]',
  cardBorder: 'border-slate-300',
  cardBgStyle: '#f8fafc',
  cardBorderStyle: '#cbd5e1',
  badgeBg: 'bg-slate-700',
  sidebarBg: 'bg-[#f8fafc]',
  accentBtn: 'bg-slate-800 hover:bg-slate-900 text-white font-black shadow-md shadow-slate-800/20',
  accentText: 'text-slate-800',
  badgeTag: 'bg-slate-100 text-slate-800 border border-slate-300 font-bold',
  activeNavBtn: 'bg-slate-800 text-white shadow-md shadow-slate-800/25',
  archetype: 'Executive Slate',
  accentColorName: 'Steel Slate',
  description: 'Monochrome slate with balanced contrast',
};

export const THEME_DARK: ThemeDefinition = {
  id: 'dark',
  name: 'Midnight Dark (Night Mode)',
  isDark: true,
  primaryColor: '#38bdf8', // Electric Sky Cyan
  primaryHover: '#0ea5e9',
  primaryDark: '#0284c7',
  primaryLight: '#1e293b',
  borderHex: '#1e293b',
  swatchHex: '#080c14',
  secondarySwatchHex: '#38bdf8',
  surfaceBgHex: '#080c14',
  cardBgHex: '#0f172a',
  headerBgClass: 'bg-slate-900',
  headerUnderlineClass: 'bg-sky-500',
  bgClass: 'bg-[#080c14]',
  textClass: 'text-slate-100',
  cardBg: 'bg-[#0f172a]',
  cardBorder: 'border-slate-800',
  cardBgStyle: '#0f172a',
  cardBorderStyle: '#1e293b',
  badgeBg: 'bg-slate-800',
  sidebarBg: 'bg-[#0b0f19]',
  accentBtn: 'bg-sky-500 hover:bg-sky-600 text-slate-950 font-black shadow-md shadow-sky-500/20',
  accentText: 'text-sky-400',
  badgeTag: 'bg-slate-800 text-sky-400 border border-sky-500/30 font-bold',
  activeNavBtn: 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25 font-black',
  archetype: 'OLED Midnight Dark',
  accentColorName: 'Electric Cyan',
  description: 'Midnight dark mode with cyan accents',
};

// 10 Official Themes in order
export const THEME_LIST: ThemeDefinition[] = [
  THEME_WHITE_RED,
  THEME_SAPPHIRE,
  THEME_EMERALD,
  THEME_PURPLE,
  THEME_GOLD,
  THEME_TEAL,
  THEME_SUNSET,
  THEME_ROSE,
  THEME_SLATE,
  THEME_DARK,
];

export const THEMES: Record<string, ThemeDefinition> = {
  white_red: THEME_WHITE_RED,
  sapphire: THEME_SAPPHIRE,
  emerald: THEME_EMERALD,
  purple: THEME_PURPLE,
  gold: THEME_GOLD,
  teal: THEME_TEAL,
  sunset: THEME_SUNSET,
  rose: THEME_ROSE,
  slate: THEME_SLATE,
  dark: THEME_DARK,

  // Legacy mappings for backwards compatibility
  ruby: { ...THEME_ROSE, id: 'ruby' },
  stealth: { ...THEME_DARK, id: 'stealth' },
  light: { ...THEME_WHITE_RED, id: 'light' },
  glass: { ...THEME_SAPPHIRE, id: 'glass' },
};

export const getThemeConfig = (themeId?: AppLayoutTheme | string): ThemeDefinition => {
  if (!themeId) return THEME_WHITE_RED;
  if (THEMES[themeId]) return THEMES[themeId];
  if (themeId === 'dark' || themeId === 'stealth') return THEME_DARK;
  if (themeId === 'ruby' || themeId === 'rose') return THEME_ROSE;
  return THEME_WHITE_RED;
};
