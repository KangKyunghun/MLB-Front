import { PostCategory, SortType } from '@/types/community';

export const CATEGORY_LABEL: Record<PostCategory, string> = {
  FREE: '자유',
  ANALYSIS: '분석',
  PLAYER: '선수',
  TEAM: '팀',
};

export const CATEGORY_COLOR: Record<PostCategory, string> = {
  FREE: 'bg-blue-100 text-blue-600',
  ANALYSIS: 'bg-amber-100 text-amber-600',
  PLAYER: 'bg-emerald-100 text-emerald-600',
  TEAM: 'bg-purple-100 text-purple-600',
};

export const SORT_LABEL: Record<SortType, string> = {
  createdAt: '최신순',
  likeCount: '좋아요순',
  viewCount: '조회순',
};

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}

export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금 전';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return formatDate(dateStr);
}

export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}