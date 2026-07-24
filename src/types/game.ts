// ─────────────────────────────────────────────
// 경기 도메인 추가 타입 (백엔드 DTO 1:1 매핑)
// ─────────────────────────────────────────────

export interface LineScoreResponse {
  id: number;
  gameId: number;
  inning: number;
  isHome: boolean;
  runs: number | null;
  hits: number | null;
  errors: number | null;
}

export interface BoxScoreResponse {
  id: number;
  gameId: number;
  playerId: number;
  playerName: string;
  playerPhotoUrl: string | null;
  teamId: number;
  teamName: string;
  teamAbbreviation: string;
  playerType: "BATTER" | "PITCHER";

  // 타자
  atBats: number | null;
  hits: number | null;
  homeRuns: number | null;
  rbi: number | null;
  runs: number | null;
  walks: number | null;
  strikeOuts: number | null;
  battingOrder: number | null;
  gamePosition: string | null; // 그 경기에서 뛴 수비 포지션 (P, C, 1B, 2B, 3B, SS, LF, CF, RF, DH)

  // 투수
  inningsPitched: number | null;
  earnedRuns: number | null;
  hitsAllowed: number | null;
  walksAllowed: number | null;
  strikeOutsPitched: number | null;
  pitchCount: number | null;
  isWin: boolean | null;
  isLoss: boolean | null;
  isSave: boolean | null;
  isHold: boolean | null;
}

export interface TimelinePitch {
  pitchNumber: number;
  callCode: string;
  callDescription: string;
  pitchTypeCode: string | null;
  pitchTypeName: string | null;
  startSpeed: number | null;
  balls: number;
  strikes: number;
  outs: number;
  isInPlay: boolean;
  isStrike: boolean;
  isBall: boolean;
}

export interface TimelineEvent {
  type:
    | "PITCH"
    | "PLAY"
    | "SCORE_CHANGE"
    | "STOLEN_BASE"
    | "CAUGHT_STEALING"
    | "PITCHING_CHANGE"
    | "PINCH_HITTER"
    | "PINCH_RUNNER"
    | "DEFENSIVE_SUB"
    | "GAME_END";
  inning: number;
  halfInning: "top" | "bottom";
  atBatIndex: string;

  batterName: string | null;
  pitcherName: string | null;

  description: string | null;
  rbi: number | null;
  homeScore: number | null;
  awayScore: number | null;
  scoringPlayers: string[] | null;

  pitches: TimelinePitch[] | null;

  stolenBasePlayer: string | null;
  stolenBase: string | null;

  outgoingPitcher: string | null;
  incomingPitcher: string | null;

  substituteName: string | null;
  replacedName: string | null;
  substitutePosition: string | null;

  balls: number | null;
  strikes: number | null;
  outs: number | null;
}

// ─────────────────────────────────────────────
// 이닝별 수비 상황 스냅샷 (수비 라인업 + 현재타자/대기타자)
// ─────────────────────────────────────────────

export interface DefenseLineupPlayer {
  playerId: number | null;
  playerName: string | null;
  photoUrl: string | null;
  battingOrder: number | null;
}

export interface DefensePlayer {
  position: string; // P, C, 1B, 2B, 3B, SS, LF, CF, RF
  playerId: number | null;
  playerName: string | null;
  photoUrl: string | null;
}

export interface DefenseSnapshotResponse {
  gameId: number;
  inning: number;
  halfInning: "top" | "bottom";

  battingTeamId: number;
  battingTeamName: string;
  battingTeamAbbreviation: string;

  fieldingTeamId: number;
  fieldingTeamName: string;
  fieldingTeamAbbreviation: string;

  awayScore: number;
  homeScore: number;

  balls: number;
  strikes: number;
  outs: number;

  positions: DefensePlayer[];

  currentBatter: DefenseLineupPlayer | null;
  onDeck: DefenseLineupPlayer | null;
  inHole: DefenseLineupPlayer | null;
}