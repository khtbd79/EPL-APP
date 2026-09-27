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

  // Descriptor props
  badgeBg: string;
  sidebarBg: string;
  cardBgStyle: string;
  cardBorderStyle: string;
  archetype: string;
  accentColorName: string;
  description: string;
}

// 1. BET365 OFFICIAL SPORTSBOOK (Signature Flagship - Green, Vivid Yellow & Charcoal Arena)
export const THEME_BET365: ThemeDefinition = {
  id: 'bet365',
  name: 'bet365 Sportsbook Pro',
  isDark: true,
  primaryColor: '#126e51',
  primaryHover: '#158360',
  primaryDark: '#0c4936',
  primaryLight: '#1f332c',
  borderHex: '#383d47',
  swatchHex: '#126e51',
  secondarySwatchHex: '#ffdf1b',
  surfaceBgHex: '#1f2228',
  cardBgHex: '#282b32',
  headerBgClass: 'bg-[#126e51]',
  headerUnderlineClass: 'bg-[#ffdf1b]',
  bgClass: 'bg-[#1f2228]',
  textClass: 'text-slate-100',
  cardBg: 'bg-[#282b32]',
  cardBorder: 'border-[#383d47]',
  cardBgStyle: '#282b32',
  cardBorderStyle: '#383d47',
  badgeBg: 'bg-[#126e51]',
  sidebarBg: '#181b20',
  accentBtn: 'bg-[#ffdf1b] hover:bg-[#ffe338] text-slate-950 font-black shadow-xs',
  accentText: 'text-[#ffdf1b]',
  badgeTag: 'bg-[#126e51] text-[#ffdf1b] border border-[#ffdf1b]/40 font-black',
  activeNavBtn: 'bg-[#ffdf1b] text-slate-950 shadow-xs font-black',
  archetype: 'bet365 Sportsbook',
  accentColorName: 'Pine Green & Vivid Yellow',
  description: 'Authentic bet365 sports arena design with dark slate canvas and vivid yellow decimal odds',
};

// 2. EXECUTIVE TITANIUM SLATE
export const THEME_SLATE: ThemeDefinition = {
  id: 'slate',
  name: 'Executive Titanium Slate',
  isDark: false,
  primaryColor: '#0f172a',
  primaryHover: '#1e293b',
  primaryDark: '#020617',
  primaryLight: '#f8fafc',
  borderHex: '#e2e8f0',
  swatchHex: '#0f172a',
  secondarySwatchHex: '#10b981',
  surfaceBgHex: '#f8fafc',
  cardBgHex: '#ffffff',
  headerBgClass: 'bg-slate-950',
  headerUnderlineClass: 'bg-emerald-500',
  bgClass: 'bg-slate-50',
  textClass: 'text-slate-900',
  cardBg: 'bg-white',
  cardBorder: 'border-slate-200/80',
  cardBgStyle: '#ffffff',
  cardBorderStyle: '#e2e8f0',
  badgeBg: 'bg-slate-900',
  sidebarBg: '#ffffff',
  accentBtn: 'bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs',
  accentText: 'text-emerald-600',
  badgeTag: 'bg-slate-100 text-slate-800 border border-slate-200 font-bold',
  activeNavBtn: 'bg-white text-slate-950 shadow-xs font-bold',
  archetype: 'Executive Titanium',
  accentColorName: 'Titanium & Emerald',
  description: 'Precision slate terminal with electric emerald indicators',
};

// 3. MIDNIGHT OBSIDIAN DARK
export const THEME_DARK: ThemeDefinition = {
  id: 'dark',
  name: 'Midnight Obsidian OLED',
  isDark: true,
  primaryColor: '#10b981',
  primaryHover: '#059669',
  primaryDark: '#047857',
  primaryLight: '#0f172a',
  borderHex: '#1e293b',
  swatchHex: '#090d16',
  secondarySwatchHex: '#10b981',
  surfaceBgHex: '#090d16',
  cardBgHex: '#0f172a',
  headerBgClass: 'bg-slate-950',
  headerUnderlineClass: 'bg-emerald-500',
  bgClass: 'bg-[#090d16]',
  textClass: 'text-slate-100',
  cardBg: 'bg-[#0f172a]',
  cardBorder: 'border-slate-800',
  cardBgStyle: '#0f172a',
  cardBorderStyle: '#1e293b',
  badgeBg: 'bg-slate-800',
  sidebarBg: '#0b0f19',
  accentBtn: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-xs',
  accentText: 'text-emerald-400',
  badgeTag: 'bg-slate-800 text-emerald-400 border border-emerald-500/30 font-bold',
  activeNavBtn: 'bg-emerald-500 text-slate-950 shadow-xs font-black',
  archetype: 'OLED Midnight Obsidian',
  accentColorName: 'Electric Emerald',
  description: 'High-contrast obsidian dark mode with electric emerald accents',
};

