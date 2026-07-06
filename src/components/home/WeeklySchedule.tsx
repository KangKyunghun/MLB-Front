"use client";

import { useEffect, useState } from "react";
import { getGamesByDate } from "@/lib/api/schedule";

const WEEKDAY_LABEL = ["일", "월", "화", "수", "목", "금", "토"];

function toDateKey(date: Date): string {
  // 로컬 타임존 기준 YYYY-MM-DD (toISOString은 UTC라서 날짜가 밀릴 수 있음)
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getWeekDates(): Date[] {
  const today = new Date();
  const monday = new Date(today);
  const dayOfWeek = today.getDay(); // 0=일 ... 6=토
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(today.getDate() + diffToMonday);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

interface DayCount {
  date: Date;
  dateKey: string;
  count: number | null; // null = 로딩 중
  isToday: boolean;
}

export default function WeeklySchedule() {
  const [days, setDays] = useState<DayCount[]>([]);

  useEffect(() => {
    const todayKey = toDateKey(new Date());
    const weekDates = getWeekDates();

    const initial: DayCount[] = weekDates.map((date) => ({
      date,
      dateKey: toDateKey(date),
      count: null,
      isToday: toDateKey(date) === todayKey,
    }));
    setDays(initial);

    initial.forEach((day) => {
      getGamesByDate(day.dateKey)
        .then((games) => {
          setDays((prev) =>
            prev.map((d) =>
              d.dateKey === day.dateKey ? { ...d, count: games.length } : d
            )
          );
        })
        .catch(() => {
          setDays((prev) =>
            prev.map((d) => (d.dateKey === day.dateKey ? { ...d, count: 0 } : d))
          );
        });
    });
  }, []);

  return (
    <div>
      <div className="mb-1.5 text-[12px] font-medium text-text-secondary">
        이번 주 경기 일정
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {days.map((day) => (
          <div
            key={day.dateKey}
            className={[
              "min-w-[54px] shrink-0 rounded-lg border px-2.5 py-2 text-center",
              day.isToday
                ? "border-accent bg-accent"
                : "border-border-tertiary bg-bg-secondary",
            ].join(" ")}
          >
            <div
              className={[
                "text-[10px]",
                day.isToday ? "text-white/80" : "text-text-secondary",
              ].join(" ")}
            >
              {day.isToday
                ? "오늘"
                : `${WEEKDAY_LABEL[day.date.getDay()]} ${day.date.getMonth() + 1}/${day.date.getDate()}`}
            </div>

            {day.count === null ? (
              <div
                className={[
                  "mx-auto mt-1 h-3.5 w-5 animate-pulse rounded",
                  day.isToday ? "bg-white/30" : "bg-bg-tertiary",
                ].join(" ")}
              />
            ) : (
              <div
                className={[
                  "mt-0.5 text-[14px] font-medium",
                  day.isToday ? "text-white" : "text-text-primary",
                ].join(" ")}
              >
                {day.count}
              </div>
            )}

            <div
              className={[
                "text-[9px]",
                day.isToday ? "text-white/80" : "text-text-secondary",
              ].join(" ")}
            >
              경기
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
