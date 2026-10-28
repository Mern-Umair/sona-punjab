import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../baseQuery";

export const tournamentApi = createApi({
  reducerPath: "tournamentApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Tournament"],
  endpoints: (builder) => ({
    getTournaments: builder.query({
      // Admin panel uses /mine so subadmins never get the public full list
      query: (params = "") => {
        if (typeof params === "string" && params.startsWith("?")) {
          return `/tournaments${params}`;
        }
        return "/tournaments/mine";
      },
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
    saveOwnerDayResult: builder.mutation({
      query: ({ id, date, ownerId, times, startTime, doubleStamps }) => ({
        url: `/tournaments/${id}/day/${date}/owner-result`,
        method: "PUT",
        body: { ownerId, times, startTime, doubleStamps },
      }),
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
  useSaveOwnerDayResultMutation,
  useAddDayResultsMutation,
  useAddTotalResultsMutation,
} = tournamentApi;
