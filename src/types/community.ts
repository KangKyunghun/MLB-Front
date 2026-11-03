export type PostCategory = 'FREE' | 'ANALYSIS' | 'PLAYER' | 'TEAM';
export type PostSearchType = 'TITLE' | 'TITLE_CONTENT' | 'AUTHOR';
export type SortType = 'createdAt' | 'likeCount' | 'viewCount';

export interface PostResponse {
  id: number;
  userId: number;
  nickname: string;
  title: string;
  content?: string;
  category: PostCategory;
  relatedPlayerId?: number;
  relatedTeamId?: number;
  likeCount: number;
  viewCount: number;
  commentCount: number;
  liked: boolean;
  hasPinSet: boolean;   // 삭제 PIN 설정 여부
  createdAt: string;
  updatedAt: string;
}

export interface PostRequest {
  title: string;
  content: string;
  category: PostCategory;
  relatedPlayerId?: number;
  relatedTeamId?: number;
  deletePin?: string;   // 작성 시 선택 입력 (4자리 숫자)
}

export interface CommentResponse {
  id: number;
  postId: number;
  userId?: number;
  nickname?: string;
  parentId?: number;
  content: string;
  likeCount: number;
  liked: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: CommentResponse[];
}

export interface CommentRequest {
  content: string;
  parentId?: number;
}

export interface LikeResponse {
  liked: boolean;
  likeCount: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface PostSearchParams {
  category?: PostCategory;
  keyword?: string;
  searchType?: PostSearchType;
  playerId?: number;
  teamId?: number;
  page?: number;
  size?: number;
  sort?: SortType;
  direction?: 'asc' | 'desc';
}