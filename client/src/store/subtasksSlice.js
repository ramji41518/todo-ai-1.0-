import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import api from "../api/axios";
import { taskPatched } from "./tasksSlice";

export const EMPTY = [];

// Thunks
export const fetchSubtasks = createAsyncThunk(
  "subtasks/fetchByTask",
  async (taskId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/subtasks/by-task/${taskId}`);
      return { taskId, subtasks: data.subtasks || [] };
    } catch (e) {
      return rejectWithValue({
        taskId,
        message: e?.response?.data?.message || e.message,
      });
    }
  }
);

export const addSubtask = createAsyncThunk(
  "subtasks/add",
  async ({ taskId, content }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await api.post("/subtasks", { taskId, content });
      if (data.task) dispatch(taskPatched({ task: data.task }));
      return { taskId, subtask: data.subtask };
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || e.message);
    }
  }
);

export const toggleSubtask = createAsyncThunk(
  "subtasks/toggle",
  async ({ id, taskId }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await api.patch(`/subtasks/${id}/toggle-done`);
      if (data.task) dispatch(taskPatched({ task: data.task }));
      return { taskId, subtask: data.subtask };
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || e.message);
    }
  }
);

export const deleteSubtask = createAsyncThunk(
  "subtasks/delete",
  async ({ id, taskId }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await api.delete(`/subtasks/${id}`);
      if (data.task) dispatch(taskPatched({ task: data.task }));
      return { taskId, id };
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || e.message);
    }
  }
);

// Slice
const subtasksSlice = createSlice({
  name: "subtasks",
  initialState: { byTask: {} },
  reducers: {
    resetSubtasks(state) {
      state.byTask = {};
    },
    dropTask(state, action) {
      delete state.byTask[action.payload];
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchSubtasks.pending, (state, action) => {
      const id = action.meta.arg;
      state.byTask[id] ||= { items: [], status: "idle", error: null };
      state.byTask[id].status = "loading";
      state.byTask[id].error = null;
    });
    b.addCase(fetchSubtasks.fulfilled, (state, action) => {
      const { taskId, subtasks } = action.payload;
      state.byTask[taskId] ||= { items: [], status: "idle", error: null };
      state.byTask[taskId].items = subtasks;
      state.byTask[taskId].status = "succeeded";
    });
    b.addCase(fetchSubtasks.rejected, (state, action) => {
      const { taskId, message } = action.payload || {};
      state.byTask[taskId] ||= { items: [], status: "idle", error: null };
      state.byTask[taskId].status = "failed";
      state.byTask[taskId].error = message || "Failed to load subtasks";
    });
    b.addCase(addSubtask.fulfilled, (state, action) => {
      const { taskId, subtask } = action.payload;
      state.byTask[taskId] ||= { items: [], status: "idle", error: null };
      state.byTask[taskId].items.unshift(subtask);
    });
    b.addCase(toggleSubtask.fulfilled, (state, action) => {
      const { taskId, subtask } = action.payload;
      const bucket = state.byTask[taskId];
      if (!bucket) return;
      const i = bucket.items.findIndex((s) => s._id === subtask._id);
      if (i !== -1) bucket.items[i] = subtask;
    });
    b.addCase(deleteSubtask.fulfilled, (state, action) => {
      const { taskId, id } = action.payload;
      const bucket = state.byTask[taskId];
      if (!bucket) return;
      const i = bucket.items.findIndex((s) => s._id === id);
      if (i !== -1) bucket.items.splice(i, 1);
    });
  },
});

export const { resetSubtasks, dropTask } = subtasksSlice.actions;
export const selectSubtasks = (s, taskId) =>
  s.subtasks.byTask[taskId]?.items || EMPTY;
export const makeSubtaskStats = () =>
  createSelector([selectSubtasks], (items) => {
    const total = items.length;
    const done = items.filter((i) => i.isDone).length;
    return { done, total };
  });

export default subtasksSlice.reducer;
