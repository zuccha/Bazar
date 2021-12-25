import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Dispatch } from 'react';
import { z } from 'zod';
import { ErrorReport } from '../../utils/ErrorReport';
import { $PriorityList } from '../../utils/PriorityList';
import { $Settings } from '../../utils/Settings';

const GenericSettingsSchema = z.object({
  newProjectDefaultAuthor: z.string(),
  newProjectDefaultLocationDirPath: z.string(),
  newProjectDefaultRomFilePath: z.string(),
  patchAskConfirmationBeforeApply: z.boolean(),
  recentProjects: $PriorityList.schema(z.string()),
  recentProjectsMaxCount: z.number(),
});

type GenericSettings = z.infer<typeof GenericSettingsSchema>;
type Setting = keyof GenericSettings;

export type SettingsState = GenericSettings;

const defaultSettings: GenericSettings = {
  newProjectDefaultAuthor: '',
  newProjectDefaultLocationDirPath: '',
  newProjectDefaultRomFilePath: '',
  patchAskConfirmationBeforeApply: true,
  recentProjects: $PriorityList.create([], 6),
  recentProjectsMaxCount: 6,
};

const $GenericSettings = $Settings.create({
  defaults: defaultSettings,
  fileName: 'generic.json',
  schema: GenericSettingsSchema,
});

type AppState = { settings: SettingsState };

// Types

type SetSettingActionPayload<S extends Setting> = PayloadAction<{
  key: S;
  value: GenericSettings[S];
}>;

type LoadSettingsActionPayload = PayloadAction<GenericSettings>;

const SetSettingActionType = 'settings/set';

const LoadSettingsActionType = 'settings/load';

// Selectors

export const getSetting =
  <S extends Setting>(key: S) =>
  (state: AppState): GenericSettings[S] =>
    state.settings[key];

// Thunks

export const loadSettings =
  () => async (dispatch: Dispatch<LoadSettingsActionPayload>) => {
    const errorOrSettings = await $GenericSettings.getAll();
    if (errorOrSettings.isError) return errorOrSettings.error;
    dispatch({ type: LoadSettingsActionType, payload: errorOrSettings.value });
  };

export const setSetting =
  <S extends Setting>(key: S, value: GenericSettings[S]) =>
  async (
    dispatch: Dispatch<SetSettingActionPayload<S>>,
  ): Promise<ErrorReport | undefined> => {
    const error = await $GenericSettings.set(key, value);
    if (error) return error;
    dispatch({ type: SetSettingActionType, payload: { key, value } });
  };

export const prioritizeRecentProject =
  (dirPath: string) =>
  async (
    dispatch: Dispatch<SetSettingActionPayload<'recentProjects'>>,
    getState: () => AppState,
  ): Promise<ErrorReport | undefined> => {
    const key = 'recentProjects';
    const recentProjects = getState().settings[key];
    const value = $PriorityList.prioritize(recentProjects, dirPath);
    const error = await $GenericSettings.set(key, value);
    if (!error) {
      dispatch({ type: SetSettingActionType, payload: { key, value } });
    }
    return error;
  };

export const removeRecentProject =
  (dirPath: string) =>
  async (
    dispatch: Dispatch<SetSettingActionPayload<'recentProjects'>>,
    getState: () => AppState,
  ): Promise<ErrorReport | undefined> => {
    const key = 'recentProjects';
    const recentProjects = getState().settings[key];
    const value = $PriorityList.remove(recentProjects, dirPath);
    const error = await $GenericSettings.set(key, value);
    if (!error) {
      dispatch({ type: SetSettingActionType, payload: { key, value } });
    }
    return error;
  };

// Slice

export const initialState: SettingsState = defaultSettings;

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: {
    [SetSettingActionType]: <S extends Setting>(
      state: SettingsState,
      action: SetSettingActionPayload<S>,
    ) => {
      state[action.payload.key] = action.payload.value;
    },
    [LoadSettingsActionType]: (
      state: SettingsState,
      action: LoadSettingsActionPayload,
    ) => {
      return action.payload;
    },
  },
});

export const reducer = settingsSlice.reducer;
