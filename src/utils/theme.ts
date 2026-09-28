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

// 1. BET365 (World #1 - Pine Green, Vivid Gold & Charcoal Pitch)
export const THEME_BET365: ThemeDefinition = {
  id: 'bet365',
  name: 'bet365 Sportsbook',
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
  archetype: 'bet365',
  accentColorName: 'Pine Green & Vivid Yellow',
  description: 'Signature pine green sportsbook with vivid decimal yellow highlights',
};

// 2. 1XBET (Electric Royal Blue, Stadium Cyan & Deep Navy)
export const THEME_1XBET: ThemeDefinition = {
  id: 'one_xbet',
  name: '1xBet Sports Arena',
  isDark: true,
  primaryColor: '#10529d',
  primaryHover: '#1565c0',
  primaryDark: '#0b3a70',
  primaryLight: '#162942',
  borderHex: '#223959',
  swatchHex: '#10529d',
  secondarySwatchHex: '#00b4d8',
  surfaceBgHex: '#0e1726',
  cardBgHex: '#16233b',
  headerBgClass: 'bg-[#10529d]',
  headerUnderlineClass: 'bg-[#00b4d8]',
  bgClass: 'bg-[#0e1726]',
  textClass: 'text-slate-100',
  cardBg: 'bg-[#16233b]',
  cardBorder: 'border-[#223959]',
  cardBgStyle: '#16233b',
  cardBorderStyle: '#223959',
  badgeBg: 'bg-[#10529d]',
  sidebarBg: '#0b121e',
  accentBtn: 'bg-[#00b4d8] hover:bg-[#38bdf8] text-slate-950 font-black shadow-xs',
  accentText: 'text-[#00b4d8]',
  badgeTag: 'bg-[#10529d] text-[#00b4d8] border border-[#00b4d8]/40 font-black',
  activeNavBtn: 'bg-[#00b4d8] text-slate-950 shadow-xs font-black',
  archetype: '1xBet',
  accentColorName: 'Royal Navy & Vivid Cyan',
  description: 'Dynamic royal blue arena with electric cyan stadium indicators',
};

// 3. BETFAIR (Exchange Golden Amber & Stealth Carbon)
export const THEME_BETFAIR: ThemeDefinition = {
  id: 'betfair',
  name: 'Betfair Exchange',
  isDark: true,
  primaryColor: '#ffb80c',
  primaryHover: '#e5a300',
  primaryDark: '#b28000',
  primaryLight: '#2a2618',
  borderHex: '#3b3830',
  swatchHex: '#ffb80c',
  secondarySwatchHex: '#ffffff',
  surfaceBgHex: '#181818',
  cardBgHex: '#232323',
  headerBgClass: 'bg-[#1f1f1f]',
  headerUnderlineClass: 'bg-[#ffb80c]',
  bgClass: 'bg-[#181818]',
  textClass: 'text-slate-100',
  cardBg: 'bg-[#232323]',
  cardBorder: 'border-[#3b3830]',
  cardBgStyle: '#232323',
  cardBorderStyle: '#3b3830',
  badgeBg: 'bg-[#ffb80c]',
  sidebarBg: '#141414',
  accentBtn: 'bg-[#ffb80c] hover:bg-[#e5a300] text-slate-950 font-black shadow-xs',
  accentText: 'text-[#ffb80c]',
  badgeTag: 'bg-[#2a2618] text-[#ffb80c] border border-[#ffb80c]/50 font-black',
  activeNavBtn: 'bg-[#ffb80c] text-slate-950 shadow-xs font-black',
  archetype: 'Betfair',
  accentColorName: 'Exchange Amber & Stealth Carbon',
  description: 'World betting exchange golden amber with sleek dark graphite',
};

// 4. WILLIAM HILL (British Heritage Royal Navy & Golden Sun)
export const THEME_WILLIAM_HILL: ThemeDefinition = {
  id: 'william_hill',
  name: 'William Hill Heritage',
  isDark: true,
  primaryColor: '#00204a',
  primaryHover: '#002d69',
  primaryDark: '#001533',
  primaryLight: '#0d274c',
  borderHex: '#1d3c6a',
  swatchHex: '#00204a',
  secondarySwatchHex: '#ffd200',
  surfaceBgHex: '#081224',
  cardBgHex: '#101f3b',
  headerBgClass: 'bg-[#00204a]',
  headerUnderlineClass: 'bg-[#ffd200]',
  bgClass: 'bg-[#081224]',
  textClass: 'text-slate-100',
  cardBg: 'bg-[#101f3b]',
  cardBorder: 'border-[#1d3c6a]',
  cardBgStyle: '#101f3b',
  cardBorderStyle: '#1d3c6a',
  badgeBg: 'bg-[#00204a]',
  sidebarBg: '#050b17',
  accentBtn: 'bg-[#ffd200] hover:bg-[#ffe043] text-slate-950 font-black shadow-xs',
  accentText: 'text-[#ffd200]',
  badgeTag: 'bg-[#00204a] text-[#ffd200] border border-[#ffd200]/40 font-black',
  activeNavBtn: 'bg-[#ffd200] text-slate-950 shadow-xs font-black',
  archetype: 'William Hill',
  accentColorName: 'Heritage Navy & Golden Sun',
  description: 'Historic British heritage deep navy with golden yellow racing lines',
};

