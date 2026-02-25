import axiosInstance from './axios';
import type {
  ApiResponse,
  CreateEventPayload,
  DashboardStats,
  Event,
  EventFilters,
  PaginatedResponse,
  UpdateEventPayload,
} from '@/types';

export const eventsApi = {
  getAll: (filters?: Partial<EventFilters>) => {
    const params: Record<string, unknown> = { ...filters };
    if (Array.isArray(params.tag_ids) && (params.tag_ids as number[]).length > 0) {
      params.tag_ids = (params.tag_ids as number[]).join(',');
    } else {
      delete params.tag_ids;
    }
    if (!params.upcoming) delete params.upcoming;
    if (!params.past) delete params.past;
    if (!params.event_type) delete params.event_type;
    if (!params.search) delete params.search;
    return axiosInstance.get<PaginatedResponse<Event>>('/api/events', { params });
  },

  getById: (id: number) =>
    axiosInstance.get<ApiResponse<{ event: Event }>>(`/api/events/${id}`),

  getMyEvents: (params?: { page?: number; limit?: number; upcoming?: boolean; past?: boolean }) => {
    const p: Record<string, unknown> = { ...params };
    if (!p.upcoming) delete p.upcoming;
    if (!p.past) delete p.past;
    return axiosInstance.get<PaginatedResponse<Event>>('/api/events/my/events', { params: p });
  },

  create: (data: CreateEventPayload) =>
    axiosInstance.post<ApiResponse<{ event: Event }>>('/api/events', data),

  update: (id: number, data: UpdateEventPayload) =>
    axiosInstance.put<ApiResponse<{ event: Event }>>(`/api/events/${id}`, data),

  delete: (id: number) =>
    axiosInstance.delete<ApiResponse<null>>(`/api/events/${id}`),

  getDashboardStats: () =>
    axiosInstance.get<ApiResponse<DashboardStats>>('/api/events/my/dashboard'),
};
