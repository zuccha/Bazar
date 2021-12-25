import { createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit';
import { $Toolchain, Toolchain } from '../../../../core/Toolchain';
import createApi from '../../../utils/createApi';

type ToolchainState = Toolchain;
type AppState = { core: { toolchain: ToolchainState } };

export const initialState: ToolchainState = $Toolchain.createEmpty();

const selectState = (state: AppState) => state.core.toolchain;

type LoadToolchainActionPayload = PayloadAction<Toolchain>;
const LoadToolchainActionType = 'toolchain/load';

export const loadToolchain =
  () => async (dispatch: Dispatch<LoadToolchainActionPayload>) => {
    const toolchain = await $Toolchain.createByLoad();
    dispatch({ type: LoadToolchainActionType, payload: toolchain });
  };

const toolchainApi = createApi({
  id: 'toolchain',
  selectState,
});

const toolchainSlice = createSlice({
  name: 'toolchain',
  initialState,
  reducers: {},
  extraReducers: {
    [toolchainApi.id]: toolchainApi.reduce,
    [LoadToolchainActionType]: (
      state: ToolchainState,
      action: LoadToolchainActionPayload,
    ) => action.payload,
  },
  // extraReducers: (builder) => {
  //   builder.addCase(toolchainApi.id, toolchainApi.reduce);
  // },
});

export const reducer = toolchainSlice.reducer;

// #region Generics

export const getToolchain = toolchainApi.createQuery((toolchain) => toolchain);

// #endregion Generics

// #region Custom

export const setEditor = toolchainApi.createMutationAsync($Toolchain.setEditor);

export const setEmulator = toolchainApi.createMutationAsync(
  $Toolchain.setEmulator,
);

// #endregion Custom

// #region Embedded

export const readLunarMagic = toolchainApi.createMutation(
  $Toolchain.readLunarMagic,
);
export const downloadLunarMagic = toolchainApi.createMutationAsync(
  $Toolchain.downloadLunarMagic,
);

export const readAsar = toolchainApi.createMutation($Toolchain.readAsar);
export const downloadAsar = toolchainApi.createMutationAsync(
  $Toolchain.downloadAsar,
);

export const readFlips = toolchainApi.createMutation($Toolchain.readFlips);
export const downloadFlips = toolchainApi.createMutationAsync(
  $Toolchain.downloadFlips,
);

export const readGps = toolchainApi.createMutation($Toolchain.readGps);
export const downloadGps = toolchainApi.createMutationAsync(
  $Toolchain.downloadGps,
);

export const readPixi = toolchainApi.createMutation($Toolchain.readPixi);
export const downloadPixi = toolchainApi.createMutationAsync(
  $Toolchain.downloadPixi,
);

export const readUberAsm = toolchainApi.createMutation($Toolchain.readUberAsm);
export const downloadUberAsm = toolchainApi.createMutationAsync(
  $Toolchain.downloadUberAsm,
);

// #endregion Embedded