// 5. LADBROKES (Premier Championship Crimson & Charcoal Slate - replacing yellow Bwin)
export const THEME_LADBROKES: ThemeDefinition = {
  id: 'ladbrokes',
  name: 'Ladbrokes Premier',
  isDark: true,
  primaryColor: '#d90429',
  primaryHover: '#ef233c',
  primaryDark: '#8b0018',
  primaryLight: '#2c0c14',
  borderHex: '#3d1c25',
  swatchHex: '#d90429',
  secondarySwatchHex: '#ff4d6d',
  surfaceBgHex: '#121318',
  cardBgHex: '#1b1e27',
  headerBgClass: 'bg-[#d90429]',
  headerUnderlineClass: 'bg-[#ff4d6d]',
  bgClass: 'bg-[#121318]',
  textClass: 'text-slate-100',
  cardBg: 'bg-[#1b1e27]',
  cardBorder: 'border-[#3d1c25]',
  cardBgStyle: '#1b1e27',
  cardBorderStyle: '#3d1c25',
  badgeBg: 'bg-[#d90429]',
  sidebarBg: '#0e0f14',
  accentBtn: 'bg-[#d90429] hover:bg-[#ef233c] text-white font-black shadow-xs',
  accentText: 'text-[#ff4d6d]',
  badgeTag: 'bg-[#2c0c14] text-[#ff4d6d] border border-[#d90429]/50 font-black',
  activeNavBtn: 'bg-[#d90429] text-white shadow-xs font-black',
  archetype: 'Ladbrokes',
  accentColorName: 'Championship Crimson & Slate Obsidian',
  description: 'Iconic British championship crimson red on sleek dark obsidian pitch',
};

// 6. UNIBET (Shamrock Green & Stadium Lime)
export const THEME_UNIBET: ThemeDefinition = {
  id: 'unibet',
  name: 'Unibet Green',
  isDark: true,
  primaryColor: '#168039',
  primaryHover: '#1b9744',
  primaryDark: '#105e2a',
  primaryLight: '#193522',
  borderHex: '#294f36',
  swatchHex: '#168039',
  secondarySwatchHex: '#88c425',
  surfaceBgHex: '#101b14',
  cardBgHex: '#17291f',
  headerBgClass: 'bg-[#168039]',
  headerUnderlineClass: 'bg-[#88c425]',
  bgClass: 'bg-[#101b14]',
  textClass: 'text-slate-100',
  cardBg: 'bg-[#17291f]',
  cardBorder: 'border-[#294f36]',
  cardBgStyle: '#17291f',
  cardBorderStyle: '#294f36',
  badgeBg: 'bg-[#168039]',
  sidebarBg: '#0c1510',
  accentBtn: 'bg-[#88c425] hover:bg-[#9de02b] text-slate-950 font-black shadow-xs',
  accentText: 'text-[#88c425]',
  badgeTag: 'bg-[#168039] text-[#88c425] border border-[#88c425]/40 font-black',
  activeNavBtn: 'bg-[#88c425] text-slate-950 shadow-xs font-black',
  archetype: 'Unibet',
  accentColorName: 'Shamrock Green & Electric Lime',
  description: 'Premier European green sportsbook with vibrant pitch lime accents',
};

