import { z } from 'zod';
import { $DateTime } from '../utils/DateTime';
import { $EitherErrorOr, EitherErrorOr } from '../utils/EitherErrorOr';
import { $ErrorReport, ErrorReport } from '../utils/ErrorReport';
import { $FileSystem } from '../utils/FileSystem';
import ProjectSnapshot from './ProjectSnapshot';
import Resource from './Resource';

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
  private backups: string[];

  private static LATEST_DIR_NAME = 'latest';
  private static BACKUPS_DIR_NAME = 'backups';

  private constructor({
    resource,
    latest,
    backups,
  }: {
    resource: Resource<ProjectInfo>;
    latest: ProjectSnapshot;
    backups: string[];
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
    const backups: string[] = [];
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

    const backupsDirectoryPath = await resource.path(Project.BACKUPS_DIR_NAME);
    const fileNames = await $FileSystem.getFileNames(backupsDirectoryPath);
    const zipNames = fileNames
      .filter((fileName) => fileName.endsWith('.zip'))
      .map((fileName) => fileName.slice(0, -4));
    const backups: string[] = zipNames.reverse();

    return $EitherErrorOr.value(
      new Project({
        resource,
        latest: latest.value,
        backups,
      }),
    );
  }

  // #endregion Constructors

  // #region Backups

  static getBackupsDeps = ['Project.backups'];
  getBackups = (): string[] => this.backups;

  static createBackupTriggers = ['Project.backups'];
  createBackup = async (): Promise<ErrorReport | undefined> => {
    const errorPrefix = 'Project.createBackup';
    let error: ErrorReport | undefined;

    const timestamp = $DateTime.timestamp();
    const backupDirectoryPath = await this.resource.path(
      Project.BACKUPS_DIR_NAME,
      timestamp,
    );

    if ((error = await $FileSystem.validateNotExists(backupDirectoryPath))) {
      const errorMessage = `${errorPrefix}: backup directory path already exists`;
      return error.extend(errorMessage);
    }

    if (
      (error = await $FileSystem.copyDirectory(
        this.latest.getDirectoryPath(),
        backupDirectoryPath,
        true,
      ))
    ) {
      const errorMessage = `${errorPrefix}: failed to create backup directory`;
      return error.extend(errorMessage);
    }

    if ((error = await $FileSystem.zip(backupDirectoryPath))) {
      const errorMessage = `${errorPrefix}: failed to zip backup directory`;
      return error.extend(errorMessage);
    }

    if ((error = await $FileSystem.removeDir(backupDirectoryPath))) {
      const errorMessage = `${errorPrefix}: failed to remove backup directory`;
      return error.extend(errorMessage);
    }

    this.backups.unshift(timestamp);
  };

  static deleteBackupTriggers = ['Project.backups'];
  deleteBackup = async (backup: string): Promise<ErrorReport | undefined> => {
    const errorPrefix = 'Project.deleteBackup';
    let error: ErrorReport | undefined;

    const backupFilePath = await this.resource.path(
      Project.BACKUPS_DIR_NAME,
      `${backup}.zip`,
    );

    const backupIndex = this.backups.indexOf(backup);
    if (backupIndex === -1) {
      const errorMessage = `${errorPrefix}: backup not found`;
      return $ErrorReport.make(errorMessage);
    }

    this.backups.splice(backupIndex, 1);

    if ((error = await $FileSystem.removeFile(backupFilePath))) {
      const errorMessage = `${errorPrefix}: failed to remove backup directory`;
      return error.extend(errorMessage);
    }
  };

  static restoreBackupTriggers = ['Project.backups', 'Project.latest'];
  restoreBackup = async (backup: string): Promise<ErrorReport | undefined> => {
    const errorPrefix = 'Project.restoreBackup';
    let error: ErrorReport | undefined;

    const backupDirPath = await this.resource.path(
      Project.BACKUPS_DIR_NAME,
      backup,
    );

    const backupFilePath = await this.resource.path(
      Project.BACKUPS_DIR_NAME,
      `${backup}.zip`,
    );

    if ((error = await $FileSystem.unzip(backupFilePath, backupDirPath))) {
      const errorMessage = `${errorPrefix}: Failed to unzip backup`;
      return error.extend(errorMessage);
    }

    if ((error = await $FileSystem.removeDir(this.latest.getDirectoryPath()))) {
      const errorMessage = `${errorPrefix}: Failed to remove latest directory`;
      return error.extend(errorMessage);
    }

    if (
      (error = await $FileSystem.rename(
        backupDirPath,
        this.latest.getDirectoryPath(),
      ))
    ) {
      const errorMessage = `${errorPrefix}: Failed to replace latest with backup`;
      return error.extend(errorMessage);
    }

    const eitherErrorOrLatest = await ProjectSnapshot.open({
      directoryPath: this.latest.getDirectoryPath(),
    });
    if (eitherErrorOrLatest.isError) {
      const errorMessage = `${errorPrefix}: Failed to load backup`;
      return eitherErrorOrLatest.error.extend(errorMessage);
    }

    this.latest = eitherErrorOrLatest.value;
  };

  // #endregion

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
}
