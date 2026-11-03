import {
  CommentRequest,
  CommentResponse,
  LikeResponse,
  Page,
  PostRequest,
  PostResponse,
  PostSearchParams,
} from '@/types/community';
import { api } from './client';

// ── 게시글 ──────────────────────────────────────────

export async function getPosts(params: PostSearchParams = {}): Promise<Page<PostResponse>> {
  const { category, keyword, searchType, playerId, teamId, page = 0, size = 20, sort = 'createdAt', direction = 'desc' } = params;
  const searchParams = new URLSearchParams();
  if (category) searchParams.set('category', category);
  if (keyword) searchParams.set('keyword', keyword);
  if (searchType) searchParams.set('searchType', searchType);
  if (playerId) searchParams.set('playerId', String(playerId));
  if (teamId) searchParams.set('teamId', String(teamId));
  searchParams.set('page', String(page));
  searchParams.set('size', String(size));
  searchParams.set('sort', `${sort},${direction}`);
  const res = await api.get<Page<PostResponse>>(`/api/posts?${searchParams.toString()}`);
  return res.data;
}

export async function getMyPosts(page = 0, size = 20): Promise<Page<PostResponse>> {
  const res = await api.get<Page<PostResponse>>(`/api/posts/my?page=${page}&size=${size}&sort=createdAt,desc`);
  return res.data;
}

/** 상세 조회 — 조회수 증가 O */
export async function getPost(postId: number): Promise<PostResponse> {
  const res = await api.get<PostResponse>(`/api/posts/${postId}`);
  return res.data;
}

/** 수정용 조회 — 조회수 증가 X, 본인만 가능 */
export async function getPostForEdit(postId: number): Promise<PostResponse> {
  const res = await api.get<PostResponse>(`/api/posts/${postId}/for-edit`);
  return res.data;
}

export async function createPost(request: PostRequest): Promise<PostResponse> {
  const res = await api.post<PostResponse>('/api/posts', request);
  return res.data;
}

/** PIN이 설정된 글은 pin 필수 */
export async function updatePost(postId: number, request: PostRequest, pin?: string): Promise<PostResponse> {
  const res = await api.put<PostResponse>(`/api/posts/${postId}`, request, {
    headers: pin ? { 'X-Delete-Pin': pin } : {},
  });
  return res.data;
}

/** PIN이 설정된 글은 pin 필수 */
export async function deletePost(postId: number, pin?: string): Promise<void> {
  await api.delete(`/api/posts/${postId}`, {
    headers: pin ? { 'X-Delete-Pin': pin } : {},
  });
}

export async function togglePostLike(postId: number): Promise<LikeResponse> {
  const res = await api.post<LikeResponse>(`/api/posts/${postId}/like`);
  return res.data;
}

// ── 댓글 ──────────────────────────────────────────

export async function getComments(postId: number): Promise<CommentResponse[]> {
  const res = await api.get<CommentResponse[]>(`/api/comments/${postId}`);
  return res.data;
}

export async function getMyComments(): Promise<CommentResponse[]> {
  const res = await api.get<CommentResponse[]>('/api/comments/my');
  return res.data;
}

export async function createComment(postId: number, request: CommentRequest): Promise<CommentResponse> {
  const res = await api.post<CommentResponse>(`/api/comments/${postId}`, request);
  return res.data;
}

export async function updateComment(commentId: number, request: CommentRequest): Promise<CommentResponse> {
  const res = await api.put<CommentResponse>(`/api/comments/${commentId}`, request);
  return res.data;
}

export async function deleteComment(commentId: number): Promise<void> {
  await api.delete(`/api/comments/${commentId}`);
}

export async function toggleCommentLike(commentId: number): Promise<LikeResponse> {
  const res = await api.post<LikeResponse>(`/api/comments/${commentId}/like`);
  return res.data;
}