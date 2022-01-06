import { ZodType } from 'zod';
import { getter, setter } from '../utils/Accessors';
import { $EitherErrorOr, EitherErrorOr } from '../utils/EitherErrorOr';
import { ErrorReport } from '../utils/ErrorReport';
import { $FileSystem } from '../utils/FileSystem';
import { $Serialization } from '../utils/Serialization';

export interface ResourceFields<Info> {
  path?: string;
  directoryPath: string;
  name: string;
  info: Info;
}

export default abstract class Resource<Info> {
  public abstract readonly TypeName: string;

  private _path: string;
  private _directoryPath: string;
  private _name: string;
  private _info: Info;

  private static INFO_FILE_NAME = 'info.json';

  // #region Private

  private static async loadInfo<Info>(
    path: string,
    infoSchema: ZodType<Info>,
  ): Promise<EitherErrorOr<Info>> {
    const infoFilePath = await $FileSystem.join(path, this.INFO_FILE_NAME);
    const dataOrError = await $Serialization.load(infoFilePath, infoSchema);
    if (dataOrError.isError) {
      const errorMessage = 'Resource.loadInfo: failed to load info';
      return $EitherErrorOr.error(dataOrError.error.extend(errorMessage));
    }
    return dataOrError;
  }

  private static async saveInfo<Info>(
    path: string,
    info: Info,
  ): Promise<ErrorReport | undefined> {
    const infoFilePath = await $FileSystem.join(path, this.INFO_FILE_NAME);
    const error = await $Serialization.save(infoFilePath, info);
    if (error) {
      const errorMessage = 'Resource.saveInfo: failed to save info';
      return error.extend(errorMessage);
    }
  }

  constructor({ path, directoryPath, name, info }: ResourceFields<Info>) {
    this._path = path ?? '';
    this._directoryPath = directoryPath;
    this._name = name;
    this._info = info;
  }

  // #endregion

