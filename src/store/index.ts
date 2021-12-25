import { configureStore } from '@reduxjs/toolkit';
import * as core from './slices/core';
import * as navigation from './slices/navigation';
import * as settings from './slices/settings';

const store = configureStore({
  reducer: {
    core: core.reducer,
    navigation: navigation.reducer,
    settings: settings.reducer,
  },
});

export default store;
export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
