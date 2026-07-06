"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getGamesByDate } from "@/lib/api/games";
import type { GameResponse } from "@/types";

// ── 날짜 헬퍼 ──────────────────────────────────────────────────────────────

/** Date → "YYYY-MM-DD" (KST) */
function toKSTDateString(d: Date): string {
  return d
    .toLocaleDateString("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\. /g, "-")
    .replace(/\./g, "");
}

/** "YYYY-MM-DD" → 화면 표시용 "M월 D일 (요)" */
function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${m}월 ${d}일 (${days[date.getDay()]})`;
}

/** 경기 시간 (KST) 표시 */
function formatGameTime(gameDateISO: string): string {
  return new Date(gameDateISO).toLocaleTimeString("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** 날짜 이동: base 기준 ±days */
function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return toKSTDateString(dt);
}

// ── status 분류 ────────────────────────────────────────────────────────────

function isLive(status: string) {
  return status === "Live" || status === "In Progress";
}
function isFinal(status: string) {
  return status === "Final" || status === "Game Over";
}
function isScheduled(status: string) {
  return !isLive(status) && !isFinal(status);
}

// ── 이닝 배지 (Live 경기용) ─────────────────────────────────────────────────
// 백엔드 Game.status 예: "Live" / 실제 이닝 정보는 별도 linescore API에서 오지만,
// 목록 페이지에서는 status 문자열만 표시합니다.
function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-semibold text-red-500">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
      LIVE
    </span>
  );
}

// ── 경기 카드 ──────────────────────────────────────────────────────────────

function GameCard({ game }: { game: GameResponse }) {
  const live = isLive(game.status);
  const final = isFinal(game.status);
  const scheduled = isScheduled(game.status);

  // 스코어 표시 여부
  const showScore = live || final;

  return (
    <Link
      href={`/games/${game.id}`}
      className="flex items-center gap-4 rounded-xl bg-bg-primary px-4 py-3 transition-colors hover:bg-bg-secondary"
    >
      {/* 홈 팀 */}
      <TeamBlock
        logoUrl={game.homeTeamLogoUrl}
        abbreviation={game.homeTeamAbbreviation}
        name={game.homeTeamName}
        score={game.homeScore}
        showScore={showScore}
        align="left"
      />

      {/* 중앙: 상태/스코어 */}
      <div className="flex w-[96px] shrink-0 flex-col items-center gap-1">
        {live && <LiveBadge />}

        {showScore ? (
          <div className="flex items-center gap-2 text-[22px] font-bold tabular-nums text-text-primary">
            <span>{game.awayScore ?? "-"}</span>
            <span className="text-[14px] font-normal text-text-secondary">
              :
            </span>
            <span>{game.homeScore ?? "-"}</span>
          </div>
        ) : (
          <span className="text-[18px] font-semibold text-text-primary">
            {formatGameTime(game.gameDate)}
          </span>
        )}

        {final && (
          <span className="text-[11px] text-text-secondary">종료</span>
        )}
        {scheduled && (
          <span className="text-[11px] text-text-secondary">예정</span>
        )}
      </div>

      {/* 원정 팀 */}
      <TeamBlock
        logoUrl={game.awayTeamLogoUrl}
        abbreviation={game.awayTeamAbbreviation}
        name={game.awayTeamName}
        score={game.awayScore}
        showScore={showScore}
        align="right"
      />
    </Link>
  );
}

interface TeamBlockProps {
  logoUrl: string | null;
  abbreviation: string;
  name: string;
  score: number | null;
  showScore: boolean;
  align: "left" | "right";
}

function TeamBlock({
  logoUrl,
  abbreviation,
  name,
  score,
  showScore,
  align,
}: TeamBlockProps) {
  const isRight = align === "right";
  return (
    <div
      className={`flex flex-1 items-center gap-2.5 ${isRight ? "flex-row-reverse" : ""}`}
    >
      {/* 로고 */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={abbreviation} className="h-full w-full object-contain" />
        ) : (
          <span className="text-[11px] font-bold text-text-secondary">
            {abbreviation}
          </span>
        )}
      </div>

      {/* 팀명 + 약자 */}
      <div className={`min-w-0 ${isRight ? "text-right" : ""}`}>
        <p className="truncate text-[13px] font-semibold text-text-primary leading-tight">
          {abbreviation}
        </p>
        <p className="truncate text-[11px] text-text-secondary leading-tight">
          {name}
        </p>
      </div>
    </div>
  );
}

// ── 미니 달력 팝업 ──────────────────────────────────────────────────────────

interface MiniCalendarProps {
  dateStr: string; // 현재 선택된 날짜
  onSelect: (d: string) => void;
  onClose: () => void;
}

function MiniCalendar({ dateStr, onSelect, onClose }: MiniCalendarProps) {
  const [y, m] = dateStr.split("-").map(Number);
  // 달력에 표시할 "보고 있는 달" (선택 날짜와 별개로 이동 가능)
  const [viewYear, setViewYear] = useState(y);
  const [viewMonth, setViewMonth] = useState(m); // 1-12

  const today = toKSTDateString(new Date());

  const firstDay = new Date(viewYear, viewMonth - 1, 1);
  const startWeekday = firstDay.getDay(); // 0=일
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const pad = (n: number) => String(n).padStart(2, "0");
  const cellDateStr = (day: number) =>
    `${viewYear}-${pad(viewMonth)}-${pad(day)}`;

  const goPrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear((yy) => yy - 1);
      setViewMonth(12);
    } else {
      setViewMonth((mm) => mm - 1);
    }
  };
  const goNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear((yy) => yy + 1);
      setViewMonth(1);
    } else {
      setViewMonth((mm) => mm + 1);
    }
  };

  return (
    <>
      {/* 바깥 클릭 시 닫기 */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute left-1/2 top-full z-50 mt-2 w-[280px] -translate-x-1/2 rounded-xl bg-bg-primary p-3 shadow-lg">
        {/* 월 네비 */}
        <div className="mb-2 flex items-center justify-between">
          <button
            onClick={goPrevMonth}
            className="rounded-lg px-2 py-1 text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
          >
            ‹
          </button>
          <span className="text-[13px] font-semibold text-text-primary">
            {viewYear}년 {viewMonth}월
          </span>
          <button
            onClick={goNextMonth}
            className="rounded-lg px-2 py-1 text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
          >
            ›
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="mb-1 grid grid-cols-7 gap-y-1">
          {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
            <span
              key={d}
              className={`text-center text-[10px] font-medium ${
                i === 0
                  ? "text-red-400"
                  : i === 6
                    ? "text-blue-400"
                    : "text-text-secondary"
              }`}
            >
              {d}
            </span>
          ))}
        </div>

        {/* 날짜 셀 */}
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, idx) => {
            if (day == null) return <span key={idx} />;
            const cs = cellDateStr(day);
            const isSelected = cs === dateStr;
            const isToday = cs === today;
            const weekday = (startWeekday + day - 1) % 7;

            return (
              <button
                key={idx}
                onClick={() => {
                  onSelect(cs);
                  onClose();
                }}
                className={[
                  "mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[12px] transition-colors",
                  isSelected
                    ? "bg-accent font-semibold text-white"
                    : isToday
                      ? "bg-accent/10 font-semibold text-accent"
                      : weekday === 0
                        ? "text-red-400 hover:bg-bg-tertiary"
                        : weekday === 6
                          ? "text-blue-400 hover:bg-bg-tertiary"
                          : "text-text-primary hover:bg-bg-tertiary",
                ].join(" ")}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ── 날짜 네비게이션 바 ──────────────────────────────────────────────────────

interface DateNavProps {
  dateStr: string;
  onChange: (d: string) => void;
}

function DateNav({ dateStr, onChange }: DateNavProps) {
  const today = toKSTDateString(new Date());
  const isToday = dateStr === today;
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <div className="relative flex items-center justify-between rounded-xl bg-bg-primary px-4 py-3">
      <button
        onClick={() => onChange(shiftDate(dateStr, -1))}
        className="rounded-lg px-2 py-1 text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
      >
        ‹
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setCalendarOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[14px] font-semibold text-text-primary transition-colors hover:bg-bg-tertiary"
        >
          <span>📅</span>
          <span>{formatDateLabel(dateStr)}</span>
        </button>
        {!isToday && (
          <button
            onClick={() => onChange(today)}
            className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-medium text-accent hover:bg-accent/20"
          >
            오늘
          </button>
        )}

        {calendarOpen && (
          <MiniCalendar
            dateStr={dateStr}
            onSelect={onChange}
            onClose={() => setCalendarOpen(false)}
          />
        )}
      </div>

      <button
        onClick={() => onChange(shiftDate(dateStr, 1))}
        className="rounded-lg px-2 py-1 text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
      >
        ›
      </button>
    </div>
  );
}

// ── 메인 페이지 ────────────────────────────────────────────────────────────

export default function GamesPage() {
  const [dateStr, setDateStr] = useState<string>(() =>
    toKSTDateString(new Date())
  );
  const [games, setGames] = useState<GameResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  let cancelled = false;
  getGamesByDate(dateStr)
    .then((data) => {
      if (!cancelled) {
        setGames(data);
        setError(null);
      }
    })
    .catch(() => {
      if (!cancelled) setError("경기 정보를 불러오지 못했습니다.");
    })
    .finally(() => {
      if (!cancelled) setLoading(false);
    });
  return () => {
    cancelled = true;
  };
}, [dateStr]);

  // status 기준으로 그룹 분리 + 정렬
  const liveGames = games.filter((g) => isLive(g.status));
  const scheduledGames = games
    .filter((g) => isScheduled(g.status))
    .sort(
      (a, b) => new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime()
    );
  const finalGames = games.filter((g) => isFinal(g.status));

  return (
    <div className="flex flex-col gap-3">
      {/* 날짜 네비 */}
      <DateNav dateStr={dateStr} onChange={setDateStr} />

      {loading && (
        <div className="flex h-40 items-center justify-center text-[13px] text-text-secondary">
          불러오는 중…
        </div>
      )}

      {error && (
        <div className="flex h-40 items-center justify-center text-[13px] text-red-500">
          {error}
        </div>
      )}

      {!loading && !error && games.length === 0 && (
        <div className="flex h-40 flex-col items-center justify-center gap-1">
          <span className="text-[32px]">⚾</span>
          <p className="text-[13px] text-text-secondary">
            이 날은 경기가 없습니다.
          </p>
        </div>
      )}

      {/* LIVE 경기 */}
      {liveGames.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="px-1 text-[12px] font-semibold uppercase tracking-widest text-red-500">
            실시간 경기
          </h2>
          <div className="flex flex-col gap-1.5">
            {liveGames.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        </section>
      )}

      {/* 예정 경기 */}
      {scheduledGames.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="px-1 text-[12px] font-semibold uppercase tracking-widest text-text-secondary">
            오늘 예정
          </h2>
          <div className="flex flex-col gap-1.5">
            {scheduledGames.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        </section>
      )}

      {/* 종료 경기 */}
      {finalGames.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="px-1 text-[12px] font-semibold uppercase tracking-widest text-text-secondary">
            종료
          </h2>
          <div className="flex flex-col gap-1.5">
            {finalGames.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
