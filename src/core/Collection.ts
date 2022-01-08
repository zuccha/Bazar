import { getter, setter } from '../utils/Accessors';
import { $EitherErrorOr, EitherErrorOr } from '../utils/EitherErrorOr';
import ErrorReport from '../utils/ErrorReport';
import { $FileSystem } from '../utils/FileSystem';
import Patch, { PatchInfo } from './Patch';
import ProjectSnapshot from './ProjectSnapshot';

export default class Collection {
  private _directoryPath: string;
  private _projectSnapshotNames: string[];
  private _patchNames: string[];

  private static PROJECT_SNAPSHOTS_DIR_NAME = 'projectSnapshots';
  private static PATCHES_DIR_NAME = 'patches';

  private constructor() {
    this._directoryPath = '';
    this._projectSnapshotNames = [];
    this._patchNames = [];
  }

  static create(): Collection {
    return new Collection();
  }

  load = setter(
    ['projectSnapshotNames'],
    async (directoryPath?: string): Promise<ErrorReport | undefined> => {
      const errorPrefix = 'Collection.open';
      let error: ErrorReport | undefined;

      this._directoryPath =
        directoryPath ?? (await $FileSystem.getDataPath('collection'));

      if ((error = await $FileSystem.createDirectory(this._directoryPath))) {
        const errorMessage = `${errorPrefix}: failed to create templates directory`;
        return error.extend(errorMessage);
      }

      const projectSnapshotsDirectory = await this.getSubPath(
        Collection.PROJECT_SNAPSHOTS_DIR_NAME,
      );
      if (await $FileSystem.exists(projectSnapshotsDirectory)) {
        const projectNames = await $FileSystem.getDirNames(
          projectSnapshotsDirectory,
        );
        this._projectSnapshotNames = projectNames;
      }

      const patchesDirectory = await this.getSubPath(
        Collection.PATCHES_DIR_NAME,
      );
      if (await $FileSystem.exists(patchesDirectory)) {
        const patchesNames = await $FileSystem.getDirNames(patchesDirectory);
        this._patchNames = patchesNames;
      }
    },
  );

  private getSubPath = getter(
    ['directoryPath'],
    async (path: string): Promise<string> => {
      return await $FileSystem.join(this._directoryPath, path);
    },
  );

  // #region ProjectSnapshots

  getProjectSnapshotPath = getter(
    ['directoryPath', 'projectSnapshotNames'],
    async (name: string): Promise<string> => {
      if (!this._projectSnapshotNames.includes(name)) {
        return '';
      }
      return await $FileSystem.join(
        this._directoryPath,
        Collection.PROJECT_SNAPSHOTS_DIR_NAME,
        name,
      );
    },
  );

  getProjectSnapshotNames = getter(['projectSnapshotNames'], (): string[] => {
    return this._projectSnapshotNames;
  });

  addProjectSnapshot = setter(
    ['projectSnapshotNames'],
    async (
      name: string,
      projectSnapshot: ProjectSnapshot,
    ): Promise<ErrorReport | undefined> => {
      const errorPrefix = 'Collection.addProjectSnapshot';
      let error: ErrorReport | undefined;

      const path = await $FileSystem.join(
        this._directoryPath,
        Collection.PROJECT_SNAPSHOTS_DIR_NAME,
        name,
      );

      if ((error = await $FileSystem.validateNotExists(path))) {
        const errorMessage = `${errorPrefix}: a template project with this name already exists`;
        return error.extend(errorMessage);
      }

      if (
        (error = await $FileSystem.copyDirectory(
          projectSnapshot.getPath(),
          path,
        ))
      ) {
        const errorMessage = `${errorPrefix}: failed to save project as template`;
        return error.extend(errorMessage);
      }

      this._projectSnapshotNames.push(name);
    },
  );

