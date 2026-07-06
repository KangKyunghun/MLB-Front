"use client";

import { useEffect, useState } from "react";
import { getTodayGames } from "@/lib/api/mainPage";
import type { GameResponse } from "@/types";

function formatGameMeta(game: GameResponse): {
  text: string;
  isLive: boolean;
  isUpcoming: boolean;
} {
  const status = game.status;

  // Final, Game Over 류 → 최종
  if (/final|game over/i.test(status)) {
    return { text: "최종", isLive: false, isUpcoming: false };
  }

  // In Progress, Live 류 → 진행 중 (상세 이닝 정보는 추후 박스스코어 연동 시 교체)
  if (/in progress|live/i.test(status)) {
    return { text: "경기중", isLive: true, isUpcoming: false };
  }

  // Scheduled, Pre-Game 류 → 예정 시각
  const time = new Date(game.gameDate).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { text: `${time} 예정`, isLive: false, isUpcoming: true };
}

function GameCardSkeleton() {
  return (
    <div className="flex-1 animate-pulse rounded-xl border border-border-tertiary bg-bg-primary px-3.5 py-2.5">
      <div className="mx-auto h-3 w-16 rounded bg-bg-tertiary" />
      <div className="mt-3 flex items-center justify-center gap-2">
        <div className="h-4 w-10 rounded bg-bg-tertiary" />
        <div className="h-5 w-8 rounded bg-bg-tertiary" />
        <div className="h-4 w-10 rounded bg-bg-tertiary" />
      </div>
    </div>
  );
}

function GameCard({ game }: { game: GameResponse }) {
  const meta = formatGameMeta(game);

  return (
    <div
      className={[
        "flex-1 rounded-xl border bg-bg-primary px-3.5 py-2.5",
        meta.isLive ? "border-accent" : "border-border-tertiary",
      ].join(" ")}
    >
      {meta.isLive && (
        <span className="mb-1.5 inline-block rounded bg-accent px-1.5 py-px text-[10px] font-medium text-white">
          LIVE
        </span>
      )}

      <div className="flex items-center justify-between gap-1.5">
        <div className="text-center">
          <div className="text-[13px] font-medium text-text-primary">
            {game.awayTeamAbbreviation}
          </div>
          <div className="mt-0.5 text-[10px] text-text-secondary">
            {game.awayTeamName}
          </div>
        </div>

        {meta.isUpcoming ? (
          <span className="px-2 text-[13px] text-text-secondary">vs</span>
        ) : (
          <span className="px-2 text-[18px] font-medium text-text-primary">
            {game.awayScore ?? 0} : {game.homeScore ?? 0}
          </span>
        )}

        <div className="text-center">
          <div className="text-[13px] font-medium text-text-primary">
            {game.homeTeamAbbreviation}
          </div>
          <div className="mt-0.5 text-[10px] text-text-secondary">
            {game.homeTeamName}
          </div>
        </div>
      </div>

      <div
        className={[
          "mt-1.5 text-center text-[10px]",
          meta.isUpcoming ? "text-accent" : "text-text-secondary",
        ].join(" ")}
      >
        {meta.text}
      </div>
    </div>
  );
}

export default function TodayGames() {
  const [games, setGames] = useState<GameResponse[] | null>(null);
  const [error, setError] = useState(false);

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

  const todayLabel = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <div className="mb-1.5 text-[12px] font-medium text-text-secondary">
        오늘의 경기 · {todayLabel}
      </div>

      {error ? (
        <div className="rounded-xl border border-border-tertiary bg-bg-primary px-4 py-6 text-center text-[13px] text-text-secondary">
          경기 정보를 불러오지 못했어요.
        </div>
      ) : games === null ? (
        <div className="flex gap-2">
          <GameCardSkeleton />
          <GameCardSkeleton />
          <GameCardSkeleton />
        </div>
      ) : games.length === 0 ? (
        <div className="rounded-xl border border-border-tertiary bg-bg-primary px-4 py-6 text-center text-[13px] text-text-secondary">
          오늘 예정된 경기가 없어요.
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
