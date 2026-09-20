/**
 * Official English Premier League (EPL) 2026/27 Complete Fixtures Database.
 * User-Specified Official Fixtures (Matchweeks 1 to 38, 380 Matches Total).
 * Preserved in exact sequence and pairing as specified by user.
 * 100% Authentic & Complete for all 20 Premier League clubs.
 * Completely Offline-Ready.
 * All kick-off times and dates in Bangladesh Standard Time (BST, UTC+6).
 */

export interface EPLFixture {
  id: string;
  matchweek: number;
  dateStr: string; // e.g. 'Sat 19 Sep'
  fullDate: string; // e.g. '2026-09-19'
  timeBST: string; // e.g. '20:00' in Bangladesh Standard Time (BST, UTC+6)
  homeTeam: string;
  awayTeam: string;
  stadium: string;
  city: string;
  homeScore?: number;
  awayScore?: number;
  status: 'UPCOMING' | 'LIVE' | 'FINISHED' | 'POSTPONED';
}

export interface MatchweekSchedule {
  matchweek: number;
  dateRange: string;
  matches: EPLFixture[];
}

export const EPL_2026_27_FIXTURES: MatchweekSchedule[] = [
  {
    "matchweek": 1,
    "dateRange": "Sat 22 Aug - Tue 25 Aug",
    "matches": [
      {
        "id": "epl-26-27-mw1-1",
        "matchweek": 1,
        "dateStr": "Sat 22 Aug",
        "fullDate": "2026-08-22",
        "timeBST": "01:00",
        "homeTeam": "Arsenal",
        "awayTeam": "Coventry City",
        "stadium": "Emirates Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw1-2",
        "matchweek": 1,
        "dateStr": "Sat 22 Aug",
        "fullDate": "2026-08-22",
        "timeBST": "17:30",
        "homeTeam": "Hull City",
        "awayTeam": "Manchester United",
        "stadium": "MKM Stadium",
        "city": "Kingston upon Hull",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw1-3",
        "matchweek": 1,
        "dateStr": "Sat 22 Aug",
        "fullDate": "2026-08-22",
        "timeBST": "20:00",
        "homeTeam": "Everton",
        "awayTeam": "Crystal Palace",
        "stadium": "Goodison Park",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw1-4",
        "matchweek": 1,
        "dateStr": "Sat 22 Aug",
        "fullDate": "2026-08-22",
        "timeBST": "20:00",
        "homeTeam": "Ipswich Town",
        "awayTeam": "Sunderland",
        "stadium": "Portman Road",
        "city": "Ipswich",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw1-5",
        "matchweek": 1,
        "dateStr": "Sat 22 Aug",
        "fullDate": "2026-08-22",
        "timeBST": "20:00",
        "homeTeam": "Nottingham Forest",
        "awayTeam": "Leeds United",
        "stadium": "City Ground",
        "city": "Nottingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw1-6",
        "matchweek": 1,
        "dateStr": "Sat 22 Aug",
        "fullDate": "2026-08-22",
        "timeBST": "22:30",
        "homeTeam": "Brentford",
        "awayTeam": "Tottenham Hotspur",
        "stadium": "Gtech Community Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw1-7",
        "matchweek": 1,
        "dateStr": "Sun 23 Aug",
        "fullDate": "2026-08-23",
        "timeBST": "19:00",
        "homeTeam": "Brighton & Hove Albion",
        "awayTeam": "Aston Villa",
        "stadium": "American Express Stadium",
        "city": "Brighton",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw1-8",
        "matchweek": 1,
        "dateStr": "Sun 23 Aug",
        "fullDate": "2026-08-23",
        "timeBST": "19:00",
        "homeTeam": "Manchester City",
        "awayTeam": "AFC Bournemouth",
        "stadium": "Etihad Stadium",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw1-9",
        "matchweek": 1,
        "dateStr": "Sun 23 Aug",
        "fullDate": "2026-08-23",
        "timeBST": "21:30",
        "homeTeam": "Newcastle United",
        "awayTeam": "Liverpool",
        "stadium": "St. James' Park",
        "city": "Newcastle upon Tyne",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw1-10",
        "matchweek": 1,
        "dateStr": "Tue 25 Aug",
        "fullDate": "2026-08-25",
        "timeBST": "01:00",
        "homeTeam": "Fulham",
        "awayTeam": "Chelsea",
        "stadium": "Craven Cottage",
        "city": "London",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 2,
    "dateRange": "Sat 29 Aug - Tue 01 Sep",
    "matches": [
      {
        "id": "epl-26-27-mw2-1",
        "matchweek": 2,
        "dateStr": "Sat 29 Aug",
        "fullDate": "2026-08-29",
        "timeBST": "17:30",
        "homeTeam": "Crystal Palace",
        "awayTeam": "Manchester City",
        "stadium": "Selhurst Park",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw2-2",
        "matchweek": 2,
        "dateStr": "Sat 29 Aug",
        "fullDate": "2026-08-29",
        "timeBST": "20:00",
        "homeTeam": "Liverpool",
        "awayTeam": "Nottingham Forest",
        "stadium": "Anfield",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw2-3",
        "matchweek": 2,
        "dateStr": "Sat 29 Aug",
        "fullDate": "2026-08-29",
        "timeBST": "20:00",
        "homeTeam": "AFC Bournemouth",
        "awayTeam": "Everton",
        "stadium": "Vitality Stadium",
        "city": "Bournemouth",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw2-4",
        "matchweek": 2,
        "dateStr": "Sat 29 Aug",
        "fullDate": "2026-08-29",
        "timeBST": "20:00",
        "homeTeam": "Coventry City",
        "awayTeam": "Hull City",
        "stadium": "Coventry Building Society Arena",
        "city": "Coventry",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw2-5",
        "matchweek": 2,
        "dateStr": "Sat 29 Aug",
        "fullDate": "2026-08-29",
        "timeBST": "20:00",
        "homeTeam": "Tottenham Hotspur",
        "awayTeam": "Newcastle United",
        "stadium": "Tottenham Hotspur Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw2-6",
        "matchweek": 2,
        "dateStr": "Sat 29 Aug",
        "fullDate": "2026-08-29",
        "timeBST": "22:30",
        "homeTeam": "Chelsea",
        "awayTeam": "Brighton & Hove Albion",
        "stadium": "Stamford Bridge",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw2-7",
        "matchweek": 2,
        "dateStr": "Sun 30 Aug",
        "fullDate": "2026-08-30",
        "timeBST": "19:00",
        "homeTeam": "Leeds United",
        "awayTeam": "Brentford",
        "stadium": "Elland Road",
        "city": "Leeds",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw2-8",
        "matchweek": 2,
        "dateStr": "Sun 30 Aug",
        "fullDate": "2026-08-30",
        "timeBST": "19:00",
        "homeTeam": "Sunderland",
        "awayTeam": "Fulham",
        "stadium": "Stadium of Light",
        "city": "Sunderland",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw2-9",
        "matchweek": 2,
        "dateStr": "Sun 30 Aug",
        "fullDate": "2026-08-30",
        "timeBST": "21:30",
        "homeTeam": "Manchester United",
        "awayTeam": "Ipswich Town",
        "stadium": "Old Trafford",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw2-10",
        "matchweek": 2,
        "dateStr": "Tue 01 Sep",
        "fullDate": "2026-09-01",
        "timeBST": "01:00",
        "homeTeam": "Aston Villa",
        "awayTeam": "Arsenal",
        "stadium": "Villa Park",
        "city": "Birmingham",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 3,
    "dateRange": "Sat 05 Sep - Tue 08 Sep",
    "matches": [
      {
        "id": "epl-26-27-mw3-1",
        "matchweek": 3,
        "dateStr": "Sat 05 Sep",
        "fullDate": "2026-09-05",
        "timeBST": "17:30",
        "homeTeam": "Ipswich Town",
        "awayTeam": "Liverpool",
        "stadium": "Portman Road",
        "city": "Ipswich",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw3-2",
        "matchweek": 3,
        "dateStr": "Sat 05 Sep",
        "fullDate": "2026-09-05",
        "timeBST": "20:00",
        "homeTeam": "Newcastle United",
        "awayTeam": "AFC Bournemouth",
        "stadium": "St. James' Park",
        "city": "Newcastle upon Tyne",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw3-3",
        "matchweek": 3,
        "dateStr": "Sat 05 Sep",
        "fullDate": "2026-09-05",
        "timeBST": "20:00",
        "homeTeam": "Brentford",
        "awayTeam": "Sunderland",
        "stadium": "Gtech Community Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw3-4",
        "matchweek": 3,
        "dateStr": "Sat 05 Sep",
        "fullDate": "2026-09-05",
        "timeBST": "20:00",
        "homeTeam": "Brighton & Hove Albion",
        "awayTeam": "Leeds United",
        "stadium": "American Express Stadium",
        "city": "Brighton",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw3-5",
        "matchweek": 3,
        "dateStr": "Sat 05 Sep",
        "fullDate": "2026-09-05",
        "timeBST": "20:00",
        "homeTeam": "Fulham",
        "awayTeam": "Crystal Palace",
        "stadium": "Craven Cottage",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw3-6",
        "matchweek": 3,
        "dateStr": "Sat 05 Sep",
        "fullDate": "2026-09-05",
        "timeBST": "22:30",
        "homeTeam": "Manchester City",
        "awayTeam": "Coventry City",
        "stadium": "Etihad Stadium",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw3-7",
        "matchweek": 3,
        "dateStr": "Sun 06 Sep",
        "fullDate": "2026-09-06",
        "timeBST": "19:00",
        "homeTeam": "Nottingham Forest",
        "awayTeam": "Tottenham Hotspur",
        "stadium": "City Ground",
        "city": "Nottingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw3-8",
        "matchweek": 3,
        "dateStr": "Sun 06 Sep",
        "fullDate": "2026-09-06",
        "timeBST": "19:00",
        "homeTeam": "Hull City",
        "awayTeam": "Aston Villa",
        "stadium": "MKM Stadium",
        "city": "Kingston upon Hull",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw3-9",
        "matchweek": 3,
        "dateStr": "Sun 06 Sep",
        "fullDate": "2026-09-06",
        "timeBST": "21:30",
        "homeTeam": "Everton",
        "awayTeam": "Manchester United",
        "stadium": "Goodison Park",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw3-10",
        "matchweek": 3,
        "dateStr": "Tue 08 Sep",
        "fullDate": "2026-09-08",
        "timeBST": "01:00",
        "homeTeam": "Arsenal",
        "awayTeam": "Chelsea",
        "stadium": "Emirates Stadium",
        "city": "London",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 4,
    "dateRange": "Sat 12 Sep - Tue 15 Sep",
    "matches": [
      {
        "id": "epl-26-27-mw4-1",
        "matchweek": 4,
        "dateStr": "Sat 12 Sep",
        "fullDate": "2026-09-12",
        "timeBST": "17:30",
        "homeTeam": "AFC Bournemouth",
        "awayTeam": "Brentford",
        "stadium": "Vitality Stadium",
        "city": "Bournemouth",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw4-2",
        "matchweek": 4,
        "dateStr": "Sat 12 Sep",
        "fullDate": "2026-09-12",
        "timeBST": "20:00",
        "homeTeam": "Aston Villa",
        "awayTeam": "Nottingham Forest",
        "stadium": "Villa Park",
        "city": "Birmingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw4-3",
        "matchweek": 4,
        "dateStr": "Sat 12 Sep",
        "fullDate": "2026-09-12",
        "timeBST": "20:00",
        "homeTeam": "Chelsea",
        "awayTeam": "Hull City",
        "stadium": "Stamford Bridge",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw4-4",
        "matchweek": 4,
        "dateStr": "Sat 12 Sep",
        "fullDate": "2026-09-12",
        "timeBST": "20:00",
        "homeTeam": "Crystal Palace",
        "awayTeam": "Ipswich Town",
        "stadium": "Selhurst Park",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw4-5",
        "matchweek": 4,
        "dateStr": "Sat 12 Sep",
        "fullDate": "2026-09-12",
        "timeBST": "20:00",
        "homeTeam": "Liverpool",
        "awayTeam": "Fulham",
        "stadium": "Anfield",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw4-6",
        "matchweek": 4,
        "dateStr": "Sat 12 Sep",
        "fullDate": "2026-09-12",
        "timeBST": "22:30",
        "homeTeam": "Tottenham Hotspur",
        "awayTeam": "Everton",
        "stadium": "Tottenham Hotspur Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw4-7",
        "matchweek": 4,
        "dateStr": "Sun 13 Sep",
        "fullDate": "2026-09-13",
        "timeBST": "19:00",
        "homeTeam": "Sunderland",
        "awayTeam": "Arsenal",
        "stadium": "Stadium of Light",
        "city": "Sunderland",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw4-8",
        "matchweek": 4,
        "dateStr": "Sun 13 Sep",
        "fullDate": "2026-09-13",
        "timeBST": "19:00",
        "homeTeam": "Coventry City",
        "awayTeam": "Brighton & Hove Albion",
        "stadium": "Coventry Building Society Arena",
        "city": "Coventry",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw4-9",
        "matchweek": 4,
        "dateStr": "Sun 13 Sep",
        "fullDate": "2026-09-13",
        "timeBST": "21:30",
        "homeTeam": "Manchester United",
        "awayTeam": "Manchester City",
        "stadium": "Old Trafford",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw4-10",
        "matchweek": 4,
        "dateStr": "Tue 15 Sep",
        "fullDate": "2026-09-15",
        "timeBST": "01:00",
        "homeTeam": "Leeds United",
        "awayTeam": "Newcastle United",
        "stadium": "Elland Road",
        "city": "Leeds",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 5,
    "dateRange": "Sat 19 Sep - Tue 22 Sep",
    "matches": [
      {
        "id": "epl-26-27-mw5-1",
        "matchweek": 5,
        "dateStr": "Sat 19 Sep",
        "fullDate": "2026-09-19",
        "timeBST": "01:00",
        "homeTeam": "Brentford",
        "awayTeam": "Chelsea",
        "stadium": "Gtech Community Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw5-2",
        "matchweek": 5,
        "dateStr": "Sat 19 Sep",
        "fullDate": "2026-09-19",
        "timeBST": "17:30",
        "homeTeam": "Tottenham Hotspur",
        "awayTeam": "Aston Villa",
        "stadium": "Tottenham Hotspur Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw5-3",
        "matchweek": 5,
        "dateStr": "Sat 19 Sep",
        "fullDate": "2026-09-19",
        "timeBST": "20:00",
        "homeTeam": "Brighton & Hove Albion",
        "awayTeam": "Arsenal",
        "stadium": "American Express Stadium",
        "city": "Brighton",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw5-4",
        "matchweek": 5,
        "dateStr": "Sat 19 Sep",
        "fullDate": "2026-09-19",
        "timeBST": "20:00",
        "homeTeam": "Everton",
        "awayTeam": "Ipswich Town",
        "stadium": "Goodison Park",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw5-5",
        "matchweek": 5,
        "dateStr": "Sat 19 Sep",
        "fullDate": "2026-09-19",
        "timeBST": "20:00",
        "homeTeam": "Newcastle United",
        "awayTeam": "Hull City",
        "stadium": "St. James' Park",
        "city": "Newcastle upon Tyne",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw5-6",
        "matchweek": 5,
        "dateStr": "Sat 19 Sep",
        "fullDate": "2026-09-19",
        "timeBST": "22:30",
        "homeTeam": "Nottingham Forest",
        "awayTeam": "Coventry City",
        "stadium": "City Ground",
        "city": "Nottingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw5-7",
        "matchweek": 5,
        "dateStr": "Sun 20 Sep",
        "fullDate": "2026-09-20",
        "timeBST": "19:00",
        "homeTeam": "AFC Bournemouth",
        "awayTeam": "Liverpool",
        "stadium": "Vitality Stadium",
        "city": "Bournemouth",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw5-8",
        "matchweek": 5,
        "dateStr": "Sun 20 Sep",
        "fullDate": "2026-09-20",
        "timeBST": "19:00",
        "homeTeam": "Leeds United",
        "awayTeam": "Crystal Palace",
        "stadium": "Elland Road",
        "city": "Leeds",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw5-9",
        "matchweek": 5,
        "dateStr": "Sun 20 Sep",
        "fullDate": "2026-09-20",
        "timeBST": "21:30",
        "homeTeam": "Manchester City",
        "awayTeam": "Sunderland",
        "stadium": "Etihad Stadium",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw5-10",
        "matchweek": 5,
        "dateStr": "Tue 22 Sep",
        "fullDate": "2026-09-22",
        "timeBST": "01:00",
        "homeTeam": "Fulham",
        "awayTeam": "Manchester United",
        "stadium": "Craven Cottage",
        "city": "London",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 6,
    "dateRange": "Sat 10 Oct - Tue 13 Oct",
    "matches": [
      {
        "id": "epl-26-27-mw6-1",
        "matchweek": 6,
        "dateStr": "Sat 10 Oct",
        "fullDate": "2026-10-10",
        "timeBST": "17:30",
        "homeTeam": "Arsenal",
        "awayTeam": "Leeds United",
        "stadium": "Emirates Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw6-2",
        "matchweek": 6,
        "dateStr": "Sat 10 Oct",
        "fullDate": "2026-10-10",
        "timeBST": "20:00",
        "homeTeam": "Aston Villa",
        "awayTeam": "Brentford",
        "stadium": "Villa Park",
        "city": "Birmingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw6-3",
        "matchweek": 6,
        "dateStr": "Sat 10 Oct",
        "fullDate": "2026-10-10",
        "timeBST": "20:00",
        "homeTeam": "Chelsea",
        "awayTeam": "AFC Bournemouth",
        "stadium": "Stamford Bridge",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw6-4",
        "matchweek": 6,
        "dateStr": "Sat 10 Oct",
        "fullDate": "2026-10-10",
        "timeBST": "20:00",
        "homeTeam": "Ipswich Town",
        "awayTeam": "Fulham",
        "stadium": "Portman Road",
        "city": "Ipswich",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw6-5",
        "matchweek": 6,
        "dateStr": "Sat 10 Oct",
        "fullDate": "2026-10-10",
        "timeBST": "20:00",
        "homeTeam": "Sunderland",
        "awayTeam": "Brighton & Hove Albion",
        "stadium": "Stadium of Light",
        "city": "Sunderland",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw6-6",
        "matchweek": 6,
        "dateStr": "Sat 10 Oct",
        "fullDate": "2026-10-10",
        "timeBST": "22:30",
        "homeTeam": "Manchester United",
        "awayTeam": "Tottenham Hotspur",
        "stadium": "Old Trafford",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw6-7",
        "matchweek": 6,
        "dateStr": "Sun 11 Oct",
        "fullDate": "2026-10-11",
        "timeBST": "19:00",
        "homeTeam": "Crystal Palace",
        "awayTeam": "Nottingham Forest",
        "stadium": "Selhurst Park",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw6-8",
        "matchweek": 6,
        "dateStr": "Sun 11 Oct",
        "fullDate": "2026-10-11",
        "timeBST": "19:00",
        "homeTeam": "Hull City",
        "awayTeam": "Everton",
        "stadium": "MKM Stadium",
        "city": "Kingston upon Hull",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw6-9",
        "matchweek": 6,
        "dateStr": "Sun 11 Oct",
        "fullDate": "2026-10-11",
        "timeBST": "21:30",
        "homeTeam": "Liverpool",
        "awayTeam": "Manchester City",
        "stadium": "Anfield",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw6-10",
        "matchweek": 6,
        "dateStr": "Tue 13 Oct",
        "fullDate": "2026-10-13",
        "timeBST": "01:00",
        "homeTeam": "Coventry City",
        "awayTeam": "Newcastle United",
        "stadium": "Coventry Building Society Arena",
        "city": "Coventry",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 7,
    "dateRange": "Sat 17 Oct - Tue 20 Oct",
    "matches": [
      {
        "id": "epl-26-27-mw7-1",
        "matchweek": 7,
        "dateStr": "Sat 17 Oct",
        "fullDate": "2026-10-17",
        "timeBST": "17:30",
        "homeTeam": "Everton",
        "awayTeam": "Chelsea",
        "stadium": "Goodison Park",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw7-2",
        "matchweek": 7,
        "dateStr": "Sat 17 Oct",
        "fullDate": "2026-10-17",
        "timeBST": "20:00",
        "homeTeam": "Brentford",
        "awayTeam": "Liverpool",
        "stadium": "Gtech Community Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw7-3",
        "matchweek": 7,
        "dateStr": "Sat 17 Oct",
        "fullDate": "2026-10-17",
        "timeBST": "20:00",
        "homeTeam": "Fulham",
        "awayTeam": "Hull City",
        "stadium": "Craven Cottage",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw7-4",
        "matchweek": 7,
        "dateStr": "Sat 17 Oct",
        "fullDate": "2026-10-17",
        "timeBST": "20:00",
        "homeTeam": "Manchester City",
        "awayTeam": "Ipswich Town",
        "stadium": "Etihad Stadium",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw7-5",
        "matchweek": 7,
        "dateStr": "Sat 17 Oct",
        "fullDate": "2026-10-17",
        "timeBST": "20:00",
        "homeTeam": "Newcastle United",
        "awayTeam": "Aston Villa",
        "stadium": "St. James' Park",
        "city": "Newcastle upon Tyne",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw7-6",
        "matchweek": 7,
        "dateStr": "Sat 17 Oct",
        "fullDate": "2026-10-17",
        "timeBST": "22:30",
        "homeTeam": "AFC Bournemouth",
        "awayTeam": "Sunderland",
        "stadium": "Vitality Stadium",
        "city": "Bournemouth",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw7-7",
        "matchweek": 7,
        "dateStr": "Sun 18 Oct",
        "fullDate": "2026-10-18",
        "timeBST": "19:00",
        "homeTeam": "Brighton & Hove Albion",
        "awayTeam": "Crystal Palace",
        "stadium": "American Express Stadium",
        "city": "Brighton",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw7-8",
        "matchweek": 7,
        "dateStr": "Sun 18 Oct",
        "fullDate": "2026-10-18",
        "timeBST": "19:00",
        "homeTeam": "Leeds United",
        "awayTeam": "Manchester United",
        "stadium": "Elland Road",
        "city": "Leeds",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw7-9",
        "matchweek": 7,
        "dateStr": "Sun 18 Oct",
        "fullDate": "2026-10-18",
        "timeBST": "21:30",
        "homeTeam": "Nottingham Forest",
        "awayTeam": "Arsenal",
        "stadium": "City Ground",
        "city": "Nottingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw7-10",
        "matchweek": 7,
        "dateStr": "Tue 20 Oct",
        "fullDate": "2026-10-20",
        "timeBST": "01:00",
        "homeTeam": "Tottenham Hotspur",
        "awayTeam": "Coventry City",
        "stadium": "Tottenham Hotspur Stadium",
        "city": "London",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 8,
    "dateRange": "Sat 24 Oct - Tue 27 Oct",
    "matches": [
      {
        "id": "epl-26-27-mw8-1",
        "matchweek": 8,
        "dateStr": "Sat 24 Oct",
        "fullDate": "2026-10-24",
        "timeBST": "01:00",
        "homeTeam": "Ipswich Town",
        "awayTeam": "Nottingham Forest",
        "stadium": "Portman Road",
        "city": "Ipswich",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw8-2",
        "matchweek": 8,
        "dateStr": "Sat 24 Oct",
        "fullDate": "2026-10-24",
        "timeBST": "17:30",
        "homeTeam": "Aston Villa",
        "awayTeam": "Manchester City",
        "stadium": "Villa Park",
        "city": "Birmingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw8-3",
        "matchweek": 8,
        "dateStr": "Sat 24 Oct",
        "fullDate": "2026-10-24",
        "timeBST": "20:00",
        "homeTeam": "Arsenal",
        "awayTeam": "Everton",
        "stadium": "Emirates Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw8-4",
        "matchweek": 8,
        "dateStr": "Sat 24 Oct",
        "fullDate": "2026-10-24",
        "timeBST": "20:00",
        "homeTeam": "Coventry City",
        "awayTeam": "Fulham",
        "stadium": "Coventry Building Society Arena",
        "city": "Coventry",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw8-5",
        "matchweek": 8,
        "dateStr": "Sat 24 Oct",
        "fullDate": "2026-10-24",
        "timeBST": "20:00",
        "homeTeam": "Chelsea",
        "awayTeam": "Tottenham Hotspur",
        "stadium": "Stamford Bridge",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw8-6",
        "matchweek": 8,
        "dateStr": "Sat 24 Oct",
        "fullDate": "2026-10-24",
        "timeBST": "22:30",
        "homeTeam": "Crystal Palace",
        "awayTeam": "Newcastle United",
        "stadium": "Selhurst Park",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw8-7",
        "matchweek": 8,
        "dateStr": "Sun 25 Oct",
        "fullDate": "2026-10-25",
        "timeBST": "19:00",
        "homeTeam": "Hull City",
        "awayTeam": "Brentford",
        "stadium": "MKM Stadium",
        "city": "Kingston upon Hull",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw8-8",
        "matchweek": 8,
        "dateStr": "Sun 25 Oct",
        "fullDate": "2026-10-25",
        "timeBST": "19:00",
        "homeTeam": "Liverpool",
        "awayTeam": "Brighton & Hove Albion",
        "stadium": "Anfield",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw8-9",
        "matchweek": 8,
        "dateStr": "Sun 25 Oct",
        "fullDate": "2026-10-25",
        "timeBST": "21:30",
        "homeTeam": "Manchester United",
        "awayTeam": "AFC Bournemouth",
        "stadium": "Old Trafford",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw8-10",
        "matchweek": 8,
        "dateStr": "Tue 27 Oct",
        "fullDate": "2026-10-27",
        "timeBST": "02:00",
        "homeTeam": "Sunderland",
        "awayTeam": "Leeds United",
        "stadium": "Stadium of Light",
        "city": "Sunderland",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 9,
    "dateRange": "Sat 31 Oct - Tue 03 Nov",
    "matches": [
      {
        "id": "epl-26-27-mw9-1",
        "matchweek": 9,
        "dateStr": "Sat 31 Oct",
        "fullDate": "2026-10-31",
        "timeBST": "18:30",
        "homeTeam": "Chelsea",
        "awayTeam": "Manchester United",
        "stadium": "Stamford Bridge",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw9-2",
        "matchweek": 9,
        "dateStr": "Sat 31 Oct",
        "fullDate": "2026-10-31",
        "timeBST": "21:00",
        "homeTeam": "AFC Bournemouth",
        "awayTeam": "Leeds United",
        "stadium": "Vitality Stadium",
        "city": "Bournemouth",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw9-3",
        "matchweek": 9,
        "dateStr": "Sat 31 Oct",
        "fullDate": "2026-10-31",
        "timeBST": "21:00",
        "homeTeam": "Brentford",
        "awayTeam": "Nottingham Forest",
        "stadium": "Gtech Community Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw9-4",
        "matchweek": 9,
        "dateStr": "Sat 31 Oct",
        "fullDate": "2026-10-31",
        "timeBST": "21:00",
        "homeTeam": "Coventry City",
        "awayTeam": "Sunderland",
        "stadium": "Coventry Building Society Arena",
        "city": "Coventry",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw9-5",
        "matchweek": 9,
        "dateStr": "Sat 31 Oct",
        "fullDate": "2026-10-31",
        "timeBST": "21:00",
        "homeTeam": "Hull City",
        "awayTeam": "Ipswich Town",
        "stadium": "MKM Stadium",
        "city": "Kingston upon Hull",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw9-6",
        "matchweek": 9,
        "dateStr": "Sat 31 Oct",
        "fullDate": "2026-10-31",
        "timeBST": "23:30",
        "homeTeam": "Manchester City",
        "awayTeam": "Brighton & Hove Albion",
        "stadium": "Etihad Stadium",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw9-7",
        "matchweek": 9,
        "dateStr": "Sun 01 Nov",
        "fullDate": "2026-11-01",
        "timeBST": "20:00",
        "homeTeam": "Tottenham Hotspur",
        "awayTeam": "Crystal Palace",
        "stadium": "Tottenham Hotspur Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw9-8",
        "matchweek": 9,
        "dateStr": "Sun 01 Nov",
        "fullDate": "2026-11-01",
        "timeBST": "20:00",
        "homeTeam": "Aston Villa",
        "awayTeam": "Fulham",
        "stadium": "Villa Park",
        "city": "Birmingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw9-9",
        "matchweek": 9,
        "dateStr": "Sun 01 Nov",
        "fullDate": "2026-11-01",
        "timeBST": "22:30",
        "homeTeam": "Liverpool",
        "awayTeam": "Arsenal",
        "stadium": "Anfield",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw9-10",
        "matchweek": 9,
        "dateStr": "Tue 03 Nov",
        "fullDate": "2026-11-03",
        "timeBST": "02:00",
        "homeTeam": "Newcastle United",
        "awayTeam": "Everton",
        "stadium": "St. James' Park",
        "city": "Newcastle upon Tyne",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 10,
    "dateRange": "Sat 07 Nov - Tue 10 Nov",
    "matches": [
      {
        "id": "epl-26-27-mw10-1",
        "matchweek": 10,
        "dateStr": "Sat 07 Nov",
        "fullDate": "2026-11-07",
        "timeBST": "18:30",
        "homeTeam": "Arsenal",
        "awayTeam": "Hull City",
        "stadium": "Emirates Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw10-2",
        "matchweek": 10,
        "dateStr": "Sat 07 Nov",
        "fullDate": "2026-11-07",
        "timeBST": "21:00",
        "homeTeam": "Brighton & Hove Albion",
        "awayTeam": "Brentford",
        "stadium": "American Express Stadium",
        "city": "Brighton",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw10-3",
        "matchweek": 10,
        "dateStr": "Sat 07 Nov",
        "fullDate": "2026-11-07",
        "timeBST": "21:00",
        "homeTeam": "Crystal Palace",
        "awayTeam": "Liverpool",
        "stadium": "Selhurst Park",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw10-4",
        "matchweek": 10,
        "dateStr": "Sat 07 Nov",
        "fullDate": "2026-11-07",
        "timeBST": "21:00",
        "homeTeam": "Everton",
        "awayTeam": "Coventry City",
        "stadium": "Goodison Park",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw10-5",
        "matchweek": 10,
        "dateStr": "Sat 07 Nov",
        "fullDate": "2026-11-07",
        "timeBST": "21:00",
        "homeTeam": "Fulham",
        "awayTeam": "Newcastle United",
        "stadium": "Craven Cottage",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw10-6",
        "matchweek": 10,
        "dateStr": "Sat 07 Nov",
        "fullDate": "2026-11-07",
        "timeBST": "23:30",
        "homeTeam": "Ipswich Town",
        "awayTeam": "AFC Bournemouth",
        "stadium": "Portman Road",
        "city": "Ipswich",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw10-7",
        "matchweek": 10,
        "dateStr": "Sun 08 Nov",
        "fullDate": "2026-11-08",
        "timeBST": "20:00",
        "homeTeam": "Leeds United",
        "awayTeam": "Tottenham Hotspur",
        "stadium": "Elland Road",
        "city": "Leeds",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw10-8",
        "matchweek": 10,
        "dateStr": "Sun 08 Nov",
        "fullDate": "2026-11-08",
        "timeBST": "20:00",
        "homeTeam": "Manchester United",
        "awayTeam": "Aston Villa",
        "stadium": "Old Trafford",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw10-9",
        "matchweek": 10,
        "dateStr": "Sun 08 Nov",
        "fullDate": "2026-11-08",
        "timeBST": "22:30",
        "homeTeam": "Nottingham Forest",
        "awayTeam": "Manchester City",
        "stadium": "City Ground",
        "city": "Nottingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw10-10",
        "matchweek": 10,
        "dateStr": "Tue 10 Nov",
        "fullDate": "2026-11-10",
        "timeBST": "02:00",
        "homeTeam": "Sunderland",
        "awayTeam": "Chelsea",
        "stadium": "Stadium of Light",
        "city": "Sunderland",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 11,
    "dateRange": "Sat 21 Nov - Tue 24 Nov",
    "matches": [
      {
        "id": "epl-26-27-mw11-1",
        "matchweek": 11,
        "dateStr": "Sat 21 Nov",
        "fullDate": "2026-11-21",
        "timeBST": "18:30",
        "homeTeam": "Aston Villa",
        "awayTeam": "Sunderland",
        "stadium": "Villa Park",
        "city": "Birmingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw11-2",
        "matchweek": 11,
        "dateStr": "Sat 21 Nov",
        "fullDate": "2026-11-21",
        "timeBST": "21:00",
        "homeTeam": "AFC Bournemouth",
        "awayTeam": "Nottingham Forest",
        "stadium": "Vitality Stadium",
        "city": "Bournemouth",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw11-3",
        "matchweek": 11,
        "dateStr": "Sat 21 Nov",
        "fullDate": "2026-11-21",
        "timeBST": "21:00",
        "homeTeam": "Brentford",
        "awayTeam": "Everton",
        "stadium": "Gtech Community Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw11-4",
        "matchweek": 11,
        "dateStr": "Sat 21 Nov",
        "fullDate": "2026-11-21",
        "timeBST": "21:00",
        "homeTeam": "Chelsea",
        "awayTeam": "Leeds United",
        "stadium": "Stamford Bridge",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw11-5",
        "matchweek": 11,
        "dateStr": "Sat 21 Nov",
        "fullDate": "2026-11-21",
        "timeBST": "21:00",
        "homeTeam": "Coventry City",
        "awayTeam": "Crystal Palace",
        "stadium": "Coventry Building Society Arena",
        "city": "Coventry",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw11-6",
        "matchweek": 11,
        "dateStr": "Sat 21 Nov",
        "fullDate": "2026-11-21",
        "timeBST": "23:30",
        "homeTeam": "Hull City",
        "awayTeam": "Brighton & Hove Albion",
        "stadium": "MKM Stadium",
        "city": "Kingston upon Hull",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw11-7",
        "matchweek": 11,
        "dateStr": "Sun 22 Nov",
        "fullDate": "2026-11-22",
        "timeBST": "20:00",
        "homeTeam": "Liverpool",
        "awayTeam": "Manchester United",
        "stadium": "Anfield",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw11-8",
        "matchweek": 11,
        "dateStr": "Sun 22 Nov",
        "fullDate": "2026-11-22",
        "timeBST": "20:00",
        "homeTeam": "Manchester City",
        "awayTeam": "Fulham",
        "stadium": "Etihad Stadium",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw11-9",
        "matchweek": 11,
        "dateStr": "Sun 22 Nov",
        "fullDate": "2026-11-22",
        "timeBST": "22:30",
        "homeTeam": "Newcastle United",
        "awayTeam": "Arsenal",
        "stadium": "St. James' Park",
        "city": "Newcastle upon Tyne",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw11-10",
        "matchweek": 11,
        "dateStr": "Tue 24 Nov",
        "fullDate": "2026-11-24",
        "timeBST": "02:00",
        "homeTeam": "Tottenham Hotspur",
        "awayTeam": "Ipswich Town",
        "stadium": "Tottenham Hotspur Stadium",
        "city": "London",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 12,
    "dateRange": "Sat 28 Nov - Tue 01 Dec",
    "matches": [
      {
        "id": "epl-26-27-mw12-1",
        "matchweek": 12,
        "dateStr": "Sat 28 Nov",
        "fullDate": "2026-11-28",
        "timeBST": "18:30",
        "homeTeam": "Arsenal",
        "awayTeam": "Manchester City",
        "stadium": "Emirates Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw12-2",
        "matchweek": 12,
        "dateStr": "Sat 28 Nov",
        "fullDate": "2026-11-28",
        "timeBST": "21:00",
        "homeTeam": "Brighton & Hove Albion",
        "awayTeam": "Newcastle United",
        "stadium": "American Express Stadium",
        "city": "Brighton",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw12-3",
        "matchweek": 12,
        "dateStr": "Sat 28 Nov",
        "fullDate": "2026-11-28",
        "timeBST": "21:00",
        "homeTeam": "Crystal Palace",
        "awayTeam": "Hull City",
        "stadium": "Selhurst Park",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw12-4",
        "matchweek": 12,
        "dateStr": "Sat 28 Nov",
        "fullDate": "2026-11-28",
        "timeBST": "21:00",
        "homeTeam": "Everton",
        "awayTeam": "Liverpool",
        "stadium": "Goodison Park",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw12-5",
        "matchweek": 12,
        "dateStr": "Sat 28 Nov",
        "fullDate": "2026-11-28",
        "timeBST": "21:00",
        "homeTeam": "Fulham",
        "awayTeam": "AFC Bournemouth",
        "stadium": "Craven Cottage",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw12-6",
        "matchweek": 12,
        "dateStr": "Sat 28 Nov",
        "fullDate": "2026-11-28",
        "timeBST": "23:30",
        "homeTeam": "Ipswich Town",
        "awayTeam": "Aston Villa",
        "stadium": "Portman Road",
        "city": "Ipswich",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw12-7",
        "matchweek": 12,
        "dateStr": "Sun 29 Nov",
        "fullDate": "2026-11-29",
        "timeBST": "20:00",
        "homeTeam": "Leeds United",
        "awayTeam": "Coventry City",
        "stadium": "Elland Road",
        "city": "Leeds",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw12-8",
        "matchweek": 12,
        "dateStr": "Sun 29 Nov",
        "fullDate": "2026-11-29",
        "timeBST": "20:00",
        "homeTeam": "Manchester United",
        "awayTeam": "Brentford",
        "stadium": "Old Trafford",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw12-9",
        "matchweek": 12,
        "dateStr": "Sun 29 Nov",
        "fullDate": "2026-11-29",
        "timeBST": "22:30",
        "homeTeam": "Nottingham Forest",
        "awayTeam": "Chelsea",
        "stadium": "City Ground",
        "city": "Nottingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw12-10",
        "matchweek": 12,
        "dateStr": "Tue 01 Dec",
        "fullDate": "2026-12-01",
        "timeBST": "02:00",
        "homeTeam": "Sunderland",
        "awayTeam": "Tottenham Hotspur",
        "stadium": "Stadium of Light",
        "city": "Sunderland",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 13,
    "dateRange": "Thu 03 Dec - Fri 04 Dec",
    "matches": [
      {
        "id": "epl-26-27-mw13-1",
        "matchweek": 13,
        "dateStr": "Thu 03 Dec",
        "fullDate": "2026-12-03",
        "timeBST": "01:30",
        "homeTeam": "Aston Villa",
        "awayTeam": "Everton",
        "stadium": "Villa Park",
        "city": "Birmingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw13-2",
        "matchweek": 13,
        "dateStr": "Thu 03 Dec",
        "fullDate": "2026-12-03",
        "timeBST": "01:30",
        "homeTeam": "AFC Bournemouth",
        "awayTeam": "Brighton & Hove Albion",
        "stadium": "Vitality Stadium",
        "city": "Bournemouth",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw13-3",
        "matchweek": 13,
        "dateStr": "Thu 03 Dec",
        "fullDate": "2026-12-03",
        "timeBST": "01:30",
        "homeTeam": "Brentford",
        "awayTeam": "Arsenal",
        "stadium": "Gtech Community Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw13-4",
        "matchweek": 13,
        "dateStr": "Thu 03 Dec",
        "fullDate": "2026-12-03",
        "timeBST": "01:30",
        "homeTeam": "Chelsea",
        "awayTeam": "Crystal Palace",
        "stadium": "Stamford Bridge",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw13-5",
        "matchweek": 13,
        "dateStr": "Thu 03 Dec",
        "fullDate": "2026-12-03",
        "timeBST": "02:15",
        "homeTeam": "Coventry City",
        "awayTeam": "Ipswich Town",
        "stadium": "Coventry Building Society Arena",
        "city": "Coventry",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw13-6",
        "matchweek": 13,
        "dateStr": "Fri 04 Dec",
        "fullDate": "2026-12-04",
        "timeBST": "01:30",
        "homeTeam": "Hull City",
        "awayTeam": "Nottingham Forest",
        "stadium": "MKM Stadium",
        "city": "Kingston upon Hull",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw13-7",
        "matchweek": 13,
        "dateStr": "Fri 04 Dec",
        "fullDate": "2026-12-04",
        "timeBST": "01:30",
        "homeTeam": "Liverpool",
        "awayTeam": "Sunderland",
        "stadium": "Anfield",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw13-8",
        "matchweek": 13,
        "dateStr": "Fri 04 Dec",
        "fullDate": "2026-12-04",
        "timeBST": "01:30",
        "homeTeam": "Manchester City",
        "awayTeam": "Leeds United",
        "stadium": "Etihad Stadium",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw13-9",
        "matchweek": 13,
        "dateStr": "Fri 04 Dec",
        "fullDate": "2026-12-04",
        "timeBST": "01:30",
        "homeTeam": "Newcastle United",
        "awayTeam": "Manchester United",
        "stadium": "St. James' Park",
        "city": "Newcastle upon Tyne",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw13-10",
        "matchweek": 13,
        "dateStr": "Fri 04 Dec",
        "fullDate": "2026-12-04",
        "timeBST": "02:15",
        "homeTeam": "Tottenham Hotspur",
        "awayTeam": "Fulham",
        "stadium": "Tottenham Hotspur Stadium",
        "city": "London",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 14,
    "dateRange": "Sat 05 Dec - Tue 08 Dec",
    "matches": [
      {
        "id": "epl-26-27-mw14-1",
        "matchweek": 14,
        "dateStr": "Sat 05 Dec",
        "fullDate": "2026-12-05",
        "timeBST": "18:30",
        "homeTeam": "Aston Villa",
        "awayTeam": "Crystal Palace",
        "stadium": "Villa Park",
        "city": "Birmingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw14-2",
        "matchweek": 14,
        "dateStr": "Sat 05 Dec",
        "fullDate": "2026-12-05",
        "timeBST": "21:00",
        "homeTeam": "AFC Bournemouth",
        "awayTeam": "Hull City",
        "stadium": "Vitality Stadium",
        "city": "Bournemouth",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw14-3",
        "matchweek": 14,
        "dateStr": "Sat 05 Dec",
        "fullDate": "2026-12-05",
        "timeBST": "21:00",
        "homeTeam": "Brentford",
        "awayTeam": "Manchester City",
        "stadium": "Gtech Community Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw14-4",
        "matchweek": 14,
        "dateStr": "Sat 05 Dec",
        "fullDate": "2026-12-05",
        "timeBST": "21:00",
        "homeTeam": "Chelsea",
        "awayTeam": "Liverpool",
        "stadium": "Stamford Bridge",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw14-5",
        "matchweek": 14,
        "dateStr": "Sat 05 Dec",
        "fullDate": "2026-12-05",
        "timeBST": "21:00",
        "homeTeam": "Everton",
        "awayTeam": "Fulham",
        "stadium": "Goodison Park",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw14-6",
        "matchweek": 14,
        "dateStr": "Sat 05 Dec",
        "fullDate": "2026-12-05",
        "timeBST": "23:30",
        "homeTeam": "Leeds United",
        "awayTeam": "Ipswich Town",
        "stadium": "Elland Road",
        "city": "Leeds",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw14-7",
        "matchweek": 14,
        "dateStr": "Sun 06 Dec",
        "fullDate": "2026-12-06",
        "timeBST": "20:00",
        "homeTeam": "Manchester United",
        "awayTeam": "Coventry City",
        "stadium": "Old Trafford",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw14-8",
        "matchweek": 14,
        "dateStr": "Sun 06 Dec",
        "fullDate": "2026-12-06",
        "timeBST": "20:00",
        "homeTeam": "Newcastle United",
        "awayTeam": "Sunderland",
        "stadium": "St. James' Park",
        "city": "Newcastle upon Tyne",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw14-9",
        "matchweek": 14,
        "dateStr": "Sun 06 Dec",
        "fullDate": "2026-12-06",
        "timeBST": "22:30",
        "homeTeam": "Nottingham Forest",
        "awayTeam": "Brighton & Hove Albion",
        "stadium": "City Ground",
        "city": "Nottingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw14-10",
        "matchweek": 14,
        "dateStr": "Tue 08 Dec",
        "fullDate": "2026-12-08",
        "timeBST": "02:00",
        "homeTeam": "Tottenham Hotspur",
        "awayTeam": "Arsenal",
        "stadium": "Tottenham Hotspur Stadium",
        "city": "London",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 15,
    "dateRange": "Sat 12 Dec - Tue 15 Dec",
    "matches": [
      {
        "id": "epl-26-27-mw15-1",
        "matchweek": 15,
        "dateStr": "Sat 12 Dec",
        "fullDate": "2026-12-12",
        "timeBST": "18:30",
        "homeTeam": "Arsenal",
        "awayTeam": "AFC Bournemouth",
        "stadium": "Emirates Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw15-2",
        "matchweek": 15,
        "dateStr": "Sat 12 Dec",
        "fullDate": "2026-12-12",
        "timeBST": "21:00",
        "homeTeam": "Brighton & Hove Albion",
        "awayTeam": "Everton",
        "stadium": "American Express Stadium",
        "city": "Brighton",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw15-3",
        "matchweek": 15,
        "dateStr": "Sat 12 Dec",
        "fullDate": "2026-12-12",
        "timeBST": "21:00",
        "homeTeam": "Coventry City",
        "awayTeam": "Aston Villa",
        "stadium": "Coventry Building Society Arena",
        "city": "Coventry",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw15-4",
        "matchweek": 15,
        "dateStr": "Sat 12 Dec",
        "fullDate": "2026-12-12",
        "timeBST": "21:00",
        "homeTeam": "Crystal Palace",
        "awayTeam": "Manchester United",
        "stadium": "Selhurst Park",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw15-5",
        "matchweek": 15,
        "dateStr": "Sat 12 Dec",
        "fullDate": "2026-12-12",
        "timeBST": "21:00",
        "homeTeam": "Fulham",
        "awayTeam": "Brentford",
        "stadium": "Craven Cottage",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw15-6",
        "matchweek": 15,
        "dateStr": "Sat 12 Dec",
        "fullDate": "2026-12-12",
        "timeBST": "23:30",
        "homeTeam": "Hull City",
        "awayTeam": "Tottenham Hotspur",
        "stadium": "MKM Stadium",
        "city": "Kingston upon Hull",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw15-7",
        "matchweek": 15,
        "dateStr": "Sun 13 Dec",
        "fullDate": "2026-12-13",
        "timeBST": "20:00",
        "homeTeam": "Ipswich Town",
        "awayTeam": "Newcastle United",
        "stadium": "Portman Road",
        "city": "Ipswich",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw15-8",
        "matchweek": 15,
        "dateStr": "Sun 13 Dec",
        "fullDate": "2026-12-13",
        "timeBST": "20:00",
        "homeTeam": "Liverpool",
        "awayTeam": "Leeds United",
        "stadium": "Anfield",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw15-9",
        "matchweek": 15,
        "dateStr": "Sun 13 Dec",
        "fullDate": "2026-12-13",
        "timeBST": "22:30",
        "homeTeam": "Manchester City",
        "awayTeam": "Chelsea",
        "stadium": "Etihad Stadium",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw15-10",
        "matchweek": 15,
        "dateStr": "Tue 15 Dec",
        "fullDate": "2026-12-15",
        "timeBST": "02:00",
        "homeTeam": "Sunderland",
        "awayTeam": "Nottingham Forest",
        "stadium": "Stadium of Light",
        "city": "Sunderland",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 16,
    "dateRange": "Sat 19 Dec - Tue 22 Dec",
    "matches": [
      {
        "id": "epl-26-27-mw16-1",
        "matchweek": 16,
        "dateStr": "Sat 19 Dec",
        "fullDate": "2026-12-19",
        "timeBST": "18:30",
        "homeTeam": "Arsenal",
        "awayTeam": "Manchester United",
        "stadium": "Emirates Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw16-2",
        "matchweek": 16,
        "dateStr": "Sat 19 Dec",
        "fullDate": "2026-12-19",
        "timeBST": "21:00",
        "homeTeam": "AFC Bournemouth",
        "awayTeam": "Coventry City",
        "stadium": "Vitality Stadium",
        "city": "Bournemouth",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw16-3",
        "matchweek": 16,
        "dateStr": "Sat 19 Dec",
        "fullDate": "2026-12-19",
        "timeBST": "21:00",
        "homeTeam": "Brentford",
        "awayTeam": "Newcastle United",
        "stadium": "Gtech Community Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw16-4",
        "matchweek": 16,
        "dateStr": "Sat 19 Dec",
        "fullDate": "2026-12-19",
        "timeBST": "21:00",
        "homeTeam": "Brighton & Hove Albion",
        "awayTeam": "Ipswich Town",
        "stadium": "American Express Stadium",
        "city": "Brighton",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw16-5",
        "matchweek": 16,
        "dateStr": "Sat 19 Dec",
        "fullDate": "2026-12-19",
        "timeBST": "21:00",
        "homeTeam": "Chelsea",
        "awayTeam": "Aston Villa",
        "stadium": "Stamford Bridge",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw16-6",
        "matchweek": 16,
        "dateStr": "Sat 19 Dec",
        "fullDate": "2026-12-19",
        "timeBST": "23:30",
        "homeTeam": "Leeds United",
        "awayTeam": "Fulham",
        "stadium": "Elland Road",
        "city": "Leeds",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw16-7",
        "matchweek": 16,
        "dateStr": "Sun 20 Dec",
        "fullDate": "2026-12-20",
        "timeBST": "20:00",
        "homeTeam": "Liverpool",
        "awayTeam": "Tottenham Hotspur",
        "stadium": "Anfield",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw16-8",
        "matchweek": 16,
        "dateStr": "Sun 20 Dec",
        "fullDate": "2026-12-20",
        "timeBST": "20:00",
        "homeTeam": "Manchester City",
        "awayTeam": "Hull City",
        "stadium": "Etihad Stadium",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw16-9",
        "matchweek": 16,
        "dateStr": "Sun 20 Dec",
        "fullDate": "2026-12-20",
        "timeBST": "22:30",
        "homeTeam": "Nottingham Forest",
        "awayTeam": "Everton",
        "stadium": "City Ground",
        "city": "Nottingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw16-10",
        "matchweek": 16,
        "dateStr": "Tue 22 Dec",
        "fullDate": "2026-12-22",
        "timeBST": "02:00",
        "homeTeam": "Sunderland",
        "awayTeam": "Crystal Palace",
        "stadium": "Stadium of Light",
        "city": "Sunderland",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 17,
    "dateRange": "Sat 26 Dec - Tue 29 Dec",
    "matches": [
      {
        "id": "epl-26-27-mw17-1",
        "matchweek": 17,
        "dateStr": "Sat 26 Dec",
        "fullDate": "2026-12-26",
        "timeBST": "18:30",
        "homeTeam": "Aston Villa",
        "awayTeam": "Leeds United",
        "stadium": "Villa Park",
        "city": "Birmingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw17-2",
        "matchweek": 17,
        "dateStr": "Sat 26 Dec",
        "fullDate": "2026-12-26",
        "timeBST": "21:00",
        "homeTeam": "Everton",
        "awayTeam": "Sunderland",
        "stadium": "Goodison Park",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw17-3",
        "matchweek": 17,
        "dateStr": "Sat 26 Dec",
        "fullDate": "2026-12-26",
        "timeBST": "21:00",
        "homeTeam": "Fulham",
        "awayTeam": "Brighton & Hove Albion",
        "stadium": "Craven Cottage",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw17-4",
        "matchweek": 17,
        "dateStr": "Sat 26 Dec",
        "fullDate": "2026-12-26",
        "timeBST": "21:00",
        "homeTeam": "Ipswich Town",
        "awayTeam": "Brentford",
        "stadium": "Portman Road",
        "city": "Ipswich",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw17-5",
        "matchweek": 17,
        "dateStr": "Sat 26 Dec",
        "fullDate": "2026-12-26",
        "timeBST": "21:00",
        "homeTeam": "Tottenham Hotspur",
        "awayTeam": "AFC Bournemouth",
        "stadium": "Tottenham Hotspur Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw17-6",
        "matchweek": 17,
        "dateStr": "Sat 26 Dec",
        "fullDate": "2026-12-26",
        "timeBST": "23:30",
        "homeTeam": "Hull City",
        "awayTeam": "Liverpool",
        "stadium": "MKM Stadium",
        "city": "Kingston upon Hull",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw17-7",
        "matchweek": 17,
        "dateStr": "Sun 27 Dec",
        "fullDate": "2026-12-27",
        "timeBST": "20:00",
        "homeTeam": "Newcastle United",
        "awayTeam": "Manchester City",
        "stadium": "St. James' Park",
        "city": "Newcastle upon Tyne",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw17-8",
        "matchweek": 17,
        "dateStr": "Sun 27 Dec",
        "fullDate": "2026-12-27",
        "timeBST": "20:00",
        "homeTeam": "Coventry City",
        "awayTeam": "Chelsea",
        "stadium": "Coventry Building Society Arena",
        "city": "Coventry",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw17-9",
        "matchweek": 17,
        "dateStr": "Sun 27 Dec",
        "fullDate": "2026-12-27",
        "timeBST": "22:30",
        "homeTeam": "Manchester United",
        "awayTeam": "Nottingham Forest",
        "stadium": "Old Trafford",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw17-10",
        "matchweek": 17,
        "dateStr": "Tue 29 Dec",
        "fullDate": "2026-12-29",
        "timeBST": "02:00",
        "homeTeam": "Crystal Palace",
        "awayTeam": "Arsenal",
        "stadium": "Selhurst Park",
        "city": "London",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 18,
    "dateRange": "Wed 30 Dec - Thu 31 Dec",
    "matches": [
      {
        "id": "epl-26-27-mw18-1",
        "matchweek": 18,
        "dateStr": "Wed 30 Dec",
        "fullDate": "2026-12-30",
        "timeBST": "01:30",
        "homeTeam": "Hull City",
        "awayTeam": "Leeds United",
        "stadium": "MKM Stadium",
        "city": "Kingston upon Hull",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw18-2",
        "matchweek": 18,
        "dateStr": "Wed 30 Dec",
        "fullDate": "2026-12-30",
        "timeBST": "01:30",
        "homeTeam": "Tottenham Hotspur",
        "awayTeam": "Brighton & Hove Albion",
        "stadium": "Tottenham Hotspur Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw18-3",
        "matchweek": 18,
        "dateStr": "Wed 30 Dec",
        "fullDate": "2026-12-30",
        "timeBST": "01:30",
        "homeTeam": "Everton",
        "awayTeam": "Manchester City",
        "stadium": "Goodison Park",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw18-4",
        "matchweek": 18,
        "dateStr": "Wed 30 Dec",
        "fullDate": "2026-12-30",
        "timeBST": "01:30",
        "homeTeam": "Coventry City",
        "awayTeam": "Brentford",
        "stadium": "Coventry Building Society Arena",
        "city": "Coventry",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw18-5",
        "matchweek": 18,
        "dateStr": "Wed 30 Dec",
        "fullDate": "2026-12-30",
        "timeBST": "02:15",
        "homeTeam": "Crystal Palace",
        "awayTeam": "AFC Bournemouth",
        "stadium": "Selhurst Park",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw18-6",
        "matchweek": 18,
        "dateStr": "Thu 31 Dec",
        "fullDate": "2026-12-31",
        "timeBST": "01:30",
        "homeTeam": "Fulham",
        "awayTeam": "Arsenal",
        "stadium": "Craven Cottage",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw18-7",
        "matchweek": 18,
        "dateStr": "Thu 31 Dec",
        "fullDate": "2026-12-31",
        "timeBST": "01:30",
        "homeTeam": "Manchester United",
        "awayTeam": "Sunderland",
        "stadium": "Old Trafford",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw18-8",
        "matchweek": 18,
        "dateStr": "Thu 31 Dec",
        "fullDate": "2026-12-31",
        "timeBST": "01:30",
        "homeTeam": "Newcastle United",
        "awayTeam": "Nottingham Forest",
        "stadium": "St. James' Park",
        "city": "Newcastle upon Tyne",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw18-9",
        "matchweek": 18,
        "dateStr": "Thu 31 Dec",
        "fullDate": "2026-12-31",
        "timeBST": "01:30",
        "homeTeam": "Aston Villa",
        "awayTeam": "Liverpool",
        "stadium": "Villa Park",
        "city": "Birmingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw18-10",
        "matchweek": 18,
        "dateStr": "Thu 31 Dec",
        "fullDate": "2026-12-31",
        "timeBST": "02:15",
        "homeTeam": "Ipswich Town",
        "awayTeam": "Chelsea",
        "stadium": "Portman Road",
        "city": "Ipswich",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 19,
    "dateRange": "Sat 02 Jan - Tue 05 Jan",
    "matches": [
      {
        "id": "epl-26-27-mw19-1",
        "matchweek": 19,
        "dateStr": "Sat 02 Jan",
        "fullDate": "2027-01-02",
        "timeBST": "02:00",
        "homeTeam": "Leeds United",
        "awayTeam": "Everton",
        "stadium": "Elland Road",
        "city": "Leeds",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw19-2",
        "matchweek": 19,
        "dateStr": "Sat 02 Jan",
        "fullDate": "2027-01-02",
        "timeBST": "18:30",
        "homeTeam": "Brighton & Hove Albion",
        "awayTeam": "Manchester United",
        "stadium": "American Express Stadium",
        "city": "Brighton",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw19-3",
        "matchweek": 19,
        "dateStr": "Sat 02 Jan",
        "fullDate": "2027-01-02",
        "timeBST": "21:00",
        "homeTeam": "Arsenal",
        "awayTeam": "Ipswich Town",
        "stadium": "Emirates Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw19-4",
        "matchweek": 19,
        "dateStr": "Sat 02 Jan",
        "fullDate": "2027-01-02",
        "timeBST": "21:00",
        "homeTeam": "Brentford",
        "awayTeam": "Crystal Palace",
        "stadium": "Gtech Community Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw19-5",
        "matchweek": 19,
        "dateStr": "Sat 02 Jan",
        "fullDate": "2027-01-02",
        "timeBST": "21:00",
        "homeTeam": "Liverpool",
        "awayTeam": "Coventry City",
        "stadium": "Anfield",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw19-6",
        "matchweek": 19,
        "dateStr": "Sat 02 Jan",
        "fullDate": "2027-01-02",
        "timeBST": "23:30",
        "homeTeam": "Nottingham Forest",
        "awayTeam": "Fulham",
        "stadium": "City Ground",
        "city": "Nottingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw19-7",
        "matchweek": 19,
        "dateStr": "Sun 03 Jan",
        "fullDate": "2027-01-03",
        "timeBST": "20:00",
        "homeTeam": "Sunderland",
        "awayTeam": "Hull City",
        "stadium": "Stadium of Light",
        "city": "Sunderland",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw19-8",
        "matchweek": 19,
        "dateStr": "Sun 03 Jan",
        "fullDate": "2027-01-03",
        "timeBST": "20:00",
        "homeTeam": "AFC Bournemouth",
        "awayTeam": "Aston Villa",
        "stadium": "Vitality Stadium",
        "city": "Bournemouth",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw19-9",
        "matchweek": 19,
        "dateStr": "Sun 03 Jan",
        "fullDate": "2027-01-03",
        "timeBST": "22:30",
        "homeTeam": "Chelsea",
        "awayTeam": "Newcastle United",
        "stadium": "Stamford Bridge",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw19-10",
        "matchweek": 19,
        "dateStr": "Tue 05 Jan",
        "fullDate": "2027-01-05",
        "timeBST": "02:00",
        "homeTeam": "Manchester City",
        "awayTeam": "Tottenham Hotspur",
        "stadium": "Etihad Stadium",
        "city": "Manchester",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 20,
    "dateRange": "Sat 16 Jan - Tue 19 Jan",
    "matches": [
      {
        "id": "epl-26-27-mw20-1",
        "matchweek": 20,
        "dateStr": "Sat 16 Jan",
        "fullDate": "2027-01-16",
        "timeBST": "18:30",
        "homeTeam": "Arsenal",
        "awayTeam": "Brentford",
        "stadium": "Emirates Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw20-2",
        "matchweek": 20,
        "dateStr": "Sat 16 Jan",
        "fullDate": "2027-01-16",
        "timeBST": "21:00",
        "homeTeam": "Brighton & Hove Albion",
        "awayTeam": "AFC Bournemouth",
        "stadium": "American Express Stadium",
        "city": "Brighton",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw20-3",
        "matchweek": 20,
        "dateStr": "Sat 16 Jan",
        "fullDate": "2027-01-16",
        "timeBST": "21:00",
        "homeTeam": "Crystal Palace",
        "awayTeam": "Chelsea",
        "stadium": "Selhurst Park",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw20-4",
        "matchweek": 20,
        "dateStr": "Sat 16 Jan",
        "fullDate": "2027-01-16",
        "timeBST": "21:00",
        "homeTeam": "Everton",
        "awayTeam": "Aston Villa",
        "stadium": "Goodison Park",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw20-5",
        "matchweek": 20,
        "dateStr": "Sat 16 Jan",
        "fullDate": "2027-01-16",
        "timeBST": "21:00",
        "homeTeam": "Fulham",
        "awayTeam": "Tottenham Hotspur",
        "stadium": "Craven Cottage",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw20-6",
        "matchweek": 20,
        "dateStr": "Sat 16 Jan",
        "fullDate": "2027-01-16",
        "timeBST": "23:30",
        "homeTeam": "Ipswich Town",
        "awayTeam": "Coventry City",
        "stadium": "Portman Road",
        "city": "Ipswich",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw20-7",
        "matchweek": 20,
        "dateStr": "Sun 17 Jan",
        "fullDate": "2027-01-17",
        "timeBST": "20:00",
        "homeTeam": "Leeds United",
        "awayTeam": "Manchester City",
        "stadium": "Elland Road",
        "city": "Leeds",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw20-8",
        "matchweek": 20,
        "dateStr": "Sun 17 Jan",
        "fullDate": "2027-01-17",
        "timeBST": "20:00",
        "homeTeam": "Manchester United",
        "awayTeam": "Newcastle United",
        "stadium": "Old Trafford",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw20-9",
        "matchweek": 20,
        "dateStr": "Sun 17 Jan",
        "fullDate": "2027-01-17",
        "timeBST": "22:30",
        "homeTeam": "Nottingham Forest",
        "awayTeam": "Hull City",
        "stadium": "City Ground",
        "city": "Nottingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw20-10",
        "matchweek": 20,
        "dateStr": "Tue 19 Jan",
        "fullDate": "2027-01-19",
        "timeBST": "02:00",
        "homeTeam": "Sunderland",
        "awayTeam": "Liverpool",
        "stadium": "Stadium of Light",
        "city": "Sunderland",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 21,
    "dateRange": "Sat 23 Jan - Tue 26 Jan",
    "matches": [
      {
        "id": "epl-26-27-mw21-1",
        "matchweek": 21,
        "dateStr": "Sat 23 Jan",
        "fullDate": "2027-01-23",
        "timeBST": "18:30",
        "homeTeam": "AFC Bournemouth",
        "awayTeam": "Ipswich Town",
        "stadium": "Vitality Stadium",
        "city": "Bournemouth",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw21-2",
        "matchweek": 21,
        "dateStr": "Sat 23 Jan",
        "fullDate": "2027-01-23",
        "timeBST": "21:00",
        "homeTeam": "Aston Villa",
        "awayTeam": "Manchester United",
        "stadium": "Villa Park",
        "city": "Birmingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw21-3",
        "matchweek": 21,
        "dateStr": "Sat 23 Jan",
        "fullDate": "2027-01-23",
        "timeBST": "21:00",
        "homeTeam": "Brentford",
        "awayTeam": "Brighton & Hove Albion",
        "stadium": "Gtech Community Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw21-4",
        "matchweek": 21,
        "dateStr": "Sat 23 Jan",
        "fullDate": "2027-01-23",
        "timeBST": "21:00",
        "homeTeam": "Chelsea",
        "awayTeam": "Sunderland",
        "stadium": "Stamford Bridge",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw21-5",
        "matchweek": 21,
        "dateStr": "Sat 23 Jan",
        "fullDate": "2027-01-23",
        "timeBST": "21:00",
        "homeTeam": "Coventry City",
        "awayTeam": "Everton",
        "stadium": "Coventry Building Society Arena",
        "city": "Coventry",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw21-6",
        "matchweek": 21,
        "dateStr": "Sat 23 Jan",
        "fullDate": "2027-01-23",
        "timeBST": "23:30",
        "homeTeam": "Hull City",
        "awayTeam": "Arsenal",
        "stadium": "MKM Stadium",
        "city": "Kingston upon Hull",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw21-7",
        "matchweek": 21,
        "dateStr": "Sun 24 Jan",
        "fullDate": "2027-01-24",
        "timeBST": "20:00",
        "homeTeam": "Liverpool",
        "awayTeam": "Crystal Palace",
        "stadium": "Anfield",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw21-8",
        "matchweek": 21,
        "dateStr": "Sun 24 Jan",
        "fullDate": "2027-01-24",
        "timeBST": "20:00",
        "homeTeam": "Manchester City",
        "awayTeam": "Nottingham Forest",
        "stadium": "Etihad Stadium",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw21-9",
        "matchweek": 21,
        "dateStr": "Sun 24 Jan",
        "fullDate": "2027-01-24",
        "timeBST": "22:30",
        "homeTeam": "Newcastle United",
        "awayTeam": "Fulham",
        "stadium": "St. James' Park",
        "city": "Newcastle upon Tyne",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw21-10",
        "matchweek": 21,
        "dateStr": "Tue 26 Jan",
        "fullDate": "2027-01-26",
        "timeBST": "02:00",
        "homeTeam": "Tottenham Hotspur",
        "awayTeam": "Leeds United",
        "stadium": "Tottenham Hotspur Stadium",
        "city": "London",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 22,
    "dateRange": "Sat 30 Jan - Tue 02 Feb",
    "matches": [
      {
        "id": "epl-26-27-mw22-1",
        "matchweek": 22,
        "dateStr": "Sat 30 Jan",
        "fullDate": "2027-01-30",
        "timeBST": "18:30",
        "homeTeam": "Arsenal",
        "awayTeam": "Newcastle United",
        "stadium": "Emirates Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw22-2",
        "matchweek": 22,
        "dateStr": "Sat 30 Jan",
        "fullDate": "2027-01-30",
        "timeBST": "21:00",
        "homeTeam": "Brighton & Hove Albion",
        "awayTeam": "Manchester City",
        "stadium": "American Express Stadium",
        "city": "Brighton",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw22-3",
        "matchweek": 22,
        "dateStr": "Sat 30 Jan",
        "fullDate": "2027-01-30",
        "timeBST": "21:00",
        "homeTeam": "Crystal Palace",
        "awayTeam": "Tottenham Hotspur",
        "stadium": "Selhurst Park",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw22-4",
        "matchweek": 22,
        "dateStr": "Sat 30 Jan",
        "fullDate": "2027-01-30",
        "timeBST": "21:00",
        "homeTeam": "Everton",
        "awayTeam": "Brentford",
        "stadium": "Goodison Park",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw22-5",
        "matchweek": 22,
        "dateStr": "Sat 30 Jan",
        "fullDate": "2027-01-30",
        "timeBST": "21:00",
        "homeTeam": "Fulham",
        "awayTeam": "Aston Villa",
        "stadium": "Craven Cottage",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw22-6",
        "matchweek": 22,
        "dateStr": "Sat 30 Jan",
        "fullDate": "2027-01-30",
        "timeBST": "23:30",
        "homeTeam": "Ipswich Town",
        "awayTeam": "Hull City",
        "stadium": "Portman Road",
        "city": "Ipswich",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw22-7",
        "matchweek": 22,
        "dateStr": "Sun 31 Jan",
        "fullDate": "2027-01-31",
        "timeBST": "20:00",
        "homeTeam": "Leeds United",
        "awayTeam": "Chelsea",
        "stadium": "Elland Road",
        "city": "Leeds",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw22-8",
        "matchweek": 22,
        "dateStr": "Sun 31 Jan",
        "fullDate": "2027-01-31",
        "timeBST": "20:00",
        "homeTeam": "Manchester United",
        "awayTeam": "Liverpool",
        "stadium": "Old Trafford",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw22-9",
        "matchweek": 22,
        "dateStr": "Sun 31 Jan",
        "fullDate": "2027-01-31",
        "timeBST": "22:30",
        "homeTeam": "Nottingham Forest",
        "awayTeam": "AFC Bournemouth",
        "stadium": "City Ground",
        "city": "Nottingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw22-10",
        "matchweek": 22,
        "dateStr": "Tue 02 Feb",
        "fullDate": "2027-02-02",
        "timeBST": "02:00",
        "homeTeam": "Sunderland",
        "awayTeam": "Coventry City",
        "stadium": "Stadium of Light",
        "city": "Sunderland",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 23,
    "dateRange": "Sat 06 Feb - Tue 09 Feb",
    "matches": [
      {
        "id": "epl-26-27-mw23-1",
        "matchweek": 23,
        "dateStr": "Sat 06 Feb",
        "fullDate": "2027-02-06",
        "timeBST": "18:30",
        "homeTeam": "AFC Bournemouth",
        "awayTeam": "Fulham",
        "stadium": "Vitality Stadium",
        "city": "Bournemouth",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw23-2",
        "matchweek": 23,
        "dateStr": "Sat 06 Feb",
        "fullDate": "2027-02-06",
        "timeBST": "21:00",
        "homeTeam": "Aston Villa",
        "awayTeam": "Ipswich Town",
        "stadium": "Villa Park",
        "city": "Birmingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw23-3",
        "matchweek": 23,
        "dateStr": "Sat 06 Feb",
        "fullDate": "2027-02-06",
        "timeBST": "21:00",
        "homeTeam": "Brentford",
        "awayTeam": "Manchester United",
        "stadium": "Gtech Community Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw23-4",
        "matchweek": 23,
        "dateStr": "Sat 06 Feb",
        "fullDate": "2027-02-06",
        "timeBST": "21:00",
        "homeTeam": "Chelsea",
        "awayTeam": "Nottingham Forest",
        "stadium": "Stamford Bridge",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw23-5",
        "matchweek": 23,
        "dateStr": "Sat 06 Feb",
        "fullDate": "2027-02-06",
        "timeBST": "21:00",
        "homeTeam": "Coventry City",
        "awayTeam": "Leeds United",
        "stadium": "Coventry Building Society Arena",
        "city": "Coventry",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw23-6",
        "matchweek": 23,
        "dateStr": "Sat 06 Feb",
        "fullDate": "2027-02-06",
        "timeBST": "23:30",
        "homeTeam": "Hull City",
        "awayTeam": "Crystal Palace",
        "stadium": "MKM Stadium",
        "city": "Kingston upon Hull",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw23-7",
        "matchweek": 23,
        "dateStr": "Sun 07 Feb",
        "fullDate": "2027-02-07",
        "timeBST": "20:00",
        "homeTeam": "Liverpool",
        "awayTeam": "Everton",
        "stadium": "Anfield",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw23-8",
        "matchweek": 23,
        "dateStr": "Sun 07 Feb",
        "fullDate": "2027-02-07",
        "timeBST": "20:00",
        "homeTeam": "Manchester City",
        "awayTeam": "Arsenal",
        "stadium": "Etihad Stadium",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw23-9",
        "matchweek": 23,
        "dateStr": "Sun 07 Feb",
        "fullDate": "2027-02-07",
        "timeBST": "22:30",
        "homeTeam": "Newcastle United",
        "awayTeam": "Brighton & Hove Albion",
        "stadium": "St. James' Park",
        "city": "Newcastle upon Tyne",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw23-10",
        "matchweek": 23,
        "dateStr": "Tue 09 Feb",
        "fullDate": "2027-02-09",
        "timeBST": "02:00",
        "homeTeam": "Tottenham Hotspur",
        "awayTeam": "Sunderland",
        "stadium": "Tottenham Hotspur Stadium",
        "city": "London",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 24,
    "dateRange": "Sat 13 Feb - Tue 16 Feb",
    "matches": [
      {
        "id": "epl-26-27-mw24-1",
        "matchweek": 24,
        "dateStr": "Sat 13 Feb",
        "fullDate": "2027-02-13",
        "timeBST": "18:30",
        "homeTeam": "Arsenal",
        "awayTeam": "Liverpool",
        "stadium": "Emirates Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw24-2",
        "matchweek": 24,
        "dateStr": "Sat 13 Feb",
        "fullDate": "2027-02-13",
        "timeBST": "21:00",
        "homeTeam": "Brighton & Hove Albion",
        "awayTeam": "Hull City",
        "stadium": "American Express Stadium",
        "city": "Brighton",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw24-3",
        "matchweek": 24,
        "dateStr": "Sat 13 Feb",
        "fullDate": "2027-02-13",
        "timeBST": "21:00",
        "homeTeam": "Crystal Palace",
        "awayTeam": "Coventry City",
        "stadium": "Selhurst Park",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw24-4",
        "matchweek": 24,
        "dateStr": "Sat 13 Feb",
        "fullDate": "2027-02-13",
        "timeBST": "21:00",
        "homeTeam": "Everton",
        "awayTeam": "Newcastle United",
        "stadium": "Goodison Park",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw24-5",
        "matchweek": 24,
        "dateStr": "Sat 13 Feb",
        "fullDate": "2027-02-13",
        "timeBST": "21:00",
        "homeTeam": "Fulham",
        "awayTeam": "Manchester City",
        "stadium": "Craven Cottage",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw24-6",
        "matchweek": 24,
        "dateStr": "Sat 13 Feb",
        "fullDate": "2027-02-13",
        "timeBST": "23:30",
        "homeTeam": "Ipswich Town",
        "awayTeam": "Tottenham Hotspur",
        "stadium": "Portman Road",
        "city": "Ipswich",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw24-7",
        "matchweek": 24,
        "dateStr": "Sun 14 Feb",
        "fullDate": "2027-02-14",
        "timeBST": "20:00",
        "homeTeam": "Leeds United",
        "awayTeam": "AFC Bournemouth",
        "stadium": "Elland Road",
        "city": "Leeds",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw24-8",
        "matchweek": 24,
        "dateStr": "Sun 14 Feb",
        "fullDate": "2027-02-14",
        "timeBST": "20:00",
        "homeTeam": "Manchester United",
        "awayTeam": "Chelsea",
        "stadium": "Old Trafford",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw24-9",
        "matchweek": 24,
        "dateStr": "Sun 14 Feb",
        "fullDate": "2027-02-14",
        "timeBST": "22:30",
        "homeTeam": "Nottingham Forest",
        "awayTeam": "Brentford",
        "stadium": "City Ground",
        "city": "Nottingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw24-10",
        "matchweek": 24,
        "dateStr": "Tue 16 Feb",
        "fullDate": "2027-02-16",
        "timeBST": "02:00",
        "homeTeam": "Sunderland",
        "awayTeam": "Aston Villa",
        "stadium": "Stadium of Light",
        "city": "Sunderland",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 25,
    "dateRange": "Sat 20 Feb - Tue 23 Feb",
    "matches": [
      {
        "id": "epl-26-27-mw25-1",
        "matchweek": 25,
        "dateStr": "Sat 20 Feb",
        "fullDate": "2027-02-20",
        "timeBST": "18:30",
        "homeTeam": "Aston Villa",
        "awayTeam": "AFC Bournemouth",
        "stadium": "Villa Park",
        "city": "Birmingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw25-2",
        "matchweek": 25,
        "dateStr": "Sat 20 Feb",
        "fullDate": "2027-02-20",
        "timeBST": "21:00",
        "homeTeam": "Coventry City",
        "awayTeam": "Liverpool",
        "stadium": "Coventry Building Society Arena",
        "city": "Coventry",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw25-3",
        "matchweek": 25,
        "dateStr": "Sat 20 Feb",
        "fullDate": "2027-02-20",
        "timeBST": "21:00",
        "homeTeam": "Crystal Palace",
        "awayTeam": "Brentford",
        "stadium": "Selhurst Park",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw25-4",
        "matchweek": 25,
        "dateStr": "Sat 20 Feb",
        "fullDate": "2027-02-20",
        "timeBST": "21:00",
        "homeTeam": "Everton",
        "awayTeam": "Leeds United",
        "stadium": "Goodison Park",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw25-5",
        "matchweek": 25,
        "dateStr": "Sat 20 Feb",
        "fullDate": "2027-02-20",
        "timeBST": "21:00",
        "homeTeam": "Fulham",
        "awayTeam": "Nottingham Forest",
        "stadium": "Craven Cottage",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw25-6",
        "matchweek": 25,
        "dateStr": "Sat 20 Feb",
        "fullDate": "2027-02-20",
        "timeBST": "23:30",
        "homeTeam": "Hull City",
        "awayTeam": "Sunderland",
        "stadium": "MKM Stadium",
        "city": "Kingston upon Hull",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw25-7",
        "matchweek": 25,
        "dateStr": "Sun 21 Feb",
        "fullDate": "2027-02-21",
        "timeBST": "20:00",
        "homeTeam": "Ipswich Town",
        "awayTeam": "Arsenal",
        "stadium": "Portman Road",
        "city": "Ipswich",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw25-8",
        "matchweek": 25,
        "dateStr": "Sun 21 Feb",
        "fullDate": "2027-02-21",
        "timeBST": "20:00",
        "homeTeam": "Manchester United",
        "awayTeam": "Brighton & Hove Albion",
        "stadium": "Old Trafford",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw25-9",
        "matchweek": 25,
        "dateStr": "Sun 21 Feb",
        "fullDate": "2027-02-21",
        "timeBST": "22:30",
        "homeTeam": "Newcastle United",
        "awayTeam": "Chelsea",
        "stadium": "St. James' Park",
        "city": "Newcastle upon Tyne",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw25-10",
        "matchweek": 25,
        "dateStr": "Tue 23 Feb",
        "fullDate": "2027-02-23",
        "timeBST": "02:00",
        "homeTeam": "Tottenham Hotspur",
        "awayTeam": "Manchester City",
        "stadium": "Tottenham Hotspur Stadium",
        "city": "London",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 26,
    "dateRange": "Sat 27 Feb - Tue 02 Mar",
    "matches": [
      {
        "id": "epl-26-27-mw26-1",
        "matchweek": 26,
        "dateStr": "Sat 27 Feb",
        "fullDate": "2027-02-27",
        "timeBST": "18:30",
        "homeTeam": "AFC Bournemouth",
        "awayTeam": "Crystal Palace",
        "stadium": "Vitality Stadium",
        "city": "Bournemouth",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw26-2",
        "matchweek": 26,
        "dateStr": "Sat 27 Feb",
        "fullDate": "2027-02-27",
        "timeBST": "21:00",
        "homeTeam": "Arsenal",
        "awayTeam": "Fulham",
        "stadium": "Emirates Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw26-3",
        "matchweek": 26,
        "dateStr": "Sat 27 Feb",
        "fullDate": "2027-02-27",
        "timeBST": "21:00",
        "homeTeam": "Brentford",
        "awayTeam": "Coventry City",
        "stadium": "Gtech Community Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw26-4",
        "matchweek": 26,
        "dateStr": "Sat 27 Feb",
        "fullDate": "2027-02-27",
        "timeBST": "21:00",
        "homeTeam": "Brighton & Hove Albion",
        "awayTeam": "Tottenham Hotspur",
        "stadium": "American Express Stadium",
        "city": "Brighton",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw26-5",
        "matchweek": 26,
        "dateStr": "Sat 27 Feb",
        "fullDate": "2027-02-27",
        "timeBST": "21:00",
        "homeTeam": "Chelsea",
        "awayTeam": "Ipswich Town",
        "stadium": "Stamford Bridge",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw26-6",
        "matchweek": 26,
        "dateStr": "Sat 27 Feb",
        "fullDate": "2027-02-27",
        "timeBST": "23:30",
        "homeTeam": "Leeds United",
        "awayTeam": "Aston Villa",
        "stadium": "Elland Road",
        "city": "Leeds",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw26-7",
        "matchweek": 26,
        "dateStr": "Sun 28 Feb",
        "fullDate": "2027-02-28",
        "timeBST": "20:00",
        "homeTeam": "Liverpool",
        "awayTeam": "Hull City",
        "stadium": "Anfield",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw26-8",
        "matchweek": 26,
        "dateStr": "Sun 28 Feb",
        "fullDate": "2027-02-28",
        "timeBST": "20:00",
        "homeTeam": "Manchester City",
        "awayTeam": "Newcastle United",
        "stadium": "Etihad Stadium",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw26-9",
        "matchweek": 26,
        "dateStr": "Sun 28 Feb",
        "fullDate": "2027-02-28",
        "timeBST": "22:30",
        "homeTeam": "Nottingham Forest",
        "awayTeam": "Manchester United",
        "stadium": "City Ground",
        "city": "Nottingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw26-10",
        "matchweek": 26,
        "dateStr": "Tue 02 Mar",
        "fullDate": "2027-03-02",
        "timeBST": "02:00",
        "homeTeam": "Sunderland",
        "awayTeam": "Everton",
        "stadium": "Stadium of Light",
        "city": "Sunderland",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 27,
    "dateRange": "Sat 06 Mar - Tue 09 Mar",
    "matches": [
      {
        "id": "epl-26-27-mw27-1",
        "matchweek": 27,
        "dateStr": "Sat 06 Mar",
        "fullDate": "2027-03-06",
        "timeBST": "18:30",
        "homeTeam": "Aston Villa",
        "awayTeam": "Chelsea",
        "stadium": "Villa Park",
        "city": "Birmingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw27-2",
        "matchweek": 27,
        "dateStr": "Sat 06 Mar",
        "fullDate": "2027-03-06",
        "timeBST": "21:00",
        "homeTeam": "Coventry City",
        "awayTeam": "AFC Bournemouth",
        "stadium": "Coventry Building Society Arena",
        "city": "Coventry",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw27-3",
        "matchweek": 27,
        "dateStr": "Sat 06 Mar",
        "fullDate": "2027-03-06",
        "timeBST": "21:00",
        "homeTeam": "Crystal Palace",
        "awayTeam": "Sunderland",
        "stadium": "Selhurst Park",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw27-4",
        "matchweek": 27,
        "dateStr": "Sat 06 Mar",
        "fullDate": "2027-03-06",
        "timeBST": "21:00",
        "homeTeam": "Everton",
        "awayTeam": "Nottingham Forest",
        "stadium": "Goodison Park",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw27-5",
        "matchweek": 27,
        "dateStr": "Sat 06 Mar",
        "fullDate": "2027-03-06",
        "timeBST": "21:00",
        "homeTeam": "Fulham",
        "awayTeam": "Leeds United",
        "stadium": "Craven Cottage",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw27-6",
        "matchweek": 27,
        "dateStr": "Sat 06 Mar",
        "fullDate": "2027-03-06",
        "timeBST": "23:30",
        "homeTeam": "Hull City",
        "awayTeam": "Manchester City",
        "stadium": "MKM Stadium",
        "city": "Kingston upon Hull",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw27-7",
        "matchweek": 27,
        "dateStr": "Sun 07 Mar",
        "fullDate": "2027-03-07",
        "timeBST": "20:00",
        "homeTeam": "Ipswich Town",
        "awayTeam": "Brighton & Hove Albion",
        "stadium": "Portman Road",
        "city": "Ipswich",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw27-8",
        "matchweek": 27,
        "dateStr": "Sun 07 Mar",
        "fullDate": "2027-03-07",
        "timeBST": "20:00",
        "homeTeam": "Manchester United",
        "awayTeam": "Arsenal",
        "stadium": "Old Trafford",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw27-9",
        "matchweek": 27,
        "dateStr": "Sun 07 Mar",
        "fullDate": "2027-03-07",
        "timeBST": "22:30",
        "homeTeam": "Newcastle United",
        "awayTeam": "Brentford",
        "stadium": "St. James' Park",
        "city": "Newcastle upon Tyne",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw27-10",
        "matchweek": 27,
        "dateStr": "Tue 09 Mar",
        "fullDate": "2027-03-09",
        "timeBST": "02:00",
        "homeTeam": "Tottenham Hotspur",
        "awayTeam": "Liverpool",
        "stadium": "Tottenham Hotspur Stadium",
        "city": "London",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 28,
    "dateRange": "Sat 13 Mar - Tue 16 Mar",
    "matches": [
      {
        "id": "epl-26-27-mw28-1",
        "matchweek": 28,
        "dateStr": "Sat 13 Mar",
        "fullDate": "2027-03-13",
        "timeBST": "18:30",
        "homeTeam": "AFC Bournemouth",
        "awayTeam": "Tottenham Hotspur",
        "stadium": "Vitality Stadium",
        "city": "Bournemouth",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw28-2",
        "matchweek": 28,
        "dateStr": "Sat 13 Mar",
        "fullDate": "2027-03-13",
        "timeBST": "21:00",
        "homeTeam": "Arsenal",
        "awayTeam": "Crystal Palace",
        "stadium": "Emirates Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw28-3",
        "matchweek": 28,
        "dateStr": "Sat 13 Mar",
        "fullDate": "2027-03-13",
        "timeBST": "21:00",
        "homeTeam": "Brentford",
        "awayTeam": "Ipswich Town",
        "stadium": "Gtech Community Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw28-4",
        "matchweek": 28,
        "dateStr": "Sat 13 Mar",
        "fullDate": "2027-03-13",
        "timeBST": "21:00",
        "homeTeam": "Brighton & Hove Albion",
        "awayTeam": "Fulham",
        "stadium": "American Express Stadium",
        "city": "Brighton",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw28-5",
        "matchweek": 28,
        "dateStr": "Sat 13 Mar",
        "fullDate": "2027-03-13",
        "timeBST": "21:00",
        "homeTeam": "Chelsea",
        "awayTeam": "Coventry City",
        "stadium": "Stamford Bridge",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw28-6",
        "matchweek": 28,
        "dateStr": "Sat 13 Mar",
        "fullDate": "2027-03-13",
        "timeBST": "23:30",
        "homeTeam": "Leeds United",
        "awayTeam": "Hull City",
        "stadium": "Elland Road",
        "city": "Leeds",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw28-7",
        "matchweek": 28,
        "dateStr": "Sun 14 Mar",
        "fullDate": "2027-03-14",
        "timeBST": "20:00",
        "homeTeam": "Liverpool",
        "awayTeam": "Aston Villa",
        "stadium": "Anfield",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw28-8",
        "matchweek": 28,
        "dateStr": "Sun 14 Mar",
        "fullDate": "2027-03-14",
        "timeBST": "20:00",
        "homeTeam": "Manchester City",
        "awayTeam": "Everton",
        "stadium": "Etihad Stadium",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw28-9",
        "matchweek": 28,
        "dateStr": "Sun 14 Mar",
        "fullDate": "2027-03-14",
        "timeBST": "22:30",
        "homeTeam": "Nottingham Forest",
        "awayTeam": "Newcastle United",
        "stadium": "City Ground",
        "city": "Nottingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw28-10",
        "matchweek": 28,
        "dateStr": "Tue 16 Mar",
        "fullDate": "2027-03-16",
        "timeBST": "02:00",
        "homeTeam": "Sunderland",
        "awayTeam": "Manchester United",
        "stadium": "Stadium of Light",
        "city": "Sunderland",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 29,
    "dateRange": "Sat 03 Apr - Tue 06 Apr",
    "matches": [
      {
        "id": "epl-26-27-mw29-1",
        "matchweek": 29,
        "dateStr": "Sat 03 Apr",
        "fullDate": "2027-04-03",
        "timeBST": "17:30",
        "homeTeam": "AFC Bournemouth",
        "awayTeam": "Newcastle United",
        "stadium": "Vitality Stadium",
        "city": "Bournemouth",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw29-2",
        "matchweek": 29,
        "dateStr": "Sat 03 Apr",
        "fullDate": "2027-04-03",
        "timeBST": "20:00",
        "homeTeam": "Aston Villa",
        "awayTeam": "Hull City",
        "stadium": "Villa Park",
        "city": "Birmingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw29-3",
        "matchweek": 29,
        "dateStr": "Sat 03 Apr",
        "fullDate": "2027-04-03",
        "timeBST": "20:00",
        "homeTeam": "Chelsea",
        "awayTeam": "Arsenal",
        "stadium": "Stamford Bridge",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw29-4",
        "matchweek": 29,
        "dateStr": "Sat 03 Apr",
        "fullDate": "2027-04-03",
        "timeBST": "20:00",
        "homeTeam": "Coventry City",
        "awayTeam": "Manchester City",
        "stadium": "Coventry Building Society Arena",
        "city": "Coventry",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw29-5",
        "matchweek": 29,
        "dateStr": "Sat 03 Apr",
        "fullDate": "2027-04-03",
        "timeBST": "20:00",
        "homeTeam": "Crystal Palace",
        "awayTeam": "Fulham",
        "stadium": "Selhurst Park",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw29-6",
        "matchweek": 29,
        "dateStr": "Sat 03 Apr",
        "fullDate": "2027-04-03",
        "timeBST": "22:30",
        "homeTeam": "Leeds United",
        "awayTeam": "Brighton & Hove Albion",
        "stadium": "Elland Road",
        "city": "Leeds",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw29-7",
        "matchweek": 29,
        "dateStr": "Sun 04 Apr",
        "fullDate": "2027-04-04",
        "timeBST": "19:00",
        "homeTeam": "Liverpool",
        "awayTeam": "Ipswich Town",
        "stadium": "Anfield",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw29-8",
        "matchweek": 29,
        "dateStr": "Sun 04 Apr",
        "fullDate": "2027-04-04",
        "timeBST": "19:00",
        "homeTeam": "Manchester United",
        "awayTeam": "Everton",
        "stadium": "Old Trafford",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw29-9",
        "matchweek": 29,
        "dateStr": "Sun 04 Apr",
        "fullDate": "2027-04-04",
        "timeBST": "21:30",
        "homeTeam": "Sunderland",
        "awayTeam": "Brentford",
        "stadium": "Stadium of Light",
        "city": "Sunderland",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw29-10",
        "matchweek": 29,
        "dateStr": "Tue 06 Apr",
        "fullDate": "2027-04-06",
        "timeBST": "01:00",
        "homeTeam": "Tottenham Hotspur",
        "awayTeam": "Nottingham Forest",
        "stadium": "Tottenham Hotspur Stadium",
        "city": "London",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 30,
    "dateRange": "Thu 08 Apr - Fri 09 Apr",
    "matches": [
      {
        "id": "epl-26-27-mw30-1",
        "matchweek": 30,
        "dateStr": "Thu 08 Apr",
        "fullDate": "2027-04-08",
        "timeBST": "00:30",
        "homeTeam": "Arsenal",
        "awayTeam": "Sunderland",
        "stadium": "Emirates Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw30-2",
        "matchweek": 30,
        "dateStr": "Thu 08 Apr",
        "fullDate": "2027-04-08",
        "timeBST": "00:30",
        "homeTeam": "Brentford",
        "awayTeam": "AFC Bournemouth",
        "stadium": "Gtech Community Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw30-3",
        "matchweek": 30,
        "dateStr": "Thu 08 Apr",
        "fullDate": "2027-04-08",
        "timeBST": "00:30",
        "homeTeam": "Brighton & Hove Albion",
        "awayTeam": "Coventry City",
        "stadium": "American Express Stadium",
        "city": "Brighton",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw30-4",
        "matchweek": 30,
        "dateStr": "Thu 08 Apr",
        "fullDate": "2027-04-08",
        "timeBST": "00:30",
        "homeTeam": "Everton",
        "awayTeam": "Tottenham Hotspur",
        "stadium": "Goodison Park",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw30-5",
        "matchweek": 30,
        "dateStr": "Thu 08 Apr",
        "fullDate": "2027-04-08",
        "timeBST": "01:15",
        "homeTeam": "Fulham",
        "awayTeam": "Liverpool",
        "stadium": "Craven Cottage",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw30-6",
        "matchweek": 30,
        "dateStr": "Fri 09 Apr",
        "fullDate": "2027-04-09",
        "timeBST": "00:30",
        "homeTeam": "Hull City",
        "awayTeam": "Chelsea",
        "stadium": "MKM Stadium",
        "city": "Kingston upon Hull",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw30-7",
        "matchweek": 30,
        "dateStr": "Fri 09 Apr",
        "fullDate": "2027-04-09",
        "timeBST": "00:30",
        "homeTeam": "Ipswich Town",
        "awayTeam": "Crystal Palace",
        "stadium": "Portman Road",
        "city": "Ipswich",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw30-8",
        "matchweek": 30,
        "dateStr": "Fri 09 Apr",
        "fullDate": "2027-04-09",
        "timeBST": "00:30",
        "homeTeam": "Manchester City",
        "awayTeam": "Manchester United",
        "stadium": "Etihad Stadium",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw30-9",
        "matchweek": 30,
        "dateStr": "Fri 09 Apr",
        "fullDate": "2027-04-09",
        "timeBST": "00:30",
        "homeTeam": "Newcastle United",
        "awayTeam": "Leeds United",
        "stadium": "St. James' Park",
        "city": "Newcastle upon Tyne",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw30-10",
        "matchweek": 30,
        "dateStr": "Fri 09 Apr",
        "fullDate": "2027-04-09",
        "timeBST": "01:15",
        "homeTeam": "Nottingham Forest",
        "awayTeam": "Aston Villa",
        "stadium": "City Ground",
        "city": "Nottingham",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 31,
    "dateRange": "Sat 10 Apr - Tue 13 Apr",
    "matches": [
      {
        "id": "epl-26-27-mw31-1",
        "matchweek": 31,
        "dateStr": "Sat 10 Apr",
        "fullDate": "2027-04-10",
        "timeBST": "17:30",
        "homeTeam": "AFC Bournemouth",
        "awayTeam": "Manchester City",
        "stadium": "Vitality Stadium",
        "city": "Bournemouth",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw31-2",
        "matchweek": 31,
        "dateStr": "Sat 10 Apr",
        "fullDate": "2027-04-10",
        "timeBST": "20:00",
        "homeTeam": "Aston Villa",
        "awayTeam": "Brighton & Hove Albion",
        "stadium": "Villa Park",
        "city": "Birmingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw31-3",
        "matchweek": 31,
        "dateStr": "Sat 10 Apr",
        "fullDate": "2027-04-10",
        "timeBST": "20:00",
        "homeTeam": "Chelsea",
        "awayTeam": "Fulham",
        "stadium": "Stamford Bridge",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw31-4",
        "matchweek": 31,
        "dateStr": "Sat 10 Apr",
        "fullDate": "2027-04-10",
        "timeBST": "20:00",
        "homeTeam": "Coventry City",
        "awayTeam": "Arsenal",
        "stadium": "Coventry Building Society Arena",
        "city": "Coventry",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw31-5",
        "matchweek": 31,
        "dateStr": "Sat 10 Apr",
        "fullDate": "2027-04-10",
        "timeBST": "20:00",
        "homeTeam": "Crystal Palace",
        "awayTeam": "Everton",
        "stadium": "Selhurst Park",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw31-6",
        "matchweek": 31,
        "dateStr": "Sat 10 Apr",
        "fullDate": "2027-04-10",
        "timeBST": "22:30",
        "homeTeam": "Leeds United",
        "awayTeam": "Nottingham Forest",
        "stadium": "Elland Road",
        "city": "Leeds",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw31-7",
        "matchweek": 31,
        "dateStr": "Sun 11 Apr",
        "fullDate": "2027-04-11",
        "timeBST": "19:00",
        "homeTeam": "Liverpool",
        "awayTeam": "Newcastle United",
        "stadium": "Anfield",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw31-8",
        "matchweek": 31,
        "dateStr": "Sun 11 Apr",
        "fullDate": "2027-04-11",
        "timeBST": "19:00",
        "homeTeam": "Manchester United",
        "awayTeam": "Hull City",
        "stadium": "Old Trafford",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw31-9",
        "matchweek": 31,
        "dateStr": "Sun 11 Apr",
        "fullDate": "2027-04-11",
        "timeBST": "21:30",
        "homeTeam": "Sunderland",
        "awayTeam": "Ipswich Town",
        "stadium": "Stadium of Light",
        "city": "Sunderland",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw31-10",
        "matchweek": 31,
        "dateStr": "Tue 13 Apr",
        "fullDate": "2027-04-13",
        "timeBST": "01:00",
        "homeTeam": "Tottenham Hotspur",
        "awayTeam": "Brentford",
        "stadium": "Tottenham Hotspur Stadium",
        "city": "London",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 32,
    "dateRange": "Sat 17 Apr - Tue 20 Apr",
    "matches": [
      {
        "id": "epl-26-27-mw32-1",
        "matchweek": 32,
        "dateStr": "Sat 17 Apr",
        "fullDate": "2027-04-17",
        "timeBST": "17:30",
        "homeTeam": "Arsenal",
        "awayTeam": "Aston Villa",
        "stadium": "Emirates Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw32-2",
        "matchweek": 32,
        "dateStr": "Sat 17 Apr",
        "fullDate": "2027-04-17",
        "timeBST": "20:00",
        "homeTeam": "Brentford",
        "awayTeam": "Leeds United",
        "stadium": "Gtech Community Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw32-3",
        "matchweek": 32,
        "dateStr": "Sat 17 Apr",
        "fullDate": "2027-04-17",
        "timeBST": "20:00",
        "homeTeam": "Brighton & Hove Albion",
        "awayTeam": "Chelsea",
        "stadium": "American Express Stadium",
        "city": "Brighton",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw32-4",
        "matchweek": 32,
        "dateStr": "Sat 17 Apr",
        "fullDate": "2027-04-17",
        "timeBST": "20:00",
        "homeTeam": "Everton",
        "awayTeam": "AFC Bournemouth",
        "stadium": "Goodison Park",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw32-5",
        "matchweek": 32,
        "dateStr": "Sat 17 Apr",
        "fullDate": "2027-04-17",
        "timeBST": "20:00",
        "homeTeam": "Fulham",
        "awayTeam": "Sunderland",
        "stadium": "Craven Cottage",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw32-6",
        "matchweek": 32,
        "dateStr": "Sat 17 Apr",
        "fullDate": "2027-04-17",
        "timeBST": "22:30",
        "homeTeam": "Hull City",
        "awayTeam": "Coventry City",
        "stadium": "MKM Stadium",
        "city": "Kingston upon Hull",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw32-7",
        "matchweek": 32,
        "dateStr": "Sun 18 Apr",
        "fullDate": "2027-04-18",
        "timeBST": "19:00",
        "homeTeam": "Ipswich Town",
        "awayTeam": "Manchester United",
        "stadium": "Portman Road",
        "city": "Ipswich",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw32-8",
        "matchweek": 32,
        "dateStr": "Sun 18 Apr",
        "fullDate": "2027-04-18",
        "timeBST": "19:00",
        "homeTeam": "Manchester City",
        "awayTeam": "Crystal Palace",
        "stadium": "Etihad Stadium",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw32-9",
        "matchweek": 32,
        "dateStr": "Sun 18 Apr",
        "fullDate": "2027-04-18",
        "timeBST": "21:30",
        "homeTeam": "Newcastle United",
        "awayTeam": "Tottenham Hotspur",
        "stadium": "St. James' Park",
        "city": "Newcastle upon Tyne",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw32-10",
        "matchweek": 32,
        "dateStr": "Tue 20 Apr",
        "fullDate": "2027-04-20",
        "timeBST": "01:00",
        "homeTeam": "Nottingham Forest",
        "awayTeam": "Liverpool",
        "stadium": "City Ground",
        "city": "Nottingham",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 33,
    "dateRange": "Sat 24 Apr - Tue 27 Apr",
    "matches": [
      {
        "id": "epl-26-27-mw33-1",
        "matchweek": 33,
        "dateStr": "Sat 24 Apr",
        "fullDate": "2027-04-24",
        "timeBST": "17:30",
        "homeTeam": "AFC Bournemouth",
        "awayTeam": "Arsenal",
        "stadium": "Vitality Stadium",
        "city": "Bournemouth",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw33-2",
        "matchweek": 33,
        "dateStr": "Sat 24 Apr",
        "fullDate": "2027-04-24",
        "timeBST": "20:00",
        "homeTeam": "Aston Villa",
        "awayTeam": "Coventry City",
        "stadium": "Villa Park",
        "city": "Birmingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw33-3",
        "matchweek": 33,
        "dateStr": "Sat 24 Apr",
        "fullDate": "2027-04-24",
        "timeBST": "20:00",
        "homeTeam": "Brentford",
        "awayTeam": "Fulham",
        "stadium": "Gtech Community Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw33-4",
        "matchweek": 33,
        "dateStr": "Sat 24 Apr",
        "fullDate": "2027-04-24",
        "timeBST": "20:00",
        "homeTeam": "Chelsea",
        "awayTeam": "Manchester City",
        "stadium": "Stamford Bridge",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw33-5",
        "matchweek": 33,
        "dateStr": "Sat 24 Apr",
        "fullDate": "2027-04-24",
        "timeBST": "20:00",
        "homeTeam": "Everton",
        "awayTeam": "Brighton & Hove Albion",
        "stadium": "Goodison Park",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw33-6",
        "matchweek": 33,
        "dateStr": "Sat 24 Apr",
        "fullDate": "2027-04-24",
        "timeBST": "22:30",
        "homeTeam": "Leeds United",
        "awayTeam": "Liverpool",
        "stadium": "Elland Road",
        "city": "Leeds",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw33-7",
        "matchweek": 33,
        "dateStr": "Sun 25 Apr",
        "fullDate": "2027-04-25",
        "timeBST": "19:00",
        "homeTeam": "Manchester United",
        "awayTeam": "Crystal Palace",
        "stadium": "Old Trafford",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw33-8",
        "matchweek": 33,
        "dateStr": "Sun 25 Apr",
        "fullDate": "2027-04-25",
        "timeBST": "19:00",
        "homeTeam": "Newcastle United",
        "awayTeam": "Ipswich Town",
        "stadium": "St. James' Park",
        "city": "Newcastle upon Tyne",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw33-9",
        "matchweek": 33,
        "dateStr": "Sun 25 Apr",
        "fullDate": "2027-04-25",
        "timeBST": "21:30",
        "homeTeam": "Nottingham Forest",
        "awayTeam": "Sunderland",
        "stadium": "City Ground",
        "city": "Nottingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw33-10",
        "matchweek": 33,
        "dateStr": "Tue 27 Apr",
        "fullDate": "2027-04-27",
        "timeBST": "01:00",
        "homeTeam": "Tottenham Hotspur",
        "awayTeam": "Hull City",
        "stadium": "Tottenham Hotspur Stadium",
        "city": "London",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 34,
    "dateRange": "Sat 01 May - Tue 04 May",
    "matches": [
      {
        "id": "epl-26-27-mw34-1",
        "matchweek": 34,
        "dateStr": "Sat 01 May",
        "fullDate": "2027-05-01",
        "timeBST": "17:30",
        "homeTeam": "Arsenal",
        "awayTeam": "Tottenham Hotspur",
        "stadium": "Emirates Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw34-2",
        "matchweek": 34,
        "dateStr": "Sat 01 May",
        "fullDate": "2027-05-01",
        "timeBST": "20:00",
        "homeTeam": "Brighton & Hove Albion",
        "awayTeam": "Nottingham Forest",
        "stadium": "American Express Stadium",
        "city": "Brighton",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw34-3",
        "matchweek": 34,
        "dateStr": "Sat 01 May",
        "fullDate": "2027-05-01",
        "timeBST": "20:00",
        "homeTeam": "Coventry City",
        "awayTeam": "Manchester United",
        "stadium": "Coventry Building Society Arena",
        "city": "Coventry",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw34-4",
        "matchweek": 34,
        "dateStr": "Sat 01 May",
        "fullDate": "2027-05-01",
        "timeBST": "20:00",
        "homeTeam": "Crystal Palace",
        "awayTeam": "Aston Villa",
        "stadium": "Selhurst Park",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw34-5",
        "matchweek": 34,
        "dateStr": "Sat 01 May",
        "fullDate": "2027-05-01",
        "timeBST": "20:00",
        "homeTeam": "Fulham",
        "awayTeam": "Everton",
        "stadium": "Craven Cottage",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw34-6",
        "matchweek": 34,
        "dateStr": "Sat 01 May",
        "fullDate": "2027-05-01",
        "timeBST": "22:30",
        "homeTeam": "Hull City",
        "awayTeam": "AFC Bournemouth",
        "stadium": "MKM Stadium",
        "city": "Kingston upon Hull",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw34-7",
        "matchweek": 34,
        "dateStr": "Sun 02 May",
        "fullDate": "2027-05-02",
        "timeBST": "19:00",
        "homeTeam": "Ipswich Town",
        "awayTeam": "Leeds United",
        "stadium": "Portman Road",
        "city": "Ipswich",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw34-8",
        "matchweek": 34,
        "dateStr": "Sun 02 May",
        "fullDate": "2027-05-02",
        "timeBST": "19:00",
        "homeTeam": "Liverpool",
        "awayTeam": "Chelsea",
        "stadium": "Anfield",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw34-9",
        "matchweek": 34,
        "dateStr": "Sun 02 May",
        "fullDate": "2027-05-02",
        "timeBST": "21:30",
        "homeTeam": "Manchester City",
        "awayTeam": "Brentford",
        "stadium": "Etihad Stadium",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw34-10",
        "matchweek": 34,
        "dateStr": "Tue 04 May",
        "fullDate": "2027-05-04",
        "timeBST": "01:00",
        "homeTeam": "Sunderland",
        "awayTeam": "Newcastle United",
        "stadium": "Stadium of Light",
        "city": "Sunderland",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 35,
    "dateRange": "Sat 08 May - Tue 11 May",
    "matches": [
      {
        "id": "epl-26-27-mw35-1",
        "matchweek": 35,
        "dateStr": "Sat 08 May",
        "fullDate": "2027-05-08",
        "timeBST": "17:30",
        "homeTeam": "AFC Bournemouth",
        "awayTeam": "Manchester United",
        "stadium": "Vitality Stadium",
        "city": "Bournemouth",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw35-2",
        "matchweek": 35,
        "dateStr": "Sat 08 May",
        "fullDate": "2027-05-08",
        "timeBST": "20:00",
        "homeTeam": "Brentford",
        "awayTeam": "Aston Villa",
        "stadium": "Gtech Community Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw35-3",
        "matchweek": 35,
        "dateStr": "Sat 08 May",
        "fullDate": "2027-05-08",
        "timeBST": "20:00",
        "homeTeam": "Brighton & Hove Albion",
        "awayTeam": "Sunderland",
        "stadium": "American Express Stadium",
        "city": "Brighton",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw35-4",
        "matchweek": 35,
        "dateStr": "Sat 08 May",
        "fullDate": "2027-05-08",
        "timeBST": "20:00",
        "homeTeam": "Everton",
        "awayTeam": "Hull City",
        "stadium": "Goodison Park",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw35-5",
        "matchweek": 35,
        "dateStr": "Sat 08 May",
        "fullDate": "2027-05-08",
        "timeBST": "20:00",
        "homeTeam": "Fulham",
        "awayTeam": "Ipswich Town",
        "stadium": "Craven Cottage",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw35-6",
        "matchweek": 35,
        "dateStr": "Sat 08 May",
        "fullDate": "2027-05-08",
        "timeBST": "22:30",
        "homeTeam": "Leeds United",
        "awayTeam": "Arsenal",
        "stadium": "Elland Road",
        "city": "Leeds",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw35-7",
        "matchweek": 35,
        "dateStr": "Sun 09 May",
        "fullDate": "2027-05-09",
        "timeBST": "19:00",
        "homeTeam": "Manchester City",
        "awayTeam": "Liverpool",
        "stadium": "Etihad Stadium",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw35-8",
        "matchweek": 35,
        "dateStr": "Sun 09 May",
        "fullDate": "2027-05-09",
        "timeBST": "19:00",
        "homeTeam": "Newcastle United",
        "awayTeam": "Coventry City",
        "stadium": "St. James' Park",
        "city": "Newcastle upon Tyne",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw35-9",
        "matchweek": 35,
        "dateStr": "Sun 09 May",
        "fullDate": "2027-05-09",
        "timeBST": "21:30",
        "homeTeam": "Nottingham Forest",
        "awayTeam": "Crystal Palace",
        "stadium": "City Ground",
        "city": "Nottingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw35-10",
        "matchweek": 35,
        "dateStr": "Tue 11 May",
        "fullDate": "2027-05-11",
        "timeBST": "01:00",
        "homeTeam": "Tottenham Hotspur",
        "awayTeam": "Chelsea",
        "stadium": "Tottenham Hotspur Stadium",
        "city": "London",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 36,
    "dateRange": "Sat 15 May - Tue 18 May",
    "matches": [
      {
        "id": "epl-26-27-mw36-1",
        "matchweek": 36,
        "dateStr": "Sat 15 May",
        "fullDate": "2027-05-15",
        "timeBST": "17:30",
        "homeTeam": "Arsenal",
        "awayTeam": "Nottingham Forest",
        "stadium": "Emirates Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw36-2",
        "matchweek": 36,
        "dateStr": "Sat 15 May",
        "fullDate": "2027-05-15",
        "timeBST": "20:00",
        "homeTeam": "Aston Villa",
        "awayTeam": "Newcastle United",
        "stadium": "Villa Park",
        "city": "Birmingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw36-3",
        "matchweek": 36,
        "dateStr": "Sat 15 May",
        "fullDate": "2027-05-15",
        "timeBST": "20:00",
        "homeTeam": "Chelsea",
        "awayTeam": "Everton",
        "stadium": "Stamford Bridge",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw36-4",
        "matchweek": 36,
        "dateStr": "Sat 15 May",
        "fullDate": "2027-05-15",
        "timeBST": "20:00",
        "homeTeam": "Coventry City",
        "awayTeam": "Tottenham Hotspur",
        "stadium": "Coventry Building Society Arena",
        "city": "Coventry",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw36-5",
        "matchweek": 36,
        "dateStr": "Sat 15 May",
        "fullDate": "2027-05-15",
        "timeBST": "20:00",
        "homeTeam": "Crystal Palace",
        "awayTeam": "Brighton & Hove Albion",
        "stadium": "Selhurst Park",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw36-6",
        "matchweek": 36,
        "dateStr": "Sat 15 May",
        "fullDate": "2027-05-15",
        "timeBST": "22:30",
        "homeTeam": "Hull City",
        "awayTeam": "Fulham",
        "stadium": "MKM Stadium",
        "city": "Kingston upon Hull",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw36-7",
        "matchweek": 36,
        "dateStr": "Sun 16 May",
        "fullDate": "2027-05-16",
        "timeBST": "19:00",
        "homeTeam": "Ipswich Town",
        "awayTeam": "Manchester City",
        "stadium": "Portman Road",
        "city": "Ipswich",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw36-8",
        "matchweek": 36,
        "dateStr": "Sun 16 May",
        "fullDate": "2027-05-16",
        "timeBST": "19:00",
        "homeTeam": "Liverpool",
        "awayTeam": "Brentford",
        "stadium": "Anfield",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw36-9",
        "matchweek": 36,
        "dateStr": "Sun 16 May",
        "fullDate": "2027-05-16",
        "timeBST": "21:30",
        "homeTeam": "Manchester United",
        "awayTeam": "Leeds United",
        "stadium": "Old Trafford",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw36-10",
        "matchweek": 36,
        "dateStr": "Tue 18 May",
        "fullDate": "2027-05-18",
        "timeBST": "01:00",
        "homeTeam": "Sunderland",
        "awayTeam": "AFC Bournemouth",
        "stadium": "Stadium of Light",
        "city": "Sunderland",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 37,
    "dateRange": "Sat 22 May - Tue 25 May",
    "matches": [
      {
        "id": "epl-26-27-mw37-1",
        "matchweek": 37,
        "dateStr": "Sat 22 May",
        "fullDate": "2027-05-22",
        "timeBST": "17:30",
        "homeTeam": "AFC Bournemouth",
        "awayTeam": "Chelsea",
        "stadium": "Vitality Stadium",
        "city": "Bournemouth",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw37-2",
        "matchweek": 37,
        "dateStr": "Sat 22 May",
        "fullDate": "2027-05-22",
        "timeBST": "20:00",
        "homeTeam": "Brentford",
        "awayTeam": "Hull City",
        "stadium": "Gtech Community Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw37-3",
        "matchweek": 37,
        "dateStr": "Sat 22 May",
        "fullDate": "2027-05-22",
        "timeBST": "20:00",
        "homeTeam": "Brighton & Hove Albion",
        "awayTeam": "Liverpool",
        "stadium": "American Express Stadium",
        "city": "Brighton",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw37-4",
        "matchweek": 37,
        "dateStr": "Sat 22 May",
        "fullDate": "2027-05-22",
        "timeBST": "20:00",
        "homeTeam": "Everton",
        "awayTeam": "Arsenal",
        "stadium": "Goodison Park",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw37-5",
        "matchweek": 37,
        "dateStr": "Sat 22 May",
        "fullDate": "2027-05-22",
        "timeBST": "20:00",
        "homeTeam": "Fulham",
        "awayTeam": "Coventry City",
        "stadium": "Craven Cottage",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw37-6",
        "matchweek": 37,
        "dateStr": "Sat 22 May",
        "fullDate": "2027-05-22",
        "timeBST": "22:30",
        "homeTeam": "Leeds United",
        "awayTeam": "Sunderland",
        "stadium": "Elland Road",
        "city": "Leeds",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw37-7",
        "matchweek": 37,
        "dateStr": "Sun 23 May",
        "fullDate": "2027-05-23",
        "timeBST": "19:00",
        "homeTeam": "Manchester City",
        "awayTeam": "Aston Villa",
        "stadium": "Etihad Stadium",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw37-8",
        "matchweek": 37,
        "dateStr": "Sun 23 May",
        "fullDate": "2027-05-23",
        "timeBST": "19:00",
        "homeTeam": "Newcastle United",
        "awayTeam": "Crystal Palace",
        "stadium": "St. James' Park",
        "city": "Newcastle upon Tyne",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw37-9",
        "matchweek": 37,
        "dateStr": "Sun 23 May",
        "fullDate": "2027-05-23",
        "timeBST": "21:30",
        "homeTeam": "Nottingham Forest",
        "awayTeam": "Ipswich Town",
        "stadium": "City Ground",
        "city": "Nottingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw37-10",
        "matchweek": 37,
        "dateStr": "Tue 25 May",
        "fullDate": "2027-05-25",
        "timeBST": "01:00",
        "homeTeam": "Tottenham Hotspur",
        "awayTeam": "Manchester United",
        "stadium": "Tottenham Hotspur Stadium",
        "city": "London",
        "status": "UPCOMING"
      }
    ]
  },
  {
    "matchweek": 38,
    "dateRange": "Sun 30 May",
    "matches": [
      {
        "id": "epl-26-27-mw38-1",
        "matchweek": 38,
        "dateStr": "Sun 30 May",
        "fullDate": "2027-05-30",
        "timeBST": "21:00",
        "homeTeam": "Arsenal",
        "awayTeam": "Brighton & Hove Albion",
        "stadium": "Emirates Stadium",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw38-2",
        "matchweek": 38,
        "dateStr": "Sun 30 May",
        "fullDate": "2027-05-30",
        "timeBST": "21:00",
        "homeTeam": "Aston Villa",
        "awayTeam": "Tottenham Hotspur",
        "stadium": "Villa Park",
        "city": "Birmingham",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw38-3",
        "matchweek": 38,
        "dateStr": "Sun 30 May",
        "fullDate": "2027-05-30",
        "timeBST": "21:00",
        "homeTeam": "Chelsea",
        "awayTeam": "Brentford",
        "stadium": "Stamford Bridge",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw38-4",
        "matchweek": 38,
        "dateStr": "Sun 30 May",
        "fullDate": "2027-05-30",
        "timeBST": "21:00",
        "homeTeam": "Coventry City",
        "awayTeam": "Nottingham Forest",
        "stadium": "Coventry Building Society Arena",
        "city": "Coventry",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw38-5",
        "matchweek": 38,
        "dateStr": "Sun 30 May",
        "fullDate": "2027-05-30",
        "timeBST": "21:00",
        "homeTeam": "Crystal Palace",
        "awayTeam": "Leeds United",
        "stadium": "Selhurst Park",
        "city": "London",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw38-6",
        "matchweek": 38,
        "dateStr": "Sun 30 May",
        "fullDate": "2027-05-30",
        "timeBST": "21:00",
        "homeTeam": "Hull City",
        "awayTeam": "Newcastle United",
        "stadium": "MKM Stadium",
        "city": "Kingston upon Hull",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw38-7",
        "matchweek": 38,
        "dateStr": "Sun 30 May",
        "fullDate": "2027-05-30",
        "timeBST": "21:00",
        "homeTeam": "Ipswich Town",
        "awayTeam": "Everton",
        "stadium": "Portman Road",
        "city": "Ipswich",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw38-8",
        "matchweek": 38,
        "dateStr": "Sun 30 May",
        "fullDate": "2027-05-30",
        "timeBST": "21:00",
        "homeTeam": "Liverpool",
        "awayTeam": "AFC Bournemouth",
        "stadium": "Anfield",
        "city": "Liverpool",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw38-9",
        "matchweek": 38,
        "dateStr": "Sun 30 May",
        "fullDate": "2027-05-30",
        "timeBST": "21:00",
        "homeTeam": "Manchester United",
        "awayTeam": "Fulham",
        "stadium": "Old Trafford",
        "city": "Manchester",
        "status": "UPCOMING"
      },
      {
        "id": "epl-26-27-mw38-10",
        "matchweek": 38,
        "dateStr": "Sun 30 May",
        "fullDate": "2027-05-30",
        "timeBST": "21:00",
        "homeTeam": "Sunderland",
        "awayTeam": "Manchester City",
        "stadium": "Stadium of Light",
        "city": "Sunderland",
        "status": "UPCOMING"
      }
    ]
  }
];


/**
 * Retrieve a specific matchweek's schedule (1 to 38).
 */
export function getMatchweekSchedule(week: number): MatchweekSchedule | undefined {
  return EPL_2026_27_FIXTURES.find((s) => s.matchweek === week);
}

/**
 * Get all 380 fixtures flat array.
 */
export function getAllFixtures(): EPLFixture[] {
  return EPL_2026_27_FIXTURES.flatMap((s) => s.matches);
}

/**
 * Get all fixtures for a specific team.
 */
export function getFixturesForTeam(teamName: string): EPLFixture[] {
  const query = teamName.toLowerCase().trim();
  return getAllFixtures().filter(
    (m) =>
      m.homeTeam.toLowerCase().includes(query) ||
      m.awayTeam.toLowerCase().includes(query)
  );
}
