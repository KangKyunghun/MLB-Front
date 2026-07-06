import { api } from "./client";
import type {
  BatterStatResponse,
  BatterStatType,
  Division,
  GameResponse,
  GameType,
  PitcherStatResponse,
  PitcherStatType,
  StandingResponse,
} from "@/types";

// ─────────────────────────────────────────────
// 경기
// ─────────────────────────────────────────────

/** 오늘 경기 목록 — GET /api/games/today */
export async function getTodayGames(): Promise<GameResponse[]> {
  const { data } = await api.get<GameResponse[]>("/api/games/today");
  return data;
}

// ─────────────────────────────────────────────
// 팀 순위
// ─────────────────────────────────────────────

/** 디비전별 순위 — GET /api/standings/{season}/division/{division} */
export async function getStandingsByDivision(
  season: number,
  division: Division
): Promise<StandingResponse[]> {
  const { data } = await api.get<StandingResponse[]>(
    `/api/standings/${season}/division/${encodeURIComponent(division)}`
  );
  return data;
}

// ─────────────────────────────────────────────
// 타자 / 투수 리더보드
// ─────────────────────────────────────────────

interface LeaderboardParams {
  season: number;
  gameType?: GameType;
  limit?: number;
}

/** 타자 리더보드 — GET /api/stats/batters/leaderboard */
export async function getBatterLeaderboard(
  statType: BatterStatType,
  { season, gameType = "R", limit = 3 }: LeaderboardParams
): Promise<BatterStatResponse[]> {
  const { data } = await api.get<BatterStatResponse[]>(
    "/api/stats/batters/leaderboard",
    { params: { season, gameType, statType, limit } }
  );
  return data;
}

/** 투수 리더보드 — GET /api/stats/pitchers/leaderboard */
export async function getPitcherLeaderboard(
  statType: PitcherStatType,
  { season, gameType = "R", limit = 3 }: LeaderboardParams
): Promise<PitcherStatResponse[]> {
  const { data } = await api.get<PitcherStatResponse[]>(
    "/api/stats/pitchers/leaderboard",
    { params: { season, gameType, statType, limit } }
  );
  return data;
}
