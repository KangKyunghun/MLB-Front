import { api } from "./client";
import type { PlayerResponse } from "@/types";

/** 활성 선수 전체 — GET /api/players/active */
export async function getActivePlayers(): Promise<PlayerResponse[]> {
  const { data } = await api.get<PlayerResponse[]>("/api/players/active");
  return data;
}

/** 선수 검색 — GET /api/players/search?keyword= */
export async function searchPlayers(keyword: string): Promise<PlayerResponse[]> {
  const { data } = await api.get<PlayerResponse[]>("/api/players/search", {
    params: { keyword },
  });
  return data;
}

/** 팀별 선수 목록 — GET /api/players/team/{teamId} */
export async function getPlayersByTeam(teamId: number): Promise<PlayerResponse[]> {
  const { data } = await api.get<PlayerResponse[]>(`/api/players/team/${teamId}`);
  return data;
}

/** 포지션별 선수 목록 — GET /api/players/position/{position} */
export async function getPlayersByPosition(position: string): Promise<PlayerResponse[]> {
  const { data } = await api.get<PlayerResponse[]>(`/api/players/position/${position}`);
  return data;
}

/** 선수 상세 — GET /api/players/{playerId} */
export async function getPlayer(playerId: number): Promise<PlayerResponse> {
  const { data } = await api.get<PlayerResponse>(`/api/players/${playerId}`);
  return data;
}