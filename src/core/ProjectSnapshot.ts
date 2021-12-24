import { z } from 'zod';
import { $IResource, IResource } from '../core-interfaces/IResource';
import { $DateTime } from '../utils/DateTime';
import { $EitherErrorOr, EitherErrorOr } from '../utils/EitherErrorOr';
import { $ErrorReport, ErrorReport } from '../utils/ErrorReport';
import { $FileSystem } from '../utils/FileSystem';
import { $Shell } from '../utils/Shell';
import { $Patch, Patch } from './Patch';
import { Toolchain } from './Toolchain';

// Resource

const ProjectSnapshotInfoSchema = z.object({
  creationDate: z.string().refine($DateTime.isISODate),
});

export type ProjectSnapshotInfo = z.infer<typeof ProjectSnapshotInfoSchema>;

const $Resource = $IResource.implement({
  label: 'project snapshot',
  infoSchema: ProjectSnapshotInfoSchema,
});

// ProjectSnapshot

export interface ProjectSnapshot extends IResource<ProjectSnapshotInfo> {
  patches: Patch[];
}

const ROM_FILE_NAME = 'rom.smc';
const PATCHES_DIR_NAME = 'patches';

export const $ProjectSnapshot = {
  // #region Constructors

  create: async ({
    locationDirPath,
    romFilePath,
    name,
  }: {
    locationDirPath: string;
    romFilePath: string;
    name: string;
  }): Promise<EitherErrorOr<ProjectSnapshot>> => {
    const errorPrefix = 'Could not create project snapshot';
    let error: ErrorReport | undefined;

    // Resource

    const info = { creationDate: new Date().toISOString() };
    const resourceOrError = await $Resource.create(locationDirPath, name, info);
    if (resourceOrError.isError) {
      const errorMessage = `${errorPrefix}: failed to create resource`;
      return $EitherErrorOr.error(resourceOrError.error.extend(errorMessage));
    }
    const resource = resourceOrError.value;

    // Copy ROM file
    if (
      (error = await $FileSystem.copyFile(
        romFilePath,
        await $FileSystem.join(resource.directoryPath, ROM_FILE_NAME),
      ))
    ) {
      $Resource.remove(resource);
      const errorMessage = `${errorPrefix}: failed to copy ROM file`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Patches

    const patches: Patch[] = [];
    const patchesDirectory = await $Resource.path(resource, PATCHES_DIR_NAME);
    if ((error = await $FileSystem.createDirectory(patchesDirectory))) {
      $Resource.remove(resource);
      const errorMessage = `${errorPrefix}: failed to create patches directory`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Instantiate snapshot

    return $EitherErrorOr.value({ ...resource, patches });
  },

  open: async ({
    directoryPath,
  }: {
    directoryPath: string;
  }): Promise<EitherErrorOr<ProjectSnapshot>> => {
    const errorPrefix = 'Could not open project snapshot';
    let error: ErrorReport | undefined;

    // Resource

    const resourceOrError = await $Resource.open(directoryPath);
    if (resourceOrError.isError) {
      const errorMessage = `${errorPrefix}: failed to open project snapshot info`;
      return $EitherErrorOr.error(resourceOrError.error.extend(errorMessage));
    }
    const resource = resourceOrError.value;

    const romFilePath = await $Resource.path(resource, ROM_FILE_NAME);
    if ((error = await $FileSystem.validateExistsFile(romFilePath))) {
      const errorMessage = `${errorPrefix}: ROM file does not exist`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Patches

    const patches: Patch[] = [];
    const patchesDirPath = await $Resource.path(resource, PATCHES_DIR_NAME);
    const patchNames = await $FileSystem.getDirNames(patchesDirPath);
    for (const patchName of patchNames) {
      const patchDirPath = await $FileSystem.join(patchesDirPath, patchName);
      const patchOrError = await $Patch.open({ directoryPath: patchDirPath });
      if (patchOrError.isError) {
        const errorMessage = `${errorPrefix}: failed to open patch "${patchName}"`;
        return $EitherErrorOr.error(patchOrError.error.extend(errorMessage));
      }
      patches.push(patchOrError.value);
    }

    // Instantiate snapshot

    return $EitherErrorOr.value({ ...resource, patches });
  },

  // #endregion Constructors

  // #region Inheritance

  ...$Resource.inherit<ProjectSnapshot>(),

  // #endregion Inheritance

  // #region Generic

  openInLunarMagic: async (
    snapshot: ProjectSnapshot,
    toolchain: Toolchain,
  ): Promise<EitherErrorOr<ProjectSnapshot>> => {
    if (toolchain.embedded.lunarMagic.status !== 'installed') {
      const errorMessage = 'Lunar Magic is not available';
      return $EitherErrorOr.error($ErrorReport.make(errorMessage));
    }
    const process = await $Shell.execute(
      toolchain.embedded.lunarMagic.exePath,
      [await $Resource.path(snapshot, ROM_FILE_NAME)],
    );
    if (process.code !== 0) {
      const errorMessage = 'Could not open project snapshot in Lunar Magic';
      return $EitherErrorOr.error($ErrorReport.make(errorMessage));
    }
    return $EitherErrorOr.value(snapshot);
  },

  launchInEmulator: async (
    snapshot: ProjectSnapshot,
    toolchain: Toolchain,
  ): Promise<EitherErrorOr<ProjectSnapshot>> => {
    if (!toolchain.custom.emulator.exePath) {
      const errorMessage = 'Emulator is not available';
      return $EitherErrorOr.error($ErrorReport.make(errorMessage));
    }
    const process = await $Shell.execute(toolchain.custom.emulator.exePath, [
      await $Resource.path(snapshot, ROM_FILE_NAME),
    ]);
    if (process.code !== 0) {
      const errorMessage = 'Could not launch project snapshot in emulator';
      return $EitherErrorOr.error($ErrorReport.make(errorMessage));
    }
    return $EitherErrorOr.value(snapshot);
  },

  // #endregion Generic

  // #region Patches

  getPatches: (snapshot: ProjectSnapshot): Patch[] => snapshot.patches,

  addPatchFromDirectory: async (
    snapshot: ProjectSnapshot,
    {
      name,
      sourceDirPath,
      mainFilePath,
    }: {
      name: string;
      sourceDirPath: string;
      mainFilePath: string;
    },
  ): Promise<EitherErrorOr<ProjectSnapshot>> => {
    const errorPrefix = 'Could not add patch to project snapshot';

    if (snapshot.patches.some((patch) => patch.info.name === name)) {
      const errorMessage = `${errorPrefix}: patch with name "${name}" already exists`;
      return $EitherErrorOr.error($ErrorReport.make(errorMessage));
    }

    const patchOrError = await $Patch.createFromDirectory({
      locationDirPath: await $Resource.path(snapshot, PATCHES_DIR_NAME),
      name,
      sourceDirPath,
      mainFilePath,
    });
    if (patchOrError.isError) {
      const errorMessage = `${errorPrefix}: failed to create patch "${name}"`;
      return $EitherErrorOr.error(patchOrError.error.extend(errorMessage));
    }

    const patches = [...snapshot.patches, patchOrError.value];

    return $EitherErrorOr.value({ ...snapshot, patches });
  },

  addPatchFromFile: async (
    snapshot: ProjectSnapshot,
    {
      name,
      filePath,
    }: {
      name: string;
      filePath: string;
    },
  ): Promise<EitherErrorOr<ProjectSnapshot>> => {
    const errorPrefix = 'Could not add patch to project snapshot';

    if (snapshot.patches.some((patch) => patch.info.name === name)) {
      const errorMessage = `${errorPrefix}: patch with name "${name}" already exists`;
      return $EitherErrorOr.error($ErrorReport.make(errorMessage));
    }

    const patchOrError = await $Patch.createFromFile({
      locationDirPath: await $Resource.path(snapshot, PATCHES_DIR_NAME),
      name,
      filePath,
    });
    if (patchOrError.isError) {
      const errorMessage = `${errorPrefix}: failed to create patch "${name}"`;
      return $EitherErrorOr.error(patchOrError.error.extend(errorMessage));
    }

    const patches = [...snapshot.patches, patchOrError.value];

    return $EitherErrorOr.value({ ...snapshot, patches });
  },

  removePatch: async (
    snapshot: ProjectSnapshot,
    patchName: string,
  ): Promise<EitherErrorOr<ProjectSnapshot>> => {
    const errorPrefix = 'Could not remove patch from project snapshot';

    const patch = snapshot.patches.find(
      (patch) => patch.info.name === patchName,
    );

    if (!patch) {
      const errorMessage = `${errorPrefix}: patch "${patchName}" does not exist`;
      return $EitherErrorOr.error($ErrorReport.make(errorMessage));
    }

    const error = await $Patch.remove(patch);
    if (error) {
      const errorMessage = `${errorPrefix}: failed to remove patch "${patchName}"`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    const patches = snapshot.patches.filter(
      (patch) => patch.info.name !== patchName,
    );

    return $EitherErrorOr.value({ ...snapshot, patches });
  },

  // #endregion Patches
};