// 4. ROYAL SAPPHIRE COBALT
export const THEME_SAPPHIRE: ThemeDefinition = {
  id: 'sapphire',
  name: 'Royal Cobalt Blue',
  isDark: false,
  primaryColor: '#2563eb',
  primaryHover: '#1d4ed8',
  primaryDark: '#1e40af',
  primaryLight: '#eff6ff',
  borderHex: '#e2e8f0',
  swatchHex: '#2563eb',
  secondarySwatchHex: '#60a5fa',
  surfaceBgHex: '#f8fafc',
  cardBgHex: '#ffffff',
  headerBgClass: 'bg-slate-950',
  headerUnderlineClass: 'bg-blue-500',
  bgClass: 'bg-slate-50',
  textClass: 'text-slate-900',
  cardBg: 'bg-white',
  cardBorder: 'border-slate-200/80',
  cardBgStyle: '#ffffff',
  cardBorderStyle: '#e2e8f0',
  badgeBg: 'bg-blue-600',
  sidebarBg: '#ffffff',
  accentBtn: 'bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs',
  accentText: 'text-blue-600',
  badgeTag: 'bg-blue-50 text-blue-700 border border-blue-200 font-bold',
  activeNavBtn: 'bg-blue-600 text-white shadow-xs font-bold',
  archetype: 'Royal Cobalt',
  accentColorName: 'Cobalt Blue',
  description: 'Modern royal cobalt blue with crisp slate canvas',
};

// 5. STADIUM PITCH EMERALD
export const THEME_EMERALD: ThemeDefinition = {
  id: 'emerald',
  name: 'Stadium Pitch Emerald',
  isDark: false,
  primaryColor: '#059669',
  primaryHover: '#047857',
  primaryDark: '#065f46',
  primaryLight: '#ecfdf5',
  borderHex: '#e2e8f0',
  swatchHex: '#059669',
  secondarySwatchHex: '#34d399',
  surfaceBgHex: '#f8fafc',
  cardBgHex: '#ffffff',
  headerBgClass: 'bg-slate-950',
  headerUnderlineClass: 'bg-emerald-500',
  bgClass: 'bg-slate-50',
  textClass: 'text-slate-900',
  cardBg: 'bg-white',
  cardBorder: 'border-slate-200/80',
  cardBgStyle: '#ffffff',
  cardBorderStyle: '#e2e8f0',
  badgeBg: 'bg-emerald-600',
  sidebarBg: '#ffffff',
  accentBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs',
  accentText: 'text-emerald-600',
  badgeTag: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold',
  activeNavBtn: 'bg-emerald-600 text-white shadow-xs font-bold',
  archetype: 'Stadium Pitch',
  accentColorName: 'Pitch Emerald',
  description: 'Football pitch emerald with clean slate framing',
};

// 6. IMPERIAL EPL TROPHY PURPLE
export const THEME_PURPLE: ThemeDefinition = {
  id: 'purple',
  name: 'Imperial Trophy Violet',
  isDark: false,
  primaryColor: '#7c3aed',
  primaryHover: '#6d28d9',
  primaryDark: '#5b21b6',
  primaryLight: '#f5f3ff',
  borderHex: '#e2e8f0',
  swatchHex: '#7c3aed',
  secondarySwatchHex: '#a78bfa',
  surfaceBgHex: '#f8fafc',
  cardBgHex: '#ffffff',
  headerBgClass: 'bg-slate-950',
  headerUnderlineClass: 'bg-purple-500',
  bgClass: 'bg-slate-50',
  textClass: 'text-slate-900',
  cardBg: 'bg-white',
  cardBorder: 'border-slate-200/80',
  cardBgStyle: '#ffffff',
  cardBorderStyle: '#e2e8f0',
  badgeBg: 'bg-purple-600',
  sidebarBg: '#ffffff',
  accentBtn: 'bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs',
  accentText: 'text-purple-600',
  badgeTag: 'bg-purple-50 text-purple-700 border border-purple-200 font-bold',
  activeNavBtn: 'bg-purple-600 text-white shadow-xs font-bold',
  archetype: 'Premier League Purple',
  accentColorName: 'Trophy Violet',
  description: 'Official Premier League trophy royal purple',
};

// 7. CHAMPIONS GOLD & AMBER
export const THEME_GOLD: ThemeDefinition = {
  id: 'gold',
  name: 'Champions Gold & Amber',
  isDark: false,
  primaryColor: '#d97706',
  primaryHover: '#b45309',
  primaryDark: '#92400e',
  primaryLight: '#fffbeb',
  borderHex: '#e2e8f0',
  swatchHex: '#d97706',
  secondarySwatchHex: '#fbbf24',
  surfaceBgHex: '#f8fafc',
  cardBgHex: '#ffffff',
  headerBgClass: 'bg-slate-950',
  headerUnderlineClass: 'bg-amber-500',
  bgClass: 'bg-slate-50',
  textClass: 'text-slate-900',
  cardBg: 'bg-white',
  cardBorder: 'border-slate-200/80',
  cardBgStyle: '#ffffff',
  cardBorderStyle: '#e2e8f0',
  badgeBg: 'bg-amber-600',
  sidebarBg: '#ffffff',
  accentBtn: 'bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs',
  accentText: 'text-amber-600',
  badgeTag: 'bg-amber-50 text-amber-800 border border-amber-200 font-bold',
  activeNavBtn: 'bg-amber-600 text-white shadow-xs font-bold',
  archetype: 'Champions Gold',
  accentColorName: 'Golden Amber',
  description: 'Victorious gold with warm amber accents',
};

// 8. CYBER TEAL & CYAN
export const THEME_TEAL: ThemeDefinition = {
  id: 'teal',
  name: 'Cyber Teal & Marine',
  isDark: false,
  primaryColor: '#0d9488',
  primaryHover: '#0f766e',
  primaryDark: '#115e59',
  primaryLight: '#f0fdfa',
  borderHex: '#e2e8f0',
  swatchHex: '#0d9488',
  secondarySwatchHex: '#2dd4bf',
  surfaceBgHex: '#f8fafc',
  cardBgHex: '#ffffff',
  headerBgClass: 'bg-slate-950',
  headerUnderlineClass: 'bg-teal-500',
  bgClass: 'bg-slate-50',
  textClass: 'text-slate-900',
  cardBg: 'bg-white',
  cardBorder: 'border-slate-200/80',
  cardBgStyle: '#ffffff',
  cardBorderStyle: '#e2e8f0',
  badgeBg: 'bg-teal-600',
  sidebarBg: '#ffffff',
  accentBtn: 'bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs',
  accentText: 'text-teal-600',
  badgeTag: 'bg-teal-50 text-teal-800 border border-teal-200 font-bold',
  activeNavBtn: 'bg-teal-600 text-white shadow-xs font-bold',
  archetype: 'Cyber Teal',
  accentColorName: 'Marine Teal',
  description: 'Cyber marine teal with clean modern styling',
};

// 9. SUNSET CORAL FLAME
export const THEME_SUNSET: ThemeDefinition = {
  id: 'sunset',
  name: 'Sunset Coral Flame',
  isDark: false,
  primaryColor: '#ea580c',
  primaryHover: '#c2410c',
  primaryDark: '#9a3412',
  primaryLight: '#fff7ed',
  borderHex: '#e2e8f0',
  swatchHex: '#ea580c',
  secondarySwatchHex: '#fb923c',
  surfaceBgHex: '#f8fafc',
  cardBgHex: '#ffffff',
  headerBgClass: 'bg-slate-950',
  headerUnderlineClass: 'bg-orange-500',
  bgClass: 'bg-slate-50',
  textClass: 'text-slate-900',
  cardBg: 'bg-white',
  cardBorder: 'border-slate-200/80',
  cardBgStyle: '#ffffff',
  cardBorderStyle: '#e2e8f0',
  badgeBg: 'bg-orange-600',
  sidebarBg: '#ffffff',
  accentBtn: 'bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-xs',
  accentText: 'text-orange-600',
  badgeTag: 'bg-orange-50 text-orange-800 border border-orange-200 font-bold',
  activeNavBtn: 'bg-orange-600 text-white shadow-xs font-bold',
  archetype: 'Sunset Coral',
  accentColorName: 'Coral Orange',
  description: 'Sunset orange with dynamic high contrast',
};

// 10. BERRY VELVET ROSE
export const THEME_ROSE: ThemeDefinition = {
  id: 'rose',
  name: 'Berry Rose Velvet',
  isDark: false,
  primaryColor: '#e11d48',
  primaryHover: '#be123c',
  primaryDark: '#9f1239',
  primaryLight: '#fff1f2',
  borderHex: '#e2e8f0',
  swatchHex: '#e11d48',
  secondarySwatchHex: '#fb7185',
  surfaceBgHex: '#f8fafc',
  cardBgHex: '#ffffff',
  headerBgClass: 'bg-slate-950',
  headerUnderlineClass: 'bg-rose-500',
  bgClass: 'bg-slate-50',
  textClass: 'text-slate-900',
  cardBg: 'bg-white',
  cardBorder: 'border-slate-200/80',
  cardBgStyle: '#ffffff',
  cardBorderStyle: '#e2e8f0',
  badgeBg: 'bg-rose-600',
  sidebarBg: '#ffffff',
  accentBtn: 'bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs',
  accentText: 'text-rose-600',
  badgeTag: 'bg-rose-50 text-rose-800 border border-rose-200 font-bold',
  activeNavBtn: 'bg-rose-600 text-white shadow-xs font-bold',
  archetype: 'Velvet Rose',
  accentColorName: 'Berry Rose',
  description: 'Velvet magenta rose with high elegance',
};

// 11. CRIMSON & OBSIDIAN
export const THEME_WHITE_RED: ThemeDefinition = {
  id: 'white_red',
  name: 'Crimson & Obsidian',
  isDark: false,
  primaryColor: '#e11d48',
  primaryHover: '#be123c',
  primaryDark: '#9f1239',
  primaryLight: '#fff1f2',
  borderHex: '#e2e8f0',
  swatchHex: '#0f172a',
  secondarySwatchHex: '#e11d48',
  surfaceBgHex: '#f8fafc',
  cardBgHex: '#ffffff',
  headerBgClass: 'bg-slate-950',
  headerUnderlineClass: 'bg-rose-500',
  bgClass: 'bg-slate-50',
  textClass: 'text-slate-900',
  cardBg: 'bg-white',
  cardBorder: 'border-slate-200/80',
  cardBgStyle: '#ffffff',
  cardBorderStyle: '#e2e8f0',
  badgeBg: 'bg-slate-900',
  sidebarBg: '#ffffff',
  accentBtn: 'bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs',
  accentText: 'text-rose-600',
  badgeTag: 'bg-rose-50 text-rose-800 border border-rose-200 font-bold',
  activeNavBtn: 'bg-slate-900 text-white shadow-xs font-bold',
  archetype: 'Crimson & Obsidian',
  accentColorName: 'Onyx & Crimson',
  description: 'Deep obsidian framing with sleek crimson accents',
};

// 11 Official Themes in Order (bet365 first as requested)
export const THEME_LIST: ThemeDefinition[] = [
  THEME_BET365,
  THEME_SLATE,
  THEME_DARK,
  THEME_SAPPHIRE,
  THEME_EMERALD,
  THEME_PURPLE,
  THEME_GOLD,
  THEME_TEAL,
  THEME_SUNSET,
  THEME_ROSE,
  THEME_WHITE_RED,
];

export const THEMES: Record<string, ThemeDefinition> = {
  bet365: THEME_BET365,
  slate: THEME_SLATE,
  dark: THEME_DARK,
  sapphire: THEME_SAPPHIRE,
  emerald: THEME_EMERALD,
  purple: THEME_PURPLE,
  gold: THEME_GOLD,
  teal: THEME_TEAL,
  sunset: THEME_SUNSET,
  rose: THEME_ROSE,
  white_red: THEME_WHITE_RED,

  // Legacy mappings for backwards compatibility
  ruby: { ...THEME_ROSE, id: 'ruby' },
  stealth: { ...THEME_DARK, id: 'stealth' },
  light: { ...THEME_SLATE, id: 'light' },
  glass: { ...THEME_SAPPHIRE, id: 'glass' },
};

export const getThemeConfig = (themeId?: AppLayoutTheme | string): ThemeDefinition => {
  if (!themeId) return THEME_BET365;
  if (THEMES[themeId]) return THEMES[themeId];
  if (themeId === 'bet365') return THEME_BET365;
  if (themeId === 'dark' || themeId === 'stealth') return THEME_DARK;
  if (themeId === 'ruby' || themeId === 'rose') return THEME_ROSE;
  if (themeId === 'white_red') return THEME_WHITE_RED;
  return THEME_BET365;
};
