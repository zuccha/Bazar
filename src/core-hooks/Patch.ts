import Patch, { PatchInfo } from '../core/Patch';
import { useGet, useSetAsync } from '../hooks/useAccessors';
import { ErrorReport } from '../utils/ErrorReport';

export const usePatchInfo = (patch: Patch): PatchInfo => {
  return useGet(patch, patch.getInfo, Patch.getInfoDeps);
};

export const useSetPatchInfo = (
  patch: Patch,
): ((info: PatchInfo) => Promise<ErrorReport | undefined>) => {
  return useSetAsync(patch, patch.setInfo, Patch.setInfoTriggers);
};
