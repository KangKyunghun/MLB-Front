'use client';

import { useEffect, useState } from 'react';
import { getPitchMix, PitchMixResponse } from '@/lib/api/stats';
import PitchMixChart from './PitchMixChart';

interface Props {
  playerId: number;
  season: number;
  gameType: 'R' | 'PS';
}

export default function PitchMixSection({ playerId, season, gameType }: Props) {
  const [data, setData] = useState<PitchMixResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);  // ← 여기가 문제였는데
      // 아래처럼 async 함수 안으로 이동
      try {
        const result = await getPitchMix(playerId, season, gameType);
        if (!cancelled) {
          setData(result);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [playerId, season, gameType]);

  if (loading) return <div className="text-text-secondary text-sm py-8 text-center">로딩 중...</div>;
  if (error || !data) return <div className="text-text-secondary text-sm py-8 text-center">구종 데이터가 없습니다.</div>;

  return (
    <PitchMixChart
      pitchTypes={data.pitchTypes}
      locations={data.locations}
      totalPitches={data.totalPitches}
    />
  );
}