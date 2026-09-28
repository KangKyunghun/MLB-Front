'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getBatterVsPitcher, getBatterVsTeam } from '@/lib/api/stats';
import type { BatterVsPitcherResponse, BatterVsTeamResponse } from '@/lib/api/stats';

interface Props {
  playerId: number;
  season: number;
  gameType: 'R' | 'PS';
}

const fmt = (val: number | null | undefined, digits = 3) =>
  val == null ? '-' : val.toFixed(digits);

export default function VsRecord({ playerId, season, gameType }: Props) {
  const [mode, setMode] = useState<'pitcher' | 'team'>('pitcher');
  const [pitcherData, setPitcherData] = useState<BatterVsPitcherResponse[]>([]);
  const [teamData, setTeamData] = useState<BatterVsTeamResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPitcher, setSelectedPitcher] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pitchers, teams] = await Promise.all([
          getBatterVsPitcher(playerId, season, gameType),
          getBatterVsTeam(playerId, season, gameType),
        ]);
        if (!cancelled) {
          setPitcherData(pitchers);
          setTeamData(teams);
          setSelectedPitcher(pitchers[0]?.pitcherName ?? '');
          setSelectedTeam(teams[0]?.teamName ?? '');
        }
      } catch {
        if (!cancelled) {
          setPitcherData([]);
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

  const isEmpty = pitcherData.length === 0 && teamData.length === 0;
  if (isEmpty) return (
    <div className="text-center py-16 text-text-secondary">
      해당 시즌 상대전적 데이터가 없습니다
    </div>
  );

  const selectedPitcherStat = pitcherData.find(p => p.pitcherName === selectedPitcher);
  const selectedTeamStat = teamData.find(t => t.teamName === selectedTeam);

  return (
    <div className="flex flex-col gap-4">
      {/* 모드 토글 */}
      <div className="flex rounded-lg overflow-hidden border border-border-tertiary w-fit">
        <button
          onClick={() => setMode('pitcher')}
          className={`px-4 py-1.5 text-sm transition-colors
            ${mode === 'pitcher' ? 'bg-accent text-white font-medium' : 'bg-bg-primary text-text-secondary hover:text-text-primary'}`}
        >
          투수별
        </button>
        <button
          onClick={() => setMode('team')}
          className={`px-4 py-1.5 text-sm transition-colors
            ${mode === 'team' ? 'bg-accent text-white font-medium' : 'bg-bg-primary text-text-secondary hover:text-text-primary'}`}
        >
          팀별
        </button>
      </div>

      {/* 투수별 */}
      {mode === 'pitcher' && (
        <div className="flex flex-col gap-4">
          <select
            value={selectedPitcher}
            onChange={e => setSelectedPitcher(e.target.value)}
            className="w-64 bg-bg-primary border border-border-tertiary rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent cursor-pointer"
          >
            {pitcherData.map(p => (
              <option key={p.pitcherId} value={p.pitcherName ?? ''}>
                {p.pitcherName}
              </option>
            ))}
          </select>

          {selectedPitcherStat && (
            <div className="overflow-x-auto rounded-xl border border-border-tertiary">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-bg-secondary text-text-secondary text-xs">
                    <th className="px-4 py-3 text-left font-medium sticky left-0 bg-bg-secondary">투수</th>
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
                      {selectedPitcherStat.pitcherName}
                    </td>
                    <td className="px-4 py-3 text-center text-text-secondary">{selectedPitcherStat.atBats}</td>
                    <td className="px-4 py-3 text-center text-text-secondary">{selectedPitcherStat.hits}</td>
                    <td className="px-4 py-3 text-center text-text-secondary">{selectedPitcherStat.homeRuns}</td>
                    <td className="px-4 py-3 text-center text-text-secondary">{selectedPitcherStat.rbi}</td>
                    <td className="px-4 py-3 text-center text-text-secondary">{selectedPitcherStat.walks}</td>
                    <td className="px-4 py-3 text-center text-text-secondary">{selectedPitcherStat.strikeOuts}</td>
                    <td className="px-4 py-3 text-center font-medium text-text-primary">{fmt(selectedPitcherStat.avg)}</td>
                    <td className="px-4 py-3 text-center font-medium text-text-primary">{fmt(selectedPitcherStat.obp)}</td>
                    <td className="px-4 py-3 text-center font-medium text-text-primary">{fmt(selectedPitcherStat.slg)}</td>
                    <td className="px-4 py-3 text-center font-medium text-accent">{fmt(selectedPitcherStat.ops)}</td>
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
                    <td className="px-4 py-3 text-center text-text-secondary">{selectedTeamStat.rbi}</td>
                    <td className="px-4 py-3 text-center text-text-secondary">{selectedTeamStat.walks}</td>
                    <td className="px-4 py-3 text-center text-text-secondary">{selectedTeamStat.strikeOuts}</td>
                    <td className="px-4 py-3 text-center font-medium text-text-primary">{fmt(selectedTeamStat.avg)}</td>
                    <td className="px-4 py-3 text-center font-medium text-text-primary">{fmt(selectedTeamStat.obp)}</td>
                    <td className="px-4 py-3 text-center font-medium text-text-primary">{fmt(selectedTeamStat.slg)}</td>
                    <td className="px-4 py-3 text-center font-medium text-accent">{fmt(selectedTeamStat.ops)}</td>
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