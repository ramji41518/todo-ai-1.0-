import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import api from "../api/axios";

/** Thunks */
export const fetchCollections = createAsyncThunk(
  "collections/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/collections");
      return data.collections || [];
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || e.message);
    }
  }
);

export const createCollection = createAsyncThunk(
  "collections/create",
  async (name, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/collections", { name });
      // Assuming API returns the created collection
      return data.collection || data;
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || e.message);
    }
  }
);

export const deleteCollection = createAsyncThunk(
  "collections/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/collections/${id}`);
      return id;
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || e.message);
    }
  }
);

/** Slice */
const collectionsSlice = createSlice({
  name: "collections",
  initialState: {
    items: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    resetCollections: (state) => {
      state.items = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchCollections.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load collections";
      })
      // create
      .addCase(createCollection.pending, (state) => {
        state.error = null;
      })
      .addCase(createCollection.fulfilled, (state, action) => {
        const c = action.payload;
        if (c && c._id && !state.items.find((x) => x._id === c._id)) {
          state.items.unshift(c); // newest on top
        }
      })
      .addCase(createCollection.rejected, (state, action) => {
        state.error = action.payload || "Failed to create collection";
      })
      // delete
      .addCase(deleteCollection.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.filter((c) => c._id !== id);
      })
      .addCase(deleteCollection.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete collection";
      });
  },
});

export const { resetCollections } = collectionsSlice.actions;

/** Selectors */
export const selectCollections = (s) => s.collections.items;
export const selectCollectionsStatus = (s) => s.collections.status;
export const selectCollectionsError = (s) => s.collections.error;

/** Group-by-date selector (no moment dependency here) */
export const selectCollectionsGrouped = createSelector(
  [selectCollections],
  (items) => {
    const map = {};
    for (const c of items) {
      const d = new Date(c.createdAt);
      const key = isNaN(d) ? "Unknown" : d.toISOString().slice(0, 10); // YYYY-MM-DD
      (map[key] ||= []).push(c);
    }
    // newest date first
    return Object.entries(map).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  }
);

export default collectionsSlice.reducer;
