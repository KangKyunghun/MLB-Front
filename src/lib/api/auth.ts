import { api } from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  email: string;
  nickname: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface SignupResponse {
  id: number;
  email: string;
  nickname: string;
}

export interface UserResponse {
  id: number;
  email: string;
  nickname: string;
  role: string;
}

export interface UpdateProfileRequest {
  nickname?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface DeleteAccountRequest {
  password: string;
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const { data: res } = await api.post<LoginResponse>("/api/auth/login", data);
  return res;
};

export const signup = async (data: SignupRequest): Promise<SignupResponse> => {
  const { data: res } = await api.post<SignupResponse>("/api/auth/signup", data);
  return res;
};

export const checkEmail = async (email: string): Promise<boolean> => {
  const { data } = await api.get<boolean>("/api/auth/check-email", { params: { email } });
  return data;
};

export const checkNickname = async (nickname: string): Promise<boolean> => {
  const { data } = await api.get<boolean>("/api/auth/check-nickname", { params: { nickname } });
  return data;
};

export const getMe = async (): Promise<UserResponse> => {
  const { data } = await api.get<UserResponse>("/api/users/me");
  return data;
};

export const updateMe = async (data: UpdateProfileRequest): Promise<UserResponse> => {
  const { data: res } = await api.put<UserResponse>("/api/users/me", data);
  return res;
};

// 회원 탈퇴 시 본인 확인을 위해 현재 비밀번호를 함께 전송
export const deleteMe = async (password: string): Promise<void> => {
  const data: DeleteAccountRequest = { password };
  await api.delete("/api/users/me", { data });
};