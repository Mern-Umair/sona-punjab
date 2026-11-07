import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../baseQuery";

export const subAdminApi = createApi({
  reducerPath: "subAdminApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["SubAdmin"],
  endpoints: (builder) => ({
    getSubAdmins: builder.query({
      query: () => "/subadmins",
      providesTags: ["SubAdmin"],
    }),
    createSubAdmin: builder.mutation({
      query: (formData) => ({ url: "/subadmins", method: "POST", body: formData }),
      invalidatesTags: ["SubAdmin"],
    }),
    updateSubAdmin: builder.mutation({
      query: ({ id, formData }) => ({ url: `/subadmins/${id}`, method: "PUT", body: formData }),
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