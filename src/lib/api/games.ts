import { api } from "./client";
import type { BatterStatResponse, GameResponse, PitcherStatResponse } from "@/types";
import type {
  LineScoreResponse,
  BoxScoreResponse,
  TimelineEvent,
  DefenseSnapshotResponse,
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

/** 이닝(초/말) 시점 수비 상황 스냅샷 (수비 라인업 + 현재타자/대기타자) */
export const getDefenseSnapshot = async (
  gameId: number,
  inning: number,
  half: "top" | "bottom"
): Promise<DefenseSnapshotResponse> => {
  const { data } = await api.get<DefenseSnapshotResponse>(
    `/api/games/${gameId}/defense`,
    { params: { inning, half } }
  );
  return data;
};

/** 특정 선수의 시즌 타자 성적 (경기 후 타율 등 표시용) */
export const getBatterStatBySeason = async (
  playerId: number,
  season: number,
  gameType: string = "R"
): Promise<BatterStatResponse> => {
  const { data } = await api.get<BatterStatResponse>(
    `/api/players/${playerId}/batter-stats/${season}`,
    { params: { gameType } }
  );
  return data;
};

/** 특정 선수의 시즌 투수 성적 (경기 후 방어율 등 표시용) */
export const getPitcherStatBySeason = async (
  playerId: number,
  season: number,
  gameType: string = "R"
): Promise<PitcherStatResponse> => {
  const { data } = await api.get<PitcherStatResponse>(
    `/api/players/${playerId}/pitcher-stats/${season}`,
    { params: { gameType } }
  );
  return data;
};