import Patch, { PatchInfo } from '../core/Patch';
import { useGet, useSetAsync } from '../hooks/useAccessors';

export const usePatchInfo = (patch: Patch): PatchInfo => {
  return useGet(patch, patch.getInfo, Patch.getInfoDeps);
};

export const useUpdatePatchInfo = (patch: Patch) => {
  return useSetAsync(patch, patch.updateInfo, Patch.updateInfoTriggers);
};
