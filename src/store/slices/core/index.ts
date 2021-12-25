import { combineReducers } from 'redux';
import * as project from './slices/project';
import * as toolchain from './slices/toolchain';

export const reducer = combineReducers({
  project: project.reducer,
  toolchain: toolchain.reducer,
});
