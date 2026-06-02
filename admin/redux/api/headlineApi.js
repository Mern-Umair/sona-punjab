import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const headlineApi = createApi({
  reducerPath: "headlineApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Headline"],
  endpoints: (builder) => ({
    getHeadlines: builder.query({
      query: () => "/headlines",
      providesTags: ["Headline"],
    }),
    createHeadline: builder.mutation({
      query: (body) => ({ url: "/headlines", method: "POST", body }),
      invalidatesTags: ["Headline"],
    }),
    updateHeadline: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/headlines/${id}`, method: "PUT", body }),
      invalidatesTags: ["Headline"],
    }),
    deleteHeadline: builder.mutation({
      query: (id) => ({ url: `/headlines/${id}`, method: "DELETE" }),
      invalidatesTags: ["Headline"],
    }),
  }),
});

export const {
  useGetHeadlinesQuery,
  useCreateHeadlineMutation,
  useUpdateHeadlineMutation,
  useDeleteHeadlineMutation,
} = headlineApi;