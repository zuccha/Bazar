import { useMemo } from 'react';
import Collection from '../core/Collection';
import Patch, { PatchInfo } from '../core/Patch';
import ProjectSnapshot from '../core/ProjectSnapshot';
import { useGet, useGetAsync, useSetAsync } from '../hooks/useAccessors';
import { AsyncResponse } from '../utils/Accessors';
import ErrorReport from '../utils/ErrorReport';

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

export const useCollectionPatch = (
  collection: Collection,
  name: string,
): AsyncResponse<Patch> => {
  return useGetAsync(
    collection,
    useMemo(() => {
      const getPatch = () => collection.getPatch(name);
      getPatch.deps = collection.getPatch.deps;
      return getPatch;
    }, [collection, name]),
  );
};

export const useAddPatchToCollectionFromDirectory = (
  collection: Collection,
) => {
  return useSetAsync(collection, collection.addPatchFromDirectory);
};

export const useAddPatchToCollectionFromFile = (collection: Collection) => {
  return useSetAsync(collection, collection.addPatchFromFile);
};

export const useAddPatchToCollectionFromExisting = (
  collection: Collection,
): ((patch: Patch, info: PatchInfo) => Promise<ErrorReport | undefined>) => {
  return useSetAsync(collection, collection.addPatchFromExisting);
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
