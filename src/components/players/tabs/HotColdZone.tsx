'use client';

import { useEffect, useState } from 'react';
import { getHotColdZone } from '@/lib/api/stats';
import type { HotColdZoneResponse } from '@/lib/api/stats';

interface Props {
  playerId: number;
  season: number;
  gameType: 'R' | 'PS';
}

const TEMP_COLOR: Record<string, string> = {
  hot:      '#d32f2f',
  warm:     '#ef6c00',
  lukewarm: '#f9a825',
  cool:     '#0288d1',
  cold:     '#1565c0',
};

const TEMP_LABEL: Record<string, string> = {
  hot:      'HOT',
  warm:     'WARM',
  lukewarm: 'LUKE',
  cool:     'COOL',
  cold:     'COLD',
};

function ZoneCell({
  avg,
  temp,
  x, y, w, h,
}: {
  avg: number | null;
  temp: string;
  x: number; y: number; w: number; h: number;
}) {
  const color = TEMP_COLOR[temp] ?? '#9e9e9e';
  const label = avg !== null ? avg.toFixed(3) : '-';

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={color} opacity={0.85} rx={2} />
      <text
        x={x + w / 2}
        y={y + h / 2 - 6}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={10}
        fontWeight="bold"
      >
        {TEMP_LABEL[temp] ?? ''}
      </text>
      <text
        x={x + w / 2}
        y={y + h / 2 + 8}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={11}
        fontWeight="bold"
      >
        {label}
      </text>
    </g>
  );
}

export default function HotColdZoneChart({ playerId, season, gameType }: Props) {
  const [data, setData] = useState<HotColdZoneResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await getHotColdZone(playerId, season, gameType);
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [playerId, season, gameType]);

  if (loading) return <div className="h-64 bg-bg-secondary rounded-xl animate-pulse" />;
  if (!data) return (
    <div className="text-center py-16 text-text-secondary">해당 시즌 핫콜드존 데이터가 없습니다</div>
  );

  // 레이아웃 치수
  const cellW = 60;
  const cellH = 50;
  const outerW = 40;
  const outerH = 36;
  const gap = 2;

  const innerW = cellW * 3 + gap * 2;
  const innerH = cellH * 3 + gap * 2;

  const totalW = outerW + gap + innerW + gap + outerW + 40; // +40 여백
  const totalH = outerH + gap + innerH + gap + outerH + 40;

  const startX = outerW + gap + 20;
  const startY = outerH + gap + 20;

  const { innerZones, innerTemps, outerZones } = data;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="bg-bg-primary border border-border-tertiary rounded-xl p-6">
        <h3 className="text-sm font-medium text-text-secondary mb-4 text-center">
          {season}시즌 핫콜드존 ({gameType === 'R' ? '정규시즌' : '포스트시즌'})
        </h3>

        <svg
          viewBox={`0 0 ${totalW} ${totalH}`}
          width={totalW}
          height={totalH}
        >
          {/* 내부 9존 */}
          {innerZones.map((row, ri) =>
            row.map((avg, ci) => (
              <ZoneCell
                key={`${ri}-${ci}`}
                avg={avg}
                temp={innerTemps[ri][ci]}
                x={startX + ci * (cellW + gap)}
                y={startY + ri * (cellH + gap)}
                w={cellW}
                h={cellH}
              />
            ))
          )}

          {/* 외부 존 — top */}
          {outerZones?.top !== undefined && (
            <ZoneCell
              avg={outerZones.top}
              temp={outerZones.topTemp}
              x={startX}
              y={startY - outerH - gap}
              w={innerW}
              h={outerH}
            />
          )}

          {/* 외부 존 — bottom */}
          {outerZones?.bottom !== undefined && (
            <ZoneCell
              avg={outerZones.bottom}
              temp={outerZones.bottomTemp}
              x={startX}
              y={startY + innerH + gap}
              w={innerW}
              h={outerH}
            />
          )}

          {/* 외부 존 — left */}
          {outerZones?.left !== undefined && (
            <ZoneCell
              avg={outerZones.left}
              temp={outerZones.leftTemp}
              x={startX - outerW - gap}
              y={startY}
              w={outerW}
              h={innerH}
            />
          )}

          {/* 외부 존 — right */}
          {outerZones?.right !== undefined && (
            <ZoneCell
              avg={outerZones.right}
              temp={outerZones.rightTemp}
              x={startX + innerW + gap}
              y={startY}
              w={outerW}
              h={innerH}
            />
          )}

          {/* 존 번호 라벨 (선택) */}
          {['01','02','03','04','05','06','07','08','09'].map((n, i) => {
            const ri = Math.floor(i / 3);
            const ci = i % 3;
            return (
              <text
                key={n}
                x={startX + ci * (cellW + gap) + 4}
                y={startY + ri * (cellH + gap) + 12}
                fill="rgba(255,255,255,0.4)"
                fontSize={8}
              >
                {n}
              </text>
            );
          })}
        </svg>

        {/* 범례 */}
        <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
          {Object.entries(TEMP_COLOR).map(([temp, color]) => (
            <div key={temp} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
              <span className="text-xs text-text-secondary capitalize">{temp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}