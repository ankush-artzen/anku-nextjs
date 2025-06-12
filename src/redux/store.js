import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices//authSlice";
import blogReducer from "./slices/blogSlice";
import publicBlogReducer from "./slices/publicSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      blogs: blogReducer,
      publicBlogs: publicBlogReducer
  
    },
  });
};

export default makeStore;
