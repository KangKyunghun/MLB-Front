import { api } from "./client";
import type { GameResponse } from "@/types";

/** 특정 날짜(YYYY-MM-DD)의 경기 목록 — GET /api/games/date/{date} */
export async function getGamesByDate(date: string): Promise<GameResponse[]> {
  const { data } = await api.get<GameResponse[]>(`/api/games/date/${date}`);
  return data;
}
