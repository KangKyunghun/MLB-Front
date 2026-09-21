"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signup, checkEmail, checkNickname, login } from "@/lib/api/auth";
import { useAuthStore } from "@/store/useAuthStore";

type FieldStatus = "idle" | "checking" | "ok" | "error";

const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,20}$/;

export default function SignupPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [form, setForm] = useState({ email: "", nickname: "", password: "", passwordConfirm: "" });
  const [emailStatus, setEmailStatus] = useState<FieldStatus>("idle");
  const [nicknameStatus, setNicknameStatus] = useState<FieldStatus>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (field === "email") setEmailStatus("idle");
    if (field === "nickname") setNicknameStatus("idle");
  };

  const handleCheckEmail = useCallback(async () => {
    if (!form.email) return;
    setEmailStatus("checking");
    try {
      const isDuplicate = await checkEmail(form.email);
      setEmailStatus(isDuplicate ? "error" : "ok");
    } catch {
      setEmailStatus("idle");
    }
  }, [form.email]);

  const handleCheckNickname = useCallback(async () => {
    if (!form.nickname) return;
    setNicknameStatus("checking");
    try {
      const isDuplicate = await checkNickname(form.nickname);
      setNicknameStatus(isDuplicate ? "error" : "ok");
    } catch {
      setNicknameStatus("idle");
    }
  }, [form.nickname]);

  const isPasswordValid = form.password.length > 0 && PASSWORD_REGEX.test(form.password);

  const isValid =
    form.email &&
    form.nickname &&
    isPasswordValid &&
    form.password === form.passwordConfirm &&
    emailStatus === "ok" &&
    nicknameStatus === "ok";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitError(null);
    setLoading(true);

    try {
      await signup({ email: form.email, password: form.password, nickname: form.nickname });
      // 가입 후 자동 로그인
      const res = await login({ email: form.email, password: form.password });
      setAuth(res);
      router.push("/");
    } catch {
      setSubmitError("회원가입에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const statusMsg = (status: FieldStatus, okMsg: string, errMsg: string) => {
    if (status === "ok") return <span className="text-[11px] text-green-500">{okMsg}</span>;
    if (status === "error") return <span className="text-[11px] text-red-500">{errMsg}</span>;
    if (status === "checking") return <span className="text-[11px] text-text-secondary">확인 중...</span>;
    return null;
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-8">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <span className="text-[28px]">⚾</span>
          <h1 className="mt-2 text-[22px] font-bold text-text-primary">MLB 커뮤니티</h1>
          <p className="mt-1 text-[13px] text-text-secondary">새 계정을 만드세요</p>
        </div>

        <div className="rounded-2xl bg-bg-primary p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* 이메일 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-text-secondary">이메일</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="example@email.com"
                  required
                  className="min-w-0 flex-1 rounded-lg border border-border-tertiary bg-bg-secondary px-3.5 py-2.5 text-[13px] text-text-primary outline-none placeholder:text-text-secondary/50 focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleCheckEmail}
                  disabled={!form.email}
                  className="shrink-0 rounded-lg border border-border-tertiary bg-bg-secondary px-3 text-[12px] text-text-secondary hover:border-accent hover:text-accent disabled:opacity-40 transition-colors"
                >
                  중복 확인
                </button>
              </div>
              {statusMsg(emailStatus, "사용 가능한 이메일입니다", "이미 사용 중인 이메일입니다")}
            </div>

            {/* 닉네임 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-text-secondary">닉네임</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.nickname}
                  onChange={handleChange("nickname")}
                  placeholder="2~50자"
                  required
                  className="min-w-0 flex-1 rounded-lg border border-border-tertiary bg-bg-secondary px-3.5 py-2.5 text-[13px] text-text-primary outline-none placeholder:text-text-secondary/50 focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleCheckNickname}
                  disabled={!form.nickname}
                  className="shrink-0 rounded-lg border border-border-tertiary bg-bg-secondary px-3 text-[12px] text-text-secondary hover:border-accent hover:text-accent disabled:opacity-40 transition-colors"
                >
                  중복 확인
                </button>
              </div>
              {statusMsg(nicknameStatus, "사용 가능한 닉네임입니다", "이미 사용 중인 닉네임입니다")}
            </div>

            {/* 비밀번호 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-text-secondary">비밀번호</label>
              <input
                type="password"
                value={form.password}
                onChange={handleChange("password")}
                placeholder="영문, 숫자, 특수문자 포함 8~20자"
                required
                className="rounded-lg border border-border-tertiary bg-bg-secondary px-3.5 py-2.5 text-[13px] text-text-primary outline-none placeholder:text-text-secondary/50 focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
              />
              {form.password && !isPasswordValid && (
                <span className="text-[11px] text-red-500">
                  영문, 숫자, 특수문자를 모두 포함하여 8~20자로 입력해주세요
                </span>
              )}
              {form.password && isPasswordValid && (
                <span className="text-[11px] text-green-500">사용 가능한 비밀번호입니다</span>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-text-secondary">비밀번호 확인</label>
              <input
                type="password"
                value={form.passwordConfirm}
                onChange={handleChange("passwordConfirm")}
                placeholder="비밀번호를 다시 입력하세요"
                required
                className="rounded-lg border border-border-tertiary bg-bg-secondary px-3.5 py-2.5 text-[13px] text-text-primary outline-none placeholder:text-text-secondary/50 focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
              />
              {form.passwordConfirm && form.password !== form.passwordConfirm && (
                <span className="text-[11px] text-red-500">비밀번호가 일치하지 않습니다</span>
              )}
              {form.passwordConfirm && form.password === form.passwordConfirm && (
                <span className="text-[11px] text-green-500">비밀번호가 일치합니다</span>
              )}
            </div>

            {submitError && (
              <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-[12px] text-red-500">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={!isValid || loading}
              className="mt-1 rounded-lg bg-accent py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {loading ? "가입 중..." : "회원가입"}
            </button>
          </form>

          <div className="mt-6 text-center text-[12px] text-text-secondary">
            이미 계정이 있으신가요?{" "}
            <Link href="/auth/login" className="font-medium text-accent hover:underline">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}