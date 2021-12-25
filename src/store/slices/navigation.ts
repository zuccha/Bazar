import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Types
 */

export interface Route<RouteName, Params = undefined> {
  name: RouteName;
  params?: Params;
}

export enum AppRouteName {
  About = 'About',
  Help = 'Help',
  Home = 'Home',
  Project = 'Project',
  Settings = 'Settings',
  Tools = 'Tools',
}

export type AppRoute = Route<AppRouteName>;

export enum AppProjectRouteName {
  Overview = 'Overview',
  Blocks = 'Blocks',
  Patches = 'Patches',
  Sprites = 'Sprites',
}

export type AppProjectRoute = Route<AppProjectRouteName>;

interface NavigationState {
  routes: {
    app: AppRoute;
    appProject: AppProjectRoute;
  };
}

/**
 * Slice
 */

const initialState: NavigationState = {
  routes: {
    app: { name: AppRouteName.Home },
    appProject: { name: AppProjectRouteName.Overview },
  },
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setAppRoute: (state, action: PayloadAction<AppRoute>) => {
      state.routes.app = action.payload;
    },
    setAppProjectRoute: (state, action: PayloadAction<AppProjectRoute>) => {
      state.routes.appProject = action.payload;
    },
  },
});

/**
 * Selectors
 */

export const selectAppRoute = (state: {
  navigation: NavigationState;
}): AppRoute => state.navigation.routes.app;

export const selectAppProjectRoute = (state: {
  navigation: NavigationState;
}): AppProjectRoute => state.navigation.routes.appProject;

/**
 * Exports
 */

export const reducer = navigationSlice.reducer;
export const setAppRoute = navigationSlice.actions.setAppRoute;
export const setAppProjectRoute = navigationSlice.actions.setAppProjectRoute;
