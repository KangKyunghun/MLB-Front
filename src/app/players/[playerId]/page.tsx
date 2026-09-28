'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { getPlayer } from '@/lib/api/players';
import type { PlayerResponse } from '@/types/player';
import SeasonGameTypeSelector from '@/components/players/SeasonGameTypeSelector';
import BatterTabs from '@/components/players/tabs/BatterTabs';
import PitcherTabs from '@/components/players/tabs/PitcherTabs';

const SEASONS = [2026, 2025, 2024];

const POSITION_LABEL: Record<string, string> = {
  P: '투수', TWP: '투타겸업', C: '포수',
  '1B': '1루수', '2B': '2루수', '3B': '3루수',
  SS: '유격수', IF: '내야수', OF: '외야수',
  LF: '좌익수', CF: '중견수', RF: '우익수', DH: '지명타자',
};

const HAND_LABEL: Record<string, string> = {
  L: '좌', R: '우', S: '양',
};

export default function PlayerDetailPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const id = Number(playerId);

  const [player, setPlayer] = useState<PlayerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState(2026);
  const [gameType, setGameType] = useState<'R' | 'PS'>('R');
  const [twpMode, setTwpMode] = useState<'batter' | 'pitcher'>('batter');

  useEffect(() => {
    getPlayer(id)
      .then(setPlayer)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-tertiary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-bg-tertiary flex items-center justify-center text-text-secondary">
        선수 정보를 찾을 수 없습니다
      </div>
    );
  }

  const isPitcher = player.position === 'P';
  const isTWP = player.position === 'TWP';

  return (
    <div className="min-h-screen bg-bg-tertiary text-text-primary">

      {/* 프로필 카드 */}
      <div className="bg-bg-primary border-b border-border-tertiary">
        <div className="max-w-6xl mx-auto px-6 py-8 flex gap-8 items-end">

          {/* 선수 사진 */}
          <div className="relative w-36 h-36 rounded-2xl overflow-hidden bg-bg-secondary flex-shrink-0">
            {player.photoUrl ? (
              <Image src={player.photoUrl} alt={player.fullName} fill className="object-cover object-center" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-text-secondary">?</div>
            )}
          </div>

          {/* 선수 정보 */}
          <div className="flex-1 pb-1">
            {/* 팀 */}
            <div className="flex items-center gap-2 mb-2">
              {player.teamLogoUrl && (
                <Image src={player.teamLogoUrl} alt={player.teamName ?? ''} width={20} height={20} />
              )}
              <span className="text-sm text-text-secondary">{player.teamName ?? '무소속'}</span>
            </div>

            {/* 이름 + 등번호 */}
            <div className="flex items-baseline gap-3 mb-3">
              <h1 className="text-3xl font-bold">{player.fullName}</h1>
              {player.shirtNumber && (
                <span className="text-xl text-text-secondary font-medium">#{player.shirtNumber}</span>
              )}
            </div>

            {/* 포지션 / 투타 / 생년월일 / 국적 */}
            <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
              <span className="bg-accent/10 text-accent px-2.5 py-0.5 rounded-full text-xs font-medium">
                {POSITION_LABEL[player.position] ?? player.position}
              </span>

                <span>
                    {HAND_LABEL[player.pitchHand ?? ''] ?? '-'}투
                    {HAND_LABEL[player.batSide ?? ''] ?? '-'}타
                </span>

              {player.dateOfBirth && (
                <span>생년월일: {player.dateOfBirth.replace(/-/g, '.')}</span>
              )}
              {player.nationality && (
                <span>국적: {player.nationality}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 시즌 / 정규·포스트 선택 + TWP 모드 */}
      <div className="bg-bg-primary border-b border-border-tertiary">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-4 flex-wrap">
          <SeasonGameTypeSelector
            seasons={SEASONS}
            season={season}
            gameType={gameType}
            onSeasonChange={setSeason}
            onGameTypeChange={setGameType}
          />
          {isTWP && (
            <div className="flex rounded-lg overflow-hidden border border-border-tertiary">
              <button
                onClick={() => setTwpMode('batter')}
                className={`px-4 py-1.5 text-sm transition-colors
                  ${twpMode === 'batter' ? 'bg-accent text-white font-medium' : 'bg-bg-primary text-text-secondary hover:text-text-primary'}`}
              >
                타자
              </button>
              <button
                onClick={() => setTwpMode('pitcher')}
                className={`px-4 py-1.5 text-sm transition-colors
                  ${twpMode === 'pitcher' ? 'bg-accent text-white font-medium' : 'bg-bg-primary text-text-secondary hover:text-text-primary'}`}
              >
                투수
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {(isPitcher || (isTWP && twpMode === 'pitcher')) ? (
          <PitcherTabs playerId={id} season={season} gameType={gameType} />
        ) : (
          <BatterTabs playerId={id} season={season} gameType={gameType} />
        )}
      </div>

    </div>
  );
}