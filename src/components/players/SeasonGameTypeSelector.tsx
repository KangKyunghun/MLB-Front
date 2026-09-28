'use client';

interface Props {
  seasons: number[];
  season: number;
  gameType: 'R' | 'PS';
  onSeasonChange: (season: number) => void;
  onGameTypeChange: (gameType: 'R' | 'PS') => void;
}

export default function SeasonGameTypeSelector({
  seasons, season, gameType, onSeasonChange, onGameTypeChange,
}: Props) {
  return (
    <div className="flex items-center gap-3">
      {/* 시즌 드롭다운 */}
      <select
        value={season}
        onChange={e => onSeasonChange(Number(e.target.value))}
        className="bg-bg-primary border border-border-tertiary rounded-lg px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent cursor-pointer"
      >
        {seasons.map(s => (
          <option key={s} value={s}>{s}시즌</option>
        ))}
      </select>

      {/* 정규 / 포스트시즌 토글 */}
      <div className="flex rounded-lg overflow-hidden border border-border-tertiary">
        <button
          onClick={() => onGameTypeChange('R')}
          className={`px-4 py-1.5 text-sm transition-colors
            ${gameType === 'R' ? 'bg-accent text-white font-medium' : 'bg-bg-primary text-text-secondary hover:text-text-primary'}`}
        >
          정규시즌
        </button>
        <button
          onClick={() => onGameTypeChange('PS')}
          className={`px-4 py-1.5 text-sm transition-colors
            ${gameType === 'PS' ? 'bg-accent text-white font-medium' : 'bg-bg-primary text-text-secondary hover:text-text-primary'}`}
        >
          포스트시즌
        </button>
      </div>
    </div>
  );
}