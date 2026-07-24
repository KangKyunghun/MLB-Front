"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { getTodayGames } from "@/lib/api/mainPage";
import { teamNameKo } from "@/lib/teamNameKo";
import type { GameResponse } from "@/types";

function isFinalStatus(status: string) {
  return /final|game over/i.test(status);
}
function isLiveStatus(status: string) {
  return /in progress|live/i.test(status);
}

function formatGameTime(gameDateISO: string): string {
  return new Date(gameDateISO).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function GameCardSkeleton() {
  return (
    <div className="w-[190px] shrink-0 animate-pulse rounded-xl border border-border-tertiary bg-bg-primary px-3.5 py-2.5">
      <div className="flex items-center justify-between gap-2 py-1">
        <div className="h-5 w-5 rounded-full bg-bg-tertiary" />
        <div className="h-3 flex-1 rounded bg-bg-tertiary" />
        <div className="h-4 w-6 rounded bg-bg-tertiary" />
      </div>
      <div className="flex items-center justify-between gap-2 py-1">
        <div className="h-5 w-5 rounded-full bg-bg-tertiary" />
        <div className="h-3 flex-1 rounded bg-bg-tertiary" />
        <div className="h-4 w-6 rounded bg-bg-tertiary" />
      </div>
    </div>
  );
}

interface TeamRowProps {
  logoUrl: string | null;
  nameKo: string;
  score: number | null;
  showScore: boolean;
  isHome: boolean;
  isWinner: boolean;
}

function TeamRow({ logoUrl, nameKo, score, showScore, isHome, isWinner }: TeamRowProps) {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <div className="flex min-w-0 items-center gap-1.5">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={nameKo}
              draggable={false}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-[9px] font-bold text-text-secondary">{nameKo.slice(0, 2)}</span>
          )}
        </div>
        <span
          className={[
            "truncate text-[13px]",
            showScore && isWinner ? "font-bold text-text-primary" : "font-medium text-text-primary",
          ].join(" ")}
        >
          {nameKo}
        </span>
        {isHome && (
          <span className="shrink-0 rounded bg-bg-tertiary px-1 py-px text-[9px] text-text-secondary">
            홈
          </span>
        )}
      </div>

      <span
        className={[
          "shrink-0 text-[15px] tabular-nums",
          showScore && isWinner ? "font-bold text-text-primary" : "font-medium text-text-secondary",
        ].join(" ")}
      >
        {showScore ? (score ?? 0) : "-"}
      </span>
    </div>
  );
}

