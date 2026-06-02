import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const tournamentApi = createApi({
  reducerPath: "tournamentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Tournament"],
  endpoints: (builder) => ({
    getTournaments: builder.query({
      query: (params = "") => `/tournaments${params}`,
      providesTags: ["Tournament"],
    }),
    getTournament: builder.query({
      query: (id) => `/tournaments/${id}`,
      providesTags: ["Tournament"],
    }),
    getTournamentByDay: builder.query({
      query: ({ id, date }) => `/tournaments/${id}/day/${date}`,
      providesTags: ["Tournament"],
    }),
    getTournamentTotal: builder.query({
      query: (id) => `/tournaments/${id}/total`,
      providesTags: ["Tournament"],
    }),
    createTournament: builder.mutation({
      query: (formData) => ({ url: "/tournaments", method: "POST", body: formData }),
      invalidatesTags: ["Tournament"],
    }),
    updateTournament: builder.mutation({
      query: ({ id, formData }) => ({ url: `/tournaments/${id}`, method: "PUT", body: formData }),
      invalidatesTags: ["Tournament"],
    }),
    deleteTournament: builder.mutation({
      query: (id) => ({ url: `/tournaments/${id}`, method: "DELETE" }),
      invalidatesTags: ["Tournament"],
    }),
    toggleScreen: builder.mutation({
      query: (id) => ({ url: `/tournaments/${id}/screen`, method: "PUT" }),
      invalidatesTags: ["Tournament"],
    }),
    addDayResults: builder.mutation({
      query: ({ id, date, ...body }) => ({
        url: `/tournaments/${id}/results/${date}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tournament"],
    }),
    addTotalResults: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/tournaments/${id}/total-results`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tournament"],
    }),
  }),
});

export const {
  useGetTournamentsQuery,
  useGetTournamentQuery,
  useGetTournamentByDayQuery,
  useGetTournamentTotalQuery,
  useCreateTournamentMutation,
  useUpdateTournamentMutation,
  useDeleteTournamentMutation,
  useToggleScreenMutation,
  useAddDayResultsMutation,
  useAddTotalResultsMutation,
} = tournamentApi;