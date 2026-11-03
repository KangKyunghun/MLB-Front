'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PostCategory, PostRequest, PostResponse } from '@/types/community';
import { createPost, updatePost } from '@/lib/api/community';
import { CATEGORY_LABEL } from './communityUtils';

interface Props {
  post?: PostResponse;
}

const CATEGORIES: PostCategory[] = ['FREE', 'ANALYSIS', 'PLAYER', 'TEAM'];

export default function PostForm({ post }: Props) {
  const router = useRouter();
  const isEdit = !!post;

  const [title, setTitle] = useState(post?.title ?? '');
  const [content, setContent] = useState(post?.content ?? '');
  const [category, setCategory] = useState<PostCategory>(post?.category ?? 'FREE');
  const [deletePin, setDeletePin] = useState('');   // 작성: 설정할 PIN / 수정: 확인용 PIN
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!title.trim()) { setError('제목을 입력해주세요.'); return; }
    if (!content.trim()) { setError('내용을 입력해주세요.'); return; }

    // 작성: PIN 입력했으면 4자리 검사
    if (!isEdit && deletePin && !/^\d{4}$/.test(deletePin)) {
      setError('삭제 PIN은 숫자 4자리여야 합니다.');
      return;
    }
    // 수정: PIN 설정된 글이면 PIN 필수
    if (isEdit && post.hasPinSet && !deletePin) {
      setError('이 게시글은 PIN이 필요합니다.');
      return;
    }

    const body: PostRequest = {
      title: title.trim(),
      content: content.trim(),
      category,
      // 작성 시에만 deletePin을 body에 포함 (수정 시엔 헤더로만 전달)
      ...(!isEdit && deletePin ? { deletePin } : {}),
    };

    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        // 수정: PIN을 헤더로 전달
        await updatePost(post.id, body, deletePin || undefined);
        router.push(`/community/${post.id}`);
      } else {
        const created = await createPost(body);
        router.push(`/community/${created.id}`);
      }
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { message?: string } } };
      if (err?.response?.status === 403) {
        setError('PIN이 올바르지 않습니다.');
      } else {
        setError(err?.response?.data?.message ?? '오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEdit ? '게시글 수정' : '게시글 작성'}
        </h1>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          {/* 카테고리 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    category === cat
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {CATEGORY_LABEL[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="제목을 입력하세요"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors"
            />
            <p className="text-right text-xs text-gray-400 mt-1">{title.length}/200</p>
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={10000}
              rows={16}
              placeholder="내용을 입력하세요"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors resize-none"
            />
            <p className="text-right text-xs text-gray-400 mt-1">{content.length}/10000</p>
          </div>

          {/* PIN 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isEdit ? 'PIN 확인' : '삭제 PIN'}
              {!isEdit && <span className="text-gray-400 font-normal ml-1">(선택)</span>}
              {isEdit && post.hasPinSet && <span className="text-red-400 font-normal ml-1">*필수</span>}
            </label>
            <p className="text-xs text-gray-400 mb-2">
              {isEdit
                ? post.hasPinSet
                  ? '이 게시글은 PIN이 설정되어 있습니다. PIN을 입력해야 수정할 수 있습니다.'
                  : 'PIN이 설정되지 않은 게시글입니다.'
                : '설정하면 글 수정·삭제 시 PIN 4자리가 필요합니다'}
            </p>
            {/* 수정 모드에서 PIN 없는 글이면 입력창 숨김 */}
            {!(isEdit && !post.hasPinSet) && (
              <input
                type="password"
                inputMode="numeric"
                value={deletePin}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setDeletePin(v);
                }}
                maxLength={4}
                placeholder="숫자 4자리"
                className="w-32 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors tracking-widest text-center text-lg"
              />
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-all text-sm"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-all"
            >
              {loading ? '저장 중...' : isEdit ? '수정 완료' : '작성 완료'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}