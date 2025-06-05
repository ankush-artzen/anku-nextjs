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
    clearBlog: (state, action) => {
      const { page } = action.payload;
      if (state.blog[page]) {
        delete state.blog[page];
      }
    },
    // optional: clear all blogs at once
    clearAllBlogs: (state) => {
      state.blog = {};
    },
  },
});

// ✅ EXPORT ACTIONS
export const { setPageBlog, clearBlog, clearAllBlogs } = blogSlice.actions;

// ✅ EXPORT REDUCER
export default blogSlice.reducer;
