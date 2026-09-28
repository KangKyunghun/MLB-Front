import { api } from "./client";

// ── 타입 정의 ──────────────────────────────────────

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

// 핫콜드존
export interface HotColdZoneResponse {
  id: number;
  playerId: number;
  playerName: string;
  season: number;
  innerZones: (number | null)[][];
  innerTemps: string[][];
  outerZones: {
    top: number | null;    topTemp: string;
    bottom: number | null; bottomTemp: string;
    left: number | null;   leftTemp: string;
    right: number | null;  rightTemp: string;
  };
}

export interface ZoneData {
  zoneId: number;
  avg: number;
  atBats: number;
  hits: number;
}

export interface SprayDataResponse {
  id: number;
  playerId: number;
  playerName: string;
  gameId: number | null;
  season: number;
  hitCoordX: number | null;
  hitCoordY: number | null;
  exitVelocity: number | null;
  launchAngle: number | null;
  hitDistance: number | null;
  events: string | null;
  hitLocation: string | null;
}

export interface BatterSituationStatResponse {
  id: number;
  playerId: number;
  season: number;
  gameType: string;
  sitCode: string;
  atBats: number;
  hits: number;
  homeRuns: number;
  rbi: number;
  walks: number;
  strikeOuts: number;
  avg: number;
  obp: number;
  slg: number;
  ops: number;
}

export interface PitchTypeData {
  pitchType: string;
  pitchName: string;
  count: number;
  percentage: number;
  avgVelocity: number | null;
  maxVelocity: number | null;
  avgSpinRate: number | null;
}

export interface PitchMixResponse {
  pitcherId: number;
  season: number;
  gameType: string;
  pitches: PitchTypeData[];
}

export interface BatterVsPitcherResponse {
  pitcherId?: number;
  pitcherName?: string;
  batterId?: number;
  batterName?: string;
  atBats: number;
  hits: number;
  homeRuns: number;
  baseOnBalls: number;
  rbi: number;
  walks: number;
  strikeOuts: number;
  avg: number;
  obp: number;
  slg: number;
  ops: number;
}

export interface BatterVsTeamResponse {
  teamId: number;
  teamName: string;
  teamLogoUrl: string | null;
  atBats: number;
  hits: number;
  homeRuns: number;
  rbi: number;
  walks: number;
  baseOnBalls: number;
  strikeOuts: number;
  avg: number;
  obp: number;
  slg: number;
  ops: number;
}

export interface PitchTypeSummary {
  pitchType: string;
  count: number;
  percentage: number;
  avgVelocity: number | null;
  avgSpinRate: number | null;
  whiffRate: number;
  strikeRate: number;
  avgBattingAvg: number | null;
}

export interface PitchLocationPoint {
  plateX: number;
  plateZ: number;
  pitchType: string | null;
  result: 'Ball' | 'Strike' | 'InPlay' | 'Unknown';
}

export interface PitchMixResponse {
  playerId: number;
  playerName: string;
  season: number;
  gameType: string;
  totalPitches: number;
  pitchTypes: PitchTypeSummary[];
  locations: PitchLocationPoint[];
}

type GameType = 'R' | 'PS';

// ── 리더보드 ───────────────────────────────────────

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

// ── 타자 스탯 ──────────────────────────────────────

export const getBatterStats = async (
  playerId: number,
  gameType?: GameType
): Promise<BatterStatResponse[]> => {
  const { data } = await api.get<BatterStatResponse[]>(`/api/players/${playerId}/batter-stats`, {
    params: gameType ? { gameType } : {},
  });
  return data;
};

export const getBatterStatBySeason = async (
  playerId: number,
  season: number,
  gameType: GameType = 'R'
): Promise<BatterStatResponse> => {
  const { data } = await api.get<BatterStatResponse>(`/api/players/${playerId}/batter-stats/${season}`, {
    params: { gameType },
  });
  return data;
};

// ── 투수 스탯 ──────────────────────────────────────

export const getPitcherStats = async (
  playerId: number,
  gameType?: GameType
): Promise<PitcherStatResponse[]> => {
  const { data } = await api.get<PitcherStatResponse[]>(`/api/players/${playerId}/pitcher-stats`, {
    params: gameType ? { gameType } : {},
  });
  return data;
};

export const getPitcherStatBySeason = async (
  playerId: number,
  season: number,
  gameType: GameType = 'R'
): Promise<PitcherStatResponse> => {
  const { data } = await api.get<PitcherStatResponse>(`/api/players/${playerId}/pitcher-stats/${season}`, {
    params: { gameType },
  });
  return data;
};

// ── 핫콜드존 ──────────────────────────────────────

export const getHotColdZone = async (
  playerId: number,
  season: number,
  gameType: GameType = 'R'
): Promise<HotColdZoneResponse> => {
  const { data } = await api.get<HotColdZoneResponse>(`/api/players/${playerId}/hot-cold-zones`, {
    params: { season, gameType },
  });
  return data;
};

// ── 스프레이차트 ───────────────────────────────────

export const getSprayData = async (
  playerId: number,
  season: number,
  gameType: GameType = 'R'
): Promise<SprayDataResponse[]> => {
  const { data } = await api.get<SprayDataResponse[]>(`/api/players/${playerId}/spray-data`, {
    params: { season, gameType },
  });
  return data;
};

// ── 스플릿 ────────────────────────────────────────

export const getSituationStats = async (
  playerId: number,
  season: number,
  gameType: GameType = 'R'
): Promise<BatterSituationStatResponse[]> => {
  const { data } = await api.get<BatterSituationStatResponse[]>(`/api/players/${playerId}/situation-stats`, {
    params: { season, gameType },
  });
  return data;
};

// ── 상대전적 ──────────────────────────────────────

export const getBatterVsPitcher = async (
  batterId: number,
  season: number,
  gameType: GameType = 'R'
): Promise<BatterVsPitcherResponse[]> => {
  const { data } = await api.get<BatterVsPitcherResponse[]>(`/api/players/${batterId}/vs-pitcher`, {
    params: { season, gameType },
  });
  return data;
};

export const getPitcherVsBatter = async (
  pitcherId: number,
  season: number,
  gameType: GameType = 'R'
): Promise<BatterVsPitcherResponse[]> => {
  const { data } = await api.get<BatterVsPitcherResponse[]>(`/api/players/${pitcherId}/vs-batter`, {
    params: { season, gameType },
  });
  return data;
};

export const getBatterVsTeam = async (
  batterId: number,
  season: number,
  gameType: GameType = 'R'
): Promise<BatterVsTeamResponse[]> => {
  const { data } = await api.get<BatterVsTeamResponse[]>(`/api/players/${batterId}/vs-team`, {
    params: { season, gameType },
  });
  return data;
};

export const getPitcherVsTeam = async (
  pitcherId: number,
  season: number,
  gameType: GameType = 'R'
): Promise<BatterVsTeamResponse[]> => {
  const { data } = await api.get<BatterVsTeamResponse[]>(`/api/players/${pitcherId}/vs-batting-team`, {
    params: { season, gameType },
  });
  return data;
};

// ── 구종 데이터 ───────────────────────────────────

export const getPitchMix = async (
  pitcherId: number,
  season: number,
  gameType: GameType = 'R'
): Promise<PitchMixResponse> => {
  const { data } = await api.get<PitchMixResponse>(`/api/players/${pitcherId}/pitch-mix`, {
    params: { season, gameType },
  });
  return data;
};

