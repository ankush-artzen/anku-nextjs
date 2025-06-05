import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices//authSlice";
import blogReducer from "./slices/blogSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      blogs: blogReducer,
    },
  });
};

export default makeStore;
