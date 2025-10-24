import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: { user: null },
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },
    toggleFavorite: (state, action) => {
      if (!state.user) return;
      const movieId = action.payload;
      // If the movie is already a favorite, remove it; else, add it
      if (state.user.favorites?.includes(movieId)) {
        state.user.favorites = state.user.favorites.filter((id) => id !== movieId);
      } else {
        state.user.favorites = [...(state.user.favorites || []), movieId];
      }
    },
  },
});

export const { login, logout, toggleFavorite } = userSlice.actions;
export default userSlice.reducer;
