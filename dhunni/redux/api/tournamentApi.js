import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const tournamentApi = createApi({
    reducerPath: "tournamentApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
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
    }),
});

export const {
    useGetTournamentsQuery,
    useGetTournamentQuery,
    useGetTournamentByDayQuery,
    useGetTournamentTotalQuery,
} = tournamentApi;