'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getAllTeams } from '@/lib/api/teams';
import type { TeamResponse } from '@/types';

const POSITIONS = [
  { value: '', label: '포지션 전체' },
  { value: 'P', label: '투수' },
  { value: 'TWP', label: '투타겸업' },
  { value: 'C', label: '포수' },
  { value: '1B', label: '1루수' },
  { value: '2B', label: '2루수' },
  { value: '3B', label: '3루수' },
  { value: 'SS', label: '유격수' },
  { value: 'IF', label: '내야수' },
  { value: 'OF', label: '외야수' },
  { value: 'LF', label: '좌익수' },
  { value: 'CF', label: '중견수' },
  { value: 'RF', label: '우익수' },
  { value: 'DH', label: '지명타자' },
];

interface Props {
  selectedTeamId: number | null;
  selectedPosition: string;
  onTeamChange: (teamId: number | null) => void;
  onPositionChange: (position: string) => void;
}

export default function PlayerFilterBar({
  selectedTeamId,
  selectedPosition,
  onTeamChange,
  onPositionChange,
}: Props) {
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [teamOpen, setTeamOpen] = useState(false);
  const [posOpen, setPosOpen] = useState(false);

  useEffect(() => {
    getAllTeams().then(setTeams).catch(console.error);
  }, []);

  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const selectedPos = POSITIONS.find(p => p.value === selectedPosition);

  return (
    <div className="flex gap-3">

      {/* 팀 드롭다운 */}
      <div className="relative">
        <button
          onClick={() => { setTeamOpen(o => !o); setPosOpen(false); }}
          className="flex items-center gap-2 min-w-48 px-4 py-2.5 bg-bg-primary border border-border-tertiary rounded-lg text-sm text-text-primary hover:border-accent/50 transition-colors"
        >
          {selectedTeam?.logoUrl && (
            <Image src={selectedTeam.logoUrl} alt={selectedTeam.name} width={18} height={18} />
          )}
          <span className="flex-1 text-left">
            {selectedTeam ? selectedTeam.name : '팀 전체'}
          </span>
          <svg className={`w-4 h-4 text-text-secondary transition-transform ${teamOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {teamOpen && (
          <div className="absolute top-full mt-1 left-0 w-64 bg-bg-primary border border-border-tertiary rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
            <button
              onClick={() => { onTeamChange(null); setTeamOpen(false); }}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-bg-secondary transition-colors
                ${selectedTeamId === null ? 'text-accent font-medium' : 'text-text-primary'}`}
            >
              팀 전체
            </button>
            {teams.map(team => (
              <button
                key={team.id}
                onClick={() => { onTeamChange(team.id); setTeamOpen(false); }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-bg-secondary transition-colors
                  ${selectedTeamId === team.id ? 'text-accent font-medium' : 'text-text-primary'}`}
              >
                {team.logoUrl && (
                  <Image src={team.logoUrl} alt={team.name} width={18} height={18} />
                )}
                {team.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 포지션 드롭다운 */}
      <div className="relative">
        <button
          onClick={() => { setPosOpen(o => !o); setTeamOpen(false); }}
          className="flex items-center gap-2 min-w-36 px-4 py-2.5 bg-bg-primary border border-border-tertiary rounded-lg text-sm text-text-primary hover:border-accent/50 transition-colors"
        >
          <span className="flex-1 text-left">
            {selectedPos?.label ?? '포지션 전체'}
          </span>
          <svg className={`w-4 h-4 text-text-secondary transition-transform ${posOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {posOpen && (
          <div className="absolute top-full mt-1 left-0 w-40 bg-bg-primary border border-border-tertiary rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
            {POSITIONS.map(pos => (
              <button
                key={pos.value}
                onClick={() => { onPositionChange(pos.value); setPosOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-bg-secondary transition-colors
                  ${selectedPosition === pos.value ? 'text-accent font-medium' : 'text-text-primary'}`}
              >
                {pos.label}
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}