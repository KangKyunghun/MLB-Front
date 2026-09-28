'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getSprayData } from '@/lib/api/stats';
import type { SprayDataResponse } from '@/lib/api/stats';

interface Props {
  playerId: number;
  season: number;
  gameType: 'R' | 'PS';
}

const EVENT_COLOR: Record<string, string> = {
  single:   '#4ade80',
  double:   '#60a5fa',
  triple:   '#f59e0b',
  home_run: '#f87171',
};

const EVENT_LABEL: Record<string, string> = {
  single:   '안타',
  double:   '2루타',
  triple:   '3루타',
  home_run: '홈런',
};

export default function SprayChart({ playerId, season, gameType }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<SprayDataResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEvents, setActiveEvents] = useState<Set<string>>(
    new Set(['single', 'double', 'triple', 'home_run'])
  );
  const [tooltip, setTooltip] = useState<{
    x: number; y: number;
    item: SprayDataResponse;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getSprayData(playerId, season, gameType);
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) setData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [playerId, season, gameType]);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const W = 400;
    const H = 400;

    const g = svg.append('g');

    const scaleX = d3.scaleLinear().domain([0, 255]).range([0, W]);
    const scaleY = d3.scaleLinear().domain([0, 255]).range([0, H]);

    const cx = scaleX(125);
    const cy = scaleY(205);

    const lfX = scaleX(10);  const lfY = scaleY(10);
    const rfX = scaleX(240); const rfY = scaleY(10);

    // 야구장 배경
    g.append('path')
      .attr('d', `M ${cx} ${cy} L ${lfX} ${lfY} A 280 280 0 0 1 ${rfX} ${rfY} Z`)
      .attr('fill', '#2d5a1b')
      .attr('opacity', 0.6);

    // 파울 라인
    g.append('line')
      .attr('x1', cx).attr('y1', cy)
      .attr('x2', lfX).attr('y2', lfY)
      .attr('stroke', 'white').attr('stroke-width', 1).attr('opacity', 0.4);

    g.append('line')
      .attr('x1', cx).attr('y1', cy)
      .attr('x2', rfX).attr('y2', rfY)
      .attr('stroke', 'white').attr('stroke-width', 1).attr('opacity', 0.4);

    // 외야 펜스 호
    const arcPath = d3.arc()({
      innerRadius: 178,
      outerRadius: 180,
      startAngle: -Math.PI * 0.72,
      endAngle: Math.PI * 0.72,
    });
    if (arcPath) {
      g.append('path')
        .attr('d', arcPath)
        .attr('transform', `translate(${cx}, ${cy})`)
        .attr('fill', 'white')
        .attr('opacity', 0.3);
    }

    // 내야 다이아몬드
    const baseSize = 22;
    g.append('rect')
      .attr('x', cx - baseSize)
      .attr('y', cy - baseSize * 2.5)
      .attr('width', baseSize * 2)
      .attr('height', baseSize * 2)
      .attr('transform', `rotate(-45, ${cx}, ${cy - baseSize * 1.5})`)
      .attr('fill', '#c8a46e')
      .attr('opacity', 0.5);

    // 필터된 데이터
    const filtered = data.filter(d =>
      d.hitCoordX !== null &&
      d.hitCoordY !== null &&
      activeEvents.has(d.events ?? '')
    );

    // 타구 점
    g.selectAll('circle')
      .data(filtered)
      .enter()
      .append('circle')
      .attr('cx', d => scaleX(d.hitCoordX!))
      .attr('cy', d => scaleY(d.hitCoordY!))
      .attr('r', 5)
      .attr('fill', d => EVENT_COLOR[d.events ?? ''] ?? '#888')
      .attr('opacity', 0.75)
      .attr('stroke', 'white')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('r', 7).attr('opacity', 1);
        const rect = svgRef.current!.getBoundingClientRect();
        setTooltip({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          item: d,
        });
      })
      .on('mouseout', function () {
        d3.select(this).attr('r', 5).attr('opacity', 0.75);
        setTooltip(null);
      });

  }, [data, activeEvents]);

  const toggleEvent = (event: string) => {
    setActiveEvents(prev => {
      const next = new Set(prev);
      if (next.has(event)) next.delete(event);
      else next.add(event);
      return next;
    });
  };

  if (loading) return <div className="h-96 bg-bg-secondary rounded-xl animate-pulse" />;

  if (data.length === 0) return (
    <div className="text-center py-16 text-text-secondary">
      해당 시즌 스프레이차트 데이터가 없습니다
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-bg-primary border border-border-tertiary rounded-xl p-6">
        <h3 className="text-sm font-medium text-text-secondary mb-4 text-center">
          {season}시즌 스프레이차트 ({gameType === 'R' ? '정규시즌' : '포스트시즌'}) — {data.length}타구
        </h3>

        {/* 필터 버튼 */}
        <div className="flex justify-center gap-2 mb-4 flex-wrap">
          {Object.entries(EVENT_LABEL).map(([event, label]) => (
            <button
              key={event}
              onClick={() => toggleEvent(event)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all
                ${activeEvents.has(event) ? 'opacity-100' : 'opacity-30'}`}
              style={{
                backgroundColor: activeEvents.has(event) ? EVENT_COLOR[event] + '25' : '#88888825',
                color: activeEvents.has(event) ? EVENT_COLOR[event] : '#888',
                border: `1px solid ${activeEvents.has(event) ? EVENT_COLOR[event] : '#888'}`,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: EVENT_COLOR[event] }}
              />
              {label} ({data.filter(d => d.events === event).length})
            </button>
          ))}
        </div>

        {/* SVG 차트 */}
        <div className="relative">
          <svg
            ref={svgRef}
            viewBox="0 0 400 400"
            width={400}
            height={400}
            className="bg-[#1a3a0f] rounded-lg"
          />

          {/* 툴팁 */}
          {tooltip && (
            <div
              className="absolute pointer-events-none bg-bg-primary border border-border-tertiary rounded-lg px-3 py-2 text-xs shadow-lg z-10"
              style={{ left: tooltip.x + 10, top: tooltip.y - 40 }}
            >
              <p className="font-medium text-text-primary mb-1">
                {EVENT_LABEL[tooltip.item.events ?? ''] ?? tooltip.item.events}
              </p>
              {tooltip.item.exitVelocity && (
                <p className="text-text-secondary">타구 속도: {tooltip.item.exitVelocity.toFixed(1)} mph</p>
              )}
              {tooltip.item.launchAngle && (
                <p className="text-text-secondary">발사각: {tooltip.item.launchAngle.toFixed(1)}°</p>
              )}
              {tooltip.item.hitDistance && (
                <p className="text-text-secondary">거리: {tooltip.item.hitDistance.toFixed(0)} ft</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}