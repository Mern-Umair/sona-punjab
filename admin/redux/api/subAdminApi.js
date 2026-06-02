import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const subAdminApi = createApi({
  reducerPath: "subAdminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["SubAdmin"],
  endpoints: (builder) => ({
    getSubAdmins: builder.query({
      query: () => "/subadmins",
      providesTags: ["SubAdmin"],
    }),
    createSubAdmin: builder.mutation({
      query: (body) => ({ url: "/subadmins", method: "POST", body }),
      invalidatesTags: ["SubAdmin"],
    }),
    updateSubAdmin: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/subadmins/${id}`, method: "PUT", body }),
      invalidatesTags: ["SubAdmin"],
    }),
    deleteSubAdmin: builder.mutation({
      query: (id) => ({ url: `/subadmins/${id}`, method: "DELETE" }),
      invalidatesTags: ["SubAdmin"],
    }),
  }),
});

export const {
  useGetSubAdminsQuery,
  useCreateSubAdminMutation,
  useUpdateSubAdminMutation,
  useDeleteSubAdminMutation,
} = subAdminApi;