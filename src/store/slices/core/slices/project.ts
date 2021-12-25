import { createSlice } from '@reduxjs/toolkit';
import { $Project, Project } from '../../../../core/Project';
import createOptionalApi from '../../../utils/createOptionalApi';

type ProjectState = Project | null;
type AppState = { core: { project: ProjectState } };

export const initialState: ProjectState = null as ProjectState;

const selectState = (state: AppState) => state.core.project;

const projectApi = createOptionalApi({
  id: 'project',
  selectState,
});

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(projectApi.id, projectApi.reduce);
  },
});

export const reducer = projectSlice.reducer;

export const hasProject = projectApi.exists;

// #region Constructors

export const createProjectFromSource = projectApi.createConstructorAsync(
  $Project.createFromSource,
);
export const openProject = projectApi.createConstructorAsync($Project.open);

// #endregion Constructors

// #region Info

export const getProjectInfo = projectApi.createQuery($Project.getInfo);
export const setProjectInfo = projectApi.createMutationAsync($Project.setInfo);

// #endregion Info

// #region Generics

export const openInLunarMagic = projectApi.createMutationAsync(
  $Project.openInLunarMagic,
);

export const launchInEmulator = projectApi.createMutationAsync(
  $Project.launchInEmulator,
);

// #endregion Generics

// #region Patches

export const getPatches = projectApi.createQuery($Project.getPatches);
export const addPatchFromDirectory = projectApi.createMutationAsync(
  $Project.addPatchFromDirectory,
);
export const addPatchFromFile = projectApi.createMutationAsync(
  $Project.addPatchFromFile,
);
export const removePatch = projectApi.createMutationAsync($Project.removePatch);

// #endregion Patches
