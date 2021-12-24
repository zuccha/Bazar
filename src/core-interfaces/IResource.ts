import { z, ZodType } from 'zod';
import { $EitherErrorOr, EitherErrorOr } from '../utils/EitherErrorOr';
import { ErrorReport } from '../utils/ErrorReport';
import { $FileSystem } from '../utils/FileSystem';
import { $Serialization } from '../utils/Serialization';

export interface IResource<T> {
  readonly info: T;
  readonly directoryPath: string;
}

/**
 * A resource is a directory containing an info.json file.
 */
export const $IResource = {
  implement: <InfoSchema>({
    label,
    infoSchema,
  }: {
    label: string;
    infoSchema: ZodType<InfoSchema>;
  }) => {
    type Info = z.infer<typeof infoSchema>;

    // PRIVATE

    const INFO_FILE_NAME = 'info.json';

    const loadInfo = async (
      directoryPath: string,
    ): Promise<EitherErrorOr<Info>> => {
      const infoFilePath = await $FileSystem.join(
        directoryPath,
        INFO_FILE_NAME,
      );
      const dataOrError = await $Serialization.load(infoFilePath, infoSchema);
      if (dataOrError.isError) {
        const errorMessage = `Could not load ${label} info`;
        return $EitherErrorOr.error(dataOrError.error.extend(errorMessage));
      }
      return dataOrError;
    };

    const saveInfo = async (
      directoryPath: string,
      info: Info,
    ): Promise<ErrorReport | undefined> => {
      const infoFilePath = await $FileSystem.join(
        directoryPath,
        INFO_FILE_NAME,
      );
      const error = await $Serialization.save(infoFilePath, info);
      if (error) {
        const errorMessage = `Could not save ${label} info`;
        return error.extend(errorMessage);
      }
    };

    // PUBLIC

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
    const create = async (
      locationDirPath: string,
      name: string,
      info: Info,
    ): Promise<EitherErrorOr<IResource<Info>>> => {
      const errorPrefix = `Could not create ${label}`;
      let error: ErrorReport | undefined;
      const resource = {
        directoryPath: await $FileSystem.join(locationDirPath, name),
        info,
      };

      // Validation
      if ((error = await $FileSystem.validateIsValidName(name))) {
        const errorMessage = `${errorPrefix}: name is not valid`;
        return $EitherErrorOr.error(error.extend(errorMessage));
      }

      if ((error = await $FileSystem.validateExistsDir(locationDirPath))) {
        const errorMessage = `${errorPrefix}: location does not exist`;
        return $EitherErrorOr.error(error.extend(errorMessage));
      }

      if (
        (error = await $FileSystem.validateNotExists(resource.directoryPath))
      ) {
        const errorMessage = `${errorPrefix}: resource already exists`;
        return $EitherErrorOr.error(error.extend(errorMessage));
      }

      // Create directory
      if ((error = await $FileSystem.createDirectory(resource.directoryPath))) {
        const errorMessage = `${errorPrefix}: failed to create directory`;
        return $EitherErrorOr.error(error.extend(errorMessage));
      }

      // Create info file
      if ((error = await saveInfo(resource.directoryPath, resource.info))) {
        await $FileSystem.removeDir(resource.directoryPath);
        const errorMessage = `${errorPrefix}: failed to save info`;
        return $EitherErrorOr.error(error.extend(errorMessage));
      }

      // Return resource
      return $EitherErrorOr.value(resource);
    };

    /**
     * Open a resource, given its directory.
     *
     * @param directoryPath Directory of the resource. It must contain an info.json
     * file that contains the correct info.
     * @returns A resource, or an error if there is any problem opening the info
     * file.
     */
    const open = async (
      directoryPath: string,
    ): Promise<EitherErrorOr<IResource<Info>>> => {
      const errorPrefix = `Could not open ${label}`;
      let error: ErrorReport | undefined;

      if ((error = await $FileSystem.validateExistsDir(directoryPath))) {
        const errorMessage = `${errorPrefix}: directory does not exist`;
        return $EitherErrorOr.error(error.extend(errorMessage));
      }

      const info = await loadInfo(directoryPath);
      if (info.isError) {
        const errorMessage = `${errorPrefix}: failed to load info`;
        return $EitherErrorOr.error(info.error.extend(errorMessage));
      }

      return $EitherErrorOr.value({
        info: info.value,
        directoryPath,
      });
    };

    /**
     * Remove a resource and its directory.
     *
     * @param resource The resource to remove.
     * @returns `undefined` if the resource was removed successfully, an error
     * otherwise.
     */
    const remove = async (
      resource: IResource<Info>,
    ): Promise<ErrorReport | undefined> => {
      return await $FileSystem.removeDir(resource.directoryPath);
    };

    /**
     * Join current directory with given name.
     *
     * @param resource Self.
     * @param name Name of a directory or file.
     * @returns The path to the directory or file.
     */
    const path = async (
      resource: IResource<Info>,
      name: string,
    ): Promise<string> => await $FileSystem.join(resource.directoryPath, name);

    /**
     * Create instance methods for the resource.
     */
    const inherit = <Resource extends IResource<Info>>() => ({
      /**
       * Get the info of the resource. The info should be a valid JSON object.
       *
       * @param resource Self.
       * @returns The info of the resource.
       */
      getInfo: (resource: Resource): Info => resource.info,

      /**
       * Update the info of a resource.
       *
       * @param resource Self.
       * @param info The new info of the resource.
       * @returns The updated resource, with the new info.
       */
      setInfo: async (
        resource: Resource,
        info: Info,
      ): Promise<EitherErrorOr<Resource>> => {
        const error = await saveInfo(resource.directoryPath, info);
        return error
          ? $EitherErrorOr.error(error)
          : $EitherErrorOr.value({ ...resource, info });
      },
    });

    // Return the interface.
    return {
      inherit,
      create,
      open,
      remove,
      path,
    };
  },
};
