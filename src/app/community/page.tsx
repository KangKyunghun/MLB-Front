'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getPosts } from '@/lib/api/community';
import { Page, PostCategory, PostResponse, PostSearchType, SortType } from '@/types/community';
import PostCard from '@/components/community/PostCard';
import { SORT_LABEL } from '@/components/community/communityUtils';

const CATEGORIES: { value: PostCategory | ''; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'FREE', label: '자유' },
  { value: 'ANALYSIS', label: '분석' },
  { value: 'PLAYER', label: '선수' },
  { value: 'TEAM', label: '팀' },
];

const SEARCH_TYPES: { value: PostSearchType; label: string }[] = [
  { value: 'TITLE_CONTENT', label: '제목+내용' },
  { value: 'TITLE', label: '제목' },
  { value: 'AUTHOR', label: '글쓴이' },
];

const SORTS: SortType[] = ['createdAt', 'likeCount', 'viewCount'];

export default function CommunityPage() {
  const searchParams = useSearchParams();

  const [data, setData] = useState<Page<PostResponse> | null>(null);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState<PostCategory | ''>((searchParams.get('category') as PostCategory) || '');
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [searchType, setSearchType] = useState<PostSearchType>((searchParams.get('searchType') as PostSearchType) || 'TITLE_CONTENT');
  const [sort, setSort] = useState<SortType>((searchParams.get('sort') as SortType) || 'createdAt');
  const [page, setPage] = useState(Number(searchParams.get('page') || 0));
  const [inputKeyword, setInputKeyword] = useState(keyword);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getPosts({
          category: category || undefined,
          keyword: keyword || undefined,
          searchType,
          sort,
          page,
          size: 20,
        });
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [category, keyword, searchType, sort, page]);

  const handleSearch = () => {
    setKeyword(inputKeyword);
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">커뮤니티</h1>
            <p className="text-gray-500 text-sm mt-1">MLB 팬들과 자유롭게 이야기해요</p>
          </div>
          <Link
            href="/community/write"
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            글쓰기
          </Link>
        </div>

        {/* 카테고리 탭 */}
        <div className="bg-white rounded-xl shadow-sm mb-4">
          <div className="flex gap-1 px-4 border-b border-gray-100">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => { setCategory(cat.value); setPage(0); }}
                className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all ${
                  category === cat.value
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 정렬 + 검색 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3">
            <div className="flex gap-1">
              {SORTS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setSort(s); setPage(0); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    sort === s
                      ? 'bg-gray-200 text-gray-800'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {SORT_LABEL[s]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as PostSearchType)}
                className="bg-gray-50 border border-gray-200 text-gray-600 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-gray-400"
              >
                {SEARCH_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden focus-within:border-gray-400 transition-colors">
                <input
                  type="text"
                  value={inputKeyword}
                  onChange={(e) => setInputKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="검색..."
                  className="bg-transparent px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none w-36"
                />
                <button onClick={handleSearch} className="px-2.5 text-gray-400 hover:text-gray-600 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 게시글 목록 */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/4 mb-3" />
                <div className="h-5 bg-gray-100 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : !data || data.content.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm text-center py-20 text-gray-400">
            <p className="text-lg mb-2">게시글이 없습니다</p>
            <p className="text-sm">첫 번째 글을 작성해보세요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.content.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={data.first}
              className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            {Array.from({ length: Math.min(data.totalPages, 7) }, (_, i) => {
              const pageNum = Math.max(0, Math.min(data.totalPages - 7, page - 3)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 rounded-lg text-sm transition-all ${
                    pageNum === page
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
              disabled={data.last}
              className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        )}

        {data && (
          <p className="text-center text-xs text-gray-400 mt-4">
            총 {data.totalElements.toLocaleString()}개의 게시글
          </p>
        )}
      </div>
    </div>
  );
}