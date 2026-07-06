import { api } from "./client";
import type { GameResponse } from "@/types";
import type {
  LineScoreResponse,
  BoxScoreResponse,
  TimelineEvent,
} from "@/types/game";

/** 날짜별 경기 목록 (date: "YYYY-MM-DD") */
export const getGamesByDate = async (date: string): Promise<GameResponse[]> => {
  const { data } = await api.get<GameResponse[]>(`/api/games/date/${date}`);
  return data;
};

/** 오늘 경기 목록 */
export const getTodayGames = async (): Promise<GameResponse[]> => {
  const { data } = await api.get<GameResponse[]>("/api/games/today");
  return data;
};

/** 경기 단건 상세 */
export const getGame = async (gameId: number): Promise<GameResponse> => {
  const { data } = await api.get<GameResponse>(`/api/games/${gameId}`);
  return data;
};

/** 라인스코어 (이닝별 득점/안타/에러) */
export const getLineScore = async (
  gameId: number
): Promise<LineScoreResponse[]> => {
  const { data } = await api.get<LineScoreResponse[]>(
    `/api/games/${gameId}/linescore`
  );
  return data;
};

/** 박스스코어 (선수별 타격/투구 기록) */
export const getBoxScore = async (
  gameId: number
): Promise<BoxScoreResponse[]> => {
  const { data } = await api.get<BoxScoreResponse[]>(
    `/api/games/${gameId}/boxscore`
  );
  return data;
};

/** 타임라인 이벤트 (투구 별 흐름) */
export const getTimeline = async (
  gameId: number
): Promise<TimelineEvent[]> => {
  const { data } = await api.get<TimelineEvent[]>(
    `/api/timeline/${gameId}`
  );
  return data;
};