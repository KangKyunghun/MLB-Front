import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * 백엔드 baseURL.
 * .env.local 에 NEXT_PUBLIC_API_BASE_URL=http://localhost:8080 를 넣어두면
 * 배포 시 환경변수만 바꿔서 대응할 수 있습니다. 값이 없으면 로컬 기본값(8080)으로 fallback.
 */
const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// refresh 요청 전용 인스턴스 — api 인스턴스의 인터셉터를 안 타게 분리해서
// "401 → refresh → refresh도 401 → 다시 refresh..." 같은 무한루프를 방지
const refreshClient = axios.create({ baseURL, timeout: 10000 });

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

// 요청 인터셉터: accessToken 자동 첨부
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 동시에 여러 요청이 401을 맞아도 refresh 호출은 한 번만 나가도록 대기열로 관리
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function subscribeTokenRefresh(callback: (token: string | null) => void) {
  refreshQueue.push(callback);
}
function notifyRefreshed(token: string | null) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

// 응답 인터셉터: 401이면 refreshToken으로 재발급 후 원래 요청 재시도
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as
      | (typeof error.config & { _retry?: boolean })
      | undefined;
    const url = originalRequest?.url ?? "";
    // 로그인/회원가입/리프레시 자체에서 난 401은 재시도 대상이 아님
    const isAuthEndpoint =
      url.includes("/api/auth/login") ||
      url.includes("/api/auth/signup") ||
      url.includes("/api/auth/refresh");

    const shouldTryRefresh =
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint;

    if (shouldTryRefresh && originalRequest) {
      originalRequest._retry = true;

      const refreshToken =
        typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

      if (!refreshToken) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      // 이미 다른 요청이 refresh 중이면, 그 결과를 기다렸다가 새 토큰으로 재시도
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            if (!newToken) {
              reject(error);
              return;
            }
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const { data } = await refreshClient.post<TokenResponse>("/api/auth/refresh", {
          refreshToken,
        });

        useAuthStore.getState().updateTokens(data.accessToken, data.refreshToken);
        notifyRefreshed(data.accessToken);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        notifyRefreshed(null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (axios.isAxiosError(error)) {
      console.error(
        `[API ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url} → ${error.response?.status}`,
        error.response?.data ?? error.message
      );
    }
    return Promise.reject(error);
  }
);