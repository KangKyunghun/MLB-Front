'use client';

import { useEffect, useRef, useState } from 'react';
import { CommentResponse } from '@/types/community';
import {
  createComment, deleteComment, getComments,
  toggleCommentLike, updateComment,
} from '@/lib/api/community';
import { formatRelativeTime } from './communityUtils';

interface Props {
  postId: number;
  currentUserId?: number;
  isLoggedIn: boolean;
}

export default function CommentSection({ postId, currentUserId, isLoggedIn }: Props) {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: number; nickname: string } | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  const fetchedRef = useRef(false);

  const load = async () => {
    try {
      const data = await getComments(postId);
      setComments(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    load();
  }, [postId]);

  const reload = async () => {
    fetchedRef.current = false;
    await load();
    fetchedRef.current = true;
  };

  const handleSubmit = async (parentId?: number) => {
    const content = parentId ? replyContent : newContent;
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await createComment(postId, { content: content.trim(), parentId });
      if (parentId) { setReplyContent(''); setReplyTo(null); }
      else setNewContent('');
      await reload();
    } catch {
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (commentId: number) => {
    if (!editContent.trim()) return;
    try {
      await updateComment(commentId, { content: editContent.trim() });
      setEditingId(null);
      await reload();
    } catch {
      alert('댓글 수정에 실패했습니다.');
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm('댓글을 삭제할까요?')) return;
    try {
      await deleteComment(commentId);
      await reload();
    } catch {
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  const handleLike = async (commentId: number) => {
    if (!isLoggedIn) { alert('로그인이 필요합니다.'); return; }
    try {
      const res = await toggleCommentLike(commentId);
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) return { ...c, liked: res.liked, likeCount: res.likeCount };
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === commentId ? { ...r, liked: res.liked, likeCount: res.likeCount } : r
              ),
            };
          }
          return c;
        })
      );
    } catch {
      // silent
    }
  };

  const totalCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length ?? 0), 0);

  if (loading) return <div className="py-8 text-center text-gray-400 text-sm">댓글을 불러오는 중...</div>;

  return (
    <div>
      <h3 className="text-gray-900 font-semibold mb-5">댓글 {totalCount}개</h3>

      <div className="space-y-1 mb-6">
        {comments.length === 0 && (
          <p className="text-gray-400 text-sm py-6 text-center">첫 번째 댓글을 작성해보세요.</p>
        )}
        {comments.map((comment) => (
          <div key={comment.id}>
            <CommentItem
              comment={comment}
              currentUserId={currentUserId}
              isLoggedIn={isLoggedIn}
              editingId={editingId}
              editContent={editContent}
              onReply={(id, nickname) => { setReplyTo({ id, nickname }); setReplyContent(''); }}
              onEdit={(c) => { setEditingId(c.id); setEditContent(c.content); }}
              onEditChange={setEditContent}
              onEditSubmit={handleUpdate}
              onEditCancel={() => setEditingId(null)}
              onDelete={handleDelete}
              onLike={handleLike}
            />
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-8 space-y-1 mt-1">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    isReply
                    currentUserId={currentUserId}
                    isLoggedIn={isLoggedIn}
                    editingId={editingId}
                    editContent={editContent}
                    onEdit={(c) => { setEditingId(c.id); setEditContent(c.content); }}
                    onEditChange={setEditContent}
                    onEditSubmit={handleUpdate}
                    onEditCancel={() => setEditingId(null)}
                    onDelete={handleDelete}
                    onLike={handleLike}
                  />
                ))}
              </div>
            )}
            {replyTo?.id === comment.id && (
              <div className="ml-8 mt-2 mb-2">
                <ReplyInput
                  nickname={replyTo.nickname}
                  value={replyContent}
                  onChange={setReplyContent}
                  onSubmit={() => handleSubmit(comment.id)}
                  onCancel={() => setReplyTo(null)}
                  submitting={submitting}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {isLoggedIn ? (
        <div className="border-t border-gray-100 pt-5">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="댓글을 입력하세요"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors resize-none text-sm"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">{newContent.length}/1000</span>
            <button
              onClick={() => handleSubmit()}
              disabled={submitting || !newContent.trim()}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-all"
            >
              {submitting ? '등록 중...' : '댓글 등록'}
            </button>
          </div>
        </div>
      ) : (
        <div className="border-t border-gray-100 pt-5 text-center text-gray-400 text-sm py-6">
          댓글을 작성하려면 로그인이 필요합니다.
        </div>
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: CommentResponse;
  isReply?: boolean;
  currentUserId?: number;
  isLoggedIn: boolean;
  editingId: number | null;
  editContent: string;
  onReply?: (id: number, nickname: string) => void;
  onEdit: (comment: CommentResponse) => void;
  onEditChange: (v: string) => void;
  onEditSubmit: (id: number) => void;
  onEditCancel: () => void;
  onDelete: (id: number) => void;
  onLike: (id: number) => void;
}

function CommentItem({
  comment, isReply, currentUserId, isLoggedIn,
  editingId, editContent,
  onReply, onEdit, onEditChange, onEditSubmit, onEditCancel, onDelete, onLike,
}: CommentItemProps) {
  const isEditing = editingId === comment.id;
  const isMine = isLoggedIn && !!currentUserId && currentUserId === comment.userId;

  return (
    <div className={`py-4 border-b border-gray-100 ${isReply ? 'flex gap-2' : ''}`}>
      {isReply && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 mt-1 shrink-0"><polyline points="15 10 20 15 15 20"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/></svg>
      )}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${comment.deleted ? 'text-gray-400' : 'text-gray-700'}`}>
              {comment.deleted ? '(알 수 없음)' : comment.nickname}
            </span>
            <span className="text-xs text-gray-400">{formatRelativeTime(comment.createdAt)}</span>
          </div>
          {isMine && !comment.deleted && (
            <div className="flex items-center gap-2">
              <button onClick={() => onEdit(comment)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button onClick={() => onDelete(comment.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div>
            <textarea
              value={editContent}
              onChange={(e) => onEditChange(e.target.value)}
              maxLength={1000}
              rows={2}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-orange-400 resize-none"
            />
            <div className="flex gap-2 mt-1.5 justify-end">
              <button onClick={onEditCancel} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1">취소</button>
              <button onClick={() => onEditSubmit(comment.id)} className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded transition-all">수정</button>
            </div>
          </div>
        ) : (
          <p className={`text-sm leading-relaxed ${comment.deleted ? 'text-gray-400 italic' : 'text-gray-700'}`}>
            {comment.content}
          </p>
        )}

        {!comment.deleted && !isEditing && (
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => onLike(comment.id)}
              className={`flex items-center gap-1 text-xs transition-colors ${comment.liked ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill={comment.liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {comment.likeCount > 0 && comment.likeCount}
            </button>
            {!isReply && onReply && (
              <button onClick={() => onReply(comment.id, comment.nickname ?? '')} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                답글
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface ReplyInputProps {
  nickname: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitting: boolean;
}

function ReplyInput({ nickname, value, onChange, onSubmit, onCancel, submitting }: ReplyInputProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <p className="text-xs text-gray-400 mb-2">@{nickname} 에게 답글</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={1000}
        rows={2}
        placeholder="답글을 입력하세요"
        className="w-full bg-transparent text-gray-900 text-sm placeholder-gray-400 focus:outline-none resize-none"
        autoFocus
      />
      <div className="flex justify-end gap-2 mt-2">
        <button onClick={onCancel} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1">취소</button>
        <button
          onClick={onSubmit}
          disabled={submitting || !value.trim()}
          className="text-xs bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white px-3 py-1 rounded transition-all"
        >
          {submitting ? '등록 중...' : '답글 등록'}
        </button>
      </div>
    </div>
  );
}