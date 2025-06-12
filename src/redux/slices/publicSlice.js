import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  publicBlog: {}
};

const publicSlice = createSlice({
  name: 'publicBlogs',
  initialState,
  reducers: {
    setPublicPageBlog(state, action) {
      const { page, blogs } = action.payload;
      state.publicBlog[page] = blogs;
    },
    clearPublicPageBlog(state, action) {
      const page = action.payload;
      delete state.publicBlog[page];
    },
    clearPublicBlogs(state) {
      state.publicBlog = {};
    }
  }
});

export const { setPublicPageBlog, clearPublicPageBlog, clearPublicBlogs } = publicSlice.actions;
export default publicSlice.reducer;