"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStandings, StandingResponse } from "@/lib/api/standings";
import {
  getBatterLeaderboard,
  getPitcherLeaderboard,
  BatterStatResponse,
  PitcherStatResponse,
} from "@/lib/api/stats";

const SEASONS = [2026, 2025, 2024];
const GAME_TYPE = "R";

type MainTab = "team" | "personal";
type PersonalCategory = "batter" | "pitcher";

function formatAvg(v: number | null | undefined): string {
  if (v == null) return "-";
  return v.toFixed(3).replace(/^0/, "");
}
function formatEra(v: number | null | undefined): string {
  if (v == null) return "-";
  return v.toFixed(2);
}
function formatIP(v: number | null | undefined): string {
  if (v == null) return "-";
  const whole = Math.trunc(v);
  const frac = Math.round((v - whole) * 10);
  if (frac === 1) return `${whole}⅓`;
  if (frac === 2) return `${whole}⅔`;
  return String(whole);
}
function formatGamesBack(v: number | null | undefined): string {
  if (v == null || v === 0) return "-";
  return v.toFixed(1);
}

// ── 팀 순위 ──────────────────────────────────────────────────────────────

type LeagueTab = "AL" | "NL";

interface WildCardRow extends StandingResponse {
  wildCardRank: number;
  wcGamesBack: number | null;
}

function computeWildCard(teams: StandingResponse[]): WildCardRow[] {
  const contenders = teams.filter((t) => t.divisionRank !== 1);
  const sorted = [...contenders].sort((a, b) => b.winPct - a.winPct || b.wins - a.wins);
  const cutoff = sorted[2];

  return sorted.map((t, idx) => {
    const wcGamesBack =
      cutoff && idx >= 3 ? ((cutoff.wins - t.wins) + (t.losses - cutoff.losses)) / 2 : null;
    return { ...t, wildCardRank: idx + 1, wcGamesBack };
  });
}

function StreakBadge({ streak }: { streak: string }) {
  if (!streak) return <span className="text-text-secondary">-</span>;
  const isWin = streak.startsWith("W");
  return (
    <span className={isWin ? "font-semibold text-blue-500" : "font-semibold text-red-500"}>
      {streak}
    </span>
  );
}

function DivisionTable({ division, teams }: { division: string; teams: StandingResponse[] }) {
  const th = "px-3 py-2 text-center text-[11px] font-semibold text-text-secondary";
  const td = "px-3 py-2 text-center text-[12px] tabular-nums text-text-primary";

  return (
    <div className="overflow-hidden rounded-xl bg-bg-primary">
      <div className="px-4 py-2.5 text-[12px] font-bold text-text-primary">{division}</div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border-tertiary">
            <th className="w-[44px] px-3 py-2 text-center text-[11px] font-semibold text-text-secondary">
              순위
            </th>
            <th className="px-3 py-2 text-left text-[11px] font-semibold text-text-secondary">팀</th>
            <th className={th}>승</th>
            <th className={th}>패</th>
            <th className={th}>승률</th>
            <th className={th}>게임차</th>
            <th className={th}>최근10경기</th>
            <th className={th}>연속</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t) => (
            <tr key={t.teamId} className="border-b border-border-tertiary/40 last:border-0">
              <td className={td + " font-semibold"}>{t.divisionRank}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  {t.teamLogoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.teamLogoUrl} alt={t.teamAbbreviation} className="h-5 w-5 object-contain" />
                  )}
                  <span className="text-[12px] font-medium text-text-primary">{t.teamName}</span>
                </div>
              </td>
              <td className={td}>{t.wins}</td>
              <td className={td}>{t.losses}</td>
              <td className={td}>{t.winPct.toFixed(3).replace(/^0/, "")}</td>
              <td className={td}>{formatGamesBack(t.gamesBack)}</td>
              <td className={td}>
                {t.lastTenWins}-{t.lastTenLosses}
              </td>
              <td className={td}>
                <StreakBadge streak={t.streak} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WildCardTable({ rows }: { rows: WildCardRow[] }) {
  const th = "px-3 py-2 text-center text-[11px] font-semibold text-text-secondary";
  const td = "px-3 py-2 text-center text-[12px] tabular-nums text-text-primary";

  return (
    <div className="overflow-hidden rounded-xl bg-bg-primary">
      <div className="px-4 py-2.5 text-[12px] font-bold text-text-primary">와일드카드</div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border-tertiary">
            <th className="w-[44px] px-3 py-2 text-center text-[11px] font-semibold text-text-secondary">
              순위
            </th>
            <th className="px-3 py-2 text-left text-[11px] font-semibold text-text-secondary">팀</th>
            <th className={th}>승</th>
            <th className={th}>패</th>
            <th className={th}>승률</th>
            <th className={th}>WC 게임차</th>
            <th className={th}>최근10경기</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t, idx) => (
            <tr
              key={t.teamId}
              className={[
                "border-b border-border-tertiary/40 last:border-0",
                idx === 2 ? "border-b-2 border-b-accent/50" : "",
              ].join(" ")}
            >
              <td className={td + " font-semibold"}>{t.wildCardRank}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  {t.teamLogoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.teamLogoUrl} alt={t.teamAbbreviation} className="h-5 w-5 object-contain" />
                  )}
                  <span className="text-[12px] font-medium text-text-primary">{t.teamName}</span>
                </div>
              </td>
              <td className={td}>{t.wins}</td>
              <td className={td}>{t.losses}</td>
              <td className={td}>{t.winPct.toFixed(3).replace(/^0/, "")}</td>
              <td className={td}>
                {t.wcGamesBack == null ? "-" : t.wcGamesBack.toFixed(1)}
              </td>
              <td className={td}>
                {t.lastTenWins}-{t.lastTenLosses}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-4 py-2 text-[11px] text-text-secondary">
        상위 3팀까지 와일드카드 진출 (파란 선 아래는 탈락권)
      </p>
    </div>
  );
}

function TeamStandings({ season }: { season: number }) {
  const [standings, setStandings] = useState<StandingResponse[]>([]);
  const [leagueTab, setLeagueTab] = useState<LeagueTab>("AL");
  const requestKey = String(season);
  const [result, setResult] = useState<{ key: string; state: "error" | "ready" }>({
    key: "",
    state: "ready",
  });
  const status: "loading" | "error" | "ready" =
    result.key !== requestKey ? "loading" : result.state;

  useEffect(() => {
    let cancelled = false;
    getStandings(season)
      .then((data) => {
        if (!cancelled) {
          setStandings(data);
          setResult({ key: requestKey, state: "ready" });
        }
      })
      .catch(() => {
        if (!cancelled) setResult({ key: requestKey, state: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [season, requestKey]);

  if (status === "loading") {
    return (
      <div className="flex h-40 items-center justify-center text-[13px] text-text-secondary">
        불러오는 중...
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="flex h-40 items-center justify-center text-[13px] text-red-500">
        순위 정보를 불러오지 못했습니다.
      </div>
    );
  }

  const leagueTeams = standings.filter((t) =>
    leagueTab === "AL" ? t.league.includes("American") : t.league.includes("National")
  );

  const divisionOrder: string[] = [];
  const grouped = new Map<string, StandingResponse[]>();
  for (const t of leagueTeams) {
    if (!grouped.has(t.division)) {
      grouped.set(t.division, []);
      divisionOrder.push(t.division);
    }
    grouped.get(t.division)!.push(t);
  }

  const wildCardRows = computeWildCard(leagueTeams);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 rounded-xl bg-bg-secondary p-1">
        {([
          { key: "AL", label: "아메리칸리그" },
          { key: "NL", label: "내셔널리그" },
        ] as { key: LeagueTab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setLeagueTab(key)}
            className={[
              "flex-1 rounded-lg py-2 text-[13px] font-medium transition-colors",
              leagueTab === key
                ? "bg-bg-primary text-text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {divisionOrder.map((d) => (
          <DivisionTable key={d} division={d} teams={grouped.get(d)!} />
        ))}
      </div>

      <WildCardTable rows={wildCardRows} />
    </div>
  );
}

// ── 개인 기록 ────────────────────────────────────────────────────────────

// [변경] games → gamesPlayed (출장 수 내림차순 백엔드 처리)
// [변경] homeRunsAllowed → homeRuns (타자 홈런 키 오타 수정)
// [변경] avg/obp/slg/ops → 규정타석(502 PA) 필터는 백엔드에서 처리
const BATTER_STAT_TYPES: { key: string; label: string }[] = [
  { key: "gamesPlayed", label: "경기" },
  { key: "plateAppearances", label: "타석" },
  { key: "atBats", label: "타수" },
  { key: "avg", label: "타율" },
  { key: "homeRuns", label: "홈런" },
  { key: "rbi", label: "타점" },
  { key: "hits", label: "안타" },
  { key: "obp", label: "출루율" },
  { key: "slg", label: "장타율" },
  { key: "ops", label: "OPS" },
  { key: "runs", label: "득점" },
  { key: "stolenBases", label: "도루" },
  { key: "walks", label: "볼넷" },
  { key: "strikeOuts", label: "삼진" },
  { key: "hitByPitch", label: "사구" },
];

// [변경] gamesPlayed: 출장 수 내림차순
// [변경] era/whip/strikeOutPer9/winPercentage → 규정이닝 필터 백엔드 적용
// [변경] walkPer9, homeRunsPer9 → 내림차순
// [삭제] strikeoutWalkRatio (탈삼진/볼넷) — 관련 데이터 없음
const PITCHER_STAT_TYPES: { key: string; label: string }[] = [
  { key: "gamesPlayed", label: "경기" },
  { key: "era", label: "방어율" },
  { key: "wins", label: "다승" },
  { key: "strikeOuts", label: "탈삼진" },
  { key: "saves", label: "세이브" },
  { key: "holds", label: "홀드" },
  { key: "whip", label: "WHIP" },
  { key: "inningsPitched", label: "이닝" },
  { key: "walks", label: "볼넷" },
  { key: "hitsAllowed", label: "피안타" },
  { key: "homeRunsAllowed", label: "피홈런" },
  { key: "runs", label: "실점" },
  { key: "earnedRuns", label: "자책점" },
  { key: "hitBatsmen", label: "사구" },
  { key: "strikeOutPer9", label: "9이닝당 탈삼진" },
  { key: "walkPer9", label: "9이닝당 볼넷" },
  { key: "homeRunsPer9", label: "9이닝당 피홈런" },
];

function statValueLabel(
  category: PersonalCategory,
  statType: string,
  row: BatterStatResponse | PitcherStatResponse
): string {
  if (category === "batter") {
    const b = row as BatterStatResponse;
    switch (statType) {
      case "gamesPlayed":
        return String(b.gamesPlayed);
      case "atBats":
        return String(b.atBats);
      case "plateAppearances":
        return String(b.plateAppearances);
      case "avg":
        return formatAvg(b.avg);
      case "ops":
        return formatAvg(b.ops);
      case "obp":
        return formatAvg(b.obp);
      case "slg":
        return formatAvg(b.slg);
      case "homeRuns":
        return String(b.homeRuns);
      case "rbi":
        return String(b.rbi);
      case "hits":
        return String(b.hits);
      case "runs":
        return String(b.runs);
      case "stolenBases":
        return String(b.stolenBases);
      case "walks":
        return String(b.walks);
      case "strikeOuts":
        return String(b.strikeOuts);
      case "hitByPitch":
        return String(b.hitByPitch);
      default:
        return "-";
    }
  }
  const p = row as PitcherStatResponse;

  switch (statType) {
    case "gamesPlayed":
      return String(p.gamesPlayed);

    case "era":
      return formatEra(p.era);

    case "whip":
      return formatEra(p.whip);

    case "wins":
      return String(p.wins);

    case "strikeOuts":
      return String(p.strikeOuts);

    case "saves":
      return String(p.saves);

    case "holds":
      return String(p.holds);

    case "inningsPitched":
      return formatIP(p.inningsPitched);

    case "walks":
      return String(p.walks);

    case "hitsAllowed":
      return String(p.hitsAllowed);

    case "homeRunsAllowed":
      return String(p.homeRunsAllowed);

    case "runs":
      return String(p.runs);

    case "earnedRuns":
      return String(p.earnedRuns);

    case "hitBatsmen":
      return String(p.hitBatsmen);

    case "strikeOutPer9":
      return formatAvg(p.strikeOutPer9);

    case "walkPer9":
      return formatAvg(p.walkPer9);

    case "homeRunsPer9":
      return formatAvg(p.homeRunsPer9);

    default:
      return "-";
  }
}

function PersonalStats({ season }: { season: number }) {
  const [category, setCategory] = useState<PersonalCategory>("batter");
  const [statType, setStatType] = useState("avg");
  const [batters, setBatters] = useState<BatterStatResponse[]>([]);
  const [pitchers, setPitchers] = useState<PitcherStatResponse[]>([]);

  const requestKey = `${category}-${statType}-${season}`;
  const [result, setResult] = useState<{ key: string; state: "error" | "ready" }>({
    key: "",
    state: "ready",
  });
  const status: "loading" | "error" | "ready" =
    result.key !== requestKey ? "loading" : result.state;

  const handleCategoryChange = (next: PersonalCategory) => {
    setCategory(next);
    setStatType(next === "batter" ? BATTER_STAT_TYPES[0].key : PITCHER_STAT_TYPES[0].key);
  };

  useEffect(() => {
    let cancelled = false;

    const request =
      category === "batter"
        ? getBatterLeaderboard(season, GAME_TYPE, statType, 25).then((data) => {
            if (!cancelled) setBatters(data);
          })
        : getPitcherLeaderboard(season, GAME_TYPE, statType, 25).then((data) => {
            if (!cancelled) setPitchers(data);
          });

    request
      .then(() => {
        if (!cancelled) setResult({ key: requestKey, state: "ready" });
      })
      .catch(() => {
        if (!cancelled) setResult({ key: requestKey, state: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [category, statType, season, requestKey]);

  const statTypes = category === "batter" ? BATTER_STAT_TYPES : PITCHER_STAT_TYPES;
  const rows: (BatterStatResponse | PitcherStatResponse)[] = category === "batter" ? batters : pitchers;

  return (
    <div className="flex flex-col gap-3">
      {/* 타자/투수 전환 */}
      <div className="flex gap-1 rounded-xl bg-bg-secondary p-1">
        {([
          { key: "batter", label: "타자" },
          { key: "pitcher", label: "투수" },
        ] as { key: PersonalCategory; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleCategoryChange(key)}
            className={[
              "flex-1 rounded-lg py-2 text-[13px] font-medium transition-colors",
              category === key
                ? "bg-bg-primary text-text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 스탯 종류 선택 */}
      <div className="flex flex-wrap gap-1.5 rounded-xl bg-bg-primary p-2">
        {statTypes.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setStatType(key)}
            className={[
              "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
              statType === key
                ? "bg-accent text-white"
                : "bg-bg-secondary text-text-secondary hover:text-text-primary",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 리더보드 */}
      {status === "loading" && (
        <div className="flex h-40 items-center justify-center text-[13px] text-text-secondary">
          불러오는 중...
        </div>
      )}
      {status === "error" && (
        <div className="flex h-40 items-center justify-center text-[13px] text-red-500">
          기록을 불러오지 못했습니다.
        </div>
      )}
      {status === "ready" && (
        <div className="overflow-hidden rounded-xl bg-bg-primary">
          {rows.length === 0 ? (
            <div className="flex h-24 items-center justify-center text-[13px] text-text-secondary">
              조건에 맞는 기록이 없습니다.
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border-tertiary">
                  <th className="w-[44px] px-3 py-2 text-center text-[11px] font-semibold text-text-secondary">
                    순위
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-text-secondary">선수</th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-text-secondary">팀</th>
                  <th className="px-3 py-2 text-right text-[11px] font-semibold text-text-secondary">
                    {statTypes.find((s) => s.key === statType)?.label}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.playerId} className="border-b border-border-tertiary/40 last:border-0">
                    <td className="px-3 py-2.5 text-center text-[12px] font-semibold tabular-nums text-text-primary">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-2.5">
                      <Link
                        href={`/players/${row.playerId}`}
                        className="flex items-center gap-2 hover:underline"
                      >
                        {row.playerPhoto && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={row.playerPhoto}
                            alt={row.playerName}
                            className="h-7 w-7 rounded-full object-cover"
                          />
                        )}
                        <span className="text-[13px] font-medium text-text-primary">{row.playerName}</span>
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-[12px] text-text-secondary">{row.teamName}</td>
                    <td className="px-3 py-2.5 text-right text-[13px] font-bold tabular-nums text-text-primary">
                      {statValueLabel(category, statType, row)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ── 메인 ────────────────────────────────────────────────────────────────

export default function StandingsPage() {
  const [mainTab, setMainTab] = useState<MainTab>("team");
  const [season, setSeason] = useState<number>(SEASONS[0]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 gap-1 rounded-xl bg-bg-secondary p-1">
          {([
            { key: "team", label: "팀 순위" },
            { key: "personal", label: "개인 기록" },
          ] as { key: MainTab; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setMainTab(key)}
              className={[
                "flex-1 rounded-lg py-2 text-[13px] font-medium transition-colors",
                mainTab === key
                  ? "bg-bg-primary text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 시즌 선택 */}
        <div className="flex shrink-0 gap-1 rounded-xl bg-bg-secondary p-1">
          {SEASONS.map((s) => (
            <button
              key={s}
              onClick={() => setSeason(s)}
              className={[
                "rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                season === s
                  ? "bg-bg-primary text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary",
              ].join(" ")}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-fade-in">
        {mainTab === "team" ? <TeamStandings season={season} /> : <PersonalStats season={season} />}
      </div>
    </div>
  );
}