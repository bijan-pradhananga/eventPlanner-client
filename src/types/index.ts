// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  email_verified_at: string | null;
  two_factor_enabled?: boolean;
  created_at?: string;
}

export type LoginResponse =
  | { requires2FA: true; tempToken: string; message: string }
  | { requires2FA: false; user: User; accessToken: string; refreshToken: string };

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

// ─── Tag ─────────────────────────────────────────────────────────────────────

export interface Tag {
  id: number;
  name: string;
  color?: string;
  usage_count?: number;
}

export interface TagsState {
  tags: Tag[];
  popularTags: Tag[];
  isLoading: boolean;
  error: string | null;
}

// ─── Event ───────────────────────────────────────────────────────────────────

export type EventType = 'public' | 'private';
export type EventStatus = 'upcoming' | 'past' | 'ongoing';

export interface Event {
  user_id: number;
  id: number;
  title: string;
  description: string;
  event_date: string;
  event_end_date?: string;
  location: string;
  event_type: EventType;
  creator_id: number;
  creator?: User;
  tags?: Tag[];
  created_at?: string;
  updated_at?: string;
  cover_image?: string;
}

export interface EventsState {
  events: Event[];
  myEvents: Event[];
  selectedEvent: Event | null;
  dashboardStats: DashboardStats | null;
  searchResults: Event[];
  pagination: Pagination;
  myEventsPagination: Pagination;
  searchPagination: Pagination;
  filters: EventFilters;
  searchFilters: EventFilters;
  isLoading: boolean;
  isStatsLoading: boolean;
  isSearching: boolean;
  isSubmitting: boolean;
  error: string | null;
}

export interface DashboardStats {
  total_events: number;
  total_public_events: number;
  total_private_events: number;
  total_upcoming_events: number;
}

export interface EventFilters {
  search?: string;
  tag_ids?: number[];
  event_type?: EventType | '';
  upcoming?: boolean;
  past?: boolean;
  sort_by?: 'event_date' | 'created_at' | 'title';
  sort_order?: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  event_date: string;
  event_end_date?: string;
  location: string;
  event_type: EventType;
  tag_ids?: number[];
}

export type UpdateEventPayload = Partial<CreateEventPayload>;

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

// ─── RSVP ────────────────────────────────────────────────────────────────────

export type RSVPStatus = 'yes' | 'no' | 'maybe';

export interface RSVP {
  id: number;
  user_id: number;
  event_id: number;
  status: RSVPStatus;
  created_at: string;
  updated_at: string;
  user?: User;
  event?: Event;
}

export interface RSVPSummary {
  yes: number;
  no: number;
  maybe: number;
  total: number;
}

export interface EventRSVPsResponse {
  rsvps: RSVP[];
  summary: RSVPSummary;
}

export interface CreateRSVPPayload {
  status: RSVPStatus;
}

export interface RSVPsState {
  myRSVPs: RSVP[];
  eventRSVPs: Record<number, RSVP[]>;
  eventRSVPSummaries: Record<number, RSVPSummary>;
  myEventRSVP: Record<number, RSVP | null>;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}
