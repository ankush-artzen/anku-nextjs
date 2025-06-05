import { createSlice } from '@reduxjs/toolkit';

// Helper: get token from cookie
function getTokenFromCookie() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
  return match ? match[2] : null;
}

// Optional: decode user from JWT token payload (if your token has user info)
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

const token = getTokenFromCookie();
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
