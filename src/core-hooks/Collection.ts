import Collection from '../core/Collection';
import Patch from '../core/Patch';
import ProjectSnapshot from '../core/ProjectSnapshot';
import { useGet, useSetAsync } from '../hooks/useAccessors';
import { ErrorReport } from '../utils/ErrorReport';

export const useLoadCollection = (
  collection: Collection,
): ((directoryPath?: string) => Promise<ErrorReport | undefined>) => {
  return useSetAsync(collection, collection.load);
};

export const useCollectionProjectSnapshotNames = (
  collection: Collection,
): string[] => {
  return useGet(collection, collection.getProjectSnapshotNames);
};

export const useAddProjectSnapshotToCollection = (
  collection: Collection,
): ((
  name: string,
  projectSnapshot: ProjectSnapshot,
) => Promise<ErrorReport | undefined>) => {
  return useSetAsync(collection, collection.addProjectSnapshot);
};

export const useDeleteProjectSnapshotFromCollection = (
  collection: Collection,
): ((name: string) => Promise<ErrorReport | undefined>) => {
  return useSetAsync(collection, collection.deleteProjectSnapshot);
};

export const useEditProjectSnapshotInCollection = (
  collection: Collection,
): ((
  prevName: string,
  nextName: string,
) => Promise<ErrorReport | undefined>) => {
  return useSetAsync(collection, collection.editProjectSnapshot);
};

export const useCollectionPatchNames = (collection: Collection): string[] => {
  return useGet(collection, collection.getPatchNames);
};

export const useAddPatchToCollection = (
  collection: Collection,
): ((
  name: string,
  projectSnapshot: Patch,
) => Promise<ErrorReport | undefined>) => {
  return useSetAsync(collection, collection.addPatch);
};

export const useDeletePatchFromCollection = (
  collection: Collection,
): ((name: string) => Promise<ErrorReport | undefined>) => {
  return useSetAsync(collection, collection.deletePatch);
};

export const useEditPatchInCollection = (
  collection: Collection,
): ((
  prevName: string,
  nextName: string,
) => Promise<ErrorReport | undefined>) => {
  return useSetAsync(collection, collection.editPatch);
};
