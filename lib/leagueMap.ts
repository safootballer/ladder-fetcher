// Static mapping of grade_id -> category hierarchy
// No DB changes needed — purely frontend grouping

export interface LeagueCategory {
  level1: string   // Main category e.g. "SANFL", "Adelaide Footy League (Men's)", "Country Football"
  level2: string   // Sub-category e.g. "League", "Reserves", "C-Grade", "Eastern Eyre"
  level3: string   // Grade label e.g. "Division 1", "A-Grade", "Reserves"
  sortOrder: number
}

export const LEAGUE_MAP: Record<string, LeagueCategory> = {
  // ── SANFL ─────────────────────────────────────────────────────────
  'e85894b8': { level1: 'SANFL', level2: 'League',   level3: 'SANFL League',    sortOrder: 1 },
  'e765432b': { level1: 'SANFL', level2: 'Reserves', level3: 'SANFL Reserves',  sortOrder: 2 },
  '19b30dd1': { level1: 'SANFL', level2: 'Youth',    level3: 'Under 18',        sortOrder: 3 },
  '46b49907': { level1: 'SANFL', level2: 'Youth',    level3: 'Under 16',        sortOrder: 4 },

  // ── Adelaide Footy League Men's — League ──────────────────────────
  '8eecd4b0': { level1: "Adelaide Footy League (Men's)", level2: 'League',   level3: 'Division 1',  sortOrder: 1 },
  '85247b82': { level1: "Adelaide Footy League (Men's)", level2: 'League',   level3: 'Division 2',  sortOrder: 2 },
  '372b55e9': { level1: "Adelaide Footy League (Men's)", level2: 'League',   level3: 'Division 3',  sortOrder: 3 },
  '22794d03': { level1: "Adelaide Footy League (Men's)", level2: 'League',   level3: 'Division 4',  sortOrder: 4 },
  '372d8776': { level1: "Adelaide Footy League (Men's)", level2: 'League',   level3: 'Division 5',  sortOrder: 5 },
  '961ce426': { level1: "Adelaide Footy League (Men's)", level2: 'League',   level3: 'Division 6',  sortOrder: 6 },
  '43b5cc78': { level1: "Adelaide Footy League (Men's)", level2: 'League',   level3: 'Division 7',  sortOrder: 7 },

  // ── Adelaide Footy League Men's — Reserves ────────────────────────
  '1f82c881': { level1: "Adelaide Footy League (Men's)", level2: 'Reserves', level3: 'Division 1 Reserves', sortOrder: 1 },
  '8ebba3c8': { level1: "Adelaide Footy League (Men's)", level2: 'Reserves', level3: 'Division 2 Reserves', sortOrder: 2 },
  'b9156c34': { level1: "Adelaide Footy League (Men's)", level2: 'Reserves', level3: 'Division 3 Reserves', sortOrder: 3 },
  '692c9b17': { level1: "Adelaide Footy League (Men's)", level2: 'Reserves', level3: 'Division 4 Reserves', sortOrder: 4 },
  'cedbc98d': { level1: "Adelaide Footy League (Men's)", level2: 'Reserves', level3: 'Division 5 Reserves', sortOrder: 5 },
  '3beb6a9e': { level1: "Adelaide Footy League (Men's)", level2: 'Reserves', level3: 'Division 6 Reserves', sortOrder: 6 },
  '1991ba25': { level1: "Adelaide Footy League (Men's)", level2: 'Reserves', level3: 'Division 7 Reserves', sortOrder: 7 },

  // ── Adelaide Footy League Men's — C-Grade ─────────────────────────
  'd7fe9dd5': { level1: "Adelaide Footy League (Men's)", level2: 'C-Grade', level3: 'Division C1', sortOrder: 1 },
  'aea638ff': { level1: "Adelaide Footy League (Men's)", level2: 'C-Grade', level3: 'Division C2', sortOrder: 2 },
  '256a623b': { level1: "Adelaide Footy League (Men's)", level2: 'C-Grade', level3: 'Division C3', sortOrder: 3 },
  '1bd8ff22': { level1: "Adelaide Footy League (Men's)", level2: 'C-Grade', level3: 'Division C4', sortOrder: 4 },
  '792996a6': { level1: "Adelaide Footy League (Men's)", level2: 'C-Grade', level3: 'Division C5', sortOrder: 5 },
  'a645b2ca': { level1: "Adelaide Footy League (Men's)", level2: 'C-Grade', level3: 'Division C6', sortOrder: 6 },
  '69f075a6': { level1: "Adelaide Footy League (Men's)", level2: 'C-Grade', level3: 'Division C7', sortOrder: 7 },
  'a374a910': { level1: "Adelaide Footy League (Men's)", level2: 'C-Grade', level3: 'Division C8', sortOrder: 8 },

  // ── SAWFL Women's ─────────────────────────────────────────────────
  '012b743d': { level1: "SAWFL Women's", level2: 'League',   level3: 'Division 1',          sortOrder: 1 },
  '56ad9865': { level1: "SAWFL Women's", level2: 'Reserves', level3: 'Division 1 Reserves',  sortOrder: 2 },
  'c54fb997': { level1: "SAWFL Women's", level2: 'League',   level3: 'Division 2',          sortOrder: 3 },
  '0d9cc3ac': { level1: "SAWFL Women's", level2: 'Reserves', level3: 'Division 2 Reserves',  sortOrder: 4 },
  '68158f54': { level1: "SAWFL Women's", level2: 'League',   level3: 'Division 3',          sortOrder: 5 },
  'c7355be5': { level1: "SAWFL Women's", level2: 'League',   level3: 'Division 4',          sortOrder: 6 },
  '387394cc': { level1: "SAWFL Women's", level2: 'League',   level3: 'Division 5',          sortOrder: 7 },
  '629dbe72': { level1: "SAWFL Women's", level2: 'League',   level3: 'Division 6',          sortOrder: 8 },

  // ── Country Football — Adelaide Plains ────────────────────────────
  'a1193711': { level1: 'Country Football', level2: 'Adelaide Plains', level3: 'A-Grade',      sortOrder: 1 },
  '07231f49': { level1: 'Country Football', level2: 'Adelaide Plains', level3: 'Reserves',     sortOrder: 2 },
  'cbc71288': { level1: 'Country Football', level2: 'Adelaide Plains', level3: 'Senior Colts', sortOrder: 3 },
  '78e0b10e': { level1: 'Country Football', level2: 'Adelaide Plains', level3: 'Junior Colts', sortOrder: 4 },

  // ── Country Football — Barossa Light & Gawler ─────────────────────
  '0c377632': { level1: 'Country Football', level2: 'Barossa Light & Gawler', level3: 'A-Grade',      sortOrder: 1 },
  '26e986f1': { level1: 'Country Football', level2: 'Barossa Light & Gawler', level3: 'Reserves',     sortOrder: 2 },
  '35d9e10b': { level1: 'Country Football', level2: 'Barossa Light & Gawler', level3: 'Senior Colts', sortOrder: 3 },
  'bceca0c3': { level1: 'Country Football', level2: 'Barossa Light & Gawler', level3: 'Junior Colts', sortOrder: 4 },

  // ── Country Football — Eastern Eyre ───────────────────────────────
  'fd121b36': { level1: 'Country Football', level2: 'Eastern Eyre', level3: 'A-Grade',      sortOrder: 1 },
  'bc380341': { level1: 'Country Football', level2: 'Eastern Eyre', level3: 'Reserves',     sortOrder: 2 },
  '8c1ac606': { level1: 'Country Football', level2: 'Eastern Eyre', level3: 'Senior Colts', sortOrder: 3 },
  '56c92641': { level1: 'Country Football', level2: 'Eastern Eyre', level3: 'Junior Colts', sortOrder: 4 },

  // ── Country Football — Far North ──────────────────────────────────
  'b5646c2c': { level1: 'Country Football', level2: 'Far North', level3: 'A-Grade',      sortOrder: 1 },
  'e5805142': { level1: 'Country Football', level2: 'Far North', level3: 'Junior Colts', sortOrder: 2 },

  // ── Country Football — Great Flinders ─────────────────────────────
  '3f7d4672': { level1: 'Country Football', level2: 'Great Flinders', level3: 'A-Grade',      sortOrder: 1 },
  '5a3596f6': { level1: 'Country Football', level2: 'Great Flinders', level3: 'Reserves',     sortOrder: 2 },
  '2a093764': { level1: 'Country Football', level2: 'Great Flinders', level3: 'Senior Colts', sortOrder: 3 },
  'f5fad00c': { level1: 'Country Football', level2: 'Great Flinders', level3: 'Junior Colts', sortOrder: 4 },

  // ── Country Football — Great Southern ─────────────────────────────
  '35f25f18': { level1: 'Country Football', level2: 'Great Southern', level3: 'A-Grade',      sortOrder: 1 },
  '6ccb9e50': { level1: 'Country Football', level2: 'Great Southern', level3: 'Reserves',     sortOrder: 2 },
  'ae578dbb': { level1: 'Country Football', level2: 'Great Southern', level3: 'Senior Colts', sortOrder: 3 },
  '790d3b6b': { level1: 'Country Football', level2: 'Great Southern', level3: 'Junior Colts', sortOrder: 4 },

  // ── Country Football — Hills Division 1 ───────────────────────────
  '9fa96325': { level1: 'Country Football', level2: 'Hills Division 1', level3: 'A-Grade',      sortOrder: 1 },
  '252cc0fc': { level1: 'Country Football', level2: 'Hills Division 1', level3: 'Reserves',     sortOrder: 2 },
  'fab04c15': { level1: 'Country Football', level2: 'Hills Division 1', level3: 'Senior Colts', sortOrder: 3 },
  '87dfe238': { level1: 'Country Football', level2: 'Hills Division 1', level3: 'Junior Colts', sortOrder: 4 },

  // ── Country Football — Hills Country Division ─────────────────────
  '548b101d': { level1: 'Country Football', level2: 'Hills Country Division', level3: 'A-Grade',      sortOrder: 1 },
  '2319ccf5': { level1: 'Country Football', level2: 'Hills Country Division', level3: 'Reserves',     sortOrder: 2 },
  '867e1b0d': { level1: 'Country Football', level2: 'Hills Country Division', level3: 'Senior Colts', sortOrder: 3 },
  '1b92ab6c': { level1: 'Country Football', level2: 'Hills Country Division', level3: 'Junior Colts', sortOrder: 4 },

  // ── Country Football — Kangaroo Island ────────────────────────────
  '013fe3b3': { level1: 'Country Football', level2: 'Kangaroo Island', level3: 'A-Grade',      sortOrder: 1 },
  'd5028549': { level1: 'Country Football', level2: 'Kangaroo Island', level3: 'Reserves',     sortOrder: 2 },
  '8e7ab005': { level1: 'Country Football', level2: 'Kangaroo Island', level3: 'Senior Colts', sortOrder: 3 },
  '9adb3e22': { level1: 'Country Football', level2: 'Kangaroo Island', level3: 'Junior Colts', sortOrder: 4 },

  // ── Country Football — Kowree Naracoorte Tatiara ──────────────────
  'bf0e8fc4': { level1: 'Country Football', level2: 'Kowree Naracoorte Tatiara', level3: 'A-Grade',      sortOrder: 1 },
  'ed9199ea': { level1: 'Country Football', level2: 'Kowree Naracoorte Tatiara', level3: 'Reserves',     sortOrder: 2 },
  'ce5a47d5': { level1: 'Country Football', level2: 'Kowree Naracoorte Tatiara', level3: 'Senior Colts', sortOrder: 3 },
  '40222c56': { level1: 'Country Football', level2: 'Kowree Naracoorte Tatiara', level3: 'Junior Colts', sortOrder: 4 },

  // ── Country Football — Limestone Coast ────────────────────────────
  '1f915c2d': { level1: 'Country Football', level2: 'Limestone Coast', level3: 'A-Grade',      sortOrder: 1 },
  '69c2b636': { level1: 'Country Football', level2: 'Limestone Coast', level3: 'Reserves',     sortOrder: 2 },
  '3f0677ac': { level1: 'Country Football', level2: 'Limestone Coast', level3: 'Senior Colts', sortOrder: 3 },
  '91006807': { level1: 'Country Football', level2: 'Limestone Coast', level3: 'Junior Colts', sortOrder: 4 },

  // ── Country Football — Murray Valley ──────────────────────────────
  '664cc617': { level1: 'Country Football', level2: 'Murray Valley', level3: 'A-Grade', sortOrder: 1 },

  // ── Country Football — Mid South Eastern ──────────────────────────
  '60d20e02': { level1: 'Country Football', level2: 'Mid South Eastern', level3: 'A-Grade',      sortOrder: 1 },
  '287ea527': { level1: 'Country Football', level2: 'Mid South Eastern', level3: 'Reserves',     sortOrder: 2 },
  '9a1f76f7': { level1: 'Country Football', level2: 'Mid South Eastern', level3: 'Senior Colts', sortOrder: 3 },
  'd49c1f56': { level1: 'Country Football', level2: 'Mid South Eastern', level3: 'Junior Colts', sortOrder: 4 },

  // ── Country Football — North Eastern ──────────────────────────────
  '6b27206f': { level1: 'Country Football', level2: 'North Eastern', level3: 'A-Grade',      sortOrder: 1 },
  'dd41e926': { level1: 'Country Football', level2: 'North Eastern', level3: 'Reserves',     sortOrder: 2 },
  '4f75c9fa': { level1: 'Country Football', level2: 'North Eastern', level3: 'Senior Colts', sortOrder: 3 },
  '9029f8c6': { level1: 'Country Football', level2: 'North Eastern', level3: 'Junior Colts', sortOrder: 4 },

  // ── Country Football — Northern Areas ─────────────────────────────
  'df66bb2a': { level1: 'Country Football', level2: 'Northern Areas', level3: 'A-Grade',      sortOrder: 1 },
  '97c1e57c': { level1: 'Country Football', level2: 'Northern Areas', level3: 'Reserves',     sortOrder: 2 },
  '82e1d942': { level1: 'Country Football', level2: 'Northern Areas', level3: 'Senior Colts', sortOrder: 3 },
  '20906995': { level1: 'Country Football', level2: 'Northern Areas', level3: 'Junior Colts', sortOrder: 4 },

  // ── Country Football — Port Lincoln ───────────────────────────────
  '9a453474': { level1: 'Country Football', level2: 'Port Lincoln', level3: 'A-Grade',      sortOrder: 1 },
  '392c6b49': { level1: 'Country Football', level2: 'Port Lincoln', level3: 'Reserves',     sortOrder: 2 },
  '747f28a3': { level1: 'Country Football', level2: 'Port Lincoln', level3: 'Senior Colts', sortOrder: 3 },
  '3ae3fce3': { level1: 'Country Football', level2: 'Port Lincoln', level3: 'Junior Colts', sortOrder: 4 },

  // ── Country Football — River Murray ───────────────────────────────
  '5e3727ac': { level1: 'Country Football', level2: 'River Murray', level3: 'A-Grade',      sortOrder: 1 },
  '4a01701c': { level1: 'Country Football', level2: 'River Murray', level3: 'Reserves',     sortOrder: 2 },
  '24f414ef': { level1: 'Country Football', level2: 'River Murray', level3: 'Senior Colts', sortOrder: 3 },
  '1caaa012': { level1: 'Country Football', level2: 'River Murray', level3: 'Junior Colts', sortOrder: 4 },

  // ── Country Football — Riverland ──────────────────────────────────
  'c03bab0b': { level1: 'Country Football', level2: 'Riverland', level3: 'A-Grade',      sortOrder: 1 },
  '19a29852': { level1: 'Country Football', level2: 'Riverland', level3: 'Reserves',     sortOrder: 2 },
  '0f7943ec': { level1: 'Country Football', level2: 'Riverland', level3: 'Senior Colts', sortOrder: 3 },
  '75c21fc2': { level1: 'Country Football', level2: 'Riverland', level3: 'Junior Colts', sortOrder: 4 },

  // ── Country Football — Southern ───────────────────────────────────
  '8c192de6': { level1: 'Country Football', level2: 'Southern', level3: 'A-Grade',      sortOrder: 1 },
  'a51eb685': { level1: 'Country Football', level2: 'Southern', level3: 'Reserves',     sortOrder: 2 },
  'c919aaad': { level1: 'Country Football', level2: 'Southern', level3: 'Senior Colts', sortOrder: 3 },
  '108755b3': { level1: 'Country Football', level2: 'Southern', level3: 'Junior Colts', sortOrder: 4 },

  // ── Country Football — Spencer Gulf ───────────────────────────────
  'e8487e43': { level1: 'Country Football', level2: 'Spencer Gulf', level3: 'A-Grade',      sortOrder: 1 },
  'aeca9c2b': { level1: 'Country Football', level2: 'Spencer Gulf', level3: 'Reserves',     sortOrder: 2 },
  '88b241f4': { level1: 'Country Football', level2: 'Spencer Gulf', level3: 'Senior Colts', sortOrder: 3 },
  'f41f2870': { level1: 'Country Football', level2: 'Spencer Gulf', level3: 'Junior Colts', sortOrder: 4 },

  // ── Country Football — Western Eyre ───────────────────────────────
  '573e15dd': { level1: 'Country Football', level2: 'Western Eyre', level3: 'A-Grade',      sortOrder: 1 },
  '242a899e': { level1: 'Country Football', level2: 'Western Eyre', level3: 'Reserves',     sortOrder: 2 },
  'a2578543': { level1: 'Country Football', level2: 'Western Eyre', level3: 'Senior Colts', sortOrder: 3 },
  '1622cd52': { level1: 'Country Football', level2: 'Western Eyre', level3: 'Junior Colts', sortOrder: 4 },

  // ── Country Football — Whyalla ────────────────────────────────────
  'bb5e36cb': { level1: 'Country Football', level2: 'Whyalla', level3: 'A-Grade',      sortOrder: 1 },
  'a9b75a8a': { level1: 'Country Football', level2: 'Whyalla', level3: 'Reserves',     sortOrder: 2 },
  'b1fdaeef': { level1: 'Country Football', level2: 'Whyalla', level3: 'Senior Colts', sortOrder: 3 },
  'cf68b6dc': { level1: 'Country Football', level2: 'Whyalla', level3: 'Junior Colts', sortOrder: 4 },

  // ── Country Football — Yorke Peninsula ───────────────────────────
  '35988582': { level1: 'Country Football', level2: 'Yorke Peninsula', level3: 'A-Grade',      sortOrder: 1 },
  'a5a21c9a': { level1: 'Country Football', level2: 'Yorke Peninsula', level3: 'Reserves',     sortOrder: 2 },
  '8a1a6dcf': { level1: 'Country Football', level2: 'Yorke Peninsula', level3: 'Senior Colts', sortOrder: 3 },
  '679a5557': { level1: 'Country Football', level2: 'Yorke Peninsula', level3: 'Junior Colts', sortOrder: 4 },
}

