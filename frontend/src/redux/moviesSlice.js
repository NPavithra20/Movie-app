// src/redux/moviesSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  recentlyViewed: JSON.parse(localStorage.getItem("recentlyViewed")) || [],
};

const moviesSlice = createSlice({
  name: "movies",
  initialState,
  reducers: {
    addRecentlyViewed: (state, action) => {
      const movie = action.payload;

      // Avoid duplicates
      const exists = state.recentlyViewed.find((m) => m.id === movie.id);
      if (!exists) {
        state.recentlyViewed.unshift(movie); // add at start
        if (state.recentlyViewed.length > 10) state.recentlyViewed.pop(); // limit list
        localStorage.setItem("recentlyViewed", JSON.stringify(state.recentlyViewed));
      }
    },
  },
});

export const { addRecentlyViewed } = moviesSlice.actions;
export default moviesSlice.reducer;
