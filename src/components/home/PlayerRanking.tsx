"use client";

import { useEffect, useMemo, useState } from "react";
import { getBatterLeaderboard, getPitcherLeaderboard } from "@/lib/api/mainPage";
import type {
  BatterStatResponse,
  BatterStatType,
  PitcherStatResponse,
  PitcherStatType,
} from "@/types";

type Tab = "batter" | "pitcher";

const SLIDE_INTERVAL_MS = 3000;
const CURRENT_SEASON = new Date().getFullYear();

const BATTER_SLIDES: { statType: BatterStatType; label: string; suffix: string }[] = [
  { statType: "avg", label: "타율 TOP 3", suffix: "" },
  { statType: "homeRuns", label: "홈런 TOP 3", suffix: "개" },
  { statType: "hits", label: "안타 TOP 3", suffix: "개" },
];

const PITCHER_SLIDES: { statType: PitcherStatType; label: string; suffix: string }[] = [
  { statType: "wins", label: "승리 TOP 3", suffix: "승" },
  { statType: "era", label: "평균자책 TOP 3", suffix: "" },
  { statType: "strikeOuts", label: "탈삼진 TOP 3", suffix: "개" },
];

function formatBatterVal(player: BatterStatResponse, statType: BatterStatType): string {
  if (statType === "avg") return player.avg.toFixed(3).replace(/^0/, "");
  if (statType === "homeRuns") return `${player.homeRuns}`;
  return `${player.hits}`; // hits
}

function formatPitcherVal(player: PitcherStatResponse, statType: PitcherStatType): string {
  if (statType === "era") return player.era.toFixed(2);
  if (statType === "wins") return `${player.wins}승`;
  return `${player.strikeOuts}`; // strikeOuts
}

interface RankRow {
  id: number;
  name: string;
  team: string;
  value: string;
}

function RankList({
  label,
  rows,
  loading,
}: {
  label: string;
  rows: RankRow[];
  loading: boolean;
}) {
  return (
    <div className="animate-[fadeIn_0.35s_ease]">
      <div className="mb-2 text-[11px] font-medium text-text-secondary">
        {label}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2 py-1">
              <div className="h-3 w-3 animate-pulse rounded bg-bg-tertiary" />
              <div className="h-3 flex-1 animate-pulse rounded bg-bg-tertiary" />
              <div className="h-3 w-8 animate-pulse rounded bg-bg-tertiary" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="py-4 text-center text-[12px] text-text-secondary">
          데이터가 없어요.
        </div>
      ) : (
        rows.map((row, i) => (
          <div
            key={row.id}
            className="flex items-center gap-2 border-b border-border-tertiary py-1.5 last:border-none"
          >
            <span
              className={[
                "w-4 text-[12px] font-medium",
                i === 0 ? "text-accent" : "text-text-secondary",
              ].join(" ")}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] text-text-primary">
                {row.name}
              </div>
              <div className="text-[11px] text-text-secondary">{row.team}</div>
            </div>
            <span className="text-[14px] font-medium text-text-primary">
              {row.value}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

export default function PlayerRanking() {
  const [tab, setTab] = useState<Tab>("batter");
  const [slideIdx, setSlideIdx] = useState(0);

  const [batterRows, setBatterRows] = useState<RankRow[] | null>(null);
  const [pitcherRows, setPitcherRows] = useState<RankRow[] | null>(null);

  const slides = tab === "batter" ? BATTER_SLIDES : PITCHER_SLIDES;
  const currentSlide = slides[slideIdx];

  // 탭 전환 시 슬라이드 인덱스 리셋
  useEffect(() => {
    setSlideIdx(0);
  }, [tab]);

  // 3초마다 슬라이드 자동 전환
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  // 현재 탭 + 슬라이드에 해당하는 데이터 fetch (간단한 캐시: rows를 statType별로 들고 있지 않고 슬라이드 바뀔 때마다 요청)
  useEffect(() => {
    let mounted = true;

    if (tab === "batter") {
      const { statType, suffix } = BATTER_SLIDES[slideIdx];
      getBatterLeaderboard(statType, { season: CURRENT_SEASON, limit: 3 })
        .then((data) => {
          if (!mounted) return;
          setBatterRows(
            data.map((p) => ({
              id: p.playerId,
              name: p.playerName,
              team: p.teamName,
              value: `${formatBatterVal(p, statType)}${suffix}`,
            }))
          );
        })
        .catch(() => {
          if (mounted) setBatterRows([]);
        });
    } else {
      const { statType, suffix } = PITCHER_SLIDES[slideIdx];
      getPitcherLeaderboard(statType, { season: CURRENT_SEASON, limit: 3 })
        .then((data) => {
          if (!mounted) return;
          setPitcherRows(
            data.map((p) => ({
              id: p.playerId,
              name: p.playerName,
              team: p.teamName,
              value: `${formatPitcherVal(p, statType)}${statType === "wins" ? "" : suffix}`,
            }))
          );
        })
        .catch(() => {
          if (mounted) setPitcherRows([]);
        });
    }

    return () => {
      mounted = false;
    };
  }, [tab, slideIdx]);

  const rows = tab === "batter" ? batterRows : pitcherRows;
  const loading = rows === null;

  const dots = useMemo(() => slides.map((s) => s.statType), [slides]);

  return (
    <div className="rounded-xl border border-border-tertiary bg-bg-primary px-4 py-3.5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[14px] font-medium text-text-primary">
          개인 순위
        </span>
        <div className="flex items-center gap-1">
          {dots.map((d, i) => (
            <div
              key={d}
              className={[
                "h-1.5 w-1.5 rounded-full transition-colors",
                i === slideIdx ? "bg-accent" : "bg-border-tertiary",
              ].join(" ")}
            />
          ))}
        </div>
      </div>

      <div className="mb-3 flex w-[160px] overflow-hidden rounded-lg border border-border-tertiary">
        <button
          onClick={() => setTab("batter")}
          className={[
            "flex-1 py-1.5 text-[12px] font-medium transition-colors",
            tab === "batter"
              ? "bg-accent text-white"
              : "bg-transparent text-text-secondary",
          ].join(" ")}
        >
          타자
        </button>
        <button
          onClick={() => setTab("pitcher")}
          className={[
            "flex-1 py-1.5 text-[12px] font-medium transition-colors",
            tab === "pitcher"
              ? "bg-accent text-white"
              : "bg-transparent text-text-secondary",
          ].join(" ")}
        >
          투수
        </button>
      </div>

      <RankList
        key={`${tab}-${slideIdx}`}
        label={currentSlide.label}
        rows={rows ?? []}
        loading={loading}
      />
    </div>
  );
}
