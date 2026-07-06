"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getGame, getLineScore, getBoxScore, getTimeline } from "@/lib/api/games";
import type { GameResponse } from "@/types";
import type { LineScoreResponse, BoxScoreResponse, TimelineEvent } from "@/types/game";

function formatGameDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function isLive(status: string) {
  return status === "Live" || status === "In Progress";
}
function isFinal(status: string) {
  return status === "Final" || status === "Game Over";
}

type Tab = "timeline" | "linescore" | "boxscore";

// ── 라인스코어 ─────────────────────────────────────────────────────────────

function LineScoreTable({
  lineScores,
  game,
  timeline,
}: {
  lineScores: LineScoreResponse[];
  game: GameResponse;
  timeline: TimelineEvent[];
}) {
  const [selectedInning, setSelectedInning] = useState<number | null>(null);

  const awayRows = lineScores.filter((ls) => !ls.isHome).sort((a, b) => a.inning - b.inning);
  const homeRows = lineScores.filter((ls) => ls.isHome).sort((a, b) => a.inning - b.inning);

  const innings = Math.max(
    9,
    awayRows.length > 0 ? awayRows[awayRows.length - 1].inning : 0,
    homeRows.length > 0 ? homeRows[homeRows.length - 1].inning : 0
  );
  const inningNums = Array.from({ length: innings }, (_, i) => i + 1);

  function find(rows: LineScoreResponse[], inning: number) {
    return rows.find((r) => r.inning === inning);
  }
  const totalR = (rows: LineScoreResponse[]) => rows.reduce((s, r) => s + (r.runs ?? 0), 0);
  const totalH = (rows: LineScoreResponse[]) => rows.reduce((s, r) => s + (r.hits ?? 0), 0);
  const totalE = (rows: LineScoreResponse[]) => rows.reduce((s, r) => s + (r.errors ?? 0), 0);

  // 선택된 이닝의 득점 이벤트(초/말 모두)
  const selectedInningEvents = selectedInning
    ? timeline.filter((ev) => ev.inning === selectedInning && ev.type === "SCORE_CHANGE")
    : [];

  const th = "min-w-[32px] px-2 py-2 text-center text-[11px] font-semibold text-text-secondary";
  const td = "min-w-[32px] px-2 py-2 text-center text-[12px] tabular-nums cursor-pointer transition-colors";

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto rounded-xl bg-bg-primary">
        <table className="w-full min-w-max border-collapse">
          <thead>
            <tr className="border-b border-border-tertiary">
              <th className="w-[120px] px-4 py-2 text-left text-[11px] font-semibold text-text-secondary">팀</th>
              {inningNums.map((n) => (
                <th
                  key={n}
                  onClick={() => setSelectedInning((prev) => (prev === n ? null : n))}
                  className={`${th} cursor-pointer hover:text-text-primary ${selectedInning === n ? "text-accent" : ""}`}
                >
                  {n}
                </th>
              ))}
              <th className={th + " border-l border-border-tertiary"}>R</th>
              <th className={th}>H</th>
              <th className={th}>E</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border-tertiary/50">
              <td className="flex items-center gap-2 px-4 py-2">
                {game.awayTeamLogoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={game.awayTeamLogoUrl} alt={game.awayTeamAbbreviation} className="h-5 w-5 object-contain" />
                )}
                <span className="text-[13px] font-semibold text-text-primary">{game.awayTeamAbbreviation}</span>
              </td>
              {inningNums.map((n) => {
                const row = find(awayRows, n);
                const hasRun = (row?.runs ?? 0) > 0;
                return (
                  <td
                    key={n}
                    onClick={() => setSelectedInning((prev) => (prev === n ? null : n))}
                    className={[
                      td,
                      hasRun ? "font-bold text-accent" : "text-text-primary",
                      selectedInning === n ? "bg-accent/10" : "hover:bg-bg-secondary",
                    ].join(" ")}
                  >
                    {row ? (row.runs ?? "-") : "-"}
                  </td>
                );
              })}
              <td className={td.replace("cursor-pointer", "") + " border-l border-border-tertiary font-bold text-text-primary"}>{totalR(awayRows)}</td>
              <td className={td.replace("cursor-pointer", "") + " text-text-secondary"}>{totalH(awayRows)}</td>
              <td className={td.replace("cursor-pointer", "") + " text-text-secondary"}>{totalE(awayRows)}</td>
            </tr>
            <tr>
              <td className="flex items-center gap-2 px-4 py-2">
                {game.homeTeamLogoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={game.homeTeamLogoUrl} alt={game.homeTeamAbbreviation} className="h-5 w-5 object-contain" />
                )}
                <span className="text-[13px] font-semibold text-text-primary">{game.homeTeamAbbreviation}</span>
              </td>
              {inningNums.map((n) => {
                const row = find(homeRows, n);
                const hasRun = (row?.runs ?? 0) > 0;
                return (
                  <td
                    key={n}
                    onClick={() => setSelectedInning((prev) => (prev === n ? null : n))}
                    className={[
                      td,
                      hasRun ? "font-bold text-accent" : "text-text-primary",
                      selectedInning === n ? "bg-accent/10" : "hover:bg-bg-secondary",
                    ].join(" ")}
                  >
                    {row ? (row.runs ?? "x") : "-"}
                  </td>
                );
              })}
              <td className={td.replace("cursor-pointer", "") + " border-l border-border-tertiary font-bold text-text-primary"}>{totalR(homeRows)}</td>
              <td className={td.replace("cursor-pointer", "") + " text-text-secondary"}>{totalH(homeRows)}</td>
              <td className={td.replace("cursor-pointer", "") + " text-text-secondary"}>{totalE(homeRows)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 선택된 이닝 득점 상세 */}
      {selectedInning && (
        <div className="rounded-xl bg-bg-primary px-4 py-3">
          <p className="mb-2 text-[12px] font-semibold text-text-primary">
            {selectedInning}회 득점 내역
          </p>
          {selectedInningEvents.length === 0 ? (
            <p className="text-[12px] text-text-secondary">이 이닝엔 득점이 없습니다.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {selectedInningEvents.map((ev, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[12px]">
                  <span className="text-text-secondary">
                    {halfLabel(ev.halfInning)} ·
                  </span>
                  <span className="font-medium text-text-primary">
                    {ev.awayScore ?? 0} - {ev.homeScore ?? 0}
                  </span>
                  {ev.scoringPlayers?.length ? (
                    <span className="text-text-secondary">
                      {ev.scoringPlayers.join(", ")} 득점
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── 박스스코어 ─────────────────────────────────────────────────────────────

/**
 * MLB 야구식 이닝 표기를 화면용으로 변환.
 * DB값 6.1 = "6이닝 1/3", 6.2 = "6이닝 2/3" (소수부가 분수를 의미, 진짜 소수 아님)
 */
function formatIP(ip: number | null): string {
  if (ip == null) return "-";
  const whole = Math.trunc(ip);
  const frac = Math.round((ip - whole) * 10);
  if (frac === 1) return `${whole}⅓`;
  if (frac === 2) return `${whole}⅔`;
  return String(whole);
}

/**
 * 위 야구식 표기를 실제 이닝 합산이 가능한 소수(3진법 보정)로 변환.
 * 6.1(=6+1/3) → 6.333..., 6.2(=6+2/3) → 6.666...
 */
function ipToDecimal(ip: number | null): number {
  if (ip == null) return 0;
  const whole = Math.trunc(ip);
  const frac = Math.round((ip - whole) * 10);
  if (frac === 1) return whole + 1 / 3;
  if (frac === 2) return whole + 2 / 3;
  return whole;
}

/** 합산된 소수 이닝(예: 9.333...)을 다시 야구식 "9⅓" 표기로 변환 */
function decimalToIPLabel(decimal: number): string {
  const whole = Math.floor(decimal + 1e-9);
  const remainder = decimal - whole;
  if (remainder > 0.55) return `${whole}⅔`;
  if (remainder > 0.22) return `${whole}⅓`;
  return String(whole);
}

function BoxScoreTable({ boxScores, game }: { boxScores: BoxScoreResponse[]; game: GameResponse }) {
  const [activeTeam, setActiveTeam] = useState<"home" | "away">("away");

  // away 탭 → awayTeamId, home 탭 → homeTeamId
  const teamId = activeTeam === "away" ? game.awayTeamId : game.homeTeamId;

  const batters = boxScores.filter((b) => b.playerType === "BATTER" && b.teamId === teamId);
  const pitchers = boxScores.filter((b) => b.playerType === "PITCHER" && b.teamId === teamId);

  const totalIP = pitchers.reduce((sum, p) => sum + ipToDecimal(p.inningsPitched), 0);
  const totalER = pitchers.reduce((sum, p) => sum + (p.earnedRuns ?? 0), 0);
  const totalH = pitchers.reduce((sum, p) => sum + (p.hitsAllowed ?? 0), 0);
  const totalBB = pitchers.reduce((sum, p) => sum + (p.walksAllowed ?? 0), 0);
  const totalSO = pitchers.reduce((sum, p) => sum + (p.strikeOutsPitched ?? 0), 0);
  const totalPitches = pitchers.reduce((sum, p) => sum + (p.pitchCount ?? 0), 0);

  const th = "px-3 py-2 text-right text-[11px] font-semibold text-text-secondary first:text-left";
  const td = "px-3 py-2 text-right text-[12px] tabular-nums text-text-primary first:text-left";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 rounded-xl bg-bg-secondary p-1">
        {(["away", "home"] as const).map((side) => {
          const abbr = side === "away" ? game.awayTeamAbbreviation : game.homeTeamAbbreviation;
          return (
            <button
              key={side}
              onClick={() => setActiveTeam(side)}
              className={[
                "flex-1 rounded-lg py-1.5 text-[13px] font-medium transition-colors",
                activeTeam === side
                  ? "bg-bg-primary text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary",
              ].join(" ")}
            >
              {abbr}
            </button>
          );
        })}
      </div>

      {batters.length > 0 && (
        <div className="overflow-x-auto rounded-xl bg-bg-primary">
          <table className="w-full min-w-max border-collapse">
            <thead>
              <tr className="border-b border-border-tertiary">
                <th className={th + " w-[160px]"}>타자</th>
                <th className={th}>타수</th>
                <th className={th}>안타</th>
                <th className={th}>홈런</th>
                <th className={th}>타점</th>
                <th className={th}>득점</th>
                <th className={th}>볼넷</th>
                <th className={th}>삼진</th>
              </tr>
            </thead>
            <tbody>
              {batters.map((b) => (
                <tr key={b.id} className="border-b border-border-tertiary/40 last:border-0">
                  <td className={td}>
                    <div className="flex items-center gap-2">
                      {b.playerPhotoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.playerPhotoUrl} alt={b.playerName} className="h-6 w-6 rounded-full object-cover" />
                      )}
                      <span className="text-[12px] font-medium">{b.playerName}</span>
                    </div>
                  </td>
                  <td className={td}>{b.atBats ?? "-"}</td>
                  <td className={td}>{b.hits ?? "-"}</td>
                  <td className={td}>{b.homeRuns ?? "-"}</td>
                  <td className={td}>{b.rbi ?? "-"}</td>
                  <td className={td}>{b.runs ?? "-"}</td>
                  <td className={td}>{b.walks ?? "-"}</td>
                  <td className={td}>{b.strikeOuts ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pitchers.length > 0 && (
        <div className="overflow-x-auto rounded-xl bg-bg-primary">
          <table className="w-full min-w-max border-collapse">
            <thead>
              <tr className="border-b border-border-tertiary">
                <th className={th + " w-[160px]"}>투수</th>
                <th className={th}>이닝</th>
                <th className={th}>피안타</th>
                <th className={th}>자책</th>
                <th className={th}>볼넷</th>
                <th className={th}>삼진</th>
                <th className={th}>투구수</th>
                <th className={th}>결과</th>
              </tr>
            </thead>
            <tbody>
              {pitchers.map((p) => (
                <tr key={p.id} className="border-b border-border-tertiary/40 last:border-0">
                  <td className={td}>
                    <div className="flex items-center gap-2">
                      {p.playerPhotoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.playerPhotoUrl} alt={p.playerName} className="h-6 w-6 rounded-full object-cover" />
                      )}
                      <span className="text-[12px] font-medium">{p.playerName}</span>
                    </div>
                  </td>
                  <td className={td}>{formatIP(p.inningsPitched)}</td>
                  <td className={td}>{p.hitsAllowed ?? "-"}</td>
                  <td className={td}>{p.earnedRuns ?? "-"}</td>
                  <td className={td}>{p.walksAllowed ?? "-"}</td>
                  <td className={td}>{p.strikeOutsPitched ?? "-"}</td>
                  <td className={td}>{p.pitchCount ?? "-"}</td>
                  <td className={td}>
                    {p.isWin ? (
                      <span className="font-semibold text-blue-500">승</span>
                    ) : p.isLoss ? (
                      <span className="font-semibold text-red-500">패</span>
                    ) : p.isSave ? (
                      <span className="font-semibold text-green-500">세</span>
                    ) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* 팀 투수 합계 — 보통 9이닝 안팎이 정상 (연장전이면 더 많을 수 있음) */}
            <tfoot>
              <tr className="border-t border-border-tertiary bg-bg-secondary/50">
                <td className={td + " font-semibold text-text-primary"}>합계</td>
                <td className={td + " font-semibold text-text-primary"}>
                  {decimalToIPLabel(totalIP)}
                </td>
                <td className={td + " font-semibold text-text-primary"}>{totalH}</td>
                <td className={td + " font-semibold text-text-primary"}>{totalER}</td>
                <td className={td + " font-semibold text-text-primary"}>{totalBB}</td>
                <td className={td + " font-semibold text-text-primary"}>{totalSO}</td>
                <td className={td + " font-semibold text-text-primary"}>{totalPitches}</td>
                <td className={td}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

// ── 타임라인 ───────────────────────────────────────────────────────────────

function halfLabel(half: "top" | "bottom") {
  return half === "top" ? "초" : "말";
}

/**
 * 구종 콜코드별 원형 배지 색상 (사진 스타일: 볼=초록, 스트라이크=주황, 타격=파랑)
 */
function pitchBadgeColor(pitch: NonNullable<TimelineEvent["pitches"]>[number]): string {
  if (pitch.isInPlay) return "bg-blue-500";
  if (pitch.isBall) return "bg-green-500";
  if (pitch.isStrike) return "bg-orange-400";
  return "bg-bg-tertiary";
}

/** 투구 결과 한 줄 라벨 (볼/스트라이크/파울/헛스윙/타격 등) */
function pitchResultLabel(pitch: NonNullable<TimelineEvent["pitches"]>[number]): string {
  return pitch.callDescription || pitch.callCode;
}

/**
 * 타자별 타석 카드.
 * 사진 스타일: 헤더(타자명 + 순번 배지) → 결과 한 줄(클릭해서 접고펴기) → 투구 목록(최근이 위, 원형 번호 배지)
 */
function AtBatCard({
  event,
  orderInInning,
}: {
  event: TimelineEvent;
  orderInInning: number;
}) {
  const [open, setOpen] = useState(true);
  const pitches = event.pitches ?? [];
  // 최근 투구가 위로 오도록 역순 정렬
  const pitchesDesc = [...pitches].sort((a, b) => b.pitchNumber - a.pitchNumber);

  // 결과 한 줄: description이 있으면 그대로, 없으면 마지막 투구 결과로 대체
  const resultLine =
    event.description ??
    (pitches.length > 0
      ? `${event.batterName ?? ""} : ${pitchResultLabel(pitches[pitches.length - 1])}`
      : `${event.batterName ?? ""} 타석`);

  return (
    <div className="overflow-hidden rounded-xl bg-bg-primary">
      {/* 타자 헤더 */}
      <div className="flex items-center gap-2 px-4 pt-3">
        <span className="text-[14px] font-bold text-text-primary">
          {event.batterName}
        </span>
        <span className="text-[11px] text-text-secondary">
          {orderInInning}번째 타석
        </span>
      </div>

      {/* 결과 한 줄 (토글) */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-bg-secondary"
      >
        <span className="text-[12px] text-text-secondary">{resultLine}</span>
        <span
          className={`shrink-0 text-[10px] text-text-secondary transition-transform ${open ? "" : "rotate-180"}`}
        >
          ▴
        </span>
      </button>

      {/* 투구 시퀀스 */}
      {open && pitchesDesc.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-border-tertiary px-4 py-3">
          {pitchesDesc.map((p) => (
            <div key={p.pitchNumber} className="flex items-center gap-2.5">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${pitchBadgeColor(p)}`}
              >
                {p.pitchNumber}
              </span>
              <span className="text-[12px] text-text-primary">
                {pitchResultLabel(p)}
              </span>
              {p.pitchTypeName && (
                <span className="text-[11px] text-text-secondary">
                  · {p.pitchTypeName}
                  {p.startSpeed ? ` ${p.startSpeed}mph` : ""}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** PITCH 이외 이벤트(투수교체/도루/대타 등)는 기존처럼 한 줄 알림 형태로 표시 */
function NonAtBatEventRow({ event }: { event: TimelineEvent }) {
  const meta: Record<TimelineEvent["type"], { icon: string; color: string }> = {
    PITCH: { icon: "⚾", color: "text-text-secondary" },
    PLAY: { icon: "🏃", color: "text-text-primary" },
    SCORE_CHANGE: { icon: "🎯", color: "text-accent" },
    STOLEN_BASE: { icon: "💨", color: "text-blue-500" },
    CAUGHT_STEALING: { icon: "🚫", color: "text-red-400" },
    PITCHING_CHANGE: { icon: "🔄", color: "text-purple-500" },
    PINCH_HITTER: { icon: "🦇", color: "text-yellow-500" },
    PINCH_RUNNER: { icon: "👟", color: "text-yellow-500" },
    GAME_END: { icon: "🏁", color: "text-text-primary" },
  };
  const { icon, color } = meta[event.type] ?? { icon: "•", color: "text-text-secondary" };

  let main = event.description ?? "";
  let sub = "";

  if (event.type === "PITCHING_CHANGE") main = `투수 교체: ${event.outgoingPitcher} → ${event.incomingPitcher}`;
  else if (event.type === "PINCH_HITTER") main = `대타: ${event.substituteName} (${event.replacedName} 대신)`;
  else if (event.type === "PINCH_RUNNER") main = `대주자: ${event.substituteName} (${event.replacedName} 대신)`;
  else if (event.type === "STOLEN_BASE") main = `도루 성공 — ${event.stolenBasePlayer} (${event.stolenBase})`;
  else if (event.type === "CAUGHT_STEALING") main = `도루 실패 — ${event.stolenBasePlayer} (${event.stolenBase})`;
  else if (event.type === "GAME_END") main = "경기 종료";
  else if (event.type === "SCORE_CHANGE") {
    sub = `${event.awayScore ?? 0} - ${event.homeScore ?? 0}`;
    if (event.scoringPlayers?.length) sub += ` · ${event.scoringPlayers.join(", ")} 득점`;
  }

  return (
    <div className="flex items-start gap-2 rounded-lg bg-bg-secondary px-3 py-2">
      <span className="mt-px text-[14px]">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className={`text-[12px] leading-snug ${color}`}>{main}</p>
        {sub && <p className="mt-0.5 text-[11px] text-text-secondary">{sub}</p>}
      </div>
    </div>
  );
}

interface InningGroup {
  key: string;
  inning: number;
  half: "top" | "bottom";
  events: TimelineEvent[];
}

function buildInningGroups(events: TimelineEvent[]): InningGroup[] {
  const map = new Map<string, InningGroup>();

  for (const ev of events) {
    const key = `${ev.inning}-${ev.halfInning}`;
    if (!map.has(key)) {
      map.set(key, { key, inning: ev.inning, half: ev.halfInning, events: [] });
    }
    map.get(key)!.events.push(ev);
  }

  // 최신 이닝이 위로, 같은 이닝이면 말(bottom)이 초(top)보다 위
  return [...map.values()].sort((a, b) => {
    if (a.inning !== b.inning) return b.inning - a.inning;
    return a.half === b.half ? 0 : a.half === "bottom" ? -1 : 1;
  });
}

function TimelinePanel({ events }: { events: TimelineEvent[] }) {
  const groups = buildInningGroups(events);

  // 최신 2개 이닝은 기본 펼침
  const [openKeys, setOpenKeys] = useState<Set<string>>(
    () => new Set(groups.slice(0, 2).map((g) => g.key))
  );

  const toggle = (key: string) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  if (events.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-[13px] text-text-secondary">
        타임라인 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {groups.map((group) => {
        const isOpen = openKeys.has(group.key);
        const scoreEvent = [...group.events].reverse().find((e) => e.type === "SCORE_CHANGE");

        // 타석(PITCH)별 순번 매기기 — 사진의 "3번타자" 느낌으로 이닝 내 등장 순서 사용
        let atBatCounter = 0;

        return (
          <div key={group.key} className="overflow-hidden rounded-xl bg-bg-primary">
            <button
              onClick={() => toggle(group.key)}
              className="flex w-full items-center justify-between px-4 py-2.5 transition-colors hover:bg-bg-secondary"
            >
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-text-primary">
                  {group.inning}회 {halfLabel(group.half)}
                </span>
                {scoreEvent && (
                  <span className="text-[11px] text-text-secondary">
                    {scoreEvent.awayScore ?? 0} - {scoreEvent.homeScore ?? 0}
                  </span>
                )}
                <span className="text-[10px] text-text-secondary">
                  ({group.events.length})
                </span>
              </div>
              <span
                className={`text-[11px] text-text-secondary transition-transform ${isOpen ? "rotate-180" : ""}`}
              >
                ▾
              </span>
            </button>

            {isOpen && (
              <div className="flex flex-col gap-2 border-t border-border-tertiary px-3 py-3">
                {group.events.map((ev, idx) => {
                  if (ev.type === "PITCH") {
                    atBatCounter += 1;
                    return (
                      <AtBatCard key={idx} event={ev} orderInInning={atBatCounter} />
                    );
                  }
                  return <NonAtBatEventRow key={idx} event={ev} />;
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── 메인 ──────────────────────────────────────────────────────────────────

export default function GameDetailPage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = use(params);
  const id = Number(gameId);

  const [game, setGame] = useState<GameResponse | null>(null);
  const [lineScores, setLineScores] = useState<LineScoreResponse[]>([]);
  const [boxScores, setBoxScores] = useState<BoxScoreResponse[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [tab, setTab] = useState<Tab>("timeline");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getGame(id),
      getLineScore(id).catch(() => []),
      getBoxScore(id).catch(() => []),
      getTimeline(id).catch(() => []),
    ])
      .then(([g, ls, bs, tl]) => {
        if (!cancelled) {
          setGame(g);
          setLineScores(ls);
          setBoxScores(bs);
          setTimeline(tl);
          setError(null);
        }
      })
      .catch(() => { if (!cancelled) setError("경기 정보를 불러오지 못했습니다."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center text-[13px] text-text-secondary">
        불러오는 중…
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="flex h-60 flex-col items-center justify-center gap-2">
        <p className="text-[13px] text-red-500">{error ?? "경기를 찾을 수 없습니다."}</p>
        <Link href="/games" className="text-[12px] text-text-secondary underline">
          경기 목록으로
        </Link>
      </div>
    );
  }

  const live = isLive(game.status);
  const final = isFinal(game.status);

  return (
    <div className="flex flex-col gap-3">
      <Link
        href="/games"
        className="flex w-fit items-center gap-1 text-[12px] text-text-secondary hover:text-text-primary"
      >
        ‹ 경기 목록
      </Link>

      {/* 헤더 스코어보드 */}
      <div className="rounded-xl bg-bg-primary px-5 py-5">
        <div className="mb-4 flex items-center gap-2">
          {live && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-semibold text-red-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
              LIVE
            </span>
          )}
          {final && <span className="text-[11px] text-text-secondary">경기 종료</span>}
          <span className="text-[11px] text-text-secondary">{formatGameDate(game.gameDate)}</span>
          {game.venue && <span className="text-[11px] text-text-secondary">· {game.venue}</span>}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 flex-col items-start gap-2">
            {game.awayTeamLogoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={game.awayTeamLogoUrl} alt={game.awayTeamAbbreviation} className="h-14 w-14 object-contain" />
            )}
            <div>
              <p className="text-[15px] font-bold text-text-primary">{game.awayTeamAbbreviation}</p>
              <p className="text-[12px] text-text-secondary">{game.awayTeamName}</p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-1">
            {live || final ? (
              <div className="flex items-center gap-3 text-[36px] font-extrabold tabular-nums text-text-primary">
                <span>{game.awayScore ?? 0}</span>
                <span className="text-[20px] font-light text-text-secondary">-</span>
                <span>{game.homeScore ?? 0}</span>
              </div>
            ) : (
              <div className="text-[24px] font-bold text-text-primary">
                {new Date(game.gameDate).toLocaleTimeString("ko-KR", {
                  timeZone: "Asia/Seoul",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col items-end gap-2">
            {game.homeTeamLogoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={game.homeTeamLogoUrl} alt={game.homeTeamAbbreviation} className="h-14 w-14 object-contain" />
            )}
            <div className="text-right">
              <p className="text-[15px] font-bold text-text-primary">{game.homeTeamAbbreviation}</p>
              <p className="text-[12px] text-text-secondary">{game.homeTeamName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 rounded-xl bg-bg-secondary p-1">
        {([
          { key: "timeline", label: "타임라인" },
          { key: "linescore", label: "라인스코어" },
          { key: "boxscore", label: "세부 기록" },
        ] as { key: Tab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={[
              "flex-1 rounded-lg py-2 text-[13px] font-medium transition-colors",
              tab === key
                ? "bg-bg-primary text-text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div className="animate-fade-in">
        {tab === "timeline" && <TimelinePanel events={timeline} />}
        {tab === "linescore" && <LineScoreTable lineScores={lineScores} game={game} timeline={timeline} />}
        {tab === "boxscore" && <BoxScoreTable boxScores={boxScores} game={game} />}
      </div>
    </div>
  );
}
