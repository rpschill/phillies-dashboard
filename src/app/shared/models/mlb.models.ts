export interface Team {
  id: number;
  name: string;
  abbreviation: string;
  teamName: string;
}

export interface GameTeamData {
  score?: number;
  team: Team;
  isWinner?: boolean;
  leagueRecord: {
    wins: number;
    losses: number;
    pct: string;
  };
}

export interface Game {
  gamePk: number;
  gameDate: string;
  status: {
    abstractGameState: "Preview" | "Live" | "Final";
    detailedState: string;
  };
  teams: { home: GameTeamData; away: GameTeamData };
  linescore?: Linescore;
  decisions?: { winner?: Pitcher; loser?: Pitcher; save?: Pitcher };
}

export interface Linescore {
  currentInning?: number;
  currentInningOrdinal?: string;
  inningState?: string;
  innings: Inning[];
  teams: {
    home: { runs: number; hits: number; errors: number };
    away: { runs: number; hits: number; errors: number };
  };
  balls?: number;
  strikes?: number;
  outs?: number;
}

export interface Inning {
  num: number;
  home: { runs?: number };
  away: { runs?: number };
}

export interface Pitcher {
  id: number;
  fullName: string;
}

export interface StandingsRecord {
  team: Team;
  wins: number;
  losses: number;
  pct: string;
  gamesBack: string;
  streak?: { streakCode: string };
  divisionRank: string;
}

export interface Player {
  person: { id: number; fullName: string };
  jerseyNumber: string;
  position: { name: string; abbreviation: string };
  status: { description: string };
}

export interface HittingStats {
  avg: string; homeRuns: number; rbi: number; ops: string;
  hits: number; atBats: number; strikeOuts: number; baseOnBalls: number;
}

export interface PitchingStats {
  era: string; wins: number; losses: number;
  strikeOuts: number; inningsPitched: string; whip: string; saves: number;
}
