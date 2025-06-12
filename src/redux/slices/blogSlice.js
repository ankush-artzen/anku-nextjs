
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  blog: {},
};

const blogSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {
    setPageBlog: (state, action) => {
      const { page, blogs } = action.payload;
      state.blog[page] = blogs;
    },
    clearAllBlogs: (state) => {
      state.blog = {};
    },
    clearPageBlog: (state, action) => {
      const page = action.payload;
      delete state.blog[page];
    }
  },
});

export const { setPageBlog, clearAllBlogs, clearPageBlog } = blogSlice.actions;
export default blogSlice.reducer;
