import { z } from 'zod';
import { getter, setter } from '../utils/Accessors';
import { $DateTime } from '../utils/DateTime';
import { $EitherErrorOr, EitherErrorOr } from '../utils/EitherErrorOr';
import { $ErrorReport, ErrorReport } from '../utils/ErrorReport';
import { $FileSystem } from '../utils/FileSystem';
import ProjectSnapshot from './ProjectSnapshot';
import Resource, { ResourceFields } from './Resource';

// #region Info

const infoSchema = z.object({
  name: z.string(),
  author: z.string(),
});

export type ProjectInfo = z.infer<typeof infoSchema>;

// #endregion Info

export default class Project extends Resource<ProjectInfo> {
  public readonly TypeName = 'Project';

  private latest!: ProjectSnapshot;
  private backups!: string[];

  private static LATEST_DIR_NAME = 'latest';
  private static BACKUPS_DIR_NAME = 'backups';

  private constructor(props: ResourceFields<ProjectInfo>) {
    super(props);
  }

  // #region Constructors

  static async createFromSource(
    directoryPath: string,
    {
      name,
      author,
      romFilePath,
    }: {
      name: string;
      author: string;
      romFilePath: string;
    },
  ): Promise<EitherErrorOr<Project>> {
    const errorPrefix = 'Project.createFromSource';
    let error: ErrorReport | undefined;

    // Resource
    const info = { name, author };
    const project = new Project({ directoryPath, name, info });
    if ((error = await project.save())) {
      const errorMessage = `${errorPrefix}: failed to create resource`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Create latest snapshot
    const errorOrLatest = await ProjectSnapshot.create(project.getPath(), {
      romFilePath,
      name: Project.LATEST_DIR_NAME,
    });
    if (errorOrLatest.isError) {
      await project.delete();
      const errorMessage = `${errorPrefix}: failed to create latest snapshot`;
      return $EitherErrorOr.error(errorOrLatest.error.extend(errorMessage));
    }

    // Create backups
    const backupsDirectory = await project.getSubPath(Project.BACKUPS_DIR_NAME);
    const backups: string[] = [];
    if ((error = await $FileSystem.createDirectory(backupsDirectory))) {
      await project.delete();
      const errorMessage = `${errorPrefix}: failed to create backups directory`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Create project
    project.latest = errorOrLatest.value;
    project.backups = backups;
    return $EitherErrorOr.value(project);
  }

  static async open(path: string): Promise<EitherErrorOr<Project>> {
    const errorPrefix = 'Project.open';

    const errorOrFields = await Resource.load(path, infoSchema);
    if (errorOrFields.isError) {
      const errorMessage = `${errorPrefix}: failed to open patch info`;
      return $EitherErrorOr.error(errorOrFields.error.extend(errorMessage));
    }
    const project = new Project(errorOrFields.value);

    const latestDirectoryPath = await project.getSubPath(
      Project.LATEST_DIR_NAME,
    );
    const errorOrLatest = await ProjectSnapshot.open(latestDirectoryPath);
    if (errorOrLatest.isError) {
      const errorMessage = `${errorPrefix}: failed to open latest snapshot`;
      return $EitherErrorOr.error(errorOrLatest.error.extend(errorMessage));
    }

    const backupsDirectoryPath = await project.getSubPath(
      Project.BACKUPS_DIR_NAME,
    );
    const fileNames = await $FileSystem.getFileNames(backupsDirectoryPath);
    const backups: string[] = fileNames
      .filter((fileName) => fileName.endsWith('.zip'))
      .map((fileName) => fileName.slice(0, -4))
      .sort($DateTime.compareTimestampsGt);

    project.latest = errorOrLatest.value;
    project.backups = backups;
    return $EitherErrorOr.value(project);
  }

  // #endregion Constructors

  // #region Backups

  getBackups = getter(['backups'], (): string[] => this.backups);

  createBackup = setter(
    ['backups'],
    async (): Promise<ErrorReport | undefined> => {
      const errorPrefix = `${this.TypeName}.createBackup`;
      let error: ErrorReport | undefined;

      const timestamp = $DateTime.timestamp();
      const backupDirectoryPath = await this.getSubPath(
        Project.BACKUPS_DIR_NAME,
        timestamp,
      );

      if ((error = await $FileSystem.validateNotExists(backupDirectoryPath))) {
        const errorMessage = `${errorPrefix}: backup directory path already exists`;
        return error.extend(errorMessage);
      }

      if (
        (error = await $FileSystem.copyDirectory(
          this.latest.getPath(),
          backupDirectoryPath,
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
    },
  );

  deleteBackup = setter(
    ['backups'],
    async (backup: string): Promise<ErrorReport | undefined> => {
      const errorPrefix = `${this.TypeName}.deleteBackup`;
      let error: ErrorReport | undefined;

      const backupFilePath = await this.getSubPath(
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
    },
  );

  restoreBackup = setter(
    ['backups', 'latest'],
    async (backup: string): Promise<ErrorReport | undefined> => {
      const errorPrefix = `${this.TypeName}.restoreBackup`;
      let error: ErrorReport | undefined;

      const backupDirPath = await this.getSubPath(
        Project.BACKUPS_DIR_NAME,
        backup,
      );

      const backupFilePath = await this.getSubPath(
        Project.BACKUPS_DIR_NAME,
        `${backup}.zip`,
      );

      if ((error = await $FileSystem.unzip(backupFilePath, backupDirPath))) {
        const errorMessage = `${errorPrefix}: Failed to unzip backup`;
        return error.extend(errorMessage);
      }

      if ((error = await $FileSystem.removeDir(this.latest.getPath()))) {
        const errorMessage = `${errorPrefix}: Failed to remove latest directory`;
        return error.extend(errorMessage);
      }

      if (
        (error = await $FileSystem.rename(backupDirPath, this.latest.getPath()))
      ) {
        const errorMessage = `${errorPrefix}: Failed to replace latest with backup`;
        return error.extend(errorMessage);
      }

      const eitherErrorOrLatest = await ProjectSnapshot.open(
        this.latest.getPath(),
      );
      if (eitherErrorOrLatest.isError) {
        const errorMessage = `${errorPrefix}: Failed to load backup`;
        return eitherErrorOrLatest.error.extend(errorMessage);
      }

      this.latest = eitherErrorOrLatest.value;
    },
  );

  // #endregion

  // #region Latest

  getLatest = getter(['latest'], (): ProjectSnapshot => {
    return this.latest;
  });

  // #endregion Latest
}
