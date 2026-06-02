import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/authReducer";
import { authApi } from "./api/authApi";
import { bannerApi } from "./api/bannerApi";
import { headlineApi } from "./api/headlineApi";
import { clubApi } from "./api/clubApi";
import { ownerApi } from "./api/ownerApi";
import { subAdminApi } from "./api/subAdminApi";
import { tournamentApi } from "./api/tournamentApi";

export const store = configureStore({
  reducer: {
    auth:                        authReducer,
    [authApi.reducerPath]:       authApi.reducer,
    [bannerApi.reducerPath]:     bannerApi.reducer,
    [headlineApi.reducerPath]:   headlineApi.reducer,
    [clubApi.reducerPath]:       clubApi.reducer,
    [ownerApi.reducerPath]:      ownerApi.reducer,
    [subAdminApi.reducerPath]:   subAdminApi.reducer,
    [tournamentApi.reducerPath]: tournamentApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      bannerApi.middleware,
      headlineApi.middleware,
      clubApi.middleware,
      ownerApi.middleware,
      subAdminApi.middleware,
      tournamentApi.middleware,
    ),
});