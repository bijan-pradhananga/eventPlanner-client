import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tagsApi } from '@/api/tagsApi';
import type { Tag, TagsState } from '@/types';

const initialState: TagsState = {
  tags: [],
  popularTags: [],
  isLoading: false,
  error: null,
};

export const fetchAllTags = createAsyncThunk(
  'tags/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await tagsApi.getAll();
      return data.data.tags;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message ?? 'Failed to fetch tags');
    }
  }
);

export const fetchPopularTags = createAsyncThunk(
  'tags/fetchPopular',
  async (limit: number | undefined, { rejectWithValue }) => {
    try {
      const { data } = await tagsApi.getPopular(limit);
      return data.data.tags;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message ?? 'Failed to fetch popular tags');
    }
  }
);

export const createTag = createAsyncThunk(
  'tags/create',
  async (payload: { name: string; color?: string }, { rejectWithValue }) => {
    try {
      const { data } = await tagsApi.create(payload);
      return data.data.tag;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      return rejectWithValue(error.response?.data?.error?.message ?? 'Failed to create tag');
    }
  }
);

const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllTags.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllTags.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tags = action.payload as Tag[];
      })
      .addCase(fetchAllTags.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchPopularTags.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPopularTags.fulfilled, (state, action) => {
        state.isLoading = false;
        state.popularTags = action.payload as Tag[];
      })
      .addCase(fetchPopularTags.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(createTag.fulfilled, (state, action) => {
      state.tags.push(action.payload as Tag);
    });
  },
});

export default tagsSlice.reducer;
