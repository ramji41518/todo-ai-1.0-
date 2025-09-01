// src/store/tasksSlice.js
import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import api from "../api/axios";

/** Stable empty array to avoid selector warnings */
export const EMPTY_ARRAY = [];

/** Local helpers */
function ensureCol(state, collectionId) {
  if (!state.byCollection[collectionId]) {
    state.byCollection[collectionId] = {
      items: [],
      status: "idle",
      error: null,
    };
  }
  return state.byCollection[collectionId];
}
function upsertItem(arr, item) {
  const i = arr.findIndex((t) => t._id === item._id);
  if (i === -1) arr.unshift(item);
  else arr[i] = item;
}
function removeItem(arr, id) {
  const i = arr.findIndex((t) => t._id === id);
  if (i !== -1) arr.splice(i, 1);
}

/** Thunks */
export const fetchTasks = createAsyncThunk(
  "tasks/fetchByCollection",
  async (collectionId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/tasks/by-collection/${collectionId}`);
      return { collectionId, tasks: data.tasks || [] };
    } catch (e) {
      return rejectWithValue({
        collectionId,
        message: e?.response?.data?.message || e.message,
      });
    }
  }
);

export const addTask = createAsyncThunk(
  "tasks/add",
  async ({ collectionId, content, priority = "low" }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/tasks", {
        collectionId,
        content,
        priority,
      });
      return { collectionId, task: data.task || data };
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || e.message);
    }
  }
);

export const toggleTaskDone = createAsyncThunk(
  "tasks/toggleDone",
  async ({ id, collectionId }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/tasks/${id}/toggle-done`);
      return { collectionId, task: data.task || data };
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || e.message);
    }
  }
);

export const toggleTaskPriority = createAsyncThunk(
  "tasks/togglePriority",
  async ({ id, collectionId }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/tasks/${id}/toggle-priority`);
      return { collectionId, task: data.task || data };
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || e.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/delete",
  async ({ id, collectionId }, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`);
      return { id, collectionId };
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || e.message);
    }
  }
);

/** Slice */
const tasksSlice = createSlice({
  name: "tasks",
  initialState: {
    byCollection: {}, // { [collectionId]: { items, status, error } }
  },
  reducers: {
    resetTasks(state) {
      state.byCollection = {};
    },
    /** Upsert a task when it’s patched by subtask actions */
    taskPatched(state, action) {
      const t = action.payload?.task;
      if (!t?.collectionId) return;
      const col = ensureCol(state, t.collectionId);
      upsertItem(col.items, t);
    },
    /** Remove an entire collection bucket (used when deleting a collection) */
    dropCollection(state, action) {
      delete state.byCollection[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchTasks.pending, (state, action) => {
        const col = ensureCol(state, action.meta.arg);
        col.status = "loading";
        col.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        const { collectionId, tasks } = action.payload;
        const col = ensureCol(state, collectionId);
        col.items = Array.isArray(tasks) ? tasks : [];
        col.status = "succeeded";
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        const { collectionId, message } = action.payload || {};
        const col = ensureCol(state, collectionId ?? "unknown");
        col.status = "failed";
        col.error = message || "Failed to load tasks";
      })

      // add
      .addCase(addTask.fulfilled, (state, action) => {
        const { collectionId, task } = action.payload;
        const col = ensureCol(state, collectionId);
        upsertItem(col.items, task);
      })

      // toggle done
      .addCase(toggleTaskDone.fulfilled, (state, action) => {
        const { collectionId, task } = action.payload;
        const col = ensureCol(state, collectionId);
        upsertItem(col.items, task);
      })

      // toggle priority
      .addCase(toggleTaskPriority.fulfilled, (state, action) => {
        const { collectionId, task } = action.payload;
        const col = ensureCol(state, collectionId);
        upsertItem(col.items, task);
      })

      // delete
      .addCase(deleteTask.fulfilled, (state, action) => {
        const { collectionId, id } = action.payload;
        const col = ensureCol(state, collectionId);
        removeItem(col.items, id);
      });
  },
});

/** Actions */
export const { resetTasks, taskPatched, dropCollection } = tasksSlice.actions;

/** Selectors */
export const selectTasksState = (s) => s.tasks.byCollection;

// Factory selector to keep array references stable
export const makeSelectTasksForCollection = () =>
  createSelector(
    [(s, id) => s.tasks.byCollection[id]?.items ?? EMPTY_ARRAY],
    (items) => items
  );

export const selectTasksStatus = (s, collectionId) =>
  s.tasks.byCollection[collectionId]?.status || "idle";

export const selectTasksError = (s, collectionId) =>
  s.tasks.byCollection[collectionId]?.error || null;

/** Default export: the reducer (required by store.js) */
export default tasksSlice.reducer;
