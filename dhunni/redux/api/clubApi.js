import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const clubApi = createApi({
    reducerPath: "clubApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
    }),
    tagTypes: ["Club"],
    endpoints: (builder) => ({
        getClubs: builder.query({
            query: () => "/clubs",
            providesTags: ["Club"],
        }),
    }),
});

export const { useGetClubsQuery } = clubApi;