// 7. PADDY POWER (Irish Shamrock Emerald & Sunburst Gold)
export const THEME_PADDY_POWER: ThemeDefinition = {
  id: 'paddy_power',
  name: 'Paddy Power',
  isDark: true,
  primaryColor: '#008054',
  primaryHover: '#009965',
  primaryDark: '#005a3b',
  primaryLight: '#143a29',
  borderHex: '#1e563d',
  swatchHex: '#008054',
  secondarySwatchHex: '#ffb900',
  surfaceBgHex: '#041f15',
  cardBgHex: '#0b3122',
  headerBgClass: 'bg-[#008054]',
  headerUnderlineClass: 'bg-[#ffb900]',
  bgClass: 'bg-[#041f15]',
  textClass: 'text-slate-100',
  cardBg: 'bg-[#0b3122]',
  cardBorder: 'border-[#1e563d]',
  cardBgStyle: '#0b3122',
  cardBorderStyle: '#1e563d',
  badgeBg: 'bg-[#008054]',
  sidebarBg: '#02160f',
  accentBtn: 'bg-[#ffb900] hover:bg-[#ffc629] text-slate-950 font-black shadow-xs',
  accentText: 'text-[#ffb900]',
  badgeTag: 'bg-[#008054] text-[#ffb900] border border-[#ffb900]/40 font-black',
  activeNavBtn: 'bg-[#ffb900] text-slate-950 shadow-xs font-black',
  archetype: 'Paddy Power',
  accentColorName: 'Irish Emerald & Sunburst Gold',
  description: 'Famous Irish sportsbook with deep emerald canvas & sunburst gold odds',
};

// 8. SKY BET (Sky Sports Royal Navy & Stadium Azure Cyan - replacing yellow Parimatch)
export const THEME_SKY_BET: ThemeDefinition = {
  id: 'sky_bet',
  name: 'Sky Bet Pro',
  isDark: true,
  primaryColor: '#004ea8',
  primaryHover: '#0263d1',
  primaryDark: '#003370',
  primaryLight: '#0d223f',
  borderHex: '#1e385c',
  swatchHex: '#004ea8',
  secondarySwatchHex: '#38bdf8',
  surfaceBgHex: '#0a101d',
  cardBgHex: '#131e30',
  headerBgClass: 'bg-[#004ea8]',
  headerUnderlineClass: 'bg-[#38bdf8]',
  bgClass: 'bg-[#0a101d]',
  textClass: 'text-slate-100',
  cardBg: 'bg-[#131e30]',
  cardBorder: 'border-[#1e385c]',
  cardBgStyle: '#131e30',
  cardBorderStyle: '#1e385c',
  badgeBg: 'bg-[#004ea8]',
  sidebarBg: '#060b14',
  accentBtn: 'bg-[#0284c7] hover:bg-[#38bdf8] text-white font-black shadow-xs',
  accentText: 'text-[#38bdf8]',
  badgeTag: 'bg-[#0d223f] text-[#38bdf8] border border-[#0284c7]/50 font-black',
  activeNavBtn: 'bg-[#0284c7] text-white shadow-xs font-black',
  archetype: 'Sky Bet',
  accentColorName: 'Sky Sports Royal & Stadium Azure',
  description: 'Premier sports broadcaster royal navy with brilliant stadium sky-blue highlights',
};

// 9. STAKE (Dark Platinum Slate & Signature Electric Mint)
export const THEME_STAKE: ThemeDefinition = {
  id: 'stake',
  name: 'Stake Platinum',
  isDark: true,
  primaryColor: '#00e701',
  primaryHover: '#00ff00',
  primaryDark: '#00b300',
  primaryLight: '#0c271c',
  borderHex: '#22384a',
  swatchHex: '#0f212e',
  secondarySwatchHex: '#00e701',
  surfaceBgHex: '#0f212e',
  cardBgHex: '#1a2c38',
  headerBgClass: 'bg-[#0f212e]',
  headerUnderlineClass: 'bg-[#00e701]',
  bgClass: 'bg-[#0f212e]',
  textClass: 'text-slate-100',
  cardBg: 'bg-[#1a2c38]',
  cardBorder: 'border-[#22384a]',
  cardBgStyle: '#1a2c38',
  cardBorderStyle: '#22384a',
  badgeBg: 'bg-[#00e701]',
  sidebarBg: '#091620',
  accentBtn: 'bg-[#00e701] hover:bg-[#00ff00] text-slate-950 font-black shadow-xs',
  accentText: 'text-[#00e701]',
  badgeTag: 'bg-[#0c271c] text-[#00e701] border border-[#00e701]/40 font-black',
  activeNavBtn: 'bg-[#00e701] text-slate-950 shadow-xs font-black',
  archetype: 'Stake',
  accentColorName: 'Dark Platinum & Electric Mint',
  description: 'World-famous sportsbook dark platinum arena with signature electric mint highlights',
};

