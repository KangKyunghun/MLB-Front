import { api } from "./client";

export interface PostResponse {
  id: number;
  userId: number;
  nickname: string;
  title: string;
  content?: string;
  category: "FREE" | "ANALYSIS" | string;
  relatedPlayerId: number | null;
  relatedTeamId: number | null;
  likeCount: number;
  viewCount: number;
  liked: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/**
 * 인기글 N개.
 * 백엔드에 좋아요순 정렬 API가 따로 없어서, 최신글을 넉넉히 가져온 뒤
 * likeCount 기준으로 프론트에서 정렬합니다.
 * (백엔드에 GET /api/posts?sort=likeCount,desc 를 지원하는 게 정석이라
 *  여유 생기면 그쪽으로 옮기는 걸 추천해요.)
 */
export async function getPopularPosts(limit = 4): Promise<PostResponse[]> {
  const { data } = await api.get<PageResponse<PostResponse>>("/api/posts", {
    params: { page: 0, size: 30, sort: "createdAt,desc" },
  });

  return [...data.content]
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, limit);
}

export const CATEGORY_LABEL: Record<string, string> = {
  FREE: "자유",
  ANALYSIS: "분석",
};
