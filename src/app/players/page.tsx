'use client';

import { useEffect, useState } from 'react';
import { PlayerResponse } from '@/types/player';
import { getActivePlayers, searchPlayers, getPlayersByPosition, getPlayersByTeam } from '@/lib/api/players';
import PlayerCard from '@/components/players/PlayerCard';
import PlayerFilterBar from '@/components/players/PlayerFilterBar';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<PlayerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const debouncedKeyword = useDebounce(keyword, 300);

  useEffect(() => {
    let cancelled = false;

    const fetchPlayers = async () => {
      setLoading(true);
      try {
        let data: PlayerResponse[];

        if (debouncedKeyword.trim()) {
          data = await searchPlayers(debouncedKeyword.trim());
        } else if (selectedTeamId) {
          data = await getPlayersByTeam(selectedTeamId);
        } else if (selectedPosition) {
          data = await getPlayersByPosition(selectedPosition);
        } else {
          data = await getActivePlayers();
        }

        if (!cancelled) setPlayers(data);
      } catch (e) {
        console.error(e);
        if (!cancelled) setPlayers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPlayers();
    return () => { cancelled = true; };
  }, [debouncedKeyword, selectedTeamId, selectedPosition]);

  return (
    <div className="min-h-screen bg-bg-tertiary text-text-primary">
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">선수</h1>
          <p className="text-text-secondary text-sm">MLB 현역 선수 {players.length}명</p>
        </div>

        {/* 검색 + 필터 */}
        <div className="flex flex-col gap-4 mb-8">
          <input
            type="text"
            placeholder="선수 이름 검색 (예: Ohtani, Judge)"
            value={keyword}
            onChange={e => {
              setKeyword(e.target.value);
              if (e.target.value) {
                setSelectedPosition('');
                setSelectedTeamId(null);
              }
            }}
            className="w-full max-w-md bg-bg-primary border border-border-tertiary rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent"
          />
          <PlayerFilterBar
            selectedTeamId={selectedTeamId}
            selectedPosition={selectedPosition}
            onTeamChange={(teamId) => {
              setSelectedTeamId(teamId);
              setKeyword('');
            }}
            onPositionChange={(pos) => {
              setSelectedPosition(pos);
              setKeyword('');
              setSelectedTeamId(null);
            }}
          />
        </div>

        {/* 선수 그리드 */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-bg-secondary rounded-xl h-56 animate-pulse" />
            ))}
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-20 text-text-secondary">
            <p className="text-lg">검색 결과가 없습니다</p>
            <p className="text-sm mt-1">다른 이름이나 포지션으로 검색해보세요</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {players.map(player => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}