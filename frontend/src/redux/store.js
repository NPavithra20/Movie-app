
import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./themeSlice";
import moviesReducer from "./moviesSlice";
import userReducer from "./userSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    movies: moviesReducer,
    user: userReducer,
  },
});