export const LEVEL1_ORDER = [
  'SANFL',
  "Adelaide Footy League (Men's)",
  "SAWFL Women's",
  'Country Football',
]

export const LEVEL2_ORDER: Record<string, string[]> = {
  'SANFL': ['League', 'Reserves', 'Youth'],
  "Adelaide Footy League (Men's)": ['League', 'Reserves', 'C-Grade'],
  "SAWFL Women's": ['League', 'Reserves'],
  'Country Football': [
    'Adelaide Plains', 'Barossa Light & Gawler', 'Eastern Eyre', 'Far North',
    'Great Flinders', 'Great Southern', 'Hills Division 1', 'Hills Country Division',
    'Kangaroo Island', 'Kowree Naracoorte Tatiara', 'Limestone Coast', 'Murray Valley',
    'Mid South Eastern', 'North Eastern', 'Northern Areas', 'Port Lincoln',
    'River Murray', 'Riverland', 'Southern', 'Spencer Gulf',
    'Western Eyre', 'Whyalla', 'Yorke Peninsula',
  ],
}

// Get category for a league, fallback to grade_name if not in map
export function getLeagueCategory(gradeId: string): LeagueCategory {
  return LEAGUE_MAP[gradeId] ?? {
    level1: 'Other',
    level2: 'Other',
    level3: gradeId,
    sortOrder: 999,
  }
}