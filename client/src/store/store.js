import {
  configureStore,
  createListenerMiddleware,
  isAnyOf,
} from "@reduxjs/toolkit";
import userReducer, { setMe, clearUser } from "./userSlice";
import collectionsReducer, { resetCollections } from "./collectionsSlice";
import tasksReducer, { resetTasks } from "./tasksSlice";
import selectionReducer, { clearSelection } from "./selectionSlice";
import subtasksReducer, { resetSubtasks } from "./subtasksSlice";

const authListener = createListenerMiddleware();
authListener.startListening({
  matcher: isAnyOf(clearUser, setMe),
  effect: (action, api) => {
    const state = api.getState();
    if (action.type === clearUser.type) {
      api.dispatch(resetCollections());
      api.dispatch(resetTasks());
      api.dispatch(resetSubtasks());
      api.dispatch(clearSelection());
      return;
    }
    if (action.type === setMe.type) {
      const prevId = state.user?._id || state.user?.id;
      const nextId = action.payload?._id || action.payload?.id;
      if (!prevId || !nextId || prevId !== nextId) {
        api.dispatch(resetCollections());
        api.dispatch(resetTasks());
        api.dispatch(resetSubtasks());
        api.dispatch(clearSelection());
      }
    }
  },
});

export const store = configureStore({
  reducer: {
    user: userReducer,
    collections: collectionsReducer,
    tasks: tasksReducer,
    selection: selectionReducer,
    subtasks: subtasksReducer, // NEW
  },
  middleware: (gdm) => gdm().concat(authListener.middleware),
  devTools: true,
});
