'use client';

import { useState } from 'react';
import PitcherStatTable from './PitcherStatTable';
import PitchMixSection from './PitchMixSection';
import PitcherVsRecord from './PitcherVsRecord';

interface Props {
  playerId: number;
  season: number;
  gameType: 'R' | 'PS';
}

const TABS = [
  { id: 'stat', label: '시즌 기록' },
  { id: 'hotcold', label: '핫콜드존' },
  { id: 'pitch', label: '구종 데이터' },
  { id: 'vs', label: '상대전적' },
];

export default function PitcherTabs({ playerId, season, gameType }: Props) {
  const [activeTab, setActiveTab] = useState('stat');

  return (
    <div>
      <div className="flex border-b border-border-tertiary mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px
              ${activeTab === tab.id
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'stat' && (
          <PitcherStatTable playerId={playerId} season={season} gameType={gameType} />
        )}
        {activeTab === 'hotcold' && (
          <div className="text-text-secondary text-sm">핫콜드존 (구현 예정)</div>
        )}
        {activeTab === 'pitch' && (
          <PitchMixSection playerId={playerId} season={season} gameType={gameType} />
        )}
        {activeTab === 'vs' && (
          <PitcherVsRecord playerId={playerId} season={season} gameType={gameType} />
        )}
      </div>
    </div>
  );
}