function GameCard({
  game,
  onClickCapture,
}: {
  game: GameResponse;
  onClickCapture: (e: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const final = isFinalStatus(game.status);
  const live = isLiveStatus(game.status);
  const showScore = live || final;

  const awayScore = game.awayScore ?? 0;
  const homeScore = game.homeScore ?? 0;
  const awayWins = showScore && awayScore > homeScore;
  const homeWins = showScore && homeScore > awayScore;

  return (
    <Link
      href={`/games/${game.id}`}
      draggable={false}
      onClickCapture={onClickCapture}
      className={[
        "w-[190px] shrink-0 select-none rounded-xl border bg-bg-primary px-3.5 py-2 transition-colors hover:bg-bg-secondary",
        live ? "border-accent" : "border-border-tertiary",
      ].join(" ")}
    >
      {live && (
        <span className="mb-0.5 inline-flex items-center gap-1 text-[10px] font-semibold text-accent">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          LIVE
        </span>
      )}

      <TeamRow
        logoUrl={game.awayTeamLogoUrl}
        nameKo={teamNameKo(game.awayTeamAbbreviation)}
        score={game.awayScore}
        showScore={showScore}
        isHome={false}
        isWinner={awayWins}
      />
      <TeamRow
        logoUrl={game.homeTeamLogoUrl}
        nameKo={teamNameKo(game.homeTeamAbbreviation)}
        score={game.homeScore}
        showScore={showScore}
        isHome={true}
        isWinner={homeWins}
      />

      <div className="mt-0.5 text-right text-[10px] text-text-secondary">
        {final ? "최종" : live ? "경기중" : `${formatGameTime(game.gameDate)} 예정`}
      </div>
    </Link>
  );
}

/** 좌/우 슬라이드 버튼 */
function SlideButton({
  direction,
  onClick,
  disabled,
}: {
  direction: "left" | "right";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "left" ? "이전 경기" : "다음 경기"}
      className={[
        "flex h-6 w-6 items-center justify-center rounded-full text-[13px] transition-colors",
        disabled
          ? "cursor-default text-text-secondary/30"
          : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary",
      ].join(" ")}
    >
      {direction === "left" ? "‹" : "›"}
    </button>
  );
}

const DRAG_CLICK_THRESHOLD = 6; // px — 이보다 적게 움직이면 드래그가 아니라 클릭으로 간주

export default function TodayGames() {
  const [games, setGames] = useState<GameResponse[] | null>(null);
  const [error, setError] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // 마우스 드래그 스크롤 상태
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    startScrollLeft: 0,
    moved: 0,
  });

  useEffect(() => {
    let mounted = true;

    getTodayGames()
      .then((data) => {
        if (mounted) setGames(data);
      })
      .catch(() => {
        if (mounted) setError(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // 스크롤 위치에 따라 좌/우 버튼 활성화 여부 갱신
  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
  }, [games]);

  const scrollByCards = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 200; // 카드 하나 폭(190px) + gap 정도
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  // ── 마우스 드래그로 슬라이드 ──────────────────────────────────
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    dragState.current = {
      isDragging: true,
      startX: e.pageX,
      startScrollLeft: el.scrollLeft,
      moved: 0,
    };
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el || !dragState.current.isDragging) return;
    e.preventDefault();
    const delta = e.pageX - dragState.current.startX;
    dragState.current.moved = Math.abs(delta);
    el.scrollLeft = dragState.current.startScrollLeft - delta;
  };

  const endDrag = () => {
    if (dragState.current.isDragging) {
      dragState.current.isDragging = false;
    }
  };

  // 드래그로 카드가 움직였으면 클릭(페이지 이동)을 막음
  const handleCardClickCapture = (e: MouseEvent<HTMLAnchorElement>) => {
    if (dragState.current.moved > DRAG_CLICK_THRESHOLD) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const todayLabel = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // 경기 시작 시간이 이른 순으로 정렬
  const sortedGames = games
    ? [...games].sort(
        (a, b) => new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime()
      )
    : null;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[12px] font-medium text-text-secondary">
          오늘의 경기 · {todayLabel}
        </span>

        {sortedGames && sortedGames.length > 1 && (
          <div className="flex items-center gap-0.5">
            <SlideButton direction="left" onClick={() => scrollByCards("left")} disabled={!canScrollLeft} />
            <SlideButton direction="right" onClick={() => scrollByCards("right")} disabled={!canScrollRight} />
          </div>
        )}
      </div>

      {error ? (
        <div className="rounded-xl border border-border-tertiary bg-bg-primary px-4 py-6 text-center text-[13px] text-text-secondary">
          경기 정보를 불러오지 못했어요.
        </div>
      ) : sortedGames === null ? (
        <div className="flex gap-2">
          <GameCardSkeleton />
          <GameCardSkeleton />
          <GameCardSkeleton />
        </div>
      ) : sortedGames.length === 0 ? (
        <div className="rounded-xl border border-border-tertiary bg-bg-primary px-4 py-6 text-center text-[13px] text-text-secondary">
          오늘 예정된 경기가 없어요.
        </div>
      ) : (
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          className="flex cursor-grab gap-2 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
        >
          {sortedGames.map((game) => (
            <GameCard key={game.id} game={game} onClickCapture={handleCardClickCapture} />
          ))}
        </div>
      )}
    </div>
  );
}