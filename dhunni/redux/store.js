import { configureStore } from "@reduxjs/toolkit";
import { headlineApi } from "./api/headlineApi";
import { bannerApi } from "./api/bannerApi";

export const store = configureStore({
    reducer: {
        [headlineApi.reducerPath]: headlineApi.reducer,
        [bannerApi.reducerPath]: bannerApi.reducer,

    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            headlineApi.middleware,
            bannerApi.middleware,

        ),
});