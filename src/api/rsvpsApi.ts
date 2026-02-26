import axiosInstance from './axios';
import type {
  ApiResponse,
  CreateRSVPPayload,
  EventRSVPsResponse,
  RSVP,
} from '@/types';

export const rsvpsApi = {
  // Get all events user has RSVP'd to
  getMyRSVPs: () =>
    axiosInstance.get<ApiResponse<{ rsvps: RSVP[] }>>('/api/rsvps/my-rsvps'),

  // Get all RSVPs for a specific event
  getEventRSVPs: (eventId: number) =>
    axiosInstance.get<ApiResponse<EventRSVPsResponse>>(`/api/rsvps/events/${eventId}`),

  // Get user's RSVP for a specific event
  getUserRSVP: (eventId: number) =>
    axiosInstance.get<ApiResponse<{ rsvp: RSVP | null }>>(`/api/rsvps/events/${eventId}/my-rsvp`),

  // Create or update RSVP for an event
  upsertRSVP: (eventId: number, data: CreateRSVPPayload) =>
    axiosInstance.post<ApiResponse<{ rsvp: RSVP }>>(`/api/rsvps/events/${eventId}`, data),

  // Delete RSVP (cancel)
  deleteRSVP: (eventId: number) =>
    axiosInstance.delete<ApiResponse<null>>(`/api/rsvps/events/${eventId}`),
};