// 10. BETWAY (Pitch Matte Carbon & Stadium Green)
export const THEME_BETWAY: ThemeDefinition = {
  id: 'betway',
  name: 'Betway Elite',
  isDark: true,
  primaryColor: '#00a826',
  primaryHover: '#00c22c',
  primaryDark: '#007a1c',
  primaryLight: '#122919',
  borderHex: '#263d2e',
  swatchHex: '#0d0e12',
  secondarySwatchHex: '#00a826',
  surfaceBgHex: '#0c0d12',
  cardBgHex: '#161720',
  headerBgClass: 'bg-[#0a0a0e]',
  headerUnderlineClass: 'bg-[#00a826]',
  bgClass: 'bg-[#0c0d12]',
  textClass: 'text-slate-100',
  cardBg: 'bg-[#161720]',
  cardBorder: 'border-[#263d2e]',
  cardBgStyle: '#161720',
  cardBorderStyle: '#263d2e',
  badgeBg: 'bg-[#00a826]',
  sidebarBg: '#07070a',
  accentBtn: 'bg-[#00a826] hover:bg-[#00c22c] text-white font-black shadow-xs',
  accentText: 'text-[#00c22c]',
  badgeTag: 'bg-[#122919] text-[#00c22c] border border-[#00a826]/40 font-black',
  activeNavBtn: 'bg-[#00a826] text-white shadow-xs font-black',
  archetype: 'Betway',
  accentColorName: 'Pitch Matte Carbon & Stadium Green',
  description: 'Premier League sponsor matte carbon black with sharp stadium green',
};

// 11. 888SPORT (Electric Blaze Orange & Stealth Obsidian)
export const THEME_888SPORT: ThemeDefinition = {
  id: 'eight_eight_eight',
  name: '888sport Orange',
  isDark: true,
  primaryColor: '#ff5a00',
  primaryHover: '#ff7020',
  primaryDark: '#cc4800',
  primaryLight: '#33190d',
  borderHex: '#4d2b1c',
  swatchHex: '#141416',
  secondarySwatchHex: '#ff5a00',
  surfaceBgHex: '#121214',
  cardBgHex: '#1c1c20',
  headerBgClass: 'bg-[#141416]',
  headerUnderlineClass: 'bg-[#ff5a00]',
  bgClass: 'bg-[#121214]',
  textClass: 'text-slate-100',
  cardBg: 'bg-[#1c1c20]',
  cardBorder: 'border-[#4d2b1c]',
  cardBgStyle: '#1c1c20',
  cardBorderStyle: '#4d2b1c',
  badgeBg: 'bg-[#ff5a00]',
  sidebarBg: '#0d0d0f',
  accentBtn: 'bg-[#ff5a00] hover:bg-[#ff7020] text-white font-black shadow-xs',
  accentText: 'text-[#ff5a00]',
  badgeTag: 'bg-[#33190d] text-[#ff5a00] border border-[#ff5a00]/40 font-black',
  activeNavBtn: 'bg-[#ff5a00] text-white shadow-xs font-black',
  archetype: '888sport',
  accentColorName: 'Electric Blaze Orange & Stealth Obsidian',
  description: 'Vibrant electric orange sports betting arena on stealth dark obsidian',
};

// Top World-Famous Bookmaker Themes in order
export const THEME_LIST: ThemeDefinition[] = [
  THEME_BET365,
  THEME_1XBET,
  THEME_BETFAIR,
  THEME_WILLIAM_HILL,
  THEME_LADBROKES,
  THEME_UNIBET,
  THEME_PADDY_POWER,
  THEME_SKY_BET,
  THEME_STAKE,
  THEME_BETWAY,
  THEME_888SPORT,
];

export const THEMES: Record<string, ThemeDefinition> = {
  bet365: THEME_BET365,
  one_xbet: THEME_1XBET,
  betfair: THEME_BETFAIR,
  william_hill: THEME_WILLIAM_HILL,
  ladbrokes: THEME_LADBROKES,
  unibet: THEME_UNIBET,
  paddy_power: THEME_PADDY_POWER,
  sky_bet: THEME_SKY_BET,
  stake: THEME_STAKE,
  betway: THEME_BETWAY,
  eight_eight_eight: THEME_888SPORT,

  // Replaced yellow themes auto-mapped to the new sleek themes
  bwin: THEME_LADBROKES,
  parimatch: THEME_SKY_BET,

  // Seamless legacy theme mappings
  slate: THEME_WILLIAM_HILL,
  dark: THEME_BETFAIR,
  sapphire: THEME_1XBET,
  emerald: THEME_UNIBET,
  purple: THEME_888SPORT,
  gold: THEME_BETFAIR,
  teal: THEME_1XBET,
  sunset: THEME_888SPORT,
  rose: THEME_LADBROKES,
  white_red: THEME_LADBROKES,
  ruby: THEME_LADBROKES,
  light: THEME_BET365,
  glass: THEME_1XBET,
  stealth: THEME_BETWAY,
};

export const getThemeConfig = (themeId?: AppLayoutTheme | string): ThemeDefinition => {
  if (!themeId) return THEME_BET365;
  if (THEMES[themeId]) return THEMES[themeId];
  return THEME_BET365;
};
