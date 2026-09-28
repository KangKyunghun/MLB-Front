import Image from 'next/image';
import Link from 'next/link';
import { PlayerResponse } from '@/types/player';

const POSITION_LABEL: Record<string, string> = {
  P: '투수', TWP: '투타겸업', C: '포수',
  '1B': '1루수', '2B': '2루수', '3B': '3루수',
  SS: '유격수', IF: '내야수', OF: '외야수',
  LF: '좌익수', CF: '중견수', RF: '우익수', DH: '지명타자',
};

const BAT_PITCH_LABEL: Record<string, string> = {
  L: '좌', R: '우', S: '양',
};

interface Props {
  player: PlayerResponse;
}

export default function PlayerCard({ player }: Props) {
  const isPitcher = ['P', 'TWP'].includes(player.position);

  return (
    <Link href={`/players/${player.id}`}>
      <div className="group bg-bg-primary border border-border-tertiary rounded-xl overflow-hidden hover:border-accent/40 hover:bg-bg-secondary transition-all duration-200 cursor-pointer">

        {/* 사진 영역 */}
        <div className="relative h-44 bg-bg-secondary overflow-hidden">
          {player.photoUrl ? (
            <Image
              src={player.photoUrl}
              alt={player.fullName}
              fill
              className="object-cover object-center"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl text-text-secondary">?</span>
            </div>
          )}
          {player.shirtNumber && (
            <span className="absolute top-2 right-2 text-xs font-bold text-white bg-black/40 px-1.5 py-0.5 rounded">
              #{player.shirtNumber}
            </span>
          )}
        </div>

        {/* 선수 정보 */}
        <div className="p-4">
          <div className="flex items-center gap-1.5 mb-2">
            {player.teamLogoUrl && (
              <Image src={player.teamLogoUrl} alt={player.teamName ?? ''} width={16} height={16} />
            )}
            <span className="text-xs text-text-secondary">{player.teamName ?? '무소속'}</span>
          </div>

          <p className="text-text-primary font-semibold text-sm leading-tight mb-3">
            {player.fullName}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
              {POSITION_LABEL[player.position] ?? player.position}
            </span>
            {isPitcher ? (
              <span className="text-xs text-text-secondary">
                {BAT_PITCH_LABEL[player.pitchHand ?? ''] ?? '-'}투
              </span>
            ) : (
              <span className="text-xs text-text-secondary">
                {BAT_PITCH_LABEL[player.batSide ?? ''] ?? '-'}타
              </span>
            )}
          </div>
        </div>

      </div>
    </Link>
  );
}