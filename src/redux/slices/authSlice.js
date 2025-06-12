import { createSlice } from '@reduxjs/toolkit';
import { getCookie } from 'cookies-next';


function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

const token = getCookie('token');
const userFromToken = token ? parseJwt(token) : null;

const initialState = {
  user: userFromToken || null,
  isAuthenticated: !!userFromToken,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      if (typeof document !== 'undefined') {
        document.cookie = 'token=; Max-Age=0; path=/;';
      }
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