  deleteProjectSnapshot = setter(
    ['projectSnapshotNames'],
    async (name: string): Promise<ErrorReport | undefined> => {
      const errorPrefix = 'Collection.deleteProjectSnapshot';
      let error: ErrorReport | undefined;

      const path = await $FileSystem.join(
        this._directoryPath,
        Collection.PROJECT_SNAPSHOTS_DIR_NAME,
        name,
      );

      const index = this._projectSnapshotNames.indexOf(name);

      if (index === -1) {
        const errorMessage = `${errorPrefix}: a template project with this name was not found`;
        return ErrorReport.from(errorMessage);
      }

      if ((error = await $FileSystem.validateExistsDir(path))) {
        const errorMessage = `${errorPrefix}: a template project with this name does not exist`;
        return error.extend(errorMessage);
      }

      if ((error = await $FileSystem.removeDir(path))) {
        const errorMessage = `${errorPrefix}: failed to delete template project`;
        return error.extend(errorMessage);
      }

      this._projectSnapshotNames.splice(index, 1);
    },
  );

  editProjectSnapshot = setter(
    ['projectSnapshotNames'],
    async (prevName: string, nextName: string) => {
      const errorPrefix = 'Collection.editProjectSnapshot';
      let error: ErrorReport | undefined;

      const prevPath = await $FileSystem.join(
        this._directoryPath,
        Collection.PROJECT_SNAPSHOTS_DIR_NAME,
        prevName,
      );

      const nextPath = await $FileSystem.join(
        this._directoryPath,
        Collection.PROJECT_SNAPSHOTS_DIR_NAME,
        nextName,
      );

      const index = this._projectSnapshotNames.indexOf(prevName);

      if (index === -1) {
        const errorMessage = `${errorPrefix}: a template project with this name was not found`;
        return ErrorReport.from(errorMessage);
      }

      if ((error = await $FileSystem.validateExistsDir(prevPath))) {
        const errorMessage = `${errorPrefix}: a template project with this name does not exist`;
        return error.extend(errorMessage);
      }

      if ((error = await $FileSystem.validateNotExists(nextPath))) {
        const errorMessage = `${errorPrefix}: a template project with this name already exists`;
        return error.extend(errorMessage);
      }

      if ((error = await $FileSystem.rename(prevPath, nextPath))) {
        const errorMessage = `${errorPrefix}: failed to rename template project`;
        return error.extend(errorMessage);
      }

      this._projectSnapshotNames[index] = nextName;
    },
  );

  // #endregion ProjectSnapshots

  // #region Patches

  getPatchPath = getter(
    ['directoryPath', 'patchNames'],
    async (name: string): Promise<string> => {
      if (!this._patchNames.includes(name)) {
        return '';
      }
      return await $FileSystem.join(
        this._directoryPath,
        Collection.PATCHES_DIR_NAME,
        name,
      );
    },
  );

  getPatch = getter(
    ['patchNames'],
    async (name: string): Promise<EitherErrorOr<Patch>> => {
      const path = await this.getPatchPath(name);
      if (!path) {
        const errorMessage = `Collection.getPatch: failed to find patch "${name}"`;
        return $EitherErrorOr.error(ErrorReport.from(errorMessage));
      }

      const errorOrPatch = await Patch.open(path);
      if (errorOrPatch.isError) {
        const errorMessage = `Collection.getPatch: failed to open patch "${name}"`;
        return $EitherErrorOr.error(errorOrPatch.error.extend(errorMessage));
      }
      return $EitherErrorOr.value(errorOrPatch.value);
    },
  );

  getPatchNames = getter(['patchNames'], (): string[] => {
    return this._patchNames;
  });

  addPatchFromDirectory = setter(
    ['patchNames'],
    async (
      sourceDirectoryPath: string,
      info: PatchInfo,
    ): Promise<ErrorReport | undefined> => {
      const errorPrefix = `Collection.addPatchFromDirectory`;

      if (this._patchNames.some((patchName) => patchName === info.name)) {
        const errorMessage = `${errorPrefix}: patch with name "${info.name}" already exists`;
        return ErrorReport.from(errorMessage);
      }

      const patchOrError = await Patch.createFromDirectory(
        await this.getSubPath(Collection.PATCHES_DIR_NAME),
        sourceDirectoryPath,
        info,
      );
      if (patchOrError.isError) {
        const errorMessage = `${errorPrefix}: failed to create patch "${info.name}"`;
        return patchOrError.error.extend(errorMessage);
      }

      this._patchNames.push(patchOrError.value.getInfo().name);
    },
  );

