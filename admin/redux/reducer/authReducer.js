import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("admin_token") || null,
    user:  null,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload.token;
      state.user  = action.payload.user;
      localStorage.setItem("admin_token", action.payload.token);
    },
    logout: (state) => {
      state.token = null;
      state.user  = null;
      localStorage.removeItem("admin_token");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;