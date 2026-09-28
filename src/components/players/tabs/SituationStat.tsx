'use client';

import { useEffect, useState } from 'react';
import { getSituationStats } from '@/lib/api/stats';
import type { BatterSituationStatResponse } from '@/lib/api/stats';

interface Props {
  playerId: number;
  season: number;
  gameType: 'R' | 'PS';
}

const SIT_LABEL: Record<string, string> = {
  risp: '득점권',
  vl:   '좌투 상대',
  vr:   '우투 상대',
};

const fmt = (val: number | null, digits = 3) =>
  val === null ? '-' : val.toFixed(digits);

export default function SituationStat({ playerId, season, gameType }: Props) {
  const [stats, setStats] = useState<BatterSituationStatResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getSituationStats(playerId, season, gameType);
        if (!cancelled) setStats(data);
      } catch {
        if (!cancelled) setStats([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [playerId, season, gameType]);

  if (loading) return <div className="h-32 bg-bg-secondary rounded-xl animate-pulse" />;

  if (stats.length === 0) return (
    <div className="text-center py-16 text-text-secondary">
      해당 시즌 스플릿 데이터가 없습니다
    </div>
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-border-tertiary">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-bg-secondary text-text-secondary text-xs">
            <th className="px-4 py-3 text-left font-medium sticky left-0 bg-bg-secondary">구분</th>
            <th className="px-4 py-3 text-center font-medium">AB</th>
            <th className="px-4 py-3 text-center font-medium">H</th>
            <th className="px-4 py-3 text-center font-medium">HR</th>
            <th className="px-4 py-3 text-center font-medium">RBI</th>
            <th className="px-4 py-3 text-center font-medium">BB</th>
            <th className="px-4 py-3 text-center font-medium">SO</th>
            <th className="px-4 py-3 text-center font-medium">AVG</th>
            <th className="px-4 py-3 text-center font-medium">OBP</th>
            <th className="px-4 py-3 text-center font-medium">SLG</th>
            <th className="px-4 py-3 text-center font-medium">OPS</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s, i) => (
            <tr
              key={s.id}
              className={`border-t border-border-tertiary hover:bg-bg-secondary transition-colors
                ${i % 2 === 0 ? 'bg-bg-primary' : 'bg-bg-tertiary/40'}`}
            >
              <td className="px-4 py-3 font-medium text-text-primary sticky left-0 bg-inherit">
                {SIT_LABEL[s.sitCode] ?? s.sitCode}
              </td>
              <td className="px-4 py-3 text-center text-text-secondary">{s.atBats}</td>
              <td className="px-4 py-3 text-center text-text-secondary">{s.hits}</td>
              <td className="px-4 py-3 text-center text-text-secondary">{s.homeRuns}</td>
              <td className="px-4 py-3 text-center text-text-secondary">{s.rbi}</td>
              <td className="px-4 py-3 text-center text-text-secondary">{s.walks}</td>
              <td className="px-4 py-3 text-center text-text-secondary">{s.strikeOuts}</td>
              <td className="px-4 py-3 text-center font-medium text-text-primary">{fmt(s.avg)}</td>
              <td className="px-4 py-3 text-center font-medium text-text-primary">{fmt(s.obp)}</td>
              <td className="px-4 py-3 text-center font-medium text-text-primary">{fmt(s.slg)}</td>
              <td className="px-4 py-3 text-center font-medium text-accent">{fmt(s.ops)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}