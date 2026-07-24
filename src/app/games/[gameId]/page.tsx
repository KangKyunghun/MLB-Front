<<<<<<< HEAD
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
=======
"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  getGame,
  getLineScore,
  getBoxScore,
  getTimeline,
  getBatterStatBySeason,
  getPitcherStatBySeason,
  getDefenseSnapshot,
} from "@/lib/api/games";
import type { GameResponse } from "@/types";
import type {
  LineScoreResponse,
  BoxScoreResponse,
  TimelineEvent,
  DefenseSnapshotResponse,
} from "@/types/game";

/** 시즌 타율/방어율 소수점 표기 (타율 .310, 방어율 3.45 스타일) */
function formatAvg(avg: number | null | undefined): string {
  if (avg == null) return "-";
  return avg.toFixed(3).replace(/^0/, "");
}
function formatEra(era: number | null | undefined): string {
  if (era == null) return "-";
  return era.toFixed(2);
}

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

type Tab = "timeline" | "boxscore";

// ── 라인스코어 ─────────────────────────────────────────────────────────────

function LineScoreTable({
  lineScores,
  game,
  boxScores,
}: {
  lineScores: LineScoreResponse[];
  game: GameResponse;
  boxScores: BoxScoreResponse[];
}) {
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

  // 팀 볼넷 합계 — 박스스코어의 타자 walks 합산 (원정/홈 팀 ID로 구분)
  const totalBB = (teamId: number) =>
    boxScores
      .filter((b) => b.playerType === "BATTER" && b.teamId === teamId)
      .reduce((s, b) => s + (b.walks ?? 0), 0);

  const th = "min-w-[32px] px-2 py-2 text-center text-[11px] font-semibold text-text-secondary";
  const td = "min-w-[32px] px-2 py-2 text-center text-[12px] tabular-nums text-text-primary";

  return (
    <div className="overflow-x-auto rounded-xl bg-bg-primary">
      <table className="w-full min-w-max border-collapse">
        <thead>
          <tr className="border-b border-border-tertiary">
            <th className="w-[120px] px-4 py-2 text-left text-[11px] font-semibold text-text-secondary">팀</th>
            {inningNums.map((n) => (
              <th key={n} className={th}>
                {n}
              </th>
            ))}
            <th className={th + " border-l border-border-tertiary"}>R</th>
            <th className={th}>H</th>
            <th className={th}>E</th>
            <th className={th}>BB</th>
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
              return (
                <td key={n} className={td}>
                  {row ? (row.runs ?? "-") : "-"}
                </td>
              );
            })}
            <td className={td + " border-l border-border-tertiary font-bold"}>{totalR(awayRows)}</td>
            <td className={td + " text-text-secondary"}>{totalH(awayRows)}</td>
            <td className={td + " text-text-secondary"}>{totalE(awayRows)}</td>
            <td className={td + " text-text-secondary"}>{totalBB(game.awayTeamId)}</td>
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
              return (
                <td key={n} className={td}>
                  {row ? (row.runs ?? "x") : "-"}
                </td>
              );
            })}
            <td className={td + " border-l border-border-tertiary font-bold"}>{totalR(homeRows)}</td>
            <td className={td + " text-text-secondary"}>{totalH(homeRows)}</td>
            <td className={td + " text-text-secondary"}>{totalE(homeRows)}</td>
            <td className={td + " text-text-secondary"}>{totalBB(game.homeTeamId)}</td>
          </tr>
        </tbody>
      </table>
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

function BoxScoreTable({
  boxScores,
  game,
  timeline,
}: {
  boxScores: BoxScoreResponse[];
  game: GameResponse;
  timeline: TimelineEvent[];
}) {
  const [activeTeam, setActiveTeam] = useState<"home" | "away">("away");

  // 교체 유형별 "들어온" 선수 이름 → 배지 레이블 매핑
  const subInMap = new Map<string, string>();
  for (const e of timeline) {
    const t = e.type as string;
    if (t === "PINCH_HITTER" && e.substituteName) subInMap.set(e.substituteName, "대타");
    if (t === "PINCH_RUNNER" && e.substituteName) subInMap.set(e.substituteName, "대주자");
    if (t === "DEFENSIVE_SUB" && e.substituteName) subInMap.set(e.substituteName, "대수비");
  }
  const subOutNames = new Set(
    timeline
      .filter((e) => {
        const t = e.type as string;
        return t === "PINCH_HITTER" || t === "PINCH_RUNNER" || t === "DEFENSIVE_SUB";
      })
      .map((e) => e.replacedName)
      .filter((name): name is string => !!name)
  );

  // 선수별 시즌 성적(경기 후 최신 타율/방어율) — playerId → avg / era
  const [seasonAvg, setSeasonAvg] = useState<Record<number, number | null>>({});
  const [seasonEra, setSeasonEra] = useState<Record<number, number | null>>({});

  // away 탭 → awayTeamId, home 탭 → homeTeamId
  const teamId = activeTeam === "away" ? game.awayTeamId : game.homeTeamId;

  const rawBatters = boxScores.filter((b) => b.playerType === "BATTER" && b.teamId === teamId);
  const pitchers = boxScores.filter((b) => b.playerType === "PITCHER" && b.teamId === teamId);

  // OUT 선수 바로 아래에 그를 대체한 IN 선수가 오도록 정렬
  const batters: BoxScoreResponse[] = (() => {
    // 대체 관계 맵: replacedName → substituteName
    const replacedByMap = new Map<string, string>();
    // 역방향 맵: substituteName → replacedName (대체된 선수가 누구인지)
    const substituteOfMap = new Map<string, string>();
    for (const e of timeline) {
      const t = e.type as string;
      if ((t === "PINCH_HITTER" || t === "PINCH_RUNNER" || t === "DEFENSIVE_SUB") && e.replacedName && e.substituteName) {
        replacedByMap.set(e.replacedName, e.substituteName);
        substituteOfMap.set(e.substituteName, e.replacedName);
      }
    }

    const byName = new Map(rawBatters.map((b) => [b.playerName, b]));
    const inserted = new Set<string>();
    const result: BoxScoreResponse[] = [];

    // battingOrder 기준 정렬, 같은 타순이면 OUT(교체된) 선수가 먼저, IN(대체) 선수가 나중에
    const ordered = [...rawBatters].sort((a, b) => {
      const ao = a.battingOrder ?? 99;
      const bo = b.battingOrder ?? 99;
      if (ao !== bo) return ao - bo;
      // 같은 타순이면 OUT 선수(replacedByMap에 있는 선수)가 먼저
      const aIsOut = replacedByMap.has(a.playerName) ? -1 : 0;
      const bIsOut = replacedByMap.has(b.playerName) ? -1 : 0;
      return aIsOut - bIsOut;
    });

    for (const batter of ordered) {
      if (inserted.has(batter.playerName)) continue;
      // 이 선수가 누군가의 대체 선수면 OUT 선수 다음에 삽입돼야 하므로 여기선 스킵
      if (substituteOfMap.has(batter.playerName)) continue;
      result.push(batter);
      inserted.add(batter.playerName);

      // 이 선수를 대체한 선수가 있으면 바로 아래에 삽입 (연쇄 대체도 처리)
      let current = batter.playerName;
      while (replacedByMap.has(current)) {
        const subName = replacedByMap.get(current)!;
        const sub = byName.get(subName);
        if (sub && !inserted.has(sub.playerName)) {
          result.push(sub);
          inserted.add(sub.playerName);
        }
        current = subName;
      }
    }

    // 아직 안 들어간 선수 뒤에 추가
    for (const batter of ordered) {
      if (!inserted.has(batter.playerName)) result.push(batter);
    }

    return result;
  })();

  // 수비 위치 변경 맵: playerName → "이전포지션 → 새포지션"
  const positionChangeMap = new Map<string, string>();
  for (const e of timeline) {
    const t = e.type as string;
    if (t === "DEFENSIVE_SUB" && e.substituteName && e.substitutePosition) {
      const batter = rawBatters.find((b) => b.playerName === e.substituteName);
      if (batter?.gamePosition && batter.gamePosition !== e.substitutePosition) {
        positionChangeMap.set(e.substituteName, `${e.substitutePosition} → ${batter.gamePosition}`);
      }
    }
  }

  // 박스스코어에 나온 타자/투수들의 시즌 타율·방어율을 불러옴 (경기 후 최신 성적 표시용)
  useEffect(() => {
    let cancelled = false;

    const batterIds = Array.from(
      new Set(
        boxScores
          .filter((b) => b.playerType === "BATTER")
          .map((b) => b.playerId)
      )
    );
    const pitcherIds = Array.from(
      new Set(
        boxScores
          .filter((b) => b.playerType === "PITCHER")
          .map((b) => b.playerId)
      )
    );

    Promise.all(
      batterIds.map((playerId) =>
        getBatterStatBySeason(playerId, game.season, game.gameType)
          .then((stat) => [playerId, stat.avg] as const)
          .catch(() => [playerId, null] as const)
      )
    ).then((entries) => {
      if (!cancelled) {
        setSeasonAvg(Object.fromEntries(entries));
      }
    });

    Promise.all(
      pitcherIds.map((playerId) =>
        getPitcherStatBySeason(playerId, game.season, game.gameType)
          .then((stat) => [playerId, stat.era] as const)
          .catch(() => [playerId, null] as const)
      )
    ).then((entries) => {
      if (!cancelled) {
        setSeasonEra(Object.fromEntries(entries));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [boxScores, game.season, game.gameType]);

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
                <th className={th}>타순</th>
                <th className={th}>포지션</th>
                <th className={th}>타수</th>
                <th className={th}>안타</th>
                <th className={th}>홈런</th>
                <th className={th}>타점</th>
                <th className={th}>득점</th>
                <th className={th}>볼넷</th>
                <th className={th}>삼진</th>
                <th className={th}>타율</th>
              </tr>
            </thead>
            <tbody>
              {batters.map((b) => (
                <tr key={b.id} className="border-b border-border-tertiary/40 last:border-0">
                  <td className={td}>
                    <div className="flex items-center gap-1.5">
                      {b.playerPhotoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.playerPhotoUrl} alt={b.playerName} className="h-6 w-6 rounded-full object-cover" />
                      )}
                      <span className="text-[12px] font-medium">{b.playerName}</span>
                      {subInMap.has(b.playerName) && (
                        <span className="rounded bg-blue-500/15 px-1 py-px text-[9px] font-semibold text-blue-500">
                          {subInMap.get(b.playerName)}
                        </span>
                      )}
                      {subOutNames.has(b.playerName) && (
                        <span className="rounded bg-bg-tertiary px-1 py-px text-[9px] font-semibold text-text-secondary">
                          OUT
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={td + " text-text-secondary"}>
                    {b.battingOrder != null ? `${b.battingOrder}번` : "-"}
                  </td>
                  <td className={td + " font-mono text-[11px] text-text-secondary"}>
                    {positionChangeMap.has(b.playerName)
                      ? positionChangeMap.get(b.playerName)
                      : (b.gamePosition ?? "-")}
                  </td>
                  <td className={td}>{b.atBats ?? "-"}</td>
                  <td className={td}>{b.hits ?? "-"}</td>
                  <td className={td}>{b.homeRuns ?? "-"}</td>
                  <td className={td}>{b.rbi ?? "-"}</td>
                  <td className={td}>{b.runs ?? "-"}</td>
                  <td className={td}>{b.walks ?? "-"}</td>
                  <td className={td}>{b.strikeOuts ?? "-"}</td>
                  <td className={td + " font-semibold"}>
                    {formatAvg(seasonAvg[b.playerId])}
                  </td>
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
                <th className={th}>방어율</th>
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
                    ) : p.isHold ? (
                      <span className="font-semibold text-purple-500">홀드</span>
                    ) : "-"}
                  </td>
                  <td className={td + " font-semibold"}>
                    {formatEra(seasonEra[p.playerId])}
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
 * 타자 한 명의 전체 타석 카드.
 * 헤더(타자명 + N번타자 배지) → 결과 한 줄(토글) → 투구 목록(최근이 위)
 * pitches는 그 타석의 모든 PITCH 이벤트를 모아서 넘겨준다.
 */
function AtBatCard({
  batterName,
  description,
  battingOrder,
  pitches,
  subLabel,
}: {
  batterName: string;
  description: string;
  battingOrder?: number | null;
  pitches: TimelineEvent["pitches"];
  subLabel?: string;
}) {
  const [open, setOpen] = useState(true);
  const allPitches = pitches ?? [];
  const pitchesDesc = [...allPitches].sort((a, b) => b.pitchNumber - a.pitchNumber);

  return (
    <div className="overflow-hidden rounded-xl bg-bg-primary">
      {/* 타자 헤더 */}
      <div className="flex items-center gap-2 px-4 pt-3">
        <span className="text-[14px] font-bold text-text-primary">{batterName}</span>
        {battingOrder ? (
          <span className="rounded-full bg-bg-tertiary px-2 py-0.5 text-[11px] font-medium text-text-secondary">
            {battingOrder}번타자
          </span>
        ) : null}
        {subLabel ? (
          <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[11px] font-semibold text-blue-500">
            {subLabel}
          </span>
        ) : null}
      </div>

      {/* 결과 한 줄 (토글) */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-bg-secondary"
      >
        <span className="text-[12px] text-text-secondary">{description}</span>
        <span className={`shrink-0 text-[10px] text-text-secondary transition-transform ${open ? "" : "rotate-180"}`}>
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
              <span className="text-[12px] text-text-primary">{pitchResultLabel(p)}</span>
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
  const meta: Record<string, { icon: string; color: string }> = {
    PITCH: { icon: "⚾", color: "text-text-secondary" },
    PLAY: { icon: "🏃", color: "text-text-primary" },
    SCORE_CHANGE: { icon: "🎯", color: "text-accent" },
    STOLEN_BASE: { icon: "💨", color: "text-blue-500" },
    CAUGHT_STEALING: { icon: "🚫", color: "text-red-400" },
    PITCHING_CHANGE: { icon: "🔄", color: "text-purple-500" },
    PINCH_HITTER: { icon: "🦇", color: "text-yellow-500" },
    PINCH_RUNNER: { icon: "👟", color: "text-yellow-500" },
    DEFENSIVE_SUB: { icon: "🔀", color: "text-blue-400" },
    GAME_END: { icon: "🏁", color: "text-text-primary" },
  };
  const { icon, color } = meta[event.type] ?? { icon: "•", color: "text-text-secondary" };

  let main = event.description ?? "";
  let sub = "";

  if (event.type === "PITCHING_CHANGE") main = `투수 교체: ${event.outgoingPitcher} → ${event.incomingPitcher}`;
  else if (event.type === "PINCH_HITTER") main = `대타: ${event.substituteName} (${event.replacedName} 대신)`;
  else if (event.type === "PINCH_RUNNER") main = `대주자: ${event.substituteName} (${event.replacedName} 대신)`;
  else if ((event.type as string) === "DEFENSIVE_SUB") main = `대수비: ${event.substituteName} (${event.replacedName} 대신${(event as unknown as { substitutePosition?: string }).substitutePosition ? ` · ${(event as unknown as { substitutePosition?: string }).substitutePosition}` : ""})`;
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

/**
 * 이닝-half 이벤트 목록을 "타자 단위 블록"으로 그룹핑.
 * PITCH 이벤트는 동일 atBatIndex끼리 묶어서 AtBatCard 하나로 만들고,
 * PITCH 이외 이벤트(교체, 도루, 투수교체 등)는 발생 순서대로 그룹 사이에 끼워 넣는다.
 */
interface AtBatGroup {
  type: "atbat";
  batterName: string;
  description: string;
  pitches: NonNullable<TimelineEvent["pitches"]>;
  atBatIndex: string;
  subLabel?: string; // "대타" | "대주자" — 이 타석이 교체 후 첫 타석이면 설정
}
interface NonAtBatItem {
  type: "event";
  event: TimelineEvent;
}
type TimelineItem = AtBatGroup | NonAtBatItem;

function groupInningEvents(events: TimelineEvent[]): TimelineItem[] {
  const items: TimelineItem[] = [];
  const atBatMap = new Map<string, AtBatGroup>();
  // 다음 PITCH 이벤트에 붙일 교체 레이블 (대타/대주자)
  let pendingSubLabel: string | undefined;

  for (const ev of events) {
    const t = ev.type as string;

    if (t === "PINCH_HITTER") {
      pendingSubLabel = "대타";
      // 별도 행으로도 남기지 않음 — AtBatCard 헤더에 합쳐짐
      continue;
    }
    if (t === "PINCH_RUNNER") {
      pendingSubLabel = "대주자";
      continue;
    }

    if (ev.type === "PITCH" && ev.atBatIndex) {
      const key = ev.atBatIndex;
      if (!atBatMap.has(key)) {
        const group: AtBatGroup = {
          type: "atbat",
          batterName: ev.batterName ?? "",
          description: `${ev.batterName ?? ""} 타석`,
          pitches: [],
          atBatIndex: key,
          subLabel: pendingSubLabel,
        };
        pendingSubLabel = undefined;
        atBatMap.set(key, group);
        items.push(group);
      }
      const group = atBatMap.get(key)!;
      group.pitches.push(...(ev.pitches ?? []));
    } else if (ev.type === "PLAY" || ev.type === "SCORE_CHANGE") {
      const key = ev.atBatIndex;
      const group = key ? atBatMap.get(key) : undefined;
      if (group && ev.description) {
        group.description = `${group.batterName} : ${ev.description}`;
      } else {
        items.push({ type: "event", event: ev });
      }
    } else {
      items.push({ type: "event", event: ev });
    }
  }

  // 투구 번호 기준 중복 제거
  for (const item of items) {
    if (item.type === "atbat") {
      const seen = new Set<number>();
      item.pitches = item.pitches.filter((p) => {
        if (seen.has(p.pitchNumber)) return false;
        seen.add(p.pitchNumber);
        return true;
      });
    }
  }

  return items;
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

/**
 * 득점 상황 탭 콘텐츠 — 이닝 탭 맨 앞 "득점" 탭 선택 시 표시.
 * 어떤 타자가 어떤 타격(안타/2루타/희생플라이 등)으로 타점을 만들었는지(description)와
 * 그 결과 어떤 주자가 득점했는지(scoringPlayers)를 함께 보여준다.
 */
function ScoringPanel({ events }: { events: TimelineEvent[] }) {
  const scoringEvents = events.filter((e) => e.type === "SCORE_CHANGE");

  if (scoringEvents.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-[13px] text-text-secondary">
        아직 득점이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {scoringEvents.map((ev, idx) => (
        <div key={idx} className="flex flex-col gap-1.5 rounded-xl bg-bg-primary px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="shrink-0 rounded bg-bg-tertiary px-1.5 py-0.5 text-[11px] font-medium text-text-secondary">
              {ev.inning}회 {halfLabel(ev.halfInning)}
            </span>
            <span className="shrink-0 text-[12px] font-semibold tabular-nums text-text-primary">
              {ev.awayScore ?? 0} - {ev.homeScore ?? 0}
            </span>
          </div>

          {/* 타자가 어떤 타격으로 타점을 만들었는지 */}
          {(ev.batterName || ev.description) && (
            <p className="text-[13px] font-medium text-text-primary">
              {ev.batterName && <span className="font-bold">{ev.batterName}</span>}
              {ev.batterName && ev.description ? " — " : ""}
              {ev.description}
              {ev.rbi ? ` (${ev.rbi}타점)` : ""}
            </p>
          )}

          {/* 어떤 주자가 득점했는지 */}
          {ev.scoringPlayers?.length ? (
            <p className="text-[12px] text-text-secondary">
              🏃 {ev.scoringPlayers.join(", ")} 득점
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** 다이아몬드 안 포지션별 배지 하나 */
function DefensePositionBadge({ label, playerName }: { label: string; playerName: string | null }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="rounded-md bg-black/25 px-2 py-1 text-[11px] font-semibold text-white">
        {playerName ?? "-"}
      </span>
      <span className="text-[9px] font-medium text-white/70">{label}</span>
    </div>
  );
}

/**
 * 이닝(초/말) 시점 수비 상황 박스.
 * 라인스코어 박스와 이닝 탭 박스 사이에 표시되며, 선택된 이닝에 맞춰 그 시점 수비 라인업과
 * 현재타자/대기타자/다음타자를 보여준다. 종료된 경기도 이닝을 바꾸면 그 시점 상황으로 다시 조회한다.
 */
function DefenseBox({
  gameId,
  inning,
  hasTop,
  hasBottom,
}: {
  gameId: number;
  inning: number;
  hasTop: boolean;
  hasBottom: boolean;
}) {
  // 사용자가 직접 고른 half. 초기값은 그 이닝에 있는 half로.
  const [selectedHalf, setSelectedHalf] = useState<"top" | "bottom">(
    hasBottom ? "bottom" : "top"
  );

  // 렌더 중 계산되는 파생값 — 이닝이 바뀌어 선택된 half가 그 이닝엔 없으면 있는 쪽으로 보정.
  // (effect에서 setState 하지 않고, 렌더 시점에 바로 계산하는 방식 — React 공식 권장 패턴)
  const half: "top" | "bottom" =
    selectedHalf === "top" && !hasTop && hasBottom
      ? "bottom"
      : selectedHalf === "bottom" && !hasBottom && hasTop
        ? "top"
        : selectedHalf;

  // 요청 키가 바뀌면 자동으로 "로딩 중"이 되도록, 결과와 그 결과를 만든 키를 함께 저장.
  // → loading을 별도 state로 안 두고, "지금 보여줄 데이터의 키"와 "지금 원하는 키"를 비교해서 파생.
  const requestKey = `${gameId}-${inning}-${half}`;
  const [result, setResult] = useState<{ key: string; data: DefenseSnapshotResponse | null }>({
    key: "",
    data: null,
  });

  const loading = result.key !== requestKey;
  const data = result.key === requestKey ? result.data : null;

  useEffect(() => {
    let cancelled = false;
    // setState 호출이 전부 비동기 콜백(.then/.catch) 안에서만 일어나므로
    // "effect 안에서 동기적으로 setState" 경고 대상이 아님.
    getDefenseSnapshot(gameId, inning, half)
      .then((res) => {
        if (!cancelled) setResult({ key: requestKey, data: res });
      })
      .catch(() => {
        if (!cancelled) setResult({ key: requestKey, data: null });
      });
    return () => {
      cancelled = true;
    };
  }, [gameId, inning, half, requestKey]);

  const posMap = new Map((data?.positions ?? []).map((p) => [p.position, p.playerName]));

  return (
    <div className="overflow-hidden rounded-xl bg-bg-primary">
      {/* 헤더: 초/말 토글 + 스코어 */}
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="flex gap-1 rounded-full bg-bg-secondary p-0.5">
          {(["top", "bottom"] as const).map((h) => (
            <button
              key={h}
              onClick={() => (h === "top" ? hasTop : hasBottom) && setSelectedHalf(h)}
              disabled={h === "top" ? !hasTop : !hasBottom}
              className={[
                "rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                half === h
                  ? "bg-accent text-white"
                  : (h === "top" ? hasTop : hasBottom)
                    ? "text-text-secondary hover:text-text-primary"
                    : "cursor-default text-text-secondary/30",
              ].join(" ")}
            >
              {inning}회 {halfLabel(h)}
            </button>
          ))}
        </div>
        {data && (
          <span className="text-[12px] font-semibold tabular-nums text-text-primary">
            {data.awayScore} - {data.homeScore}
          </span>
        )}
      </div>

      {loading || !data ? (
        <div className="flex h-40 items-center justify-center text-[12px] text-text-secondary">
          {loading ? "수비 상황 불러오는 중..." : "수비 정보가 없습니다."}
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-4">
          {/* 수비 다이아몬드 (간략화된 배치) */}
          <div className="relative overflow-hidden rounded-xl bg-[#2f6b3c] px-4 py-5">
            <p className="mb-2 text-[11px] font-semibold text-white/80">
              {data.fieldingTeamAbbreviation} 수비
            </p>
            <div className="flex flex-col items-center gap-4">
              <div className="flex w-full justify-between px-4">
                <DefensePositionBadge label="좌익수" playerName={posMap.get("LF") ?? null} />
                <DefensePositionBadge label="중견수" playerName={posMap.get("CF") ?? null} />
                <DefensePositionBadge label="우익수" playerName={posMap.get("RF") ?? null} />
              </div>
              <div className="flex w-full justify-between px-8">
                <DefensePositionBadge label="3루수" playerName={posMap.get("3B") ?? null} />
                <DefensePositionBadge label="유격수" playerName={posMap.get("SS") ?? null} />
                <DefensePositionBadge label="2루수" playerName={posMap.get("2B") ?? null} />
                <DefensePositionBadge label="1루수" playerName={posMap.get("1B") ?? null} />
              </div>
              <DefensePositionBadge label="투수" playerName={posMap.get("P") ?? null} />
              <DefensePositionBadge label="포수" playerName={posMap.get("C") ?? null} />
            </div>
          </div>

          {/* 카운트 */}
          <div className="flex items-center justify-center gap-4 text-[12px] font-medium text-text-secondary">
            <span>B {data.balls}</span>
            <span>S {data.strikes}</span>
            <span>O {data.outs}</span>
          </div>

          {/* 현재타자 / 대기타자 / 다음타자 */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "타석", player: data.currentBatter },
              { label: "대기타석", player: data.onDeck },
              { label: "다음타자", player: data.inHole },
            ].map(({ label, player }) => (
              <div key={label} className="flex flex-col items-center gap-1 rounded-lg bg-bg-secondary px-2 py-2.5">
                <span className="text-[10px] font-medium text-text-secondary">{label}</span>
                <span className="text-[12px] font-semibold text-text-primary">
                  {player?.playerName ?? "-"}
                </span>
                {player?.battingOrder ? (
                  <span className="text-[10px] text-text-secondary">{player.battingOrder}번타자</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** 이닝 탭 맨 앞 "득점" 탭을 포함하기 위한 선택 상태 타입 */
type SelectedInningTab = number | "score";

function TimelinePanel({
  events,
  gameId,
  boxScores,
}: {
  events: TimelineEvent[];
  gameId: number;
  boxScores: BoxScoreResponse[];
}) {
  const groups = buildInningGroups(events);
  const scoringEvents = events.filter((e) => e.type === "SCORE_CHANGE");

  const latestInningWithEvents =
    events.length > 0 ? Math.max(...events.map((e) => e.inning)) : 1;
  const [selectedTab, setSelectedTab] = useState<SelectedInningTab>(latestInningWithEvents);

  // 타자 이름 → 타순(N번타자) 매핑 (AtBatCard 배지용)
  const battingOrderByName = new Map<string, number>();
  for (const b of boxScores) {
    if (b.playerType === "BATTER" && b.battingOrder != null) {
      battingOrderByName.set(b.playerName, b.battingOrder);
    }
  }

  if (events.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-[13px] text-text-secondary">
        타임라인 데이터가 없습니다.
      </div>
    );
  }

  const maxInning = Math.max(9, ...events.map((e) => e.inning));
  const inningNums = Array.from({ length: maxInning }, (_, i) => i + 1);

  // 초/말 순서로 정렬 (초가 먼저)
  const topGroup =
    typeof selectedTab === "number"
      ? groups.find((g) => g.inning === selectedTab && g.half === "top")
      : undefined;
  const bottomGroup =
    typeof selectedTab === "number"
      ? groups.find((g) => g.inning === selectedTab && g.half === "bottom")
      : undefined;
  const orderedGroups = [topGroup, bottomGroup].filter(
    (g): g is InningGroup => g !== undefined
  );

  return (
    <div className="flex flex-col gap-3">
      {/* 수비 상황 박스 — 라인스코어와 이닝 탭 사이, 선택된 이닝의 수비/타순 상황 */}
      {typeof selectedTab === "number" && (
        <DefenseBox
          gameId={gameId}
          inning={selectedTab}
          hasTop={!!topGroup}
          hasBottom={!!bottomGroup}
        />
      )}

      {/* 이닝 탭 — 맨 앞에 "득점" 탭 */}
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-bg-primary p-1.5">
        <button
          onClick={() => scoringEvents.length > 0 && setSelectedTab("score")}
          disabled={scoringEvents.length === 0}
          className={[
            "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
            selectedTab === "score"
              ? "bg-accent text-white"
              : scoringEvents.length > 0
                ? "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                : "cursor-default text-text-secondary/30",
          ].join(" ")}
        >
          득점
        </button>
        {inningNums.map((n) => {
          const hasEvents = groups.some((g) => g.inning === n);
          const selected = selectedTab === n;
          return (
            <button
              key={n}
              onClick={() => hasEvents && setSelectedTab(n)}
              disabled={!hasEvents}
              className={[
                "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                selected
                  ? "bg-accent text-white"
                  : hasEvents
                    ? "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                    : "cursor-default text-text-secondary/30",
              ].join(" ")}
            >
              {n}회
            </button>
          );
        })}
      </div>

      {/* 선택된 탭 내용 */}
      <div className="flex flex-col gap-3">
        {selectedTab === "score" ? (
          <ScoringPanel events={events} />
        ) : orderedGroups.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-[13px] text-text-secondary">
            이 이닝엔 아직 기록이 없습니다.
          </div>
        ) : (
          orderedGroups.map((group) => {
            const items = groupInningEvents(group.events);
            return (
              <div key={group.key} className="flex flex-col gap-2">
                <div className="px-1 text-[13px] font-semibold text-text-primary">
                  {group.inning}회 {halfLabel(group.half)}
                </div>
                {items.map((item, idx) => {
                  if (item.type === "atbat") {
                    return (
                      <AtBatCard
                        key={item.atBatIndex ?? idx}
                        batterName={item.batterName}
                        description={item.description}
                        pitches={item.pitches}
                        battingOrder={battingOrderByName.get(item.batterName) ?? null}
                        subLabel={item.subLabel}
                      />
                    );
                  }
                  return <NonAtBatEventRow key={idx} event={item.event} />;
                })}
              </div>
            );
          })
        )}
      </div>
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

      {/* 라인스코어 — 탭이 아니라 헤더 바로 아래 항상 표시 */}
      <LineScoreTable lineScores={lineScores} game={game} boxScores={boxScores} />

      {/* 탭 */}
      <div className="flex gap-1 rounded-xl bg-bg-secondary p-1">
        {([
          { key: "timeline", label: "타임라인" },
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
        {tab === "timeline" && (
          <TimelinePanel events={timeline} gameId={id} boxScores={boxScores} />
        )}
        {tab === "boxscore" && <BoxScoreTable boxScores={boxScores} game={game} timeline={timeline} />}
      </div>
    </div>
  );
}
>>>>>>> 6f375ed (MacBook 환경 및 경기 상세 페이지 구현 중)
