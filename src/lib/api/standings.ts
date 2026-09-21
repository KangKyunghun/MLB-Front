import { api } from "./client";

export interface StandingResponse {
  id: number;
  season: number;
  teamId: number;
  teamName: string;
  teamAbbreviation: string;
  teamLogoUrl: string;
  league: string;
  division: string;
  divisionRank: number;
  leagueRank: number;
  wins: number;
  losses: number;
  winPct: number;
  gamesBack: number;
  runsScored: number;
  runsAllowed: number;
  runDifferential: number;
  lastTenWins: number;
  lastTenLosses: number;
  streak: string;
}

// GET /api/standings/{season} — 시즌 전체 순위 (지구별로 이미 정렬되어 내려옴)
export const getStandings = async (season: number): Promise<StandingResponse[]> => {
  const { data } = await api.get<StandingResponse[]>(`/api/standings/${season}`);
  return data;
};