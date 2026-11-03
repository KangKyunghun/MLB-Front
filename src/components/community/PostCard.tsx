'use client';

import Link from 'next/link';
import { PostResponse } from '@/types/community';
import { CATEGORY_COLOR, CATEGORY_LABEL, formatRelativeTime } from './communityUtils';

interface Props {
  post: PostResponse;
}

export default function PostCard({ post }: Props) {
  return (
    <Link href={`/community/${post.id}`}>
      <div className="group bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all duration-200 cursor-pointer">
        {/* 상단: 카테고리 + 날짜 */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLOR[post.category]}`}>
            {CATEGORY_LABEL[post.category]}
          </span>
          <span className="text-xs text-gray-400">{formatRelativeTime(post.createdAt)}</span>
        </div>

        {/* 제목 */}
        <h3 className="text-gray-900 font-semibold text-base leading-snug mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors">
          {post.title}
        </h3>

        {/* 하단: 작성자 + 통계 */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm text-gray-500">{post.nickname}</span>
          <div className="flex items-center gap-3 text-gray-400 text-xs">
            <span className="flex items-center gap-1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {post.viewCount}
            </span>
            <span className={`flex items-center gap-1 ${post.liked ? 'text-red-400' : ''}`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill={post.liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {post.likeCount}
            </span>
            <span className="flex items-center gap-1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {post.commentCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}