import { AppLayoutTheme } from '../types';

export interface ThemeDefinition {
  id: AppLayoutTheme;
  name: string;
  badgeBg: string;
  bgClass: string;
  textClass: string;
  sidebarBg: string;
  cardBg: string;
  cardBorder: string;
  accentBtn: string;
  accentText: string;
  badgeTag: string;
  description: string;
  cardBgStyle: string;
  cardBorderStyle: string;
  archetype: string;
  swatchHex: string;
  surfaceBgHex: string;
  accentColorName: string;
}

const defaultWhiteRedTheme: ThemeDefinition = {
  id: 'white_red',
  name: 'Red & White',
  badgeBg: 'bg-red-600',
  bgClass: 'bg-[#ffffff]',
  textClass: 'text-slate-900',
  sidebarBg: 'bg-white',
  cardBg: 'bg-white',
  cardBorder: 'border-red-200',
  cardBgStyle: '#ffffff',
  cardBorderStyle: '#dc2626',
  accentBtn: 'bg-red-600 hover:bg-red-700 text-white font-black shadow-md shadow-red-600/20',
  accentText: 'text-red-600',
  badgeTag: 'bg-red-50 text-red-700 border border-red-200 font-bold',
  description: 'Clean white canvas with bold red accents, crisp slate typography, and red top navbar',
  archetype: 'Red & White Classic',
  swatchHex: '#dc2626',
  surfaceBgHex: '#ffffff',
  accentColorName: 'Crimson Red',
};

export const THEMES: Record<AppLayoutTheme, ThemeDefinition> = {
  white_red: defaultWhiteRedTheme,
  emerald: { ...defaultWhiteRedTheme, id: 'emerald' },
  ruby: { ...defaultWhiteRedTheme, id: 'ruby' },
  sapphire: { ...defaultWhiteRedTheme, id: 'sapphire' },
  gold: { ...defaultWhiteRedTheme, id: 'gold' },
  purple: { ...defaultWhiteRedTheme, id: 'purple' },
  teal: { ...defaultWhiteRedTheme, id: 'teal' },
  sunset: { ...defaultWhiteRedTheme, id: 'sunset' },
  glass: { ...defaultWhiteRedTheme, id: 'glass' },
  stealth: { ...defaultWhiteRedTheme, id: 'stealth' },
  light: { ...defaultWhiteRedTheme, id: 'light' },
};

export const getThemeConfig = (_themeId?: AppLayoutTheme): ThemeDefinition => {
  return THEMES.white_red;
};
