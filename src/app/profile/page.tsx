"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMe, updateMe, deleteMe, checkNickname } from "@/lib/api/auth";
import { useAuthStore } from "@/store/useAuthStore";

type Section = "nickname" | "password" | "delete";

const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,20}$/;

// ✅ 컴포넌트 바깥으로 분리
const SectionCard = ({
  id,
  title,
  children,
  activeSection,
  setActiveSection,
}: {
  id: Section;
  title: string;
  children: React.ReactNode;
  activeSection: Section | null;
  setActiveSection: (s: Section | null) => void;
}) => (
  <div className="overflow-hidden rounded-2xl bg-bg-primary">
    <button
      onClick={() => setActiveSection(activeSection === id ? null : id)}
      className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-bg-secondary"
    >
      <span className="text-[14px] font-semibold text-text-primary">{title}</span>
      <span
        className={`text-[12px] text-text-secondary transition-transform duration-200 ${
          activeSection === id ? "rotate-180" : ""
        }`}
      >
        ▼
      </span>
    </button>
    {activeSection === id && (
      <div className="border-t border-border-tertiary px-6 pb-6 pt-5 animate-fade-in">
        {children}
      </div>
    )}
  </div>
);

// ✅ 탈퇴 확인 모달 (컴포넌트 바깥으로 분리)
const DeleteConfirmModal = ({
  confirmText,
  setConfirmText,
  error,
  loading,
  onCancel,
  onConfirm,
}: {
  confirmText: string;
  setConfirmText: (v: string) => void;
  error: string | null;
  loading: boolean;
  onCancel: () => void;
  onConfirm: (e: React.FormEvent) => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
    <div className="w-full max-w-[360px] rounded-2xl bg-bg-primary p-6 shadow-lg">
      <h2 className="text-[16px] font-bold text-text-primary">정말 탈퇴하시겠습니까?</h2>
      <p className="mt-2 text-[13px] text-text-secondary">
        이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제됩니다.
        계속하려면 아래에 <span className="font-semibold text-text-primary">회원탈퇴</span>를 입력하세요.
      </p>
      <form onSubmit={onConfirm} className="mt-4 flex flex-col gap-3">
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="회원탈퇴"
          autoFocus
          className="rounded-lg border border-red-200 bg-bg-secondary px-3.5 py-2.5 text-[13px] text-text-primary outline-none placeholder:text-text-secondary/50 focus:border-red-400 focus:ring-1 focus:ring-red-200 transition-colors"
        />
        {error && <p className="text-[12px] text-red-500">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-border-tertiary py-2.5 text-[13px] font-medium text-text-secondary transition-colors hover:bg-bg-secondary"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={confirmText !== "회원탈퇴" || loading}
            className="flex-1 rounded-lg bg-red-500 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {loading ? "처리 중..." : "탈퇴하기"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default function ProfilePage() {
  const router = useRouter();
  const { isLoggedIn, email, nickname: storeNickname, updateNickname, logout } = useAuthStore();

  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<Section | null>(null);

  const [newNickname, setNewNickname] = useState("");
  const [nicknameStatus, setNicknameStatus] = useState<"idle" | "checking" | "ok" | "error">("idle");
  const [nicknameLoading, setNicknameLoading] = useState(false);
  const [nicknameDone, setNicknameDone] = useState(false);

  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwDone, setPwDone] = useState(false);

  // 회원 탈퇴: 1단계(비밀번호 입력) → 2단계(모달에서 "회원탈퇴" 재입력)
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteConfirmError, setDeleteConfirmError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { router.replace("/auth/login"); return; }
    getMe().then((u) => setCurrentEmail(u.email)).catch(() => {});
  }, [isLoggedIn, router]);

  const handleCheckNickname = async () => {
    if (!newNickname || newNickname === storeNickname) return;
    setNicknameStatus("checking");
    try {
      const dup = await checkNickname(newNickname);
      setNicknameStatus(dup ? "error" : "ok");
    } catch { setNicknameStatus("idle"); }
  };

  const handleNicknameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nicknameStatus !== "ok") return;
    setNicknameLoading(true);
    try {
      const res = await updateMe({ nickname: newNickname });
      updateNickname(res.nickname);
      setNicknameDone(true);
      setNewNickname("");
      setNicknameStatus("idle");
      setTimeout(() => setNicknameDone(false), 2000);
    } catch { /* ignore */ }
    finally { setNicknameLoading(false); }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    if (!PASSWORD_REGEX.test(pwForm.next)) {
      setPwError("새 비밀번호는 영문, 숫자, 특수문자를 모두 포함하여 8~20자로 입력해주세요.");
      return;
    }
    if (pwForm.next !== pwForm.confirm) { setPwError("새 비밀번호가 일치하지 않습니다."); return; }
    setPwLoading(true);
    try {
      await updateMe({ currentPassword: pwForm.current, newPassword: pwForm.next });
      setPwDone(true);
      setPwForm({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwDone(false), 2000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setPwError(msg ?? "비밀번호 변경에 실패했습니다.");
    } finally { setPwLoading(false); }
  };

  // 1단계: 비밀번호 입력 후 "탈퇴하기" → 확인 모달 오픈
  const handleDeleteStart = (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    if (!deletePassword) { setDeleteError("비밀번호를 입력해주세요."); return; }
    setDeleteConfirmText("");
    setDeleteConfirmError(null);
    setShowDeleteModal(true);
  };

  // 2단계: 모달에서 "회원탈퇴" 입력 확인 후 실제 탈퇴 처리
  const handleDeleteConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmText !== "회원탈퇴") {
      setDeleteConfirmError('"회원탈퇴"를 정확히 입력해주세요.');
      return;
    }
    setDeleteConfirmError(null);
    setDeleteLoading(true);
    try {
      await deleteMe(deletePassword);
      logout();
      router.push("/");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setDeleteConfirmError(msg ?? "비밀번호가 일치하지 않거나 탈퇴에 실패했습니다.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 헤더 */}
      <div className="rounded-2xl bg-bg-primary px-6 py-5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">내 계정</p>
        <h1 className="mt-1 text-[20px] font-bold text-text-primary">{storeNickname}</h1>
        <p className="mt-0.5 text-[13px] text-text-secondary">{currentEmail ?? email}</p>
      </div>

      {/* 닉네임 변경 */}
      <SectionCard id="nickname" title="닉네임 변경" activeSection={activeSection} setActiveSection={setActiveSection}>
        <form onSubmit={handleNicknameSubmit} className="flex flex-col gap-3">
          <p className="text-[12px] text-text-secondary">현재 닉네임: <span className="font-medium text-text-primary">{storeNickname}</span></p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newNickname}
              onChange={(e) => { setNewNickname(e.target.value); setNicknameStatus("idle"); setNicknameDone(false); }}
              placeholder="새 닉네임 (2~50자)"
              className="min-w-0 flex-1 rounded-lg border border-border-tertiary bg-bg-secondary px-3.5 py-2.5 text-[13px] text-text-primary outline-none placeholder:text-text-secondary/50 focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
            />
            <button
              type="button"
              onClick={handleCheckNickname}
              disabled={!newNickname || newNickname === storeNickname}
              className="shrink-0 rounded-lg border border-border-tertiary bg-bg-secondary px-3 text-[12px] text-text-secondary hover:border-accent hover:text-accent disabled:opacity-40 transition-colors"
            >
              중복 확인
            </button>
          </div>
          {nicknameStatus === "ok" && <p className="text-[11px] text-green-500">사용 가능한 닉네임입니다</p>}
          {nicknameStatus === "error" && <p className="text-[11px] text-red-500">이미 사용 중인 닉네임입니다</p>}
          {nicknameDone && <p className="text-[11px] text-green-500">닉네임이 변경되었습니다</p>}
          <button
            type="submit"
            disabled={nicknameStatus !== "ok" || nicknameLoading}
            className="self-start rounded-lg bg-accent px-5 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {nicknameLoading ? "변경 중..." : "변경하기"}
          </button>
        </form>
      </SectionCard>

      {/* 비밀번호 변경 */}
      <SectionCard id="password" title="비밀번호 변경" activeSection={activeSection} setActiveSection={setActiveSection}>
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
          {(["current", "next", "confirm"] as const).map((field) => (
            <div key={field} className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-text-secondary">
                {field === "current" ? "현재 비밀번호" : field === "next" ? "새 비밀번호" : "새 비밀번호 확인"}
              </label>
              <input
                type="password"
                value={pwForm[field]}
                onChange={(e) => { setPwForm((p) => ({ ...p, [field]: e.target.value })); setPwError(null); setPwDone(false); }}
                placeholder={field === "next" ? "영문, 숫자, 특수문자 포함 8~20자" : undefined}
                required
                className="rounded-lg border border-border-tertiary bg-bg-secondary px-3.5 py-2.5 text-[13px] text-text-primary outline-none placeholder:text-text-secondary/50 focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
              />
              {field === "next" && pwForm.next && !PASSWORD_REGEX.test(pwForm.next) && (
                <span className="text-[11px] text-red-500">
                  영문, 숫자, 특수문자를 모두 포함하여 8~20자로 입력해주세요
                </span>
              )}
              {field === "next" && pwForm.next && PASSWORD_REGEX.test(pwForm.next) && (
                <span className="text-[11px] text-green-500">사용 가능한 비밀번호입니다</span>
              )}
            </div>
          ))}
          {pwError && <p className="rounded-lg bg-red-50 px-3.5 py-2 text-[12px] text-red-500">{pwError}</p>}
          {pwDone && <p className="text-[11px] text-green-500">비밀번호가 변경되었습니다</p>}
          <button
            type="submit"
            disabled={!pwForm.current || !PASSWORD_REGEX.test(pwForm.next) || !pwForm.confirm || pwLoading}
            className="self-start rounded-lg bg-accent px-5 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {pwLoading ? "변경 중..." : "변경하기"}
          </button>
        </form>
      </SectionCard>

      {/* 회원 탈퇴 */}
      <SectionCard id="delete" title="회원 탈퇴" activeSection={activeSection} setActiveSection={setActiveSection}>
        <form onSubmit={handleDeleteStart} className="flex flex-col gap-3">
          <p className="text-[13px] text-text-secondary">
            탈퇴하면 모든 데이터가 삭제되며 복구할 수 없습니다.
            본인 확인을 위해 현재 비밀번호를 입력해주세요.
          </p>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-text-secondary">현재 비밀번호</label>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(null); }}
              placeholder="비밀번호 입력"
              className="rounded-lg border border-red-200 bg-bg-secondary px-3.5 py-2.5 text-[13px] text-text-primary outline-none placeholder:text-text-secondary/50 focus:border-red-400 focus:ring-1 focus:ring-red-200 transition-colors"
            />
          </div>
          {deleteError && <p className="text-[12px] text-red-500">{deleteError}</p>}
          <button
            type="submit"
            disabled={!deletePassword}
            className="self-start rounded-lg bg-red-500 px-5 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            탈퇴하기
          </button>
        </form>
      </SectionCard>

      {showDeleteModal && (
        <DeleteConfirmModal
          confirmText={deleteConfirmText}
          setConfirmText={setDeleteConfirmText}
          error={deleteConfirmError}
          loading={deleteLoading}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}