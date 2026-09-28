'use client';

import { useEffect, useState } from 'react';
import { getPitcherStatBySeason } from '@/lib/api/stats';
import type { PitcherStatResponse } from '@/lib/api/stats';

interface Props {
  playerId: number;
  season: number;
  gameType: 'R' | 'PS';
}

const fmt = (val: number | null | undefined, digits = 2) =>
  val == null ? '-' : val.toFixed(digits);

export default function PitcherStatTable({ playerId, season, gameType }: Props) {
  const [stat, setStat] = useState<PitcherStatResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getPitcherStatBySeason(playerId, season, gameType);
        if (!cancelled) setStat(data);
      } catch {
        if (!cancelled) setStat(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [playerId, season, gameType]);

  if (loading) return <div className="h-32 bg-bg-secondary rounded-xl animate-pulse" />;

  if (!stat) return (
    <div className="text-center py-16 text-text-secondary">
      <p>{season}시즌 기록이 없습니다</p>
    </div>
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-border-tertiary">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-bg-secondary text-text-secondary text-xs">
            <th className="px-4 py-3 text-left font-medium sticky left-0 bg-bg-secondary">시즌</th>
            <th className="px-4 py-3 text-center font-medium">G</th>
            <th className="px-4 py-3 text-center font-medium">GS</th>
            <th className="px-4 py-3 text-center font-medium">W</th>
            <th className="px-4 py-3 text-center font-medium">L</th>
            <th className="px-4 py-3 text-center font-medium">SV</th>
            <th className="px-4 py-3 text-center font-medium">HLD</th>
            <th className="px-4 py-3 text-center font-medium">IP</th>
            <th className="px-4 py-3 text-center font-medium">H</th>
            <th className="px-4 py-3 text-center font-medium">R</th>
            <th className="px-4 py-3 text-center font-medium">ER</th>
            <th className="px-4 py-3 text-center font-medium">HR</th>
            <th className="px-4 py-3 text-center font-medium">BB</th>
            <th className="px-4 py-3 text-center font-medium">SO</th>
            <th className="px-4 py-3 text-center font-medium">ERA</th>
            <th className="px-4 py-3 text-center font-medium">WHIP</th>
            <th className="px-4 py-3 text-center font-medium">K/9</th>
            <th className="px-4 py-3 text-center font-medium">BB/9</th>
            <th className="px-4 py-3 text-center font-medium">K/BB</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-border-tertiary bg-bg-primary">
            <td className="px-4 py-3 font-medium text-text-primary sticky left-0 bg-inherit">{stat.season}</td>
            <td className="px-4 py-3 text-center text-text-secondary">{stat.gamesPlayed}</td>
            <td className="px-4 py-3 text-center text-text-secondary">{stat.gamesStarted}</td>
            <td className="px-4 py-3 text-center text-text-secondary">{stat.wins}</td>
            <td className="px-4 py-3 text-center text-text-secondary">{stat.losses}</td>
            <td className="px-4 py-3 text-center text-text-secondary">{stat.saves}</td>
            <td className="px-4 py-3 text-center text-text-secondary">{stat.holds}</td>
            <td className="px-4 py-3 text-center text-text-secondary">{fmt(stat.inningsPitched)}</td>
            <td className="px-4 py-3 text-center text-text-secondary">{stat.hitsAllowed}</td>
            <td className="px-4 py-3 text-center text-text-secondary">{stat.runs}</td>
            <td className="px-4 py-3 text-center text-text-secondary">{stat.earnedRuns}</td>
            <td className="px-4 py-3 text-center text-text-secondary">{stat.homeRunsAllowed}</td>
            <td className="px-4 py-3 text-center text-text-secondary">{stat.walks}</td>
            <td className="px-4 py-3 text-center text-text-secondary">{stat.strikeOuts}</td>
            <td className="px-4 py-3 text-center font-medium text-accent">{fmt(stat.era)}</td>
            <td className="px-4 py-3 text-center font-medium text-text-primary">{fmt(stat.whip)}</td>
            <td className="px-4 py-3 text-center text-text-secondary">{fmt(stat.strikeOutPer9)}</td>
            <td className="px-4 py-3 text-center text-text-secondary">{fmt(stat.walkPer9)}</td>
            <td className="px-4 py-3 text-center text-text-secondary">{fmt(stat.strikeOutWalkRatio)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}