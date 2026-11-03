"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import PostForm from "@/components/community/PostForm";
import { getPost } from "@/lib/api/community";
import type { PostResponse } from "@/types/community";
import { useAuthStore } from "@/store/useAuthStore";

type Status = "loading" | "ok" | "forbidden" | "notfound" | "error";

export default function EditPostPage() {
  const params = useParams<{ postId: string }>();
  const postId = Number(params.postId);
  const invalidPostId = Number.isNaN(postId);

  const router = useRouter();
  const { isLoggedIn, userId } = useAuthStore();

  const [post, setPost] = useState<PostResponse | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/auth/login");
      return;
    }

    // 잘못된 postId는 렌더링 단계에서 처리
    if (invalidPostId) {
      return;
    }

    let cancelled = false;

    getPost(postId)
      .then((p) => {
        if (cancelled) return;

        if (p.userId !== userId) {
          setStatus("forbidden");
        } else {
          setPost(p);
          setStatus("ok");
        }
      })
      .catch((err) => {
        if (cancelled) return;

        setStatus(
          axios.isAxiosError(err) && err.response?.status === 404
            ? "notfound"
            : "error"
        );
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, userId, postId, invalidPostId, router]);

  // 로그인하지 않은 경우
  if (!isLoggedIn) {
    return null;
  }

  // postId가 잘못된 경우
  if (invalidPostId) {
    return (
      <div className="rounded-2xl bg-bg-primary py-20 text-center text-[13px] text-text-secondary">
        <p>게시글을 찾을 수 없어요.</p>

        <Link
          href="/community"
          className="mt-3 inline-block text-accent hover:underline"
        >
          목록으로
        </Link>
      </div>
    );
  }

  // 게시글 로딩 / 오류 / 권한 없음
  if (status !== "ok" || !post) {
    const message =
      status === "loading"
        ? "불러오는 중..."
        : status === "forbidden"
          ? "본인이 작성한 글만 수정할 수 있어요."
          : status === "notfound"
            ? "게시글을 찾을 수 없어요."
            : "게시글을 불러오지 못했어요.";

    return (
      <div className="rounded-2xl bg-bg-primary py-20 text-center text-[13px] text-text-secondary">
        <p>{message}</p>

        {status !== "loading" && (
          <Link
            href="/community"
            className="mt-3 inline-block text-accent hover:underline"
          >
            목록으로
          </Link>
        )}
      </div>
    );
  }

  // 수정 화면
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-bg-primary px-6 py-5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">
          Community
        </p>

        <h1 className="mt-1 text-[20px] font-bold text-text-primary">
          글 수정
        </h1>
      </div>

      <PostForm post={post} />
    </div>
  );
}