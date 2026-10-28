import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/** Shared API base query — always attach JWT from Redux or localStorage. */
export const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token =
      getState().auth?.token || localStorage.getItem("admin_token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});
