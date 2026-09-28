'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { PitchTypeSummary, PitchLocationPoint } from '@/lib/api/stats';

// ── 구종 매핑 ──────────────────────────────────────────────
const PITCH_TYPE_MAP: Record<string, { name: string; color: string }> = {
  FF: { name: '포심 패스트볼', color: '#EF4444' },
  SI: { name: '싱커',         color: '#F97316' },
  FC: { name: '커터',         color: '#EAB308' },
  FA: { name: '패스트볼',     color: '#F87171' },
  SL: { name: '슬라이더',     color: '#3B82F6' },
  ST: { name: '스위퍼',       color: '#38BDF8' },
  CU: { name: '커브',         color: '#22C55E' },
  KC: { name: '너클커브',     color: '#86EFAC' },
  CH: { name: '체인지업',     color: '#A855F7' },
  FS: { name: '스플리터',     color: '#EC4899' },
  FO: { name: '포크볼',       color: '#C084FC' },
  KN: { name: '너클볼',       color: '#9CA3AF' },
  SV: { name: '슬러브',       color: '#14B8A6' },
  EP: { name: '이피서스',     color: '#92400E' },
  CS: { name: '슬로우커브',   color: '#84CC16' },
  SC: { name: '스크류볼',     color: '#6366F1' },
};

const getPitchName = (code: string) => PITCH_TYPE_MAP[code]?.name ?? code;
const getPitchColor = (code: string) => PITCH_TYPE_MAP[code]?.color ?? '#6B7280';

const fmt = (v: number | null | undefined, digits = 1) =>
  v == null ? '-' : v.toFixed(digits);

const fmtAvg = (v: number | null | undefined) =>
  v == null ? '-' : '.' + Math.round(v * 1000).toString().padStart(3, '0');

// ── 산점도 ──────────────────────────────────────────────────
interface ZoneChartProps {
  locations: PitchLocationPoint[];
  activeTypes: Set<string>;
}

function ZoneChart({ locations, activeTypes }: ZoneChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const W = 280, H = 300;
    const margin = { top: 16, right: 16, bottom: 16, left: 16 };
    const innerW = W - margin.left - margin.right;
    const innerH = H - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', W)
      .attr('height', H)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // MLB plateX: -1.5 ~ 1.5, plateZ: 0 ~ 5
    const xScale = d3.scaleLinear().domain([-2, 2]).range([0, innerW]);
    const yScale = d3.scaleLinear().domain([0, 5]).range([innerH, 0]);

    // 스트라이크존 (MLB 기준: x -0.83~0.83, z 1.5~3.5)
    svg.append('rect')
      .attr('x', xScale(-0.83))
      .attr('y', yScale(3.5))
      .attr('width', xScale(0.83) - xScale(-0.83))
      .attr('height', yScale(1.5) - yScale(3.5))
      .attr('fill', 'none')
      .attr('stroke', '#94A3B8')
      .attr('stroke-width', 1.5);

    // 존 9분할 선
    const xThirds = [-0.83 + (1.66 / 3), -0.83 + (1.66 / 3) * 2];
    const zThirds = [1.5 + (2.0 / 3), 1.5 + (2.0 / 3) * 2];
    xThirds.forEach(x => {
      svg.append('line')
        .attr('x1', xScale(x)).attr('y1', yScale(3.5))
        .attr('x2', xScale(x)).attr('y2', yScale(1.5))
        .attr('stroke', '#475569').attr('stroke-width', 0.5);
    });
    zThirds.forEach(z => {
      svg.append('line')
        .attr('x1', xScale(-0.83)).attr('y1', yScale(z))
        .attr('x2', xScale(0.83)).attr('y2', yScale(z))
        .attr('stroke', '#475569').attr('stroke-width', 0.5);
    });

    // 홈플레이트
    svg.append('polygon')
      .attr('points', [
        [xScale(-0.71), yScale(0.3)],
        [xScale(0.71),  yScale(0.3)],
        [xScale(0.71),  yScale(0.1)],
        [xScale(0),     yScale(0.0)],
        [xScale(-0.71), yScale(0.1)],
      ].map(p => p.join(',')).join(' '))
      .attr('fill', '#94A3B8')
      .attr('opacity', 0.4);

    // 투구 점 (샘플링: 최대 2000개)
    const filtered = locations.filter(p =>
      p.pitchType && activeTypes.has(p.pitchType) &&
      p.pitchType !== 'UN' && p.plateX != null && p.plateZ != null
    );
    const sampled = filtered.length > 2000
      ? filtered.filter((_, i) => i % Math.ceil(filtered.length / 2000) === 0)
      : filtered;

    svg.selectAll('circle')
      .data(sampled)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.plateX!))
      .attr('cy', d => yScale(d.plateZ!))
      .attr('r', 2.5)
      .attr('fill', d => getPitchColor(d.pitchType ?? ''))
      .attr('opacity', 0.55);

  }, [locations, activeTypes]);

  return <svg ref={svgRef} />;
}

// ── 메인 컴포넌트 ───────────────────────────────────────────
interface Props {
  pitchTypes: PitchTypeSummary[];
  locations: PitchLocationPoint[];
  totalPitches: number;
}

export default function PitchMixChart({ pitchTypes, locations, totalPitches }: Props) {
  // UN / null 제외
  const filtered = pitchTypes.filter(p => p.pitchType && p.pitchType !== 'UN');

  // 전체 선택 상태
  const allTypes = new Set(filtered.map(p => p.pitchType));
  const activeTypes = allTypes; // 전체 표시 (나중에 토글 추가 가능)

  return (
    <div className="space-y-6">

      {/* 구종 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-center">
          <thead>
            <tr className="text-text-secondary border-b border-border-tertiary">
              <th className="py-2 px-3 text-left">구종</th>
              <th className="py-2 px-3">투구수</th>
              <th className="py-2 px-3">비율</th>
              <th className="py-2 px-3">평균구속</th>
              <th className="py-2 px-3">회전수</th>
              <th className="py-2 px-3">헛스윙%</th>
              <th className="py-2 px-3">스트라이크%</th>
              <th className="py-2 px-3">피타율</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.pitchType} className="border-b border-border-tertiary hover:bg-bg-secondary transition-colors">
                <td className="py-2.5 px-3 text-left">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getPitchColor(p.pitchType) }}
                    />
                    <span className="text-text-primary font-medium">{getPitchName(p.pitchType)}</span>
                    <span className="text-text-tertiary text-xs">({p.pitchType})</span>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-text-primary">{p.count.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-text-primary">{fmt(p.percentage)}%</td>
                <td className="py-2.5 px-3 text-text-primary">{fmt(p.avgVelocity)} mph</td>
                <td className="py-2.5 px-3 text-text-primary">{p.avgSpinRate != null ? Math.round(p.avgSpinRate).toLocaleString() : '-'} rpm</td>
                <td className="py-2.5 px-3 text-text-primary">{fmt(p.whiffRate)}%</td>
                <td className="py-2.5 px-3 text-text-primary">{fmt(p.strikeRate)}%</td>
                <td className="py-2.5 px-3 text-text-primary">{fmtAvg(p.avgBattingAvg)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 투구 존 산점도 */}
      <div>
        <h3 className="text-sm font-medium text-text-secondary mb-3">투구 존</h3>
        <div className="flex flex-wrap gap-6 items-start">
          <ZoneChart locations={locations} activeTypes={activeTypes} />

          {/* 범례 */}
          <div className="flex flex-col gap-1.5">
            {filtered.map(p => (
              <div key={p.pitchType} className="flex items-center gap-2 text-xs text-text-secondary">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getPitchColor(p.pitchType) }}
                />
                <span>{getPitchName(p.pitchType)}</span>
                <span className="text-text-tertiary">{fmt(p.percentage)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}