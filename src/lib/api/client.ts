import axios from "axios";

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

// 요청 인터셉터: accessToken 자동 첨부 (로그인 기능 붙기 전까지는 토큰이 없어도 동작)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 응답 인터셉터: 에러를 콘솔에 한 번 정리해서 찍어줌 (디버깅 편의용)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      console.error(
        `[API ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url} → ${error.response?.status}`,
        error.response?.data ?? error.message
      );
    }
    return Promise.reject(error);
  }
);
