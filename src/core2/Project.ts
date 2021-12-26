import { z } from 'zod';
import { $EitherErrorOr, EitherErrorOr } from '../utils/EitherErrorOr';
import { ErrorReport } from '../utils/ErrorReport';
import { $FileSystem } from '../utils/FileSystem';
import Patch from './Patch';
import ProjectSnapshot from './ProjectSnapshot';
import Resource from './Resource';
import { Toolchain } from './Toolchain';

// #region Info

const ProjectInfoSchema = z.object({
  name: z.string(),
  author: z.string(),
});

export type ProjectInfo = z.infer<typeof ProjectInfoSchema>;

// #endregion Info

export default class Project {
  private resource: Resource<ProjectInfo>;
  private latest: ProjectSnapshot;
  private backups: ProjectSnapshot[];

  private static LATEST_DIR_NAME = 'latest';
  private static BACKUPS_DIR_NAME = 'backups';

  private constructor({
    resource,
    latest,
    backups,
  }: {
    resource: Resource<ProjectInfo>;
    latest: ProjectSnapshot;
    backups: ProjectSnapshot[];
  }) {
    this.resource = resource;
    this.latest = latest;
    this.backups = backups;
  }

  // #region Constructors

  static async createFromSource({
    name,
    author,
    locationDirPath,
    romFilePath,
  }: {
    name: string;
    author: string;
    locationDirPath: string;
    romFilePath: string;
  }): Promise<EitherErrorOr<Project>> {
    const errorPrefix = 'Project.createFromSource';
    let error: ErrorReport | undefined;

    const info = { name, author };
    const resourceOrError = await Resource.create(locationDirPath, name, info);
    if (resourceOrError.isError) {
      const errorMessage = `${errorPrefix}: failed to create resource`;
      return $EitherErrorOr.error(resourceOrError.error.extend(errorMessage));
    }
    const resource = resourceOrError.value;

    // Create latest snapshot
    const latest = await ProjectSnapshot.create({
      locationDirPath: resource.getDirectoryPath(),
      romFilePath,
      name: Project.LATEST_DIR_NAME,
    });
    if (latest.isError) {
      await resource.delete();
      const errorMessage = `${errorPrefix}: failed to create latest snapshot`;
      return $EitherErrorOr.error(latest.error.extend(errorMessage));
    }

    // Create backups
    const backupsDirectory = await resource.path(Project.BACKUPS_DIR_NAME);
    const backups: ProjectSnapshot[] = [];
    if ((error = await $FileSystem.createDirectory(backupsDirectory))) {
      await resource.delete();
      const errorMessage = `${errorPrefix}: failed to create backups directory`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Create project
    return $EitherErrorOr.value(
      new Project({
        resource,
        latest: latest.value,
        backups,
      }),
    );
  }

  static async open({
    directoryPath,
  }: {
    directoryPath: string;
  }): Promise<EitherErrorOr<Project>> {
    const errorPrefix = 'Project.open';

    const resourceOrError = await Resource.open(
      directoryPath,
      ProjectInfoSchema,
    );
    if (resourceOrError.isError) {
      const errorMessage = `${errorPrefix}: failed to open project info`;
      return $EitherErrorOr.error(resourceOrError.error.extend(errorMessage));
    }
    const resource = resourceOrError.value;

    const latestDirectoryPath = await resource.path(Project.LATEST_DIR_NAME);
    const latest = await ProjectSnapshot.open({
      directoryPath: latestDirectoryPath,
    });
    if (latest.isError) {
      const errorMessage = `${errorPrefix}: failed to open latest snapshot`;
      return $EitherErrorOr.error(latest.error.extend(errorMessage));
    }

    const backups: ProjectSnapshot[] = [];

    return $EitherErrorOr.value(
      new Project({
        resource,
        latest: latest.value,
        backups,
      }),
    );
  }

  // #endregion Constructors

  // #region Latest Snapshot

  static getLatestDeps = ['Project.latest'];
  getLatest = (): ProjectSnapshot => {
    return this.latest;
  };

  // #endregion Latest Snapshot

  // #region Info

  static getInfoDeps = ['Project.info'];
  getInfo = (): ProjectInfo => {
    return this.resource.getInfo();
  };

  static setInfoTriggers = ['Project.info'];
  setInfo = async (info: ProjectInfo): Promise<ErrorReport | undefined> => {
    const errorMessage = 'Project.setInfo: failed to set info';
    const maybeError = await this.resource.setInfo(info);
    return maybeError ? maybeError.extend(errorMessage) : undefined;
  };

  // #endregion Info

  // #region Generic

  // async openInLunarMagic(
  //   toolchain: Toolchain,
  // ): Promise<ErrorReport | undefined> {
  //   const errorMessage = 'Could not open project in Lunar Magic';
  //   const maybeError = await this.latest.openInLunarMagic(toolchain);
  //   return maybeError ? maybeError.extend(errorMessage) : undefined;
  // }

  // async launchInEmulator(
  //   toolchain: Toolchain,
  // ): Promise<ErrorReport | undefined> {
  //   const errorMessage = 'Could not open project in emulator';
  //   const maybeError = await this.latest.launchInEmulator(toolchain);
  //   return maybeError ? maybeError.extend(errorMessage) : undefined;
  // }

  // #endregion Generic

  // #region Patches

  // static getPatchesDeps = ['Project.patches'];
  // getPatches(): Patch[] {
  //   return this.latest.getPatches();
  // }

  // static addPatchFromDirectoryTriggers = ['Project.patches'];
  // async addPatchFromDirectory(
  //   ...args: Parameters<ProjectSnapshot['addPatchFromDirectory']>
  // ): Promise<ErrorReport | undefined> {
  //   const errorMessage = `Project.addPatchFromDirectory: failed to create patch for latest snapshot`;
  //   const maybeError = await this.latest.addPatchFromDirectory(...args);
  //   return maybeError ? maybeError.extend(errorMessage) : undefined;
  // }

  // static addPatchFromFileTriggers = ['Project.patches'];
  // async addPatchFromFile(
  //   ...args: Parameters<ProjectSnapshot['addPatchFromFile']>
  // ): Promise<ErrorReport | undefined> {
  //   const errorMessage = `Project.addPatchFromFile: failed to create patch for latest snapshot`;
  //   const maybeError = await this.latest.addPatchFromFile(...args);
  //   return maybeError ? maybeError.extend(errorMessage) : undefined;
  // }

  // static removePatchTriggers = ['Project.patches'];
  // async removePatch(
  //   ...args: Parameters<ProjectSnapshot['removePatch']>
  // ): Promise<ErrorReport | undefined> {
  //   const errorMessage = `Project.removePatch: failed to remove patch for latest snapshot`;
  //   const maybeError = await this.latest.removePatch(...args);
  //   return maybeError ? maybeError.extend(errorMessage) : undefined;
  // }

  // #endregion Patches
}
