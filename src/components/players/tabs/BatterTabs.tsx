'use client';

import { useState } from 'react';
import BatterStatTable from './BatterStatTable';
import HotColdZoneChart from './HotColdZone';
import SprayChart from './SprayChart';
import SituationStat from './SituationStat';
import VsRecord from './VsRecord';

interface Props {
  playerId: number;
  season: number;
  gameType: 'R' | 'PS';
}

const TABS = [
  { id: 'stat', label: '시즌 기록' },
  { id: 'hotcold', label: '핫콜드존' },
  { id: 'spray', label: '스프레이차트' },
  { id: 'split', label: '스플릿' },
  { id: 'vs', label: '상대전적' },
];

export default function BatterTabs({ playerId, season, gameType }: Props) {
  const [activeTab, setActiveTab] = useState('stat');

  return (
    <div>
      {/* 탭 헤더 */}
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

      {/* 탭 컨텐츠 */}
      <div>
        {activeTab === 'stat' && (
          <BatterStatTable playerId={playerId} season={season} gameType={gameType} />
        )}
        {activeTab === 'hotcold' && (
          <HotColdZoneChart playerId={playerId} season={season} gameType={gameType} />
        )}
        {activeTab === 'spray' && (
          <SprayChart playerId={playerId} season={season} gameType={gameType} />
        )}
        {activeTab === 'split' && (
          <SituationStat playerId={playerId} season={season} gameType={gameType} />
        )}
        {activeTab === 'vs' && (
          <VsRecord playerId={playerId} season={season} gameType={gameType} />
        )}
      </div>
    </div>
  );
}