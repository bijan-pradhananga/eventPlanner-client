import axiosInstance from './axios';
import type { ApiResponse, AuthTokens, LoginPayload, LoginResponse, RegisterPayload, User } from '@/types';

export const authApi = {
  register: (data: RegisterPayload) =>
    axiosInstance.post<ApiResponse<{ user: User } & AuthTokens>>('/api/auth/register', data),

  login: (data: LoginPayload) =>
    axiosInstance.post<ApiResponse<LoginResponse>>('/api/auth/login', data),

  getProfile: () =>
    axiosInstance.get<ApiResponse<{ user: User }>>('/api/auth/profile'),

  refresh: (refreshToken: string) =>
    axiosInstance.post<ApiResponse<{ accessToken: string }>>('/api/auth/refresh', { refreshToken }),

  logout: (refreshToken: string) =>
    axiosInstance.post('/api/auth/logout', { refreshToken }),

  verifyEmail: (token: string) =>
    axiosInstance.post<ApiResponse<{ message: string }>>('/api/auth/verify-email', { token }),

  resendVerificationEmail: () =>
    axiosInstance.post<ApiResponse<{ message: string }>>('/api/auth/resend-verification'),

  verify2FA: (data: { tempToken: string; code: string }) =>
    axiosInstance.post<ApiResponse<{ user: User } & AuthTokens>>('/api/auth/2fa/verify', data),

  enable2FA: () =>
    axiosInstance.post<ApiResponse<{ message: string }>>('/api/auth/2fa/enable'),

  disable2FA: (data: { password: string }) =>
    axiosInstance.post<ApiResponse<{ message: string }>>('/api/auth/2fa/disable', data),
};
