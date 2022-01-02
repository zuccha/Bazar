import { useCallback, useMemo } from 'react';
import Toolchain, {
  ToolchainCustom,
  ToolchainEmbedded,
  ToolCustom,
  ToolEmbedded,
} from '../core/Toolchain';
import { useGet, useSetAsync } from '../hooks/useAccessors';
import { ErrorReport } from '../utils/ErrorReport';

export const useLoadToolchain = (
  toolchain: Toolchain,
): (() => Promise<ErrorReport | undefined>) => {
  return useSetAsync(toolchain, toolchain.load, Toolchain.loadTriggers);
};

export const useGetCustomTool = (
  toolchain: Toolchain,
  toolName: ToolchainCustom,
): ToolCustom => {
  const getCustom = useCallback(
    () => toolchain.getCustom(toolName),
    [toolchain.getCustom, toolName],
  );
  const getCustomDeps = useMemo(() => [`Toolchain.${toolName}`], [toolName]);
  return useGet(toolchain, getCustom, getCustomDeps);
};

export const useGetEmbeddedTool = (
  toolchain: Toolchain,
  toolName: ToolchainEmbedded,
): ToolEmbedded => {
  const getEmbedded = useCallback(
    () => toolchain.getEmbedded(toolName),
    [toolchain.getEmbedded, toolName],
  );
  const getEmbeddedDeps = useMemo(() => [`Toolchain.${toolName}`], [toolName]);
  return useGet(toolchain, getEmbedded, getEmbeddedDeps);
};

export const useEditCustomTool = (
  toolchain: Toolchain,
  toolName: ToolchainCustom,
): ((exePath: string) => Promise<ErrorReport | undefined>) => {
  const editCustom = useCallback(
    (exePath: string) => {
      return toolchain.editCustom(toolName, exePath);
    },
    [toolchain.editCustom, toolName],
  );
  const editCustomTriggers = useMemo(
    () => [`Toolchain.${toolName}`],
    [toolName],
  );
  return useSetAsync(toolchain, editCustom, editCustomTriggers);
};

export const useInstallEmbeddedTool = (
  toolchain: Toolchain,
  toolName: ToolchainEmbedded,
): (() => Promise<ErrorReport | undefined>) => {
  const installEmbedded = useCallback(() => {
    return toolchain.installEmbedded(toolName);
  }, [toolchain.installEmbedded, toolName]);
  const installEmbeddedTriggers = useMemo(
    () => [`Toolchain.${toolName}`],
    [toolName],
  );
  return useSetAsync(toolchain, installEmbedded, installEmbeddedTriggers);
};

export const useUninstallEmbeddedTool = (
  toolchain: Toolchain,
  toolName: ToolchainEmbedded,
): (() => Promise<ErrorReport | undefined>) => {
  const uninstallEmbedded = useCallback(() => {
    return toolchain.uninstallEmbedded(toolName);
  }, [toolchain.uninstallEmbedded, toolName]);
  const uninstallEmbeddedTriggers = useMemo(
    () => [`Toolchain.${toolName}`],
    [toolName],
  );
  return useSetAsync(toolchain, uninstallEmbedded, uninstallEmbeddedTriggers);
};
