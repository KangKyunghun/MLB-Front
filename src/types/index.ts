// ─────────────────────────────────────────────
// 공통 도메인 타입
// 백엔드 DTO(StandingResponse / BatterStatResponse / PitcherStatResponse / GameResponse)와
// 1:1로 맞춘 타입입니다. 필드명을 변경하면 백엔드 응답과 어긋나니 주의하세요.
// ─────────────────────────────────────────────

export interface GameResponse {
  id: number;
  season: number;
  status: string;
  gameType: string;
  gameNumber: number;
  seriesDescription: string | null;
  gameDate: string; // ISO LocalDateTime string
  venue: string | null;

  homeTeamId: number;
  homeTeamName: string;
  homeTeamAbbreviation: string;
  homeTeamLogoUrl: string | null;
  homeScore: number | null;

  awayTeamId: number;
  awayTeamName: string;
  awayTeamAbbreviation: string;
  awayTeamLogoUrl: string | null;
  awayScore: number | null;
}

export interface StandingResponse {
  id: number;
  season: number;

  teamId: number;
  teamName: string;
  teamAbbreviation: string;
  teamLogoUrl: string | null;
  league: string; // "American League" | "National League"
  division: string; // "American League East" 등

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

  streak: string | null;
}

export interface BatterStatResponse {
  id: number;
  playerId: number;
  playerName: string;
  playerPhoto: string | null;
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

  sacBunts: number;
  sacFlies: number;
  leftOnBase: number;

  groundOuts: number;
  airOuts: number;
  groundOutsToAirOuts: number | null;
  numberOfPitches: number;
  atBatsPerHomeRun: number | null;

  avg: number;
  obp: number;
  slg: number;
  ops: number;
  babip: number | null;
}

export interface PitcherStatResponse {
  id: number;
  playerId: number;
  playerName: string;
  playerPhoto: string | null;
  teamId: number;
  teamName: string;
  season: number;

  gamesPlayed: number;
  gamesStarted: number;
  gamesPitched: number;
  gamesFinished: number;
  completeGames: number;
  shutouts: number;

  wins: number;
  losses: number;
  saves: number;
  saveOpportunities: number;
  blownSaves: number;
  holds: number;
  winPercentage: number | null;

  inningsPitched: number;
  outs: number;
  battersFaced: number;

  hitsAllowed: number;
  homeRunsAllowed: number;
  doubles: number;
  triples: number;
  groundOuts: number;
  airOuts: number;
  groundOutsToAirOuts: number | null;

  walks: number;
  intentionalWalks: number;
  hitBatsmen: number;

  runs: number;
  earnedRuns: number;

  strikeOuts: number;

  numberOfPitches: number;
  strikePercentage: number | null;
  pitchesPerInning: number | null;
  wildPitches: number;

  sacBunts: number;
  sacFlies: number;
  groundIntoDoublePlay: number;

  era: number;
  whip: number;
  avgAllowed: number;
  obpAllowed: number;
  slgAllowed: number;
  opsAllowed: number;
  babip: number | null;

  strikeOutPer9: number | null;
  walkPer9: number | null;
  hitsPer9: number | null;
  homeRunsPer9: number | null;
  runsScoredPer9: number | null;
  strikeoutWalkRatio: number | null;
}

export interface PlayerResponse {
  id: number;
  teamId: number | null;
  teamName: string | null;
  teamLogoUrl: string | null;
  fullName: string;
  firstName: string;
  lastName: string;
  position: string;
  shirtNumber: string | null;
  batSide: string | null;
  pitchHand: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  photoUrl: string | null;
  isActive: boolean;
}

export interface TeamResponse {
  id: number;
  name: string;
  abbreviation: string;
  teamName: string;
  locationName: string;
  league: string;
  division: string;
  venue: string;
  logoUrl: string | null;
}

// 타자 스탯
export interface BatterStatResponse {
  id: number;
  playerId: number;
  season: number;
  gameType: string;
  gamesPlayed: number;
  atBats: number;
  runs: number;
  hits: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  rbi: number;
  stolenBases: number;
  caughtStealing: number;
  walks: number;
  strikeOuts: number;
  avg: number;
  obp: number;
  slg: number;
  ops: number;
  babip: number | null;
  wrc: number | null;
}

// 투수 스탯
export interface PitcherStatResponse {
  id: number;
  playerId: number;
  season: number;
  gameType: string;
  wins: number;
  losses: number;
  era: number;
  gamesPlayed: number;
  gamesStarted: number;
  saves: number;
  holds: number;
  inningsPitched: number;
  hits: number;
  runs: number;
  earnedRuns: number;
  homeRuns: number;
  walks: number;
  strikeOuts: number;
  whip: number;
  strikeoutsPer9: number | null;
  walksPer9: number | null;
  hitsPer9: number | null;
}

// 핫콜드존
export interface HotColdZoneResponse {
  id: number;
  playerId: number;
  season: number;
  gameType: string;
  playerType: string;
  zones: ZoneData[];
}

export interface ZoneData {
  zoneId: number;
  avg: number;
  atBats: number;
  hits: number;
}

// 스프레이차트
export interface SprayDataResponse {
  id: number;
  playerId: number;
  season: number;
  gameType: string;
  hitX: number;
  hitY: number;
  hitType: string;   // single/double/triple/home_run/out
  exitVelocity: number | null;
  launchAngle: number | null;
}

// 스플릿
export interface BatterSituationStatResponse {
  id: number;
  playerId: number;
  season: number;
  gameType: string;
  sitCode: string;   // risp / vl / vr
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

// 구종 데이터
export interface PitchMixResponse {
  pitcherId: number;
  season: number;
  gameType: string;
  pitches: PitchTypeData[];
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

// 상대전적
export interface BatterVsPitcherResponse {
  pitcherId?: number;
  pitcherName?: string;
  batterId?: number;
  batterName?: string;
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

export interface BatterVsTeamResponse {
  teamId: number;
  teamName: string;
  teamLogoUrl: string | null;
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

// ── 프론트 전용 보조 타입 ──────────────────────

export type GameType = "R" | "PS";

/** 타자 리더보드에서 순환시킬 stat 종류 */
export type BatterStatType = "avg" | "homeRuns" | "hits";

/** 투수 리더보드에서 순환시킬 stat 종류 */
export type PitcherStatType = "wins" | "era" | "strikeOuts";

/** 6개 디비전 (백엔드 division 파라미터 그대로) */
export const DIVISIONS = [
  "American League East",
  "American League Central",
  "American League West",
  "National League East",
  "National League Central",
  "National League West",
] as const;

export type Division = (typeof DIVISIONS)[number];

/** 디비전 영문명 → 화면에 표시할 한글 라벨 */
export const DIVISION_LABEL: Record<Division, string> = {
  "American League East": "AL 동부",
  "American League Central": "AL 중부",
  "American League West": "AL 서부",
  "National League East": "NL 동부",
  "National League Central": "NL 중부",
  "National League West": "NL 서부",
};
