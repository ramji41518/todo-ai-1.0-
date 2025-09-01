import { createSlice } from "@reduxjs/toolkit";

/**
 * Normalizes backend user payloads into our frontend shape.
 * Handles variations like _id/id, isSubscribed/issubscribed, image/avatar, etc.
 */
function normalizeUser(u = {}) {
  const id = u._id ?? u.id ?? null;
  const isSubscribed =
    (typeof u.isSubscribed !== "undefined" ? u.isSubscribed : undefined) ??
    (typeof u.issubscribed !== "undefined" ? u.issubscribed : undefined) ??
    u.subscribed ??
    false;

  return {
    userId: id,
    name: u.name ?? "",
    email: u.email ?? "",
    profileImage: u.profileImage ?? u.image ?? u.avatar ?? "",
    isSubscribed: !!isSubscribed,
    credits: Number(u.credits ?? 0),
  };
}

const initialState = {
  userId: null,
  name: "",
  email: "",
  profileImage: "",
  isSubscribed: false,
  credits: 0,
  loading: true, // becomes false after /auth/me resolves (success or fail)
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setMe: (state, action) => {
      const n = normalizeUser(action.payload || {});
      state.userId = n.userId;
      state.name = n.name;
      state.email = n.email;
      state.profileImage = n.profileImage;
      state.isSubscribed = n.isSubscribed;
      state.credits = n.credits;
      state.loading = false;
    },
    clearUser: (state) => {
      state.userId = null;
      state.name = "";
      state.email = "";
      state.profileImage = "";
      state.isSubscribed = false;
      state.credits = 0;
      state.loading = false;
    },
    // handy when updating just a few profile fields locally
    patchUser: (state, action) => {
      const u = action.payload || {};
      if (typeof u.name !== "undefined") state.name = u.name;
      if (typeof u.email !== "undefined") state.email = u.email;
      if (typeof u.profileImage !== "undefined")
        state.profileImage = u.profileImage;
      if (typeof u.isSubscribed !== "undefined")
        state.isSubscribed = !!u.isSubscribed;
      if (typeof u.credits !== "undefined") state.credits = Number(u.credits);
    },
    setLoading: (state, action) => {
      state.loading = !!action.payload;
    },
  },
});

export const { setMe, clearUser, patchUser, setLoading } = userSlice.actions;

// Selectors (optional convenience)
export const selectUser = (s) => s.user;
export const selectUserId = (s) => s.user.userId;
export const selectUserLoading = (s) => s.user.loading;

export default userSlice.reducer;
