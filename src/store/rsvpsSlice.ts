import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { rsvpsApi } from '@/api/rsvpsApi';
import type { CreateRSVPPayload, RSVPsState } from '@/types';

const initialState: RSVPsState = {
  myRSVPs: [],
  eventRSVPs: {},
  eventRSVPSummaries: {},
  myEventRSVP: {},
  isLoading: false,
  isSubmitting: false,
  error: null,
};

// Get all events user has RSVP'd to
export const fetchMyRSVPs = createAsyncThunk(
  'rsvps/fetchMyRSVPs',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await rsvpsApi.getMyRSVPs();
      return data.data.rsvps;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message ?? 'Failed to fetch your RSVPs');
    }
  }
);

// Get all RSVPs for a specific event
export const fetchEventRSVPs = createAsyncThunk(
  'rsvps/fetchEventRSVPs',
  async (eventId: number, { rejectWithValue }) => {
    try {
      const { data } = await rsvpsApi.getEventRSVPs(eventId);
      return { eventId, ...data.data };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message ?? 'Failed to fetch event RSVPs');
    }
  }
);

// Get user's RSVP for a specific event
export const fetchUserRSVP = createAsyncThunk(
  'rsvps/fetchUserRSVP',
  async (eventId: number, { rejectWithValue }) => {
    try {
      const { data } = await rsvpsApi.getUserRSVP(eventId);
      return { eventId, rsvp: data.data.rsvp };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message ?? 'Failed to fetch your RSVP');
    }
  }
);

// Create or update RSVP for an event
export const upsertRSVP = createAsyncThunk(
  'rsvps/upsertRSVP',
  async ({ eventId, data: payload }: { eventId: number; data: CreateRSVPPayload }, { rejectWithValue }) => {
    try {
      const { data } = await rsvpsApi.upsertRSVP(eventId, payload);
      return { eventId, rsvp: data.data.rsvp };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message ?? 'Failed to submit RSVP');
    }
  }
);

// Delete RSVP (cancel)
export const deleteRSVP = createAsyncThunk(
  'rsvps/deleteRSVP',
  async (eventId: number, { rejectWithValue }) => {
    try {
      await rsvpsApi.deleteRSVP(eventId);
      return eventId;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message ?? 'Failed to cancel RSVP');
    }
  }
);

const rsvpsSlice = createSlice({
  name: 'rsvps',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearEventRSVPs(state, action) {
      const eventId = action.payload;
      delete state.eventRSVPs[eventId];
      delete state.eventRSVPSummaries[eventId];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyRSVPs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyRSVPs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myRSVPs = action.payload;
      })
      .addCase(fetchMyRSVPs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchEventRSVPs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEventRSVPs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.eventRSVPs[action.payload.eventId] = action.payload.rsvps;
        state.eventRSVPSummaries[action.payload.eventId] = action.payload.summary;
      })
      .addCase(fetchEventRSVPs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchUserRSVP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserRSVP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myEventRSVP[action.payload.eventId] = action.payload.rsvp;
      })
      .addCase(fetchUserRSVP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(upsertRSVP.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(upsertRSVP.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.myEventRSVP[action.payload.eventId] = action.payload.rsvp;
        
        // Update myRSVPs list
        const existingIdx = state.myRSVPs.findIndex(
          (r) => r.event_id === action.payload.eventId
        );
        if (existingIdx !== -1) {
          state.myRSVPs[existingIdx] = action.payload.rsvp;
        } else {
          state.myRSVPs.push(action.payload.rsvp);
        }
      })
      .addCase(upsertRSVP.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteRSVP.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteRSVP.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const eventId = action.payload;
        
        // Remove from myEventRSVP
        state.myEventRSVP[eventId] = null;
        
        // Remove from myRSVPs list
        state.myRSVPs = state.myRSVPs.filter((r) => r.event_id !== eventId);
      })
      .addCase(deleteRSVP.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearEventRSVPs } = rsvpsSlice.actions;
export default rsvpsSlice.reducer;
