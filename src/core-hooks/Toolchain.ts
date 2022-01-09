import { useMemo } from 'react';
import Toolchain, {
  Asset,
  ToolchainAsset,
  ToolchainCustom,
  ToolchainEmbedded,
  ToolCustom,
  ToolEmbedded,
} from '../core/Toolchain';
import { useGet, useSetAsync } from '../hooks/useAccessors';
import { getter, setter } from '../utils/Accessors';
import ErrorReport from '../utils/ErrorReport';

export const useLoadToolchain = (
  toolchain: Toolchain,
): (() => Promise<ErrorReport | undefined>) => {
  return useSetAsync(toolchain, toolchain.load);
};

export const useGetAsset = (
  toolchain: Toolchain,
  toolName: ToolchainAsset,
): Asset => {
  const getAsset = useMemo(
    () => getter([toolName], () => toolchain.getAsset(toolName)),
    [toolchain.getAsset, toolName],
  );
  return useGet(toolchain, getAsset);
};

export const useGetCustomTool = (
  toolchain: Toolchain,
  toolName: ToolchainCustom,
): ToolCustom => {
  const getCustomTool = useMemo(
    () => getter([toolName], () => toolchain.getCustom(toolName)),
    [toolchain.getCustom, toolName],
  );
  return useGet(toolchain, getCustomTool);
};

export const useGetEmbeddedTool = (
  toolchain: Toolchain,
  toolName: ToolchainEmbedded,
): ToolEmbedded => {
  const getEmbeddedTool = useMemo(
    () => getter([toolName], () => toolchain.getEmbedded(toolName)),
    [toolchain.getEmbedded, toolName],
  );
  return useGet(toolchain, getEmbeddedTool);
};

export const useSetupAsset = (
  toolchain: Toolchain,
  toolName: ToolchainAsset,
): ((path: string) => Promise<ErrorReport | undefined>) => {
  const setupAsset = useMemo(
    () =>
      setter([toolName], (exePath: string) => {
        return toolchain.setupAsset(toolName, exePath);
      }),
    [toolchain.setupAsset, toolName],
  );
  return useSetAsync(toolchain, setupAsset);
};

export const useEditCustomTool = (
  toolchain: Toolchain,
  toolName: ToolchainCustom,
): ((exePath: string) => Promise<ErrorReport | undefined>) => {
  const editCustom = useMemo(
    () =>
      setter([toolName], (exePath: string) => {
        return toolchain.editCustom(toolName, exePath);
      }),
    [toolchain.editCustom, toolName],
  );
  return useSetAsync(toolchain, editCustom);
};

export const useInstallEmbeddedTool = (
  toolchain: Toolchain,
  toolName: ToolchainEmbedded,
): (() => Promise<ErrorReport | undefined>) => {
  const installEmbedded = useMemo(
    () =>
      setter([toolName], () => {
        return toolchain.installEmbedded(toolName);
      }),
    [toolchain.installEmbedded, toolName],
  );
  return useSetAsync(toolchain, installEmbedded);
};

export const useUninstallEmbeddedTool = (
  toolchain: Toolchain,
  toolName: ToolchainEmbedded,
): (() => Promise<ErrorReport | undefined>) => {
  const uninstallEmbedded = useMemo(
    () =>
      setter([toolName], () => {
        return toolchain.uninstallEmbedded(toolName);
      }),
    [toolchain.uninstallEmbedded, toolName],
  );
  return useSetAsync(toolchain, uninstallEmbedded);
};
