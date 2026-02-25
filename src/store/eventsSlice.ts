import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { eventsApi } from '@/api/eventsApi';
import type {
  CreateEventPayload,
//   Event,
  EventFilters,
  EventsState,
  UpdateEventPayload,
} from '@/types';

const defaultPagination = { page: 1, limit: 9, total: 0, total_pages: 0 };

const initialState: EventsState = {
  events: [],
  myEvents: [],
  selectedEvent: null,
  dashboardStats: null,
  searchResults: [],
  pagination: defaultPagination,
  myEventsPagination: defaultPagination,
  searchPagination: defaultPagination,
  filters: {
    page: 1,
    limit: 9,
    sort_by: 'event_date',
    sort_order: 'desc',
    // status: 'upcoming',
  },
  searchFilters: {
    page: 1,
    limit: 9,
    sort_by: 'event_date',
    sort_order: 'desc',
    search: '',
  },
  isLoading: false,
  isStatsLoading: false,
  isSearching: false,
  isSubmitting: false,
  error: null,
};

export const fetchEvents = createAsyncThunk(
  'events/fetchAll',
  async (filters: Partial<EventFilters>, { rejectWithValue }) => {
    try {
      const { data } = await eventsApi.getAll(filters);
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message ?? 'Failed to fetch events');
    }
  }
);

export const searchEvents = createAsyncThunk(
  'events/search',
  async (filters: Partial<EventFilters>, { rejectWithValue }) => {
    try {
      const { data } = await eventsApi.getAll(filters);
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message ?? 'Failed to search events');
    }
  }
);

export const fetchEventById = createAsyncThunk(
  'events/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      const { data } = await eventsApi.getById(id);
      const raw = data.data.event;
      const rawTags = raw.tags as { ids: number[]; names: string[]; colors: string[] } | undefined;
      const tags = rawTags?.ids?.map((tagId: number, i: number) => ({
        id: tagId,
        name: rawTags.names[i],
        color: rawTags.colors[i],
      })) ?? [];
      return { ...raw, creator_id: raw.user_id ?? raw.creator_id, tags };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message ?? 'Failed to fetch event');
    }
  }
);

export const fetchMyEvents = createAsyncThunk(
  'events/fetchMyEvents',
  async (params: { page?: number; limit?: number; upcoming?: boolean; past?: boolean } | undefined, { rejectWithValue }) => {
    try {
      const { data } = await eventsApi.getMyEvents(params);
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message ?? 'Failed to fetch your events');
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/create',
  async (payload: CreateEventPayload, { rejectWithValue }) => {
    try {
      const { data } = await eventsApi.create(payload);
      return data.data.event;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message ?? 'Failed to create event');
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/update',
  async ({ id, data: payload }: { id: number; data: UpdateEventPayload }, { rejectWithValue }) => {
    try {
      const { data } = await eventsApi.update(id, payload);
      return data.data.event;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message ?? 'Failed to update event');
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await eventsApi.delete(id);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message ?? 'Failed to delete event');
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  'events/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await eventsApi.getDashboardStats();
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message ?? 'Failed to fetch dashboard stats');
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<EventFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSearchFilters(state, action: PayloadAction<Partial<EventFilters>>) {
      state.searchFilters = { ...state.searchFilters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = initialState.filters;
    },
    clearSearchFilters(state) {
      state.searchFilters = initialState.searchFilters;
      state.searchResults = [];
    },
    clearSelectedEvent(state) {
      state.selectedEvent = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchEventById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.selectedEvent = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchMyEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myEvents = action.payload.data;
        state.myEventsPagination = action.payload.pagination;
      })
      .addCase(fetchMyEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createEvent.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.events.unshift(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateEvent.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const idx = state.events.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.events[idx] = action.payload;
        if (state.selectedEvent?.id === action.payload.id) {
          state.selectedEvent = action.payload;
        }
        const myIdx = state.myEvents.findIndex((e) => e.id === action.payload.id);
        if (myIdx !== -1) state.myEvents[myIdx] = action.payload;
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteEvent.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.events = state.events.filter((e) => e.id !== action.payload);
        state.myEvents = state.myEvents.filter((e) => e.id !== action.payload);
        if (state.selectedEvent?.id === action.payload) state.selectedEvent = null;
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isStatsLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isStatsLoading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isStatsLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(searchEvents.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchEvents.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload.data;
        state.searchPagination = action.payload.pagination;
      })
      .addCase(searchEvents.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, setSearchFilters, clearFilters, clearSearchFilters, clearSelectedEvent, clearError } = eventsSlice.actions;
export default eventsSlice.reducer;
