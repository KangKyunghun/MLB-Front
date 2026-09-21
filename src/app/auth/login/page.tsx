"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api/auth";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login({ email, password });
      setAuth(res);
      router.push("/");
    } catch {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-[400px]">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <span className="text-[28px]">⚾</span>
          <h1 className="mt-2 text-[22px] font-bold text-text-primary">MLB 커뮤니티</h1>
          <p className="mt-1 text-[13px] text-text-secondary">계정에 로그인하세요</p>
        </div>

        {/* 폼 */}
        <div className="rounded-2xl bg-bg-primary p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-text-secondary">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className="rounded-lg border border-border-tertiary bg-bg-secondary px-3.5 py-2.5 text-[13px] text-text-primary outline-none placeholder:text-text-secondary/50 focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-text-secondary">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                className="rounded-lg border border-border-tertiary bg-bg-secondary px-3.5 py-2.5 text-[13px] text-text-primary outline-none placeholder:text-text-secondary/50 focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-[12px] text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 rounded-lg bg-accent py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="mt-6 text-center text-[12px] text-text-secondary">
            계정이 없으신가요?{" "}
            <Link href="/auth/signup" className="font-medium text-accent hover:underline">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}