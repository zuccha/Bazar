import Patch, { PatchInfo } from '../core/Patch';
import { useGet, useSetAsync } from '../hooks/useAccessors';

export const usePatchDirectoryPath = (patch: Patch): string => {
  return useGet(patch, patch.getPath);
};

export const usePatchInfo = (patch: Patch): PatchInfo => {
  return useGet(patch, patch.getInfo);
};

export const useRenameSetPatchInfo = (patch: Patch) => {
  return useSetAsync(patch, patch.renameAndSetInfo);
};