  /**
   * Open a resource's info.
   */
  protected static async load<Info>(
    path: string,
    infoSchema: ZodType<Info>,
  ): Promise<EitherErrorOr<ResourceFields<Info>>> {
    const errorPrefix = `Resource.load`;
    let error: ErrorReport | undefined;

    const directoryPath = $FileSystem.dirpath(path);
    const name = $FileSystem.basename(path);

    if ((error = await $FileSystem.validateExistsDir(path))) {
      const errorMessage = `${errorPrefix}: directory does not exist`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    const eitherErrorOrInfo = await Resource.loadInfo(path, infoSchema);
    if (eitherErrorOrInfo.isError) {
      const errorMessage = `${errorPrefix}: failed to load info`;
      return $EitherErrorOr.error(eitherErrorOrInfo.error.extend(errorMessage));
    }

    const info = eitherErrorOrInfo.value;
    return $EitherErrorOr.value({ path, directoryPath, name, info });
  }

  /**
   * Create a directory for the resource, along with its info file.
   */
  protected save = async (): Promise<ErrorReport | undefined> => {
    const errorPrefix = `${this.TypeName}.save`;
    let error: ErrorReport | undefined;

    this._path = await $FileSystem.join(this._directoryPath, this._name);

    // Validation
    if ((error = await $FileSystem.validateIsValidName(this._name))) {
      const errorMessage = `${errorPrefix}: name is not valid`;
      return error.extend(errorMessage);
    }

    if ((error = await $FileSystem.validateExistsDir(this._directoryPath))) {
      const errorMessage = `${errorPrefix}: destination directory does not exist`;
      return error.extend(errorMessage);
    }

    if ((error = await $FileSystem.validateNotExists(this._path))) {
      const errorMessage = `${errorPrefix}: resource with this name already exists in destination directory`;
      return error.extend(errorMessage);
    }

    // Create directory
    if ((error = await $FileSystem.createDirectory(this._path))) {
      const errorMessage = `${errorPrefix}: failed to create directory`;
      return error.extend(errorMessage);
    }

    // Create info file
    if ((error = await Resource.saveInfo(this._path, this._info))) {
      await $FileSystem.removeDir(this._path);
      const errorMessage = `${errorPrefix}: failed to save info`;
      return error.extend(errorMessage);
    }
  };

  /**
   * Delete a resource and its directory.
   *
   * @returns `undefined` if the resource was removed successfully, an error
   * otherwise.
   */
  delete = async (): Promise<ErrorReport | undefined> => {
    const error = await $FileSystem.removeDir(this._path);
    if (error) {
      const errorMessage = `${this.TypeName}.delete: failed to delete resource`;
      return error.extend(errorMessage);
    }
  };

  /**
   * Rename the resource, moving the directory.
   *
   * @param name New name of the resource.
   * @returns `undefined` if the resource was removed successfully, an error
   * otherwise.
   */
  rename = setter(
    ['name', 'path'],
    async (name: string): Promise<ErrorReport | undefined> => {
      const errorPrefix = `${this.TypeName}.rename`;
      let error: ErrorReport | undefined;

      const path = await $FileSystem.join(this._directoryPath, name);

      if ((error = await $FileSystem.validateIsValidName(name))) {
        const errorMessage = `${errorPrefix}: name is not valid`;
        return error.extend(errorMessage);
      }

      if ((error = await $FileSystem.validateExistsDir(this._path))) {
        const errorMessage = `${errorPrefix}: this resource does not exist`;
        return error.extend(errorMessage);
      }

      if ((error = await $FileSystem.validateNotExists(path))) {
        const errorMessage = `${errorPrefix}: resource with new name already exists`;
        return error.extend(errorMessage);
      }

      if ((error = await $FileSystem.rename(this._path, path))) {
        const errorMessage = `${errorPrefix}: failed to rename resource`;
        return error.extend(errorMessage);
      }

      this._path = path;
      this._name = name;
      return undefined;
    },
  );

  /**
   * Move the resource to another directory.
   *
   * @param name New directory containing the resource.
   * @returns `undefined` if the resource was moved successfully, an error
   * otherwise.
   */
  move = setter(
    ['directoryPath', 'path'],
    async (directoryPath: string): Promise<ErrorReport | undefined> => {
      const errorPrefix = `${this.TypeName}.move`;
      let error: ErrorReport | undefined;

      const path = await $FileSystem.join(directoryPath, this._name);

      if ((error = await $FileSystem.validateExistsDir(this._path))) {
        const errorMessage = `${errorPrefix}: this resource does not exist`;
        return error.extend(errorMessage);
      }

      if ((error = await $FileSystem.validateExistsDir(directoryPath))) {
        const errorMessage = `${errorPrefix}: the destination directory does not exist`;
        return error.extend(errorMessage);
      }

      if ((error = await $FileSystem.validateNotExists(path))) {
        const errorMessage = `${errorPrefix}: resource with this name already exists in destination directory`;
        return error.extend(errorMessage);
      }

      if ((error = await $FileSystem.rename(this._path, path))) {
        const errorMessage = `${errorPrefix}: failed to rename resource`;
        return error.extend(errorMessage);
      }

      this._path = path;
      this._directoryPath = directoryPath;
      return undefined;
    },
  );

  /**
   * Get path to the resource.
   *
   * @returns The path of the resource.
   */
  getPath = getter(['directoryPath', 'name', 'path'], (): string => {
    return this._path;
  });

  /**
   * Join current path with given name(s).
   *
   * @param names Name(s) of a directory or file.
   * @returns The path to the directory or file.
   */
  getSubPath = getter(
    ['directoryPath', 'name', 'path'],
    async (...names: string[]): Promise<string> => {
      return await $FileSystem.join(this._path, ...names);
    },
  );

  /**
   * Get the info of the resource. The info should be a valid JSON object.
   *
   * @returns The info of the resource.
   */
  getName = getter(['name'], (): string => {
    return this._name;
  });

  /**
   * Get the info of the resource. The info should be a valid JSON object.
   *
   * @returns The info of the resource.
   */
  getInfo = getter(['info'], (): Info => {
    return this._info;
  });

  /**
   * Update the info of a resource.
   *
   * @param info The new info of the resource.
   * @returns The updated resource, with the new info.
   */
  setInfo = setter(
    ['info'],
    async (info: Info): Promise<ErrorReport | undefined> => {
      const errorPrefix = `${this.TypeName}.setInfo`;
      let error: ErrorReport | undefined;

      if ((error = await Resource.saveInfo(this._path, info))) {
        const errorMessage = `${errorPrefix}: failed to save info`;
        return error.extend(errorMessage);
      }

      this._info = info;
    },
  );
}
