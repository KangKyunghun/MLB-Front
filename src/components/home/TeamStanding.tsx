"use client";

import { useEffect, useState } from "react";
import { getStandingsByDivision } from "@/lib/api/mainPage";
import { DIVISIONS, DIVISION_LABEL, type Division, type StandingResponse } from "@/types";

const ROTATE_INTERVAL_MS = 4000;
const CURRENT_SEASON = new Date().getFullYear();

export default function TeamStanding() {
  const [divisionIdx, setDivisionIdx] = useState(0);
  const [teams, setTeams] = useState<StandingResponse[] | null>(null);

  const division: Division = DIVISIONS[divisionIdx];

  // 4초마다 다음 디비전으로 자동 순환
  useEffect(() => {
    const timer = setInterval(() => {
      setDivisionIdx((prev) => (prev + 1) % DIVISIONS.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    setTeams(null);

    getStandingsByDivision(CURRENT_SEASON, division)
      .then((data) => {
        if (!mounted) return;
        // 지구 순위(divisionRank) 기준 오름차순 정렬
        setTeams([...data].sort((a, b) => a.divisionRank - b.divisionRank));
      })
      .catch(() => {
        if (mounted) setTeams([]);
      });

    return () => {
      mounted = false;
    };
  }, [division]);

  const loading = teams === null;

  return (
    <div className="rounded-xl border border-border-tertiary bg-bg-primary px-4 py-3.5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[14px] font-medium text-text-primary">
          팀 순위
        </span>
        <div className="flex items-center gap-1">
          {DIVISIONS.map((d, i) => (
            <div
              key={d}
              className={[
                "h-1.5 w-1.5 rounded-full transition-colors",
                i === divisionIdx ? "bg-accent" : "bg-border-tertiary",
              ].join(" ")}
            />
          ))}
        </div>
      </div>

      <div key={division} className="animate-[fadeIn_0.35s_ease]">
        <div className="mb-2 text-[11px] font-medium text-accent">
          {DIVISION_LABEL[division]}
        </div>

        <div className="mb-1 flex gap-1.5 border-b border-border-tertiary pb-1">
          <span className="w-3.5 shrink-0 text-[10px] text-text-secondary" />
          <span className="flex-1 text-[10px] text-text-secondary">팀</span>
          <span className="w-7 text-right text-[10px] text-text-secondary">승</span>
          <span className="w-7 text-right text-[10px] text-text-secondary">패</span>
          <span className="w-9 text-right text-[10px] text-text-secondary">승률</span>
        </div>

        {loading ? (
          <div className="space-y-2 py-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-3 animate-pulse rounded bg-bg-tertiary" />
            ))}
          </div>
        ) : teams.length === 0 ? (
          <div className="py-4 text-center text-[12px] text-text-secondary">
            순위 데이터가 없어요.
          </div>
        ) : (
          teams.map((t) => (
            <div
              key={t.teamId}
              className="flex items-center gap-1.5 border-b border-border-tertiary py-1 last:border-none"
            >
              <span className="w-3.5 shrink-0 text-[11px] text-text-secondary">
                {t.divisionRank}
              </span>
              <span className="min-w-0 flex-1 truncate text-[12px] text-text-primary">
                {t.teamName}
              </span>
              <span className="w-7 text-right text-[11px] font-medium text-text-primary">
                {t.wins}
              </span>
              <span className="w-7 text-right text-[11px] text-text-secondary">
                {t.losses}
              </span>
              <span className="w-9 text-right text-[11px] text-text-secondary">
                {t.winPct.toFixed(3).replace(/^0/, "")}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
