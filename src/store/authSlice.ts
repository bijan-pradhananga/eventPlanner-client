import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '@/api/authApi';
import type { AuthState, LoginPayload, LoginResponse, RegisterPayload, User } from '@/types';

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginPayload
>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await authApi.login(payload);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message ?? 'Login failed');
    }
  }
);

export const verify2FAUser = createAsyncThunk(
  'auth/verify2FA',
  async (payload: { tempToken: string; code: string }, { rejectWithValue }) => {
    try {
      const { data } = await authApi.verify2FA(payload);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message ?? '2FA verification failed');
    }
  }
);

export const enable2FAUser = createAsyncThunk(
  'auth/enable2FA',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await authApi.enable2FA();
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message ?? 'Failed to enable 2FA');
    }
  }
);

export const disable2FAUser = createAsyncThunk(
  'auth/disable2FA',
  async (payload: { password: string }, { rejectWithValue }) => {
    try {
      const { data } = await authApi.disable2FA(payload);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message ?? 'Failed to disable 2FA');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const { data } = await authApi.register(payload);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message ?? 'Registration failed');
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await authApi.getProfile();
      return data.data.user;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message ?? 'Failed to fetch profile');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      if (state.auth.refreshToken) {
        await authApi.logout(state.auth.refreshToken);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message ?? 'Logout failed');
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token: string, { rejectWithValue }) => {
    try {
      const { data } = await authApi.verifyEmail(token);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message ?? 'Email verification failed');
    }
  }
);

export const resendVerificationEmail = createAsyncThunk(
  'auth/resendVerificationEmail',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await authApi.resendVerificationEmail();
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message ?? 'Failed to resend verification email');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!action.payload.requires2FA) {
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
          localStorage.setItem('accessToken', action.payload.accessToken);
          localStorage.setItem('refreshToken', action.payload.refreshToken);
        }
        // requires2FA === true: navigation is handled in the component
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch profile
    builder
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        // state.isLoading = false;
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.isAuthenticated = false;
        // state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    });

    // Verify Email
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.isLoading = false;
        if (state.user) {
          state.user.email_verified_at = new Date().toISOString();
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Resend Verification Email
    builder
      .addCase(resendVerificationEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendVerificationEmail.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resendVerificationEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // verify 2FA
    builder
      .addCase(verify2FAUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verify2FAUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(verify2FAUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Enable 2FA
    builder
      .addCase(enable2FAUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(enable2FAUser.fulfilled, (state) => {
        state.isLoading = false;
        if (state.user) {
          state.user.two_factor_enabled = true;
        }
      })
      .addCase(enable2FAUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Disable 2FA
    builder
      .addCase(disable2FAUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(disable2FAUser.fulfilled, (state) => {
        state.isLoading = false;
        if (state.user) {
          state.user.two_factor_enabled = false;
        }
      })
      .addCase(disable2FAUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
