// src/redux/themeSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isDark: localStorage.getItem("theme") === "dark",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark;
      localStorage.setItem("theme", state.isDark ? "dark" : "light");
      if (state.isDark) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
