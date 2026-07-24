// ─────────────────────────────────────────────
// MLB 팀 약어(abbreviation) → 한글 팀명 매핑
// 백엔드 GameResponse.homeTeamAbbreviation / awayTeamAbbreviation 값 기준.
// (MLB Stats API 표준 3자 약어를 그대로 사용하므로, 실제 값과 다르면 이 표만 수정하면 됨)
// ─────────────────────────────────────────────

export const TEAM_NAME_KO: Record<string, string> = {
  // AL 동부
  BAL: "볼티모어",
  BOS: "보스턴",
  NYY: "뉴욕양키스",
  TB: "탬파베이",
  TBR: "탬파베이",
  TOR: "토론토",

  // AL 중부
  CWS: "시카고화이트삭스",
  CHW: "시카고화이트삭스",
  CLE: "클리블랜드",
  DET: "디트로이트",
  KC: "캔자스시티",
  KCR: "캔자스시티",
  MIN: "미네소타",

  // AL 서부
  HOU: "휴스턴",
  LAA: "LA에인절스",
  ATH: "애슬레틱스",
  OAK: "애슬레틱스",
  SEA: "시애틀",
  TEX: "텍사스",

  // NL 동부
  ATL: "애틀랜타",
  MIA: "마이애미",
  NYM: "뉴욕메츠",
  PHI: "필라델피아",
  WSH: "워싱턴",
  WAS: "워싱턴",

  // NL 중부
  CHC: "시카고컵스",
  CIN: "신시내티",
  MIL: "밀워키",
  PIT: "피츠버그",
  STL: "세인트루이스",

  // NL 서부
  AZ: "애리조나",
  COL: "콜로라도",
  LAD: "LA다저스",
  SD: "샌디에이고",
  SDP: "샌디에이고",
  SF: "샌프란시스코",
  SFG: "샌프란시스코",
};

/** 약어 → 한글 팀명. 매핑이 없으면 원래 약어를 그대로 반환. */
export function teamNameKo(abbreviation: string): string {
  return TEAM_NAME_KO[abbreviation] ?? abbreviation;
}