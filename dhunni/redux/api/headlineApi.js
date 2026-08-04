import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const headlineApi = createApi({
    reducerPath: "headlineApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,

    }),
    tagTypes: ["Headline"],
    endpoints: (builder) => ({
        getHeadlines: builder.query({
            query: () => "/headlines",
            providesTags: ["Headline"],
        }),
    }),
});
export const { useGetHeadlinesQuery } = headlineApi;