import { create } from "zustand";

interface AuthState {
  isLoggedIn: boolean;
  nickname: string | null;
  setAuth: (nickname: string) => void;
  logout: () => void;
}

/**
 * 이미 프로젝트에 인증 스토어가 있다면 이 파일은 무시하고
 * 기존 스토어를 Sidebar에서 import 하도록 경로만 바꿔주면 됩니다.
 */
export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  nickname: null,
  setAuth: (nickname) => set({ isLoggedIn: true, nickname }),
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
    }
    set({ isLoggedIn: false, nickname: null });
  },
}));
