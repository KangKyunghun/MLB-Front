'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getPitcherVsBatter, getPitcherVsTeam } from '@/lib/api/stats';
import type { BatterVsPitcherResponse, BatterVsTeamResponse } from '@/lib/api/stats';

interface Props {
  playerId: number;
  season: number;
  gameType: 'R' | 'PS';
}

const fmt = (val: number | null | undefined, digits = 3) =>
  val == null ? '-' : val.toFixed(digits);

export default function PitcherVsRecord({ playerId, season, gameType }: Props) {
  const [mode, setMode] = useState<'batter' | 'team'>('batter');
  const [batterData, setBatterData] = useState<BatterVsPitcherResponse[]>([]);
  const [teamData, setTeamData] = useState<BatterVsTeamResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatter, setSelectedBatter] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const [batters, teams] = await Promise.all([
          getPitcherVsBatter(playerId, season, gameType),
          getPitcherVsTeam(playerId, season, gameType),
        ]);
        if (!cancelled) {
          setBatterData(batters);
          setTeamData(teams);
          setSelectedBatter(batters[0]?.batterName ?? '');
          setSelectedTeam(teams[0]?.teamName ?? '');
        }
      } catch {
        if (!cancelled) {
          setBatterData([]);
          setTeamData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [playerId, season, gameType]);

  if (loading) return <div className="h-32 bg-bg-secondary rounded-xl animate-pulse" />;

  const isEmpty = batterData.length === 0 && teamData.length === 0;
  if (isEmpty) return (
    <div className="text-center py-16 text-text-secondary">
      해당 시즌 상대전적 데이터가 없습니다
    </div>
  );

  const selectedBatterStat = batterData.find(b => b.batterName === selectedBatter);
  const selectedTeamStat = teamData.find(t => t.teamName === selectedTeam);

  return (
    <div className="flex flex-col gap-4">
      {/* 모드 토글 */}
      <div className="flex rounded-lg overflow-hidden border border-border-tertiary w-fit">
        <button
          onClick={() => setMode('batter')}
          className={`px-4 py-1.5 text-sm transition-colors
            ${mode === 'batter' ? 'bg-accent text-white font-medium' : 'bg-bg-primary text-text-secondary hover:text-text-primary'}`}
        >
          타자별
        </button>
        <button
          onClick={() => setMode('team')}
          className={`px-4 py-1.5 text-sm transition-colors
            ${mode === 'team' ? 'bg-accent text-white font-medium' : 'bg-bg-primary text-text-secondary hover:text-text-primary'}`}
        >
          팀별
        </button>
      </div>

      {/* 타자별 */}
      {mode === 'batter' && (
        <div className="flex flex-col gap-4">
          <select
            value={selectedBatter}
            onChange={e => setSelectedBatter(e.target.value)}
            className="w-64 bg-bg-primary border border-border-tertiary rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent cursor-pointer"
          >
            {batterData.map(b => (
              <option key={b.batterId} value={b.batterName ?? ''}>
                {b.batterName}
              </option>
            ))}
          </select>

          {selectedBatterStat && (
            <div className="overflow-x-auto rounded-xl border border-border-tertiary">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-bg-secondary text-text-secondary text-xs">
                    <th className="px-4 py-3 text-left font-medium sticky left-0 bg-bg-secondary">타자</th>
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
                  <tr className="border-t border-border-tertiary bg-bg-primary">
                    <td className="px-4 py-3 font-medium text-text-primary sticky left-0 bg-inherit">
                      {selectedBatterStat.batterName}
                    </td>
                    <td className="px-4 py-3 text-center text-text-secondary">{selectedBatterStat.atBats}</td>
                    <td className="px-4 py-3 text-center text-text-secondary">{selectedBatterStat.hits}</td>
                    <td className="px-4 py-3 text-center text-text-secondary">{selectedBatterStat.homeRuns}</td>
                    <td className="px-4 py-3 text-center text-text-secondary">{selectedBatterStat.rbi}</td>
                    <td className="px-4 py-3 text-center text-text-secondary">{selectedBatterStat.walks}</td>
                    <td className="px-4 py-3 text-center text-text-secondary">{selectedBatterStat.strikeOuts}</td>
                    <td className="px-4 py-3 text-center font-medium text-text-primary">{fmt(selectedBatterStat.avg)}</td>
                    <td className="px-4 py-3 text-center font-medium text-text-primary">{fmt(selectedBatterStat.obp)}</td>
                    <td className="px-4 py-3 text-center font-medium text-text-primary">{fmt(selectedBatterStat.slg)}</td>
                    <td className="px-4 py-3 text-center font-medium text-accent">{fmt(selectedBatterStat.ops)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 팀별 */}
      {mode === 'team' && (
        <div className="flex flex-col gap-4">
          <select
            value={selectedTeam}
            onChange={e => setSelectedTeam(e.target.value)}
            className="w-64 bg-bg-primary border border-border-tertiary rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent cursor-pointer"
          >
            {teamData.map(t => (
              <option key={t.teamId} value={t.teamName}>
                {t.teamName}
              </option>
            ))}
          </select>

          {selectedTeamStat && (
            <div className="overflow-x-auto rounded-xl border border-border-tertiary">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-bg-secondary text-text-secondary text-xs">
                    <th className="px-4 py-3 text-left font-medium sticky left-0 bg-bg-secondary">팀</th>
                    <th className="px-4 py-3 text-center font-medium">AB</th>
                    <th className="px-4 py-3 text-center font-medium">H</th>
                    <th className="px-4 py-3 text-center font-medium">HR</th>
                    <th className="px-4 py-3 text-center font-medium">BB</th>
                    <th className="px-4 py-3 text-center font-medium">SO</th>
                    <th className="px-4 py-3 text-center font-medium">AVG</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border-tertiary bg-bg-primary">
                    <td className="px-4 py-3 font-medium text-text-primary sticky left-0 bg-inherit">
                      <div className="flex items-center gap-2">
                        {selectedTeamStat.teamLogoUrl && (
                          <Image src={selectedTeamStat.teamLogoUrl} alt={selectedTeamStat.teamName} width={18} height={18} />
                        )}
                        {selectedTeamStat.teamName}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-text-secondary">{selectedTeamStat.atBats}</td>
                    <td className="px-4 py-3 text-center text-text-secondary">{selectedTeamStat.hits}</td>
                    <td className="px-4 py-3 text-center text-text-secondary">{selectedTeamStat.homeRuns}</td>
                    <td className="px-4 py-3 text-center text-text-secondary">{selectedTeamStat.baseOnBalls}</td>
                    <td className="px-4 py-3 text-center text-text-secondary">{selectedTeamStat.strikeOuts}</td>
                    <td className="px-4 py-3 text-center font-medium text-accent">{fmt(selectedTeamStat.avg)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}