  addPatchFromFile = setter(
    ['patches'],
    async (
      sourceDirectoryPath: string,
      info: PatchInfo,
    ): Promise<ErrorReport | undefined> => {
      const errorPrefix = `Collection.addPatchFromFile`;

      if (this._patchNames.some((patchName) => patchName === info.name)) {
        const errorMessage = `${errorPrefix}: patch with name "${info.name}" already exists`;
        return ErrorReport.from(errorMessage);
      }

      const patchOrError = await Patch.createFromFile(
        await this.getSubPath(Collection.PATCHES_DIR_NAME),
        sourceDirectoryPath,
        info,
      );
      if (patchOrError.isError) {
        const errorMessage = `${errorPrefix}: failed to create patch "${info.name}"`;
        return patchOrError.error.extend(errorMessage);
      }

      this._patchNames.push(patchOrError.value.getInfo().name);
    },
  );

  addPatchFromExisting = setter(
    ['patchNames'],
    async (patch: Patch, info: PatchInfo): Promise<ErrorReport | undefined> => {
      const errorPrefix = 'Collection.addPatchFromExisting';
      let error: ErrorReport | undefined;

      const path = await $FileSystem.join(
        this._directoryPath,
        Collection.PATCHES_DIR_NAME,
        info.name,
      );

      if ((error = await $FileSystem.validateNotExists(path))) {
        const errorMessage = `${errorPrefix}: a template patch with this name already exists`;
        return error.extend(errorMessage);
      }

      if ((error = await $FileSystem.copyDirectory(patch.getPath(), path))) {
        const errorMessage = `${errorPrefix}: failed to save patch as template`;
        return error.extend(errorMessage);
      }

      const patchOrError = await Patch.open(path);
      if (patchOrError.isError) {
        await $FileSystem.removeDir(path);
        const errorMessage = `${errorPrefix}: failed to open patch "${info.name}"`;
        return patchOrError.error.extend(errorMessage);
      }

      if ((error = await patchOrError.value.renameAndSetInfo(info))) {
        patchOrError.value.delete();
        const errorMessage = `${errorPrefix}: failed to set new info for patch "${name}"`;
        return error.extend(errorMessage);
      }

      this._patchNames.push(info.name);
    },
  );

  deletePatch = setter(
    ['patchNames'],
    async (name: string): Promise<ErrorReport | undefined> => {
      const errorPrefix = 'Collection.deletePatch';
      let error: ErrorReport | undefined;

      const path = await $FileSystem.join(
        this._directoryPath,
        Collection.PATCHES_DIR_NAME,
        name,
      );

      const index = this._patchNames.indexOf(name);

      if (index === -1) {
        const errorMessage = `${errorPrefix}: a template patch with this name was not found`;
        return ErrorReport.from(errorMessage);
      }

      if ((error = await $FileSystem.validateExistsDir(path))) {
        const errorMessage = `${errorPrefix}: a template patch with this name does not exist`;
        return error.extend(errorMessage);
      }

      if ((error = await $FileSystem.removeDir(path))) {
        const errorMessage = `${errorPrefix}: failed to delete template patch`;
        return error.extend(errorMessage);
      }

      this._patchNames.splice(index, 1);
    },
  );

  editPatch = setter(
    ['patchNames'],
    async (prevName: string, nextName: string) => {
      const errorPrefix = 'Collection.editPatch';
      let error: ErrorReport | undefined;

      const prevPath = await $FileSystem.join(
        this._directoryPath,
        Collection.PATCHES_DIR_NAME,
        prevName,
      );

      const nextPath = await $FileSystem.join(
        this._directoryPath,
        Collection.PATCHES_DIR_NAME,
        nextName,
      );

      const index = this._patchNames.indexOf(prevName);

      if (index === -1) {
        const errorMessage = `${errorPrefix}: a template patch with this name was not found`;
        return ErrorReport.from(errorMessage);
      }

      if ((error = await $FileSystem.validateExistsDir(prevPath))) {
        const errorMessage = `${errorPrefix}: a template patch with this name does not exist`;
        return error.extend(errorMessage);
      }

      if ((error = await $FileSystem.validateNotExists(nextPath))) {
        const errorMessage = `${errorPrefix}: a template patch with this name already exists`;
        return error.extend(errorMessage);
      }

      if ((error = await $FileSystem.rename(prevPath, nextPath))) {
        const errorMessage = `${errorPrefix}: failed to rename template patch`;
        return error.extend(errorMessage);
      }

      this._patchNames[index] = nextName;
    },
  );

  // #endregion Patch
}
