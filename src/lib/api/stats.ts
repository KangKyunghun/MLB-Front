import { api } from "./client";

export interface BatterStatResponse {
  id: number;
  playerId: number;
  playerName: string;
  playerPhoto: string;
  teamId: number;
  teamName: string;
  season: number;
  gamesPlayed: number;
  plateAppearances: number;
  atBats: number;
  hits: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  totalBases: number;
  runs: number;
  rbi: number;
  walks: number;
  intentionalWalks: number;
  hitByPitch: number;
  stolenBases: number;
  caughtStealing: number;
  stolenBasePercentage: number | null;
  strikeOuts: number;
  groundIntoDoublePlay: number;
  avg: number | null;
  obp: number | null;
  slg: number | null;
  ops: number | null;
  babip: number | null;
}

export interface PitcherStatResponse {
  id: number;
  playerId: number;
  playerName: string;
  playerPhoto: string;
  teamId: number;
  teamName: string;
  season: number;
  gamesPlayed: number;
  gamesStarted: number;
  wins: number;
  losses: number;
  saves: number;
  saveOpportunities: number;
  blownSaves: number;
  holds: number;
  winPercentage: number | null;
  inningsPitched: number | null;
  hitsAllowed: number;
  walks: number;
  runs: number;
  earnedRuns: number;
  strikeOuts: number;
  era: number | null;
  whip: number | null;
  strikeOutPer9: number | null;
  homeRunsAllowed: number;
  hitBatsmen: number;
  walkPer9: number | null;
  homeRunsPer9: number | null;
  strikeOutWalkRatio: number | null;
}

// GET /api/stats/batters/leaderboard?season=&gameType=&statType=&limit=
export const getBatterLeaderboard = async (
  season: number,
  gameType: string,
  statType: string,
  limit = 25
): Promise<BatterStatResponse[]> => {
  const { data } = await api.get<BatterStatResponse[]>("/api/stats/batters/leaderboard", {
    params: { season, gameType, statType, limit },
  });
  return data;
};

// GET /api/stats/pitchers/leaderboard?season=&gameType=&statType=&limit=
export const getPitcherLeaderboard = async (
  season: number,
  gameType: string,
  statType: string,
  limit = 25
): Promise<PitcherStatResponse[]> => {
  const { data } = await api.get<PitcherStatResponse[]>("/api/stats/pitchers/leaderboard", {
    params: { season, gameType, statType, limit },
  });
  return data;
};