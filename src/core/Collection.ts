import { getter, setter } from '../utils/Accessors';
import { ErrorReport } from '../utils/ErrorReport';
import { $FileSystem } from '../utils/FileSystem';
import ProjectSnapshot from './ProjectSnapshot';

export default class Collection {
  private _directoryPath: string;
  private _projectSnapshotNames: string[];

  private static PROJECT_SNAPSHOTS_DIR_NAME = 'projectSnapshots';

  private constructor() {
    this._directoryPath = '';
    this._projectSnapshotNames = [];
  }

  static create(): Collection {
    return new Collection();
  }

  load = setter(
    ['projectSnapshots'],
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
        const projectNames = await $FileSystem.getFileNames(
          projectSnapshotsDirectory,
        );
        this._projectSnapshotNames = projectNames;
      }
    },
  );

  private getSubPath = getter(
    ['directoryPath'],
    async (path: string): Promise<string> => {
      return await $FileSystem.join(this._directoryPath, path);
    },
  );

  getProjectSnapshotNames = getter(['projectSnapshots'], (): string[] => {
    return this._projectSnapshotNames;
  });

  addProjectSnapshot = setter(
    ['projectSnapshots'],
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

      this._projectSnapshotNames.push(projectSnapshot.getName());
    },
  );
}
