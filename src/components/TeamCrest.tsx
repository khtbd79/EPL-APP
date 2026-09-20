import React from 'react';

interface TeamCrestProps {
  teamName: string;
  className?: string;
  size?: number;
}

/**
 * High-definition vector SVG club crests for all 20 EPL 2026/27 teams.
 * 100% offline-ready, zero external image downloads, crystal sharp at all sizes.
 */
export const TeamCrest: React.FC<TeamCrestProps> = ({ teamName, className = 'w-7 h-7', size = 28 }) => {
  const normalized = (teamName || '').toLowerCase().trim();

  // Arsenal
  if (normalized.includes('arsenal') || normalized === 'ars') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19" fill="#EF0107" stroke="#9C824A" strokeWidth="2" />
        <circle cx="20" cy="20" r="16.5" fill="#EF0107" stroke="#063672" strokeWidth="1" />
        {/* Cannon body */}
        <path d="M10 21.5C10 20.5 13 20 18 20L28 19.5V22.5L18 23C13 23 10 22.5 10 21.5Z" fill="#9C824A" />
        <rect x="27" y="18" width="4" height="6" rx="1" fill="#9C824A" />
        <circle cx="16" cy="22" r="5" fill="#063672" stroke="#9C824A" strokeWidth="1.5" />
        <circle cx="16" cy="22" r="2" fill="#FFFFFF" />
        <path d="M12 25L9 28H15L13.5 25" fill="#9C824A" />
      </svg>
    );
  }

  // Aston Villa
  if (normalized.includes('aston') || normalized.includes('villa') || normalized === 'avl') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Shield */}
        <path d="M7 6C7 6 20 4 20 4C20 4 33 6 33 6C33 22 28 32 20 37C12 32 7 22 7 6Z" fill="#670E36" stroke="#94BEE5" strokeWidth="2" />
        {/* Yellow Lion Rampant */}
        <path d="M22 11C23 11 24 12 23.5 13C22 14 24 15 25 15.5C24 16.5 22 17 21 16C20 17 21 19 23 20C24 20.5 25 22 24 23C22 23 21 21.5 20 22C19 23 18 25 19 27C17.5 27 16 25 17 23.5C16 23 14.5 24 14 23C14.5 21.5 16 21 17 20C16 19 15 17 16.5 16C18 16 19 14.5 18.5 13C18 11.5 20 11 22 11Z" fill="#FEE100" />
        <circle cx="25" cy="9" r="1.5" fill="#FFFFFF" />
      </svg>
    );
  }

  // Bournemouth
  if (normalized.includes('bournemouth') || normalized === 'bou') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 6C8 6 20 4 20 4C20 4 32 6 32 6C32 23 27 32 20 37C13 32 8 23 8 6Z" fill="#000000" stroke="#DA291C" strokeWidth="2" />
        {/* Red stripes */}
        <path d="M13 5.5V34C15 35 17 36 20 36.5V4.3C18 4.6 15 5 13 5.5Z" fill="#DA291C" />
        <path d="M24 5.5V34C22 35 20 36 17 36.5V4.3C19 4.6 22 5 24 5.5Z" fill="#DA291C" />
        {/* Silhouette profile / football */}
        <circle cx="20" cy="18" r="5" fill="#F1C40F" />
        <path d="M19 14C23 15 25 19 23 23L27 25" stroke="#000000" strokeWidth="1.5" />
      </svg>
    );
  }

  // Brentford
  if (normalized.includes('brentford') || normalized === 'bre') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19" fill="#E30613" stroke="#D1A72A" strokeWidth="2" />
        <circle cx="20" cy="20" r="15" fill="#FFFFFF" />
        {/* Brentford Bee */}
        <circle cx="20" cy="15" r="3" fill="#000000" />
        {/* Abdomen with yellow & black stripes */}
        <ellipse cx="20" cy="24" rx="4.5" ry="6.5" fill="#F4B41A" stroke="#000000" strokeWidth="1" />
        <line x1="16" y1="22" x2="24" y2="22" stroke="#000000" strokeWidth="1.5" />
        <line x1="16" y1="25" x2="24" y2="25" stroke="#000000" strokeWidth="1.5" />
        {/* Wings */}
        <ellipse cx="13" cy="18" rx="5" ry="3" fill="#E8F4F8" stroke="#000000" strokeWidth="1" transform="rotate(-25 13 18)" opacity="0.85" />
        <ellipse cx="27" cy="18" rx="5" ry="3" fill="#E8F4F8" stroke="#000000" strokeWidth="1" transform="rotate(25 27 18)" opacity="0.85" />
      </svg>
    );
  }

  // Brighton & Hove Albion
  if (normalized.includes('brighton') || normalized.includes('albion') || normalized === 'bha') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19" fill="#0057B8" stroke="#FFCD00" strokeWidth="2" />
        <circle cx="20" cy="20" r="15.5" fill="#FFFFFF" />
        <circle cx="20" cy="20" r="13.5" fill="#0057B8" />
        {/* Seagull flying */}
        <path d="M12 21C16 18 19 16 23 17C26 15 30 14 31 13C29 17 26 19 23 20C19 21 15 22 12 21Z" fill="#FFFFFF" />
        <path d="M19 19C17 21 16 24 15 26C18 24 21 21 23 19" fill="#FFFFFF" />
        {/* Yellow beak */}
        <polygon points="31,13 33,14 30,15" fill="#FFCD00" />
      </svg>
    );
  }

  // Chelsea
  if (normalized.includes('chelsea') || normalized === 'che') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19" fill="#034694" stroke="#DBA111" strokeWidth="2" />
        <circle cx="20" cy="20" r="15.5" fill="#FFFFFF" />
        <circle cx="20" cy="20" r="13" fill="#034694" />
        {/* White Lion Rampant holding staff */}
        <path d="M22 10C23 10 24 11 23.5 12C22 13 24 14 25 14.5C24 15.5 22 16 21 15C20 16 21 18 23 19C24 19.5 25 21 24 22C22 22 21 20.5 20 21C19 22 18 24 19 26C17.5 26 16 24 17 22.5C16 22 14.5 23 14 22C14.5 20.5 16 20 17 19C16 18 15 16 16.5 15C18 15 19 13.5 18.5 12C18 10.5 20 10 22 10Z" fill="#FFFFFF" />
        {/* Golden staff */}
        <line x1="24" y1="9" x2="21" y2="27" stroke="#DBA111" strokeWidth="1.5" />
        <circle cx="24" cy="9" r="1.5" fill="#ED1C24" />
      </svg>
    );
  }

  // Crystal Palace
  if (normalized.includes('crystal') || normalized.includes('palace') || normalized === 'cry') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 6C8 6 20 4 20 4C20 4 32 6 32 6C32 23 27 32 20 37C13 32 8 23 8 6Z" fill="#1B458F" stroke="#C4122E" strokeWidth="2" />
        {/* Red & Blue split */}
        <path d="M20 4C20 4 32 6 32 6C32 23 27 32 20 37V4Z" fill="#C4122E" />
        {/* Eagle soaring on ball */}
        <circle cx="20" cy="27" r="5" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
        <path d="M12 17C16 15 19 16 20 19C21 16 24 15 28 17C26 21 23 22 20 25C17 22 14 21 12 17Z" fill="#FDB913" stroke="#000000" strokeWidth="0.8" />
      </svg>
    );
  }

  // Everton
  if (normalized.includes('everton') || normalized === 'eve') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 6C7 6 20 4 20 4C20 4 33 6 33 6C33 22 28 32 20 37C12 32 7 22 7 6Z" fill="#003399" stroke="#FFFFFF" strokeWidth="1.8" />
        {/* Prince Rupert's Tower */}
        <path d="M18 13H22V16H18V13Z" fill="#FFFFFF" />
        <path d="M16 16L20 10L24 16H16Z" fill="#FFFFFF" />
        <path d="M15 16H25V26H15V16Z" fill="#FFFFFF" />
        <rect x="18" y="21" width="4" height="5" fill="#003399" />
        {/* Laurel wreaths */}
        <path d="M11 19C11 25 15 28 17 29" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
        <path d="M29 19C29 25 25 28 23 29" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
      </svg>
    );
  }

  // Fulham
  if (normalized.includes('fulham') || normalized === 'ful') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 6C8 6 20 4 20 4C20 4 32 6 32 6C32 23 27 32 20 37C13 32 8 23 8 6Z" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
        {/* FFC monogram in Red */}
        <text x="20" y="24" fill="#CC0000" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">FFC</text>
        <path d="M12 28H28" stroke="#000000" strokeWidth="2" />
      </svg>
    );
  }

  // Hull City
  if (normalized.includes('hull') || normalized === 'hul') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 6C8 6 20 4 20 4C20 4 32 6 32 6C32 23 27 32 20 37C13 32 8 23 8 6Z" fill="#F5971E" stroke="#000000" strokeWidth="2" />
        {/* Tiger Head */}
        <circle cx="20" cy="19" r="8" fill="#F5971E" stroke="#000000" strokeWidth="1.5" />
        <polygon points="14,13 17,9 18,13" fill="#000000" />
        <polygon points="26,13 23,9 22,13" fill="#000000" />
        {/* Tiger stripes */}
        <path d="M20 12V15M17 14L19 16M23 14L21 16" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
        {/* Tiger eyes & snout */}
        <ellipse cx="17.5" cy="18" rx="1.2" ry="0.8" fill="#000000" />
        <ellipse cx="22.5" cy="18" rx="1.2" ry="0.8" fill="#000000" />
        <polygon points="20,20 18.5,22 21.5,22" fill="#000000" />
      </svg>
    );
  }

  // Ipswich Town
  if (normalized.includes('ipswich') || normalized === 'ips') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 6C8 6 20 4 20 4C20 4 32 6 32 6C32 23 27 32 20 37C13 32 8 23 8 6Z" fill="#003399" stroke="#E03A3E" strokeWidth="2" />
        {/* White Horse (Suffolk Punch) */}
        <path d="M23 12C21 12 19 14 17 15C15 16 14 18 15 20C16 22 18 21 19 23C20 25 21 27 22 28H24C24 26 23 24 24 22C26 21 27 18 26 15C25 13 24 12 23 12Z" fill="#FFFFFF" />
        <circle cx="16" cy="15" r="1.5" fill="#E03A3E" />
      </svg>
    );
  }

  // Leeds United
  if (normalized.includes('leeds') || normalized === 'lee') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 6C8 6 20 4 20 4C20 4 32 6 32 6C32 23 27 32 20 37C13 32 8 23 8 6Z" fill="#FFFFFF" stroke="#1D428A" strokeWidth="2" />
        <path d="M10 7H30V15H10V7Z" fill="#1D428A" />
        <text x="20" y="14" fill="#FFCD00" fontSize="7" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">LUFC</text>
        {/* Yorkshire Rose / Shield elements */}
        <circle cx="20" cy="24" r="5" fill="#FFCD00" stroke="#1D428A" strokeWidth="1.5" />
        <circle cx="20" cy="24" r="2.5" fill="#FFFFFF" />
      </svg>
    );
  }

  // Liverpool
  if (normalized.includes('liverpool') || normalized === 'liv') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19" fill="#C8102E" stroke="#00B2A9" strokeWidth="2" />
        {/* Golden Liver Bird */}
        <path d="M22 10C21 11 20 12 18 12C17 13 18 15 19 16C17 16 15 18 15 20C15 22 17 24 19 25L17 29H22L21 25C23 24 25 22 25 19C25 16 23 14 24 12C24 10 23 10 22 10Z" fill="#F6EB61" />
        {/* Twig in beak */}
        <path d="M17 11L14 9M17 11L14 13" stroke="#00B2A9" strokeWidth="1.2" strokeLinecap="round" />
        {/* Shankly Gates top flames */}
        <path d="M16 7L18 5L20 7L22 5L24 7" stroke="#F6EB61" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // Manchester City
  if (normalized.includes('city') || normalized === 'mci' || normalized === 'manchester city') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19" fill="#6CABDD" stroke="#1C2C5B" strokeWidth="2" />
        <circle cx="20" cy="20" r="15" fill="#FFFFFF" />
        <circle cx="20" cy="20" r="13" fill="#6CABDD" />
        {/* Golden Ship */}
        <path d="M14 17L16 13H24L26 17H14Z" fill="#F4A900" stroke="#1C2C5B" strokeWidth="0.8" />
        <polygon points="20,10 18,13 22,13" fill="#F4A900" />
        {/* Red Rose of Lancaster */}
        <circle cx="20" cy="23" r="3.5" fill="#E03A3E" stroke="#1C2C5B" strokeWidth="0.8" />
        <circle cx="20" cy="23" r="1.5" fill="#F4A900" />
      </svg>
    );
  }

  // Manchester United
  if (normalized.includes('united') || normalized === 'mun' || normalized === 'manchester united') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19" fill="#DA291C" stroke="#FBE122" strokeWidth="2" />
        <circle cx="20" cy="20" r="15.5" fill="#FFFFFF" />
        <circle cx="20" cy="20" r="13" fill="#DA291C" />
        {/* Central Shield */}
        <rect x="14" y="12" width="12" height="15" rx="2" fill="#FBE122" />
        {/* Red Devil with Trident */}
        <circle cx="20" cy="17" r="2.5" fill="#DA291C" />
        <path d="M19 14.5L18 13M21 14.5L22 13" stroke="#DA291C" strokeWidth="1.2" />
        <path d="M20 19.5V25" stroke="#DA291C" strokeWidth="1.5" />
        <path d="M17 21H23" stroke="#DA291C" strokeWidth="1.2" />
      </svg>
    );
  }

  // Newcastle United
  if (normalized.includes('newcastle') || normalized === 'new') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 6C8 6 20 4 20 4C20 4 32 6 32 6C32 23 27 32 20 37C13 32 8 23 8 6Z" fill="#000000" stroke="#41B6E6" strokeWidth="2" />
        {/* Black & White vertical stripes */}
        <path d="M12 5.5V34C14 35 17 36 20 36.5V4.3C16 4.8 13 5.3 12 5.5Z" fill="#FFFFFF" />
        <path d="M24 5.5V34C22 35 19 36 16 36.5V4.3C20 4.8 23 5.3 24 5.5Z" fill="#FFFFFF" />
        {/* Castle & Lion at top */}
        <rect x="17" y="3" width="6" height="5" fill="#41B6E6" stroke="#000000" strokeWidth="0.8" />
        <circle cx="20" cy="5" r="1.5" fill="#F4B41A" />
      </svg>
    );
  }

  // Nottingham Forest
  if (normalized.includes('nottingham') || normalized.includes('forest') || normalized === 'for') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19" fill="#DD0000" stroke="#FFFFFF" strokeWidth="2" />
        {/* Sherwood Oak Tree */}
        <path d="M20 11C17 11 15 13 15 15C13 16 13 18 14 20C15 21 16 21 17 21C17 23 18 25 19 26V29H21V26C22 25 23 23 23 21C24 21 25 21 26 20C27 18 27 16 25 15C25 13 23 11 20 11Z" fill="#FFFFFF" />
        {/* Wavy River Trent */}
        <path d="M13 30C15 29 17 31 20 30C23 29 25 31 27 30" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M13 33C15 32 17 34 20 33C23 32 25 34 27 33" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  // Sunderland
  if (normalized.includes('sunderland') || normalized === 'sun') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 6C8 6 20 4 20 4C20 4 32 6 32 6C32 23 27 32 20 37C13 32 8 23 8 6Z" fill="#EB172B" stroke="#000000" strokeWidth="2" />
        {/* White stripes */}
        <path d="M12 5.5V34C14 35 17 36 20 36.5V4.3C16 4.8 13 5.3 12 5.5Z" fill="#FFFFFF" />
        <path d="M24 5.5V34C22 35 19 36 16 36.5V4.3C20 4.8 23 5.3 24 5.5Z" fill="#FFFFFF" />
        {/* Black Cat / Bridge */}
        <circle cx="20" cy="18" r="4" fill="#000000" />
        <polygon points="17,14 18.5,12 19.5,14" fill="#000000" />
        <polygon points="23,14 21.5,12 20.5,14" fill="#000000" />
      </svg>
    );
  }

  // Tottenham Hotspur
  if (normalized.includes('tottenham') || normalized.includes('spurs') || normalized === 'tot') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19" fill="#132257" stroke="#FFFFFF" strokeWidth="1.8" />
        {/* Iconic Cockerel on Football */}
        <ellipse cx="20" cy="28" rx="4.5" ry="4.5" fill="#FFFFFF" stroke="#132257" strokeWidth="1" />
        {/* Cockerel body & comb */}
        <path d="M19 12C19 11 20 10 21 10C21.5 10 22 10.5 22 11C23 11 23 12 22.5 13C24 13.5 25 15 24 17C23 19 22 21 21 23.5H19C18 21 17 19 17 16C17 14 18 13 19 12Z" fill="#FFFFFF" />
        {/* Tail feathers */}
        <path d="M16 15C14 14 13 16 14 18C15 19 17 19 18 18" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
        {/* Legs */}
        <line x1="19.5" y1="23.5" x2="19.5" y2="25" stroke="#FFFFFF" strokeWidth="1.5" />
        <line x1="21" y1="23.5" x2="21" y2="25" stroke="#FFFFFF" strokeWidth="1.5" />
      </svg>
    );
  }

  // Leicester City
  if (normalized.includes('leicester') || normalized === 'lei') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19" fill="#003090" stroke="#FDBE11" strokeWidth="2" />
        <circle cx="20" cy="20" r="15" fill="#FFFFFF" />
        {/* Fox head badge */}
        <polygon points="20,27 14,17 26,17" fill="#E26A00" />
        <polygon points="14,17 12,12 16,14" fill="#E26A00" />
        <polygon points="26,17 28,12 24,14" fill="#E26A00" />
        <polygon points="20,27 17,21 23,21" fill="#FFFFFF" />
        <circle cx="20" cy="25" r="1.5" fill="#000000" />
      </svg>
    );
  }

  // Southampton
  if (normalized.includes('southampton') || normalized === 'sou') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 6C8 6 20 4 20 4C20 4 32 6 32 6C32 23 27 32 20 37C13 32 8 23 8 6Z" fill="#D71920" stroke="#130C0E" strokeWidth="2" />
        {/* Red and White stripes */}
        <path d="M12 5.5V34C14 35 17 36 20 36.5V4.3C16 4.8 13 5.3 12 5.5Z" fill="#FFFFFF" />
        <path d="M24 5.5V34C22 35 19 36 16 36.5V4.3C20 4.8 23 5.3 24 5.5Z" fill="#FFFFFF" />
        {/* Halo & Hampshire Rose */}
        <ellipse cx="20" cy="11" rx="5" ry="2" stroke="#FFC20E" strokeWidth="1.5" fill="none" />
        <circle cx="20" cy="21" r="4.5" fill="#FFC20E" stroke="#130C0E" strokeWidth="1" />
      </svg>
    );
  }

  // West Ham United
  if (normalized.includes('west ham') || normalized === 'whu') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 6C7 6 20 4 20 4C20 4 33 6 33 6C33 22 28 32 20 37C12 32 7 22 7 6Z" fill="#7A263A" stroke="#1BB1E7" strokeWidth="2" />
        {/* Crossed Golden Hammers */}
        <g stroke="#F3D449" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="28" x2="28" y2="12" />
          <line x1="28" y1="28" x2="12" y2="12" />
        </g>
        <rect x="25" y="9" width="5" height="5" rx="1" fill="#F3D449" transform="rotate(45 27.5 11.5)" />
        <rect x="10" y="9" width="5" height="5" rx="1" fill="#F3D449" transform="rotate(-45 12.5 11.5)" />
      </svg>
    );
  }

  // Wolverhampton Wanderers (Wolves)
  if (normalized.includes('wolverhampton') || normalized.includes('wolves') || normalized === 'wol') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Hexagon Shield */}
        <polygon points="20,4 34,12 34,28 20,36 6,28 6,12" fill="#FDB913" stroke="#231F20" strokeWidth="2" />
        {/* Angular Wolf Head */}
        <polygon points="20,29 13,19 16,14 19,16 20,13 21,16 24,14 27,19" fill="#231F20" />
        <polygon points="16,21 18,22 17,24" fill="#FDB913" />
        <polygon points="24,21 22,22 23,24" fill="#FDB913" />
      </svg>
    );
  }

  // Coventry City
  if (normalized.includes('coventry') || normalized === 'cov') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 6C8 6 20 4 20 4C20 4 32 6 32 6C32 23 27 32 20 37C13 32 8 23 8 6Z" fill="#5FB6E5" stroke="#002D62" strokeWidth="2" />
        {/* Coventry Elephant & Castle */}
        <rect x="18" y="10" width="4" height="4" fill="#002D62" />
        <ellipse cx="20" cy="20" rx="6" ry="4.5" fill="#002D62" />
        {/* Trunk */}
        <path d="M14 20C13 22 13 24 15 25" stroke="#002D62" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Legs */}
        <rect x="16" y="24" width="2" height="4" fill="#002D62" />
        <rect x="22" y="24" width="2" height="4" fill="#002D62" />
      </svg>
    );
  }

  // Default fallback crest
  return (
    <div className={`rounded-full bg-red-600 text-white flex items-center justify-center font-black text-[10px] border border-white shadow-xs ${className}`}>
      {teamName.slice(0, 3).toUpperCase()}
    </div>
  );
};
