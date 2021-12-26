import { z } from 'zod';
import { $DateTime } from '../utils/DateTime';
import { $EitherErrorOr, EitherErrorOr } from '../utils/EitherErrorOr';
import { $ErrorReport, ErrorReport } from '../utils/ErrorReport';
import { $FileSystem } from '../utils/FileSystem';
import { $Shell } from '../utils/Shell';
import Patch from './Patch';
import Resource from './Resource';
import Toolchain from './Toolchain';

// #region Info

const ProjectSnapshotInfoSchema = z.object({
  creationDate: z.string().refine($DateTime.isISODate),
});

export type ProjectSnapshotInfo = z.infer<typeof ProjectSnapshotInfoSchema>;

// #endregion Info

export default class ProjectSnapshot {
  private resource: Resource<ProjectSnapshotInfo>;
  private patches: Patch[];

  private static ROM_FILE_NAME = 'rom.smc';
  private static PATCHES_DIR_NAME = 'patches';

  private constructor({
    resource,
    patches,
  }: {
    resource: Resource<ProjectSnapshotInfo>;
    patches: Patch[];
  }) {
    this.resource = resource;
    this.patches = patches;
  }

  // #region Constructors

  static async create({
    locationDirPath,
    romFilePath,
    name,
  }: {
    locationDirPath: string;
    romFilePath: string;
    name: string;
  }): Promise<EitherErrorOr<ProjectSnapshot>> {
    const errorPrefix = 'ProjectSnapshot.create';
    let error: ErrorReport | undefined;

    // Resource

    const info = { creationDate: new Date().toISOString() };
    const resourceOrError = await Resource.create(locationDirPath, name, info);
    if (resourceOrError.isError) {
      const errorMessage = `${errorPrefix}: failed to create resource`;
      return $EitherErrorOr.error(resourceOrError.error.extend(errorMessage));
    }
    const resource = resourceOrError.value;

    // Copy ROM file
    if (
      (error = await $FileSystem.copyFile(
        romFilePath,
        await $FileSystem.join(
          resource.getDirectoryPath(),
          ProjectSnapshot.ROM_FILE_NAME,
        ),
      ))
    ) {
      resource.delete();
      const errorMessage = `${errorPrefix}: failed to copy ROM file`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Patches

    const patches: Patch[] = [];
    const patchesDirectory = await resource.path(
      ProjectSnapshot.PATCHES_DIR_NAME,
    );
    if ((error = await $FileSystem.createDirectory(patchesDirectory))) {
      resource.delete();
      const errorMessage = `${errorPrefix}: failed to create patches directory`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Instantiate snapshot

    const snapshot = new ProjectSnapshot({ resource, patches });
    return $EitherErrorOr.value(snapshot);
  }

  static async open({
    directoryPath,
  }: {
    directoryPath: string;
  }): Promise<EitherErrorOr<ProjectSnapshot>> {
    const errorPrefix = 'ProjectSnapshot.open';
    let error: ErrorReport | undefined;

    // Resource

    const resourceOrError = await Resource.open(
      directoryPath,
      ProjectSnapshotInfoSchema,
    );
    if (resourceOrError.isError) {
      const errorMessage = `${errorPrefix}: failed to open project snapshot info`;
      return $EitherErrorOr.error(resourceOrError.error.extend(errorMessage));
    }
    const resource = resourceOrError.value;

    const romFilePath = await resource.path(ProjectSnapshot.ROM_FILE_NAME);
    if ((error = await $FileSystem.validateExistsFile(romFilePath))) {
      const errorMessage = `${errorPrefix}: ROM file does not exist`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Patches

    const patches: Patch[] = [];
    const patchesDirPath = await resource.path(
      ProjectSnapshot.PATCHES_DIR_NAME,
    );
    const patchNames = await $FileSystem.getDirNames(patchesDirPath);
    for (const patchName of patchNames) {
      const patchDirPath = await $FileSystem.join(patchesDirPath, patchName);
      const patchOrError = await Patch.open({ directoryPath: patchDirPath });
      if (patchOrError.isError) {
        const errorMessage = `${errorPrefix}: failed to open patch "${patchName}"`;
        return $EitherErrorOr.error(patchOrError.error.extend(errorMessage));
      }
      patches.push(patchOrError.value);
    }

    // Instantiate snapshot

    const snapshot = new ProjectSnapshot({ resource, patches });
    return $EitherErrorOr.value(snapshot);
  }

  // #endregion Constructors

  // #region Generic

  openInLunarMagic = async (
    toolchain: Toolchain,
  ): Promise<ErrorReport | undefined> => {
    const errorPrefix = 'ProjectSnapshot.openInLunarMagic';
    let error: ErrorReport | undefined;
    const lunarMagic = toolchain.getLunarMagic();

    if (lunarMagic.status !== 'installed') {
      const errorMessage = `${errorPrefix}: Lunar Magic is not installed`;
      return $ErrorReport.make(errorMessage);
    }

    if ((error = await $FileSystem.validateExistsFile(lunarMagic.exePath))) {
      const errorMessage = `${errorPrefix}: Lunar Magic is not available`;
      return error.extend(errorMessage);
    }

    const process = await $Shell.execute(lunarMagic.exePath, [
      await this.resource.path(ProjectSnapshot.ROM_FILE_NAME),
    ]);
    if (process.code !== 0) {
      const errorMessage = `${errorPrefix}: Could not open project snapshot in Lunar Magic`;
      return $ErrorReport.make(errorMessage);
    }
  };

  launchInEmulator = async (
    toolchain: Toolchain,
  ): Promise<ErrorReport | undefined> => {
    const errorPrefix = 'ProjectSnapshot.launchInEmulator';
    let error: ErrorReport | undefined;
    const emulator = toolchain.getEmulator();

    if ((error = await $FileSystem.validateExistsFile(emulator.exePath))) {
      const errorMessage = `${errorPrefix}: Emulator is not available`;
      return error.extend(errorMessage);
    }

    const process = await $Shell.execute(emulator.exePath, [
      await this.resource.path(ProjectSnapshot.ROM_FILE_NAME),
    ]);
    if (process.code !== 0) {
      const errorMessage = `${errorPrefix}: Could not launch project snapshot in emulator`;
      return $ErrorReport.make(errorMessage);
    }
  };

  // #endregion Generic

  // #region Info

  static getInfoDeps = ['ProjectSnapshot.info'];
  getInfo = (): ProjectSnapshotInfo => {
    return this.resource.getInfo();
  };

  static setInfoTriggers = ['ProjectSnapshot.info'];
  setInfo = async (
    info: ProjectSnapshotInfo,
  ): Promise<ErrorReport | undefined> => {
    const errorMessage = 'ProjectSnapshot.setInfo: failed to set info';
    const maybeError = await this.resource.setInfo(info);
    return maybeError ? maybeError.extend(errorMessage) : undefined;
  };

  // #endregion Info

  // #region Patches

  static getPatchesDeps = ['ProjectSnapshot.patches'];
  getPatches = (): Patch[] => {
    return this.patches;
  };

  static addPatchFromDirectoryTriggers = ['ProjectSnapshot.patches'];
  addPatchFromDirectory = async ({
    name,
    sourceDirPath,
    mainFilePath,
  }: {
    name: string;
    sourceDirPath: string;
    mainFilePath: string;
  }): Promise<ErrorReport | undefined> => {
    const errorPrefix = 'ProjectSnapshot.addPatchFromDirectory';

    if (this.patches.some((patch) => patch.getInfo().name === name)) {
      const errorMessage = `${errorPrefix}: patch with name "${name}" already exists`;
      return $ErrorReport.make(errorMessage);
    }

    const patchOrError = await Patch.createFromDirectory({
      locationDirPath: await this.resource.path(
        ProjectSnapshot.PATCHES_DIR_NAME,
      ),
      name,
      sourceDirPath,
      mainFilePath,
    });
    if (patchOrError.isError) {
      const errorMessage = `${errorPrefix}: failed to create patch "${name}"`;
      return patchOrError.error.extend(errorMessage);
    }

    this.patches.push(patchOrError.value);
  };

  static addPatchFromFileTriggers = ['ProjectSnapshot.patches'];
  addPatchFromFile = async ({
    name,
    filePath,
  }: {
    name: string;
    filePath: string;
  }): Promise<ErrorReport | undefined> => {
    const errorPrefix = 'ProjectSnapshot.addPatchFromFile';

    if (this.patches.some((patch) => patch.getInfo().name === name)) {
      const errorMessage = `${errorPrefix}: patch with name "${name}" already exists`;
      return $ErrorReport.make(errorMessage);
    }

    const patchOrError = await Patch.createFromFile({
      locationDirPath: await this.resource.path(
        ProjectSnapshot.PATCHES_DIR_NAME,
      ),
      name,
      filePath,
    });
    if (patchOrError.isError) {
      const errorMessage = `${errorPrefix}: failed to create patch "${name}"`;
      return patchOrError.error.extend(errorMessage);
    }

    this.patches.push(patchOrError.value);
  };

  static removePatchTriggers = ['ProjectSnapshot.patches'];
  removePatch = async (patchName: string): Promise<ErrorReport | undefined> => {
    const errorPrefix = 'ProjectSnapshot.removePatch';

    const patchIndex = this.patches.findIndex(
      (patch) => patch.getInfo().name === patchName,
    );
    const patch = this.patches[patchIndex];

    if (!patch) {
      const errorMessage = `${errorPrefix}: patch "${patchName}" does not exist`;
      return $ErrorReport.make(errorMessage);
    }

    const error = await patch.delete();
    if (error) {
      const errorMessage = `${errorPrefix}: failed to remove patch "${patchName}"`;
      return error.extend(errorMessage);
    }

    this.patches.splice(patchIndex, 1);
  };

  // #endregion Patches
}