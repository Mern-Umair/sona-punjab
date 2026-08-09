import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("admin_token") || null,
    user:  JSON.parse(localStorage.getItem("admin_user") || "null"),
  },
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload.token;
      state.user  = action.payload.user;
      localStorage.setItem("admin_token", action.payload.token);
      localStorage.setItem("admin_user", JSON.stringify(action.payload.user));

    },
    logout: (state) => {
      state.token = null;
      state.user  = null;
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;