import { getter, setter } from '../utils/Accessors';
import { $DateTime, DateTimeFormat } from '../utils/DateTime';
import { $EitherErrorOr, EitherErrorOr } from '../utils/EitherErrorOr';
import ErrorReport from '../utils/ErrorReport';
import { $FileSystem } from '../utils/FileSystem';

export interface ReleaseInfo {
  name: string;
  creationDate: Date;
  version: string;
}

export default class Release {
  private _path: string;

  private _info: ReleaseInfo;
  private _credits: string;

  static compareLt(release1: Release, release2: Release) {
    if (release1._info.creationDate < release2._info.creationDate) return -1;
    if (release1._info.creationDate > release2._info.creationDate) return 1;
    return 0;
  }

  static compareGt(release1: Release, release2: Release) {
    if (release1._info.creationDate < release2._info.creationDate) return 1;
    if (release1._info.creationDate > release2._info.creationDate) return -1;
    return 0;
  }

  private constructor(
    directoryPath: string,
    info: ReleaseInfo,
    credits: string,
  ) {
    this._path = directoryPath;
    this._info = info;
    this._credits = credits;
  }

  static async createFromFiles(
    directoryPath: string,
    files: { romFilePath: string },
    info: ReleaseInfo,
    credits: string,
  ): Promise<EitherErrorOr<Release>> {
    let error: ErrorReport | undefined;

    const timestamp = $DateTime.formatDate(
      info.creationDate,
      DateTimeFormat.Timestamp,
    );

    const name = `${timestamp}-${info.version}`;
    const path = await $FileSystem.join(directoryPath, name);
    const romFilePath = await $FileSystem.join(path, `${info.name}.bps`);
    const creditsFilePath = await $FileSystem.join(path, `credits.txt`);

    if (!(await $FileSystem.exists(files.romFilePath))) {
      const errorMessage = `Release.createFromFiles: file "${files.romFilePath}" does not exist`;
      return $EitherErrorOr.error(ErrorReport.from(errorMessage));
    }

    if (await $FileSystem.exists(path)) {
      const errorMessage = `Release.createFromFiles: file "${path}" already exists`;
      return $EitherErrorOr.error(ErrorReport.from(errorMessage));
    }

    if ((error = await $FileSystem.createDirectory(path))) {
      const errorMessage = `Release.createFromFiles: failed to create release directory`;
      return $EitherErrorOr.error(ErrorReport.from(errorMessage));
    }

    // TODO: Invoke Flips instead of copying the ROM file.
    if ((error = await $FileSystem.copyFile(files.romFilePath, romFilePath))) {
      await $FileSystem.removeDir(path);
      const errorMessage = `Release.createFromFiles: failed to copy "${files.romFilePath}" to "${romFilePath}"`;
      return $EitherErrorOr.error(ErrorReport.from(errorMessage));
    }

    if ((error = await $FileSystem.writeFile(creditsFilePath, credits))) {
      await $FileSystem.removeDir(path);
      const errorMessage = `Release.createFromFiles: failed to create credits`;
      return $EitherErrorOr.error(ErrorReport.from(errorMessage));
    }

    const release = new Release(path, info, credits);
    return $EitherErrorOr.value(release);
  }

  static async openFromId(
    directoryPath: string,
    id: string,
  ): Promise<EitherErrorOr<Release>> {
    const errorPrefix = `Release.openFromId:`;

    const path = await $FileSystem.join(directoryPath, id);
    const [timestamp, version] = id.split('-');

    if (!timestamp || !version) {
      const errorMessage = `${errorPrefix}: invalid file name "${id}"`;
      return $EitherErrorOr.error(ErrorReport.from(errorMessage));
    }

    if (!$DateTime.isTimestamp(timestamp)) {
      const errorMessage = `${errorPrefix}: invalid timestamp "${timestamp}"`;
      return $EitherErrorOr.error(ErrorReport.from(errorMessage));
    }

    const fileNames = await $FileSystem.getFileNames(path);
    const bpsFileName = fileNames.find((fileName) => fileName.endsWith('.bps'));
    if (!bpsFileName) {
      const errorMessage = `${errorPrefix}: no BPS file found`;
      return $EitherErrorOr.error(ErrorReport.from(errorMessage));
    }

    const creditsFilePath = await $FileSystem.join(path, 'credits.txt');
    let credits: string = '';
    if (await $FileSystem.exists(creditsFilePath)) {
      const errorOrCredits = await $FileSystem.readFile(creditsFilePath);
      if (errorOrCredits.isError) {
        const errorMessage = `${errorPrefix}: failed to read credits file`;
        return $EitherErrorOr.error(errorOrCredits.error.extend(errorMessage));
      }
      credits = errorOrCredits.value;
    }

    const release = new Release(
      path,
      {
        name: bpsFileName.slice(0, -4),
        creationDate: $DateTime.fromTimestamp(timestamp),
        version,
      },
      credits,
    );
    return $EitherErrorOr.value(release);
  }

  getId = getter(['info'], (): string => {
    const timestamp = $DateTime.formatDate(
      this._info.creationDate,
      DateTimeFormat.Timestamp,
    );
    return `${timestamp}-${this._info.version}`;
  });

  getInfo = getter(['info'], (): ReleaseInfo => {
    return this._info;
  });

  setInfo = setter(
    ['info', 'path'],
    async (info: ReleaseInfo): Promise<ErrorReport | undefined> => {
      let error: ErrorReport | undefined;

      const oldTimestamp = $DateTime.formatDate(
        this._info.creationDate,
        DateTimeFormat.Timestamp,
      );

      const newTimestamp = $DateTime.formatDate(
        info.creationDate,
        DateTimeFormat.Timestamp,
      );

      const oldId = `${oldTimestamp}-${this._info.version}`;
      const newId = `${newTimestamp}-${info.version}`;

      if (oldId === newId && this._info.version === info.version) {
        return undefined;
      }

      const newPath = await $FileSystem.join(
        $FileSystem.dirpath(this._path),
        newId,
      );

      if (!(await $FileSystem.exists(this._path))) {
        const errorMessage = `Release.setInfo: file "${this._path}" does not exist`;
        return ErrorReport.from(errorMessage);
      }

      if (await $FileSystem.exists(newPath)) {
        const errorMessage = `Release.setInfo: file "${newPath}" already exists`;
        return ErrorReport.from(errorMessage);
      }

      if ((error = await $FileSystem.rename(this._path, newPath))) {
        const errorMessage = `Release.setInfo: failed to copy "${this._path}" to "${newPath}"`;
        return ErrorReport.from(errorMessage);
      }

      if (this._info.name !== info.name) {
        const oldRomFilePath = await $FileSystem.join(
          this._path,
          this._info.name,
        );
        const newRomFilePath = await $FileSystem.join(this._path, info.name);
        if (
          (error = await $FileSystem.rename(oldRomFilePath, newRomFilePath))
        ) {
          const errorMessage = `Release.setInfo: failed to rename "${this._path}" to "${newPath}"`;
          return ErrorReport.from(errorMessage);
        }
      }

      this._info = info;
      this._path = newPath;
    },
  );

  delete = async (): Promise<ErrorReport | undefined> => {
    let error: ErrorReport | undefined;

    if (!(await $FileSystem.exists(this._path))) {
      const errorMessage = `Release.delete: file "${this._path}" does not exist`;
      return ErrorReport.from(errorMessage);
    }

    if ((error = await $FileSystem.removeDir(this._path))) {
      const errorMessage = `Release.delete: failed to remove "${this._path}"`;
      return ErrorReport.from(errorMessage);
    }
  };
}
