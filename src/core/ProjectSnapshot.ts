import * as Tauri from '@tauri-apps/api';
import { z } from 'zod';
import { getter, setter } from '../utils/Accessors';
import { $DateTime } from '../utils/DateTime';
import { $EitherErrorOr, EitherErrorOr } from '../utils/EitherErrorOr';
import ErrorReport from '../utils/ErrorReport';
import { $FileSystem } from '../utils/FileSystem';
import { $Shell, Process } from '../utils/Shell';
import Patch, { PatchInfo } from './Patch';
import Resource, { ResourceFields } from './Resource';
import Toolchain from './Toolchain';

// #region Info

const infoSchema = z.object({
  creationDate: z.string().refine($DateTime.isISODate),
});

export type ProjectSnapshotInfo = z.infer<typeof infoSchema>;

// #endregion Info

export default class ProjectSnapshot extends Resource<ProjectSnapshotInfo> {
  public readonly TypeName = 'ProjectSnapshot';

  private patches!: Patch[];

  public static ROM_FILE_NAME = 'rom.smc';
  public static PATCHES_DIR_NAME = 'resources/patches';

  private constructor(props: ResourceFields<ProjectSnapshotInfo>) {
    super(props);
  }

  // #region Constructors

  static async create(
    directoryPath: string,
    {
      romFilePath,
      name,
    }: {
      romFilePath: string;
      name: string;
    },
  ): Promise<EitherErrorOr<ProjectSnapshot>> {
    const errorPrefix = 'ProjectSnapshot.create';
    let error: ErrorReport | undefined;

    // Resource
    const info = { creationDate: new Date().toISOString() };
    const projectSnapshot = new ProjectSnapshot({ directoryPath, name, info });
    if ((error = await projectSnapshot.save())) {
      const errorMessage = `${errorPrefix}: failed to create resource`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Copy ROM file
    if (
      (error = await $FileSystem.copyFile(
        romFilePath,
        await projectSnapshot.getSubPath(ProjectSnapshot.ROM_FILE_NAME),
      ))
    ) {
      projectSnapshot.delete();
      const errorMessage = `${errorPrefix}: failed to copy ROM file`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Patches
    const patches: Patch[] = [];
    const patchesDirectory = await projectSnapshot.getSubPath(
      ProjectSnapshot.PATCHES_DIR_NAME,
    );
    if ((error = await $FileSystem.createDirectory(patchesDirectory))) {
      projectSnapshot.delete();
      const errorMessage = `${errorPrefix}: failed to create patches directory`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Return snapshot
    projectSnapshot.patches = patches;
    return $EitherErrorOr.value(projectSnapshot);
  }

  static async open(path: string): Promise<EitherErrorOr<ProjectSnapshot>> {
    const errorPrefix = 'ProjectSnapshot.open';
    let error: ErrorReport | undefined;

    // Resource
    const errorOrFields = await Resource.load(path, infoSchema);
    if (errorOrFields.isError) {
      const errorMessage = `${errorPrefix}: failed to open patch info`;
      return $EitherErrorOr.error(errorOrFields.error.extend(errorMessage));
    }
    const projectSnapshot = new ProjectSnapshot(errorOrFields.value);

    // ROM
    const romFilePath = await projectSnapshot.getSubPath(
      ProjectSnapshot.ROM_FILE_NAME,
    );
    if ((error = await $FileSystem.validateExistsFile(romFilePath))) {
      const errorMessage = `${errorPrefix}: ROM file does not exist`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Patches
    const patches: Patch[] = [];
    const patchesDirPath = await $FileSystem.join(
      path,
      ProjectSnapshot.PATCHES_DIR_NAME,
    );
    const patchNames = await $FileSystem.getDirNames(patchesDirPath);
    for (const patchName of patchNames) {
      const patchDirPath = await $FileSystem.join(patchesDirPath, patchName);
      const patchOrError = await Patch.open(patchDirPath);
      if (patchOrError.isError) {
        const errorMessage = `${errorPrefix}: failed to open patch "${patchName}"`;
        return $EitherErrorOr.error(patchOrError.error.extend(errorMessage));
      }
      patches.push(patchOrError.value);
    }
    patches.sort(Patch.compareLt);

    // Return snapshot
    projectSnapshot.patches = patches;
    return $EitherErrorOr.value(projectSnapshot);
  }

  // #endregion Constructors

  // #region Properties

  getRomFilePath = (): Promise<string> => {
    return this.getSubPath(ProjectSnapshot.ROM_FILE_NAME);
  };

  getCredits = (): string => {
    const EOL = Tauri.os.EOL;

    let credits = '';

    credits += `Patches:${EOL}`;
    credits += this.patches.map((patch) => patch.getCredits()).join(EOL);

    return credits;
  };

  // #endregion Properties

  // #region Generic

  openInLunarMagic = setter(
    [],
    async (toolchain: Toolchain): Promise<ErrorReport | undefined> => {
      const errorPrefix = `${this.TypeName}.openInLunarMagic`;
      let error: ErrorReport | undefined;
      const lunarMagic = toolchain.getEmbedded('lunarMagic');

      if (lunarMagic.status !== 'installed') {
        const errorMessage = `${errorPrefix}: Lunar Magic is not installed`;
        return ErrorReport.from(errorMessage);
      }

      if ((error = await $FileSystem.validateExistsFile(lunarMagic.exePath))) {
        const errorMessage = `${errorPrefix}: Lunar Magic is not available`;
        return error.extend(errorMessage);
      }

      const process = await $Shell.execute(lunarMagic.exePath, [
        await this.getSubPath(ProjectSnapshot.ROM_FILE_NAME),
      ]);
      if (process.code !== 0) {
        const errorMessage = `${errorPrefix}: Could not open project snapshot in Lunar Magic`;
        return ErrorReport.from(errorMessage);
      }
    },
  );

  launchInEmulator = setter(
    [],
    async (toolchain: Toolchain): Promise<ErrorReport | undefined> => {
      const errorPrefix = `${this.TypeName}.launchInEmulator`;
      let error: ErrorReport | undefined;
      const emulator = toolchain.getCustom('emulator');

      if ((error = await $FileSystem.validateExistsFile(emulator.exePath))) {
        const errorMessage = `${errorPrefix}: Emulator is not available`;
        return error.extend(errorMessage);
      }

      const process = await $Shell.execute(emulator.exePath, [
        await this.getSubPath(ProjectSnapshot.ROM_FILE_NAME),
      ]);
      if (process.code !== 0) {
        const errorMessage = `${errorPrefix}: Could not launch project snapshot in emulator`;
        return ErrorReport.from(errorMessage);
      }
    },
  );

  // #endregion Generic

  // #region Patches

  getPatches = getter(['patches'], (): Patch[] => {
    return this.patches;
  });

  addPatchFromDirectory = setter(
    ['patches'],
    async (
      sourceDirectoryPath: string,
      info: PatchInfo,
    ): Promise<ErrorReport | undefined> => {
      const errorPrefix = `${this.TypeName}.addPatchFromDirectory`;

      if (this.patches.some((patch) => patch.getInfo().name === info.name)) {
        const errorMessage = `${errorPrefix}: patch with name "${info.name}" already exists`;
        return ErrorReport.from(errorMessage);
      }

      const patchOrError = await Patch.createFromDirectory(
        await this.getSubPath(ProjectSnapshot.PATCHES_DIR_NAME),
        sourceDirectoryPath,
        info,
      );
      if (patchOrError.isError) {
        const errorMessage = `${errorPrefix}: failed to create patch "${name}"`;
        return patchOrError.error.extend(errorMessage);
      }

      this.patches.push(patchOrError.value);
      this.patches.sort(Patch.compareLt);
    },
  );

  addPatchFromFile = setter(
    ['patches'],
    async (
      sourceDirectoryPath: string,
      info: PatchInfo,
    ): Promise<ErrorReport | undefined> => {
      const errorPrefix = `${this.TypeName}.addPatchFromFile`;

      if (this.patches.some((patch) => patch.getInfo().name === info.name)) {
        const errorMessage = `${errorPrefix}: patch with name "${info.name}" already exists`;
        return ErrorReport.from(errorMessage);
      }

      const patchOrError = await Patch.createFromFile(
        await this.getSubPath(ProjectSnapshot.PATCHES_DIR_NAME),
        sourceDirectoryPath,
        info,
      );
      if (patchOrError.isError) {
        const errorMessage = `${errorPrefix}: failed to create patch "${name}"`;
        return patchOrError.error.extend(errorMessage);
      }

      this.patches.push(patchOrError.value);
      this.patches.sort(Patch.compareLt);
    },
  );

  addPatchFromExisting = setter(
    ['patches'],
    async (patch: Patch, info: PatchInfo): Promise<ErrorReport | undefined> => {
      let error: ErrorReport | undefined;
      const errorPrefix = `${this.TypeName}.addPatchFromFile`;

      const name = patch.getInfo().name;

      const patchPath = await this.getSubPath(
        ProjectSnapshot.PATCHES_DIR_NAME,
        info.name,
      );

      if (patchPath === '') {
        const errorMessage = `${errorPrefix}: patch with name "${name}" was not found`;
        return ErrorReport.from(errorMessage);
      }

      if ((error = await $FileSystem.validateNotExists(patchPath))) {
        const errorMessage = `${errorPrefix}: a patch named "${name}" already exists`;
        return error.extend(errorMessage);
      }

      if (
        (error = await $FileSystem.copyDirectory(patch.getPath(), patchPath))
      ) {
        const errorMessage = `${errorPrefix}: failed to copy template patch "${name}"`;
        return error.extend(errorMessage);
      }

      const patchOrError = await Patch.open(patchPath);
      if (patchOrError.isError) {
        await $FileSystem.removeDir(patchPath);
        const errorMessage = `${errorPrefix}: failed to open patch "${name}"`;
        return patchOrError.error.extend(errorMessage);
      }

      if ((error = await patchOrError.value.renameAndSetInfo(info))) {
        patchOrError.value.delete();
        const errorMessage = `${errorPrefix}: failed to set new info for patch "${name}"`;
        return error.extend(errorMessage);
      }

      this.patches.push(patchOrError.value);
      this.patches.sort(Patch.compareLt);
    },
  );

  removePatch = setter(
    ['patches'],
    async (patch: Patch): Promise<ErrorReport | undefined> => {
      const errorPrefix = `${this.TypeName}.removePatch`;

      const name = patch.getInfo().name;
      const patchIndex = this.patches.findIndex(
        (p) => p.getInfo().name === name,
      );

      if (patchIndex === -1) {
        const errorMessage = `${errorPrefix}: patch "${name}" does not exist`;
        return ErrorReport.from(errorMessage);
      }

      const error = await patch.delete();
      if (error) {
        const errorMessage = `${errorPrefix}: failed to remove patch "${name}"`;
        return error.extend(errorMessage);
      }

      this.patches.splice(patchIndex, 1);
    },
  );

  editPatch = setter(['patches'], async (patch: Patch, info: PatchInfo) => {
    const errorPrefix = 'ProjectSnapshot.editPatch';
    let error: ErrorReport | undefined;

    if (!this.patches.includes(patch)) {
      const errorMessage = `${errorPrefix}: a template patch named "${name}" was not found`;
      return ErrorReport.from(errorMessage);
    }

    if ((error = await patch.renameAndSetInfo(info))) {
      const errorMessage = `${errorPrefix}: failed to remove patch "${name}"`;
      return error.extend(errorMessage);
    }

    this.patches.sort(Patch.compareLt);
  });

  // #endregion Patches
}
