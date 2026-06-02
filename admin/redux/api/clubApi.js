import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const clubApi = createApi({
  reducerPath: "clubApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Club"],
  endpoints: (builder) => ({
    getClubs: builder.query({
      query: () => "/clubs",
      providesTags: ["Club"],
    }),
    createClub: builder.mutation({
      query: (body) => ({ url: "/clubs", method: "POST", body }),
      invalidatesTags: ["Club"],
    }),
    updateClub: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/clubs/${id}`, method: "PUT", body }),
      invalidatesTags: ["Club"],
    }),
    deleteClub: builder.mutation({
      query: (id) => ({ url: `/clubs/${id}`, method: "DELETE" }),
      invalidatesTags: ["Club"],
    }),
  }),
});

export const {
  useGetClubsQuery,
  useCreateClubMutation,
  useUpdateClubMutation,
  useDeleteClubMutation,
} = clubApi;