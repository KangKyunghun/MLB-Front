import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  isLoggedIn: boolean;
  userId: number | null;
  email: string | null;
  nickname: string | null;
  role: string | null;
  accessToken: string | null;
  refreshToken: string | null;

  setAuth: (payload: {
    id: number;
    email: string;
    nickname: string;
    role: string;
    accessToken: string;
    refreshToken: string;
  }) => void;
  updateNickname: (nickname: string) => void;
  // 액세스 토큰 만료 시 axios 인터셉터가 재발급받은 토큰을 조용히 반영할 때 사용
  updateTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      userId: null,
      email: null,
      nickname: null,
      role: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (payload) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", payload.accessToken);
          localStorage.setItem("refreshToken", payload.refreshToken);
        }
        set({
          isLoggedIn: true,
          userId: payload.id,
          email: payload.email,
          nickname: payload.nickname,
          role: payload.role,
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
        });
      },

      updateNickname: (nickname) => set({ nickname }),

      updateTokens: (accessToken, refreshToken) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
        }
        set({ accessToken, refreshToken });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
        set({
          isLoggedIn: false,
          userId: null,
          email: null,
          nickname: null,
          role: null,
          accessToken: null,
          refreshToken: null,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        userId: state.userId,
        email: state.email,
        nickname: state.nickname,
        role: state.role,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);