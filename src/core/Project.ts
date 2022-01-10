import { z } from 'zod';
import { getter, setter } from '../utils/Accessors';
import { $DateTime } from '../utils/DateTime';
import { $EitherErrorOr, EitherErrorOr } from '../utils/EitherErrorOr';
import ErrorReport from '../utils/ErrorReport';
import { $FileSystem } from '../utils/FileSystem';
import ProjectSnapshot from './ProjectSnapshot';
import Release, { ReleaseInfo } from './Release';
import Resource, { ResourceFields } from './Resource';

// #region Info

const infoSchema = z.object({
  name: z.string(),
  author: z.string(),
  version: z.string(),
});

export type ProjectInfo = z.infer<typeof infoSchema>;

// #endregion Info

export default class Project extends Resource<ProjectInfo> {
  public readonly TypeName = 'Project';

  private latest!: ProjectSnapshot;
  private backups!: string[];
  private releases!: Release[];

  private static LATEST_DIR_NAME = 'latest';
  private static BACKUPS_DIR_NAME = 'backups';
  private static RELEASES_DIR_NAME = 'releases';

  private constructor(props: ResourceFields<ProjectInfo>) {
    super(props);
  }

  // #region Constructors

  static async createFromRom(
    directoryPath: string,
    info: ProjectInfo,
    romFilePath: string,
  ): Promise<EitherErrorOr<Project>> {
    const errorPrefix = 'Project.createFromSource';
    let error: ErrorReport | undefined;

    // Resource
    const project = new Project({ directoryPath, name: info.name, info });
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

    // Create releases
    const releasesDirectory = await project.getSubPath(
      Project.RELEASES_DIR_NAME,
    );
    const releases: Release[] = [];
    if ((error = await $FileSystem.createDirectory(releasesDirectory))) {
      await project.delete();
      const errorMessage = `${errorPrefix}: failed to create releases directory`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Create project
    project.latest = errorOrLatest.value;
    project.backups = backups;
    project.releases = releases;
    return $EitherErrorOr.value(project);
  }

  static async createFromTemplate(
    directoryPath: string,
    info: ProjectInfo,
    templatePath: string,
  ): Promise<EitherErrorOr<Project>> {
    const errorPrefix = 'Project.createFromSource';
    let error: ErrorReport | undefined;

    const latestPath = await $FileSystem.join(
      directoryPath,
      info.name,
      Project.LATEST_DIR_NAME,
    );

    // Resource
    const project = new Project({ directoryPath, name: info.name, info });
    if ((error = await project.save())) {
      const errorMessage = `${errorPrefix}: failed to create resource`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Copy latest snapshot
    if ((error = await $FileSystem.copyDirectory(templatePath, latestPath))) {
      await project.delete();
      const errorMessage = `${errorPrefix}: failed to create latest snapshot`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Open latest snapshot
    const errorOrLatest = await ProjectSnapshot.open(latestPath);
    if (errorOrLatest.isError) {
      await project.delete();
      const errorMessage = `${errorPrefix}: failed to open latest snapshot`;
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

    // Create releases
    const releasesDirectory = await project.getSubPath(
      Project.RELEASES_DIR_NAME,
    );
    const releases: Release[] = [];
    if ((error = await $FileSystem.createDirectory(releasesDirectory))) {
      await project.delete();
      const errorMessage = `${errorPrefix}: failed to create releases directory`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Create project
    project.latest = errorOrLatest.value;
    project.backups = backups;
    project.releases = releases;
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
    const backupFileNames = await $FileSystem.getFileNames(
      backupsDirectoryPath,
    );
    const backups: string[] = backupFileNames
      .filter((fileName) => fileName.endsWith('.zip'))
      .map((fileName) => fileName.slice(0, -4))
      .sort($DateTime.compareTimestampsGt);

    const releasesDirectoryPath = await project.getSubPath(
      Project.RELEASES_DIR_NAME,
    );
    const releaseDirectoryNames = await $FileSystem.getDirNames(
      releasesDirectoryPath,
    );
    const releases: Release[] = [];
    console.log(releaseDirectoryNames);
    for (const releaseDirectoryName of releaseDirectoryNames) {
      const errorOrRelease = await Release.openFromId(
        releasesDirectoryPath,
        releaseDirectoryName,
      );
      if (errorOrRelease.isValue) {
        releases.push(errorOrRelease.value);
      } else {
        console.log(errorOrRelease.error);
      }
    }
    releases.sort(Release.compareGt);

    project.latest = errorOrLatest.value;
    project.backups = backups;
    project.releases = releases;
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
        return ErrorReport.from(errorMessage);
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

  // #region Releases

  // getReleases

  getReleases = getter(['releases'], (): Release[] => this.releases);

  createRelease = setter(
    ['releases'],
    async (info: ReleaseInfo): Promise<ErrorReport | undefined> => {
      // TODO: Call Flips.
      const romFilePath = await this.latest.getSubPath(
        ProjectSnapshot.ROM_FILE_NAME,
      );

      const errorOrRelease = await Release.createFromFiles(
        await this.getSubPath(Project.RELEASES_DIR_NAME),
        { romFilePath },
        info,
      );

      if (errorOrRelease.isError) {
        const errorMessage = `${this.TypeName}.createRelease: failed to create release`;
        return errorOrRelease.error.extend(errorMessage);
      }

      this.releases.push(errorOrRelease.value);
      this.releases.sort(Release.compareGt);
    },
  );

  deleteRelease = setter(
    ['releases'],
    async (release: Release): Promise<ErrorReport | undefined> => {
      const errorPrefix = `${this.TypeName}.deleteRelease`;
      let error: ErrorReport | undefined;

      const releaseIndex = this.releases.indexOf(release);
      if (releaseIndex === -1) {
        const errorMessage = `${errorPrefix}: release not found`;
        return ErrorReport.from(errorMessage);
      }

      if ((error = await release.delete())) {
        const errorMessage = `${errorPrefix}: failed to remove release`;
        return error.extend(errorMessage);
      }

      this.releases.splice(releaseIndex, 1);
    },
  );

  editRelease = setter(
    ['releases'],
    async (
      release: Release,
      info: ReleaseInfo,
    ): Promise<ErrorReport | undefined> => {
      const errorPrefix = `${this.TypeName}.editRelease`;
      let error: ErrorReport | undefined;

      const releaseIndex = this.releases.indexOf(release);
      if (releaseIndex === -1) {
        const errorMessage = `${errorPrefix}: release not found`;
        return ErrorReport.from(errorMessage);
      }

      if ((error = await release.setInfo(info))) {
        const errorMessage = `${errorPrefix}: failed to edit release`;
        return error.extend(errorMessage);
      }

      this.releases.sort(Release.compareGt);
    },
  );

  // #endregion Releases

  // #region Latest

  getLatest = getter(['latest'], (): ProjectSnapshot => {
    return this.latest;
  });

  // #endregion Latest
}
