import axiosInstance from './axios';
import type { ApiResponse, Tag } from '@/types';

export const tagsApi = {
  getAll: () =>
    axiosInstance.get<ApiResponse<{ tags: Tag[] }>>('/api/tags'),

  getPopular: (limit?: number) =>
    axiosInstance.get<ApiResponse<{ tags: Tag[] }>>('/api/tags/popular', { params: { limit } }),

  create: (data: { name: string; color?: string }) =>
    axiosInstance.post<ApiResponse<{ tag: Tag }>>('/api/tags', data),

  update: (id: number, data: { name?: string; color?: string }) =>
    axiosInstance.put<ApiResponse<Tag>>(`/api/tags/${id}`, data),

  delete: (id: number) =>
    axiosInstance.delete<ApiResponse<null>>(`/api/tags/${id}`),
};
