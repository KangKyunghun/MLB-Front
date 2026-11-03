'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { deletePost, getPost, togglePostLike } from '@/lib/api/community';
import { PostResponse } from '@/types/community';
import CommentSection from '@/components/community/CommentSection';
import { CATEGORY_COLOR, CATEGORY_LABEL, formatDate, formatRelativeTime } from '@/components/community/communityUtils';
import { useAuthStore } from '@/store/useAuthStore';

// ── PIN 삭제 모달 ─────────────────────────────────
// PIN 검증은 백엔드에서 수행 — 프론트는 입력만 받아서 헤더로 전달
function DeletePinModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: (pin: string) => void;
  onCancel: () => void;
}) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    setError('');
    if (val && idx < 3) inputRefs.current[idx + 1]?.focus();
    if (!val && idx > 0) inputRefs.current[idx - 1]?.focus();

    // 4자리 완성 시 자동 제출
    if (val && idx === 3) {
      const pin = [...next.slice(0, 3), val].join('');
      onConfirm(pin);
    }
  };

  // 백엔드에서 PIN 오류 응답 시 호출
  const showError = () => {
    setError('PIN이 올바르지 않습니다');
    setDigits(['', '', '', '']);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  };

  // 부모에서 에러 표시 트리거용 ref 노출
  // (간단하게 처리: 부모가 실패 시 모달을 다시 열거나 에러 상태를 내려보내는 방식 사용)
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-80">
        <h3 className="text-gray-900 font-semibold text-lg mb-1 text-center">게시글 삭제</h3>
        <p className="text-gray-500 text-sm text-center mb-6">삭제 PIN 4자리를 입력하세요</p>

        <div className="flex justify-center gap-3 mb-4">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !digits[i] && i > 0) {
                  inputRefs.current[i - 1]?.focus();
                }
              }}
              autoFocus={i === 0}
              className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-gray-50 text-gray-900 focus:outline-none transition-all ${
                error ? 'border-red-400' : d ? 'border-orange-400' : 'border-gray-200 focus:border-orange-400'
              }`}
            />
          ))}
        </div>

        {error && <p className="text-red-500 text-xs text-center mb-4">{error}</p>}

        <button
          onClick={onCancel}
          className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm transition-all"
        >
          취소
        </button>
      </div>
    </div>
  );
}

// ── 상세 페이지 ───────────────────────────────────
export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const router = useRouter();
  const { isLoggedIn, userId } = useAuthStore();

  const [post, setPost] = useState<PostResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    const load = async () => {
      try {
        const data = await getPost(Number(postId));
        setPost(data);
      } catch {
        router.replace('/community');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [postId, router]);

  const handleLike = async () => {
    if (!isLoggedIn) { alert('로그인이 필요합니다.'); return; }
    if (!post || liking) return;
    setLiking(true);
    try {
      const res = await togglePostLike(post.id);
      setPost((prev) => prev ? { ...prev, liked: res.liked, likeCount: res.likeCount } : prev);
    } finally {
      setLiking(false);
    }
  };

  // PIN 없는 글 → 바로 삭제 / PIN 있는 글 → 모달 띄움
  const handleDeleteClick = () => {
    if (!post) return;
    if (post.hasPinSet) {
      setDeleteError('');
      setShowDeleteModal(true);
    } else {
      if (!confirm('게시글을 삭제할까요?')) return;
      executeDelete();
    }
  };

  const executeDelete = async (pin?: string) => {
    if (!post) return;
    try {
      await deletePost(post.id, pin);
      router.replace('/community');
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } };
      if (err?.response?.status === 403) {
        // PIN 틀림 — 모달 유지하고 에러 표시
        setDeleteError('PIN이 올바르지 않습니다');
        return;
      }
      alert('삭제에 실패했습니다.');
      setShowDeleteModal(false);
    }
  };

  const handlePinConfirm = (pin: string) => {
    executeDelete(pin);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-6" />
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="h-7 bg-gray-100 rounded w-2/3 mb-4" />
            <div className="h-4 bg-gray-100 rounded w-1/3 mb-8" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-100 rounded mb-3" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  const isMine = isLoggedIn && !!userId && userId === post.userId;

  return (
    <div className="min-h-screen bg-gray-100">
      {showDeleteModal && (
        <DeletePinModal
          onConfirm={handlePinConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {/* PIN 오류 토스트 */}
      {deleteError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          {deleteError}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* 뒤로가기 */}
        <Link
          href="/community"
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-4 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          목록으로
        </Link>

        {/* 게시글 본문 카드 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLOR[post.category]}`}>
              {CATEGORY_LABEL[post.category]}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-4">{post.title}</h1>

          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="font-medium text-gray-700">{post.nickname}</span>
              <span>·</span>
              <span title={formatDate(post.createdAt)}>{formatRelativeTime(post.createdAt)}</span>
              {post.createdAt !== post.updatedAt && (
                <span className="text-gray-400 text-xs">(수정됨)</span>
              )}
            </div>

            {isMine && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/community/${post.id}/edit`}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 rounded border border-gray-200 hover:border-gray-300"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  수정
                </Link>
                <button
                  onClick={handleDeleteClick}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors px-2 py-1 rounded border border-gray-200 hover:border-red-200"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  삭제
                </button>
              </div>
            )}
          </div>

          {/* 본문 */}
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base py-6 min-h-40">
            {post.content}
          </div>

          {/* 통계 + 좋아요 */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                조회 {post.viewCount.toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 0 2 2z"/></svg>
                댓글 {post.commentCount}
              </span>
            </div>

            <button
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center gap-2 px-5 py-2 rounded-full border transition-all text-sm font-medium ${
                post.liked
                  ? 'bg-red-50 border-red-200 text-red-500'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill={post.liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              좋아요 {post.likeCount}
            </button>
          </div>
        </div>

        {/* 댓글 카드 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <CommentSection postId={post.id} currentUserId={userId ?? undefined} isLoggedIn={isLoggedIn} />
        </div>
      </div>
    </div>
  );
}