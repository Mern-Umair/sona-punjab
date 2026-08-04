import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const bannerApi = createApi({
    reducerPath: "bannerApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,

    }),
    tagTypes: ["Banner"],
    endpoints: (builder) => ({
        getBanners: builder.query({
            query: () => "/banners",
            providesTags: ["Banner"],
        }),
    }),
});
export const { useGetBannersQuery } = bannerApi;