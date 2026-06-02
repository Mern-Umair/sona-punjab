import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ownerApi = createApi({
  reducerPath: "ownerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Owner"],
  endpoints: (builder) => ({
    getOwners: builder.query({
      query: (search = "") => `/owners${search ? `?search=${search}` : ""}`,
      providesTags: ["Owner"],
    }),
    getOwner: builder.query({
      query: (id) => `/owners/${id}`,
      providesTags: ["Owner"],
    }),
    createOwner: builder.mutation({
      query: (formData) => ({ url: "/owners", method: "POST", body: formData }),
      invalidatesTags: ["Owner"],
    }),
    updateOwner: builder.mutation({
      query: ({ id, formData }) => ({ url: `/owners/${id}`, method: "PUT", body: formData }),
      invalidatesTags: ["Owner"],
    }),
    deleteOwner: builder.mutation({
      query: (id) => ({ url: `/owners/${id}`, method: "DELETE" }),
      invalidatesTags: ["Owner"],
    }),
  }),
});

export const {
  useGetOwnersQuery,
  useGetOwnerQuery,
  useCreateOwnerMutation,
  useUpdateOwnerMutation,
  useDeleteOwnerMutation,
} = ownerApi;