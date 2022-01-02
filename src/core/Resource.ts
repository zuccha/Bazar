import { ZodType } from 'zod';
import { $EitherErrorOr, EitherErrorOr } from '../utils/EitherErrorOr';
import { ErrorReport } from '../utils/ErrorReport';
import { $FileSystem } from '../utils/FileSystem';
import { $Serialization } from '../utils/Serialization';

export default class Resource<Info> {
  private directoryPath: string;
  private info: Info;

  private static INFO_FILE_NAME = 'info.json';

  // #region Private

  static async loadInfo<Info>(
    directoryPath: string,
    infoSchema: ZodType<Info>,
  ): Promise<EitherErrorOr<Info>> {
    const infoFilePath = await $FileSystem.join(
      directoryPath,
      this.INFO_FILE_NAME,
    );
    const dataOrError = await $Serialization.load(infoFilePath, infoSchema);
    if (dataOrError.isError) {
      const errorMessage = 'Resource.loadInfo: failed to load info';
      return $EitherErrorOr.error(dataOrError.error.extend(errorMessage));
    }
    return dataOrError;
  }

  static async saveInfo<Info>(
    directoryPath: string,
    info: Info,
  ): Promise<ErrorReport | undefined> {
    const infoFilePath = await $FileSystem.join(
      directoryPath,
      this.INFO_FILE_NAME,
    );
    const error = await $Serialization.save(infoFilePath, info);
    if (error) {
      const errorMessage = 'Resource.saveInfo: failed to save info';
      return error.extend(errorMessage);
    }
  }

  private constructor({
    directoryPath,
    info,
  }: {
    directoryPath: string;
    info: Info;
  }) {
    this.directoryPath = directoryPath;
    this.info = info;
  }

  // #endregion

  /**
   * Create a directory for the resource, along its info file.
   *
   * @param locationDirPath Directory into which the resource directory will be
   * created.
   * @param name Name of the resource. This will be the name of the directory
   * that will be created in the location directory.
   * @param info Object containing the info of the resource. Can be any valid
   * JSON object.
   * @returns A resource, or an error if there is any problem creating the
   * resource, its directory, or its info file.
   */
  static async create<Info>(
    locationDirPath: string,
    name: string,
    info: Info,
  ): Promise<EitherErrorOr<Resource<Info>>> {
    const errorPrefix = `Resource.create`;
    let error: ErrorReport | undefined;
    const resource = new Resource({
      directoryPath: await $FileSystem.join(locationDirPath, name),
      info,
    });

    // Validation
    if ((error = await $FileSystem.validateIsValidName(name))) {
      const errorMessage = `${errorPrefix}: name is not valid`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    if ((error = await $FileSystem.validateExistsDir(locationDirPath))) {
      const errorMessage = `${errorPrefix}: location does not exist`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    if ((error = await $FileSystem.validateNotExists(resource.directoryPath))) {
      const errorMessage = `${errorPrefix}: resource already exists`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Create directory
    if ((error = await $FileSystem.createDirectory(resource.directoryPath))) {
      const errorMessage = `${errorPrefix}: failed to create directory`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Create info file
    if (
      (error = await Resource.saveInfo(resource.directoryPath, resource.info))
    ) {
      await $FileSystem.removeDir(resource.directoryPath);
      const errorMessage = `${errorPrefix}: failed to save info`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Return resource
    return $EitherErrorOr.value(resource);
  }

  /**
   * Open a resource, given its directory.
   *
   * @param directoryPath Directory of the resource. It must contain an info.json
   * file that contains the correct info.
   * @returns A resource, or an error if there is any problem opening the info
   * file.
   */
  static async open<Info>(
    directoryPath: string,
    infoSchema: ZodType<Info>,
  ): Promise<EitherErrorOr<Resource<Info>>> {
    const errorPrefix = `Resource.open`;
    let error: ErrorReport | undefined;

    if ((error = await $FileSystem.validateExistsDir(directoryPath))) {
      const errorMessage = `${errorPrefix}: directory does not exist`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    const info = await Resource.loadInfo(directoryPath, infoSchema);
    if (info.isError) {
      const errorMessage = `${errorPrefix}: failed to load info`;
      return $EitherErrorOr.error(info.error.extend(errorMessage));
    }

    const resource = new Resource({
      info: info.value,
      directoryPath,
    });
    return $EitherErrorOr.value(resource);
  }

  /**
   * Delete a resource and its directory.
   *
   * @returns `undefined` if the resource was removed successfully, an error
   * otherwise.
   */
  delete = async (): Promise<ErrorReport | undefined> => {
    return await $FileSystem.removeDir(this.directoryPath);
  };

  /**
   * Rename the resource, moving the directory.
   *
   * @param name New name of the resource.
   * @returns `undefined` if the resource was removed successfully, an error
   * otherwise.
   */
  rename = async (name: string): Promise<ErrorReport | undefined> => {
    const errorPrefix = `Resource.rename`;
    let error: ErrorReport | undefined;

    const parentDirectoryPath = $FileSystem.dirpath(this.directoryPath);
    const directoryPath = await $FileSystem.join(parentDirectoryPath, name);

    if ((error = await $FileSystem.validateIsValidName(name))) {
      const errorMessage = `${errorPrefix}: name is not valid`;
      return error.extend(errorMessage);
    }

    if ((error = await $FileSystem.validateExistsDir(this.directoryPath))) {
      const errorMessage = `${errorPrefix}: this resource does not exist`;
      return error.extend(errorMessage);
    }

    if ((error = await $FileSystem.validateNotExists(directoryPath))) {
      const errorMessage = `${errorPrefix}: resource with new name already exists`;
      return error.extend(errorMessage);
    }

    if ((error = await $FileSystem.rename(this.directoryPath, directoryPath))) {
      const errorMessage = `${errorPrefix}: failed to rename resource`;
      return error.extend(errorMessage);
    }

    this.directoryPath = directoryPath;
    return undefined;
  };

  /**
   * Join current directory with given name.
   *
   * @param name Name of a directory or file.
   * @returns The path to the directory or file.
   */
  path = async (name: string): Promise<string> => {
    return await $FileSystem.join(this.directoryPath, name);
  };

  /**
   * The directory of the resource.
   *
   * @returns The directory containing the resource's info file.
   */
  static getDirectoryPathDeps = ['Resource.directoryPath'];
  getDirectoryPath = (): string => {
    return this.directoryPath;
  };

  /**
   * Get the info of the resource. The info should be a valid JSON object.
   *
   * @returns The info of the resource.
   */
  static getInfoPathDeps = ['Resource.info'];
  getInfo = (): Info => {
    return this.info;
  };

  /**
   * Update the info of a resource.
   *
   * @param info The new info of the resource.
   * @returns The updated resource, with the new info.
   */
  static setInfoPathTriggers = ['Resource.info'];
  setInfo = async (info: Info): Promise<ErrorReport | undefined> => {
    const error = await Resource.saveInfo(this.directoryPath, info);
    if (error) return error;
    this.info = info;
  };
}
