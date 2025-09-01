import { createSlice } from "@reduxjs/toolkit";

const selectionSlice = createSlice({
  name: "selection",
  initialState: { selectedCollectionId: null },
  reducers: {
    setSelectedCollectionId: (state, action) => {
      state.selectedCollectionId = action.payload ?? null;
    },
    clearSelection: (state) => {
      state.selectedCollectionId = null;
    },
  },
});

export const { setSelectedCollectionId, clearSelection } =
  selectionSlice.actions;
export const selectSelectedCollectionId = (s) =>
  s.selection.selectedCollectionId;

export default selectionSlice.reducer;
