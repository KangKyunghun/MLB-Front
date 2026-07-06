"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CATEGORY_LABEL, getPopularPosts, type PostResponse } from "@/lib/api/community";

const BADGE_STYLE: Record<string, string> = {
  FREE: "bg-[#e1f5ee] text-[#0f6e56]",
  ANALYSIS: "bg-[#e6f1fb] text-[#185fa5]",
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

export default function CommunityPreview() {
  const [posts, setPosts] = useState<PostResponse[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    getPopularPosts(4)
      .then((data) => {
        if (mounted) setPosts(data);
      })
      .catch(() => {
        if (mounted) setError(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="rounded-xl border border-border-tertiary bg-bg-primary px-4 py-3.5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[14px] font-medium text-text-primary">
          커뮤니티 인기글
        </span>
        <Link
          href="/community"
          className="text-[11px] text-text-secondary hover:text-text-primary"
        >
          더보기
        </Link>
      </div>

      {error ? (
        <div className="py-6 text-center text-[13px] text-text-secondary">
          게시글을 불러오지 못했어요.
        </div>
      ) : posts === null ? (
        <div className="space-y-3 py-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-bg-tertiary" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="py-6 text-center text-[13px] text-text-secondary">
          아직 등록된 게시글이 없어요.
        </div>
      ) : (
        posts.map((post) => (
          <Link
            key={post.id}
            href={`/community/${post.id}`}
            className="flex items-start gap-2 border-b border-border-tertiary py-1.5 last:border-none"
          >
            <span
              className={[
                "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                BADGE_STYLE[post.category] ?? "bg-bg-tertiary text-text-secondary",
              ].join(" ")}
            >
              {CATEGORY_LABEL[post.category] ?? post.category}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] leading-snug text-text-primary">
                {post.title}
              </div>
              <div className="mt-0.5 text-[11px] text-text-secondary">
                좋아요 {post.likeCount} · {timeAgo(post.createdAt)}
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
