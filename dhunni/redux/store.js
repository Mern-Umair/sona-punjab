import { configureStore } from "@reduxjs/toolkit";
import { headlineApi } from "./api/headlineApi";
import { bannerApi } from "./api/bannerApi";
import { tournamentApi } from "./api/tournamentApi";

export const store = configureStore({
    reducer: {
        [headlineApi.reducerPath]: headlineApi.reducer,
        [bannerApi.reducerPath]: bannerApi.reducer,
        [tournamentApi.reducerPath]: tournamentApi.reducer,


    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            headlineApi.middleware,
            bannerApi.middleware,
            tournamentApi.middleware,


        ),
});