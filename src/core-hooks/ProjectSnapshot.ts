import Collection from '../core/Collection';
import Patch from '../core/Patch';
import ProjectSnapshot, { ProjectSnapshotInfo } from '../core/ProjectSnapshot';
import Toolchain from '../core/Toolchain';
import { useGet, useSetAsync } from '../hooks/useAccessors';
import { ErrorReport } from '../utils/ErrorReport';

export const useOpenProjectSnapshotInLunarMagic = (
  snapshot: ProjectSnapshot,
): ((toolchain: Toolchain) => Promise<ErrorReport | undefined>) => {
  return useSetAsync(snapshot, snapshot.openInLunarMagic);
};

export const useLaunchProjectSnapshotInEmulator = (
  snapshot: ProjectSnapshot,
): ((toolchain: Toolchain) => Promise<ErrorReport | undefined>) => {
  return useSetAsync(snapshot, snapshot.launchInEmulator);
};

export const useProjectSnapshotInfo = (
  snapshot: ProjectSnapshot,
): ProjectSnapshotInfo => {
  return useGet(snapshot, snapshot.getInfo);
};

export const useSetProjectSnapshotInfo = (
  snapshot: ProjectSnapshot,
): ((info: ProjectSnapshotInfo) => Promise<ErrorReport | undefined>) => {
  return useSetAsync(snapshot, snapshot.setInfo);
};

export const useProjectSnapshotPatches = (
  snapshot: ProjectSnapshot,
): Patch[] => {
  return useGet(snapshot, snapshot.getPatches);
};

export const useAddPatchToProjectSnapshotFromDirectory = (
  snapshot: ProjectSnapshot,
) => {
  return useSetAsync(snapshot, snapshot.addPatchFromDirectory);
};

export const useAddPatchToProjectSnapshotFromFile = (
  snapshot: ProjectSnapshot,
) => {
  return useSetAsync(snapshot, snapshot.addPatchFromFile);
};

export const useAddPatchToProjectSnapshotFromTemplate = (
  snapshot: ProjectSnapshot,
) => {
  return useSetAsync(snapshot, snapshot.addPatchFromTemplate);
};

export const useRemovePatchFromProjectSnapshot = (
  snapshot: ProjectSnapshot,
) => {
  return useSetAsync(snapshot, snapshot.removePatch);
};
