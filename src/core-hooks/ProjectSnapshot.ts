import Patch from '../core/Patch';
import ProjectSnapshot, { ProjectSnapshotInfo } from '../core/ProjectSnapshot';
import Toolchain from '../core/Toolchain';
import { useGet, useSetAsync } from '../hooks/useAccessors';
import { ErrorReport } from '../utils/ErrorReport';

export const useOpenProjectSnapshotInLunarMagic = (
  snapshot: ProjectSnapshot,
): ((toolchain: Toolchain) => Promise<ErrorReport | undefined>) => {
  return useSetAsync(
    snapshot,
    snapshot.openInLunarMagic,
    ProjectSnapshot.openInLunarMagicTriggers,
  );
};

export const useLaunchProjectSnapshotInEmulator = (
  snapshot: ProjectSnapshot,
): ((toolchain: Toolchain) => Promise<ErrorReport | undefined>) => {
  return useSetAsync(
    snapshot,
    snapshot.launchInEmulator,
    ProjectSnapshot.launchInEmulatorTriggers,
  );
};

export const useProjectSnapshotInfo = (
  snapshot: ProjectSnapshot,
): ProjectSnapshotInfo => {
  return useGet(snapshot, snapshot.getInfo, ProjectSnapshot.getInfoDeps);
};

export const useSetProjectSnapshotInfo = (
  snapshot: ProjectSnapshot,
): ((info: ProjectSnapshotInfo) => Promise<ErrorReport | undefined>) => {
  return useSetAsync(
    snapshot,
    snapshot.setInfo,
    ProjectSnapshot.setInfoTriggers,
  );
};

export const useProjectSnapshotPatches = (
  snapshot: ProjectSnapshot,
): Patch[] => {
  return useGet(snapshot, snapshot.getPatches, ProjectSnapshot.getPatchesDeps);
};

export const useAddPatchToProjectSnapshotFromDirectory = (
  snapshot: ProjectSnapshot,
) => {
  return useSetAsync(
    snapshot,
    snapshot.addPatchFromDirectory,
    ProjectSnapshot.addPatchFromDirectoryTriggers,
  );
};

export const useAddPatchToProjectSnapshotFromFile = (
  snapshot: ProjectSnapshot,
) => {
  return useSetAsync(
    snapshot,
    snapshot.addPatchFromFile,
    ProjectSnapshot.addPatchFromFileTriggers,
  );
};

export const useRemovePatchFromProjectSnapshot = (
  snapshot: ProjectSnapshot,
) => {
  return useSetAsync(
    snapshot,
    snapshot.removePatch,
    ProjectSnapshot.removePatchTriggers,
  );
};
