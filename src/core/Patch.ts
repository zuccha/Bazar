import { z } from 'zod';
import { $EitherErrorOr, EitherErrorOr } from '../utils/EitherErrorOr';
import { ErrorReport } from '../utils/ErrorReport';
import { $FileSystem } from '../utils/FileSystem';
import Resource from './Resource';

const PatchInfoSchema = z.object({
  name: z.string(),
  author: z.string(),
  version: z.string(),
  mainFileRelativePath: z.string(),
});

export type PatchInfo = Required<z.infer<typeof PatchInfoSchema>>;

export default class Patch {
  private resource: Resource<PatchInfo>;

  private constructor({ resource }: { resource: Resource<PatchInfo> }) {
    this.resource = resource;
  }

  static async createFromDirectory({
    locationDirPath,
    name,
    author,
    version,
    sourceDirPath,
    mainFilePath,
  }: {
    locationDirPath: string;
    name: string;
    author: string;
    version: string;
    sourceDirPath: string;
    mainFilePath: string;
  }): Promise<EitherErrorOr<Patch>> {
    const errorPrefix = 'Patch.createFromDirectory';
    let error: ErrorReport | undefined;

    // Resource

    const mainFileRelativePath = await $FileSystem.computeRelativePath(
      sourceDirPath,
      mainFilePath,
    );
    const info = { name, author, version, mainFileRelativePath };
    const resourceOrError = await Resource.create(locationDirPath, name, info);
    if (resourceOrError.isError) {
      const errorMessage = `${errorPrefix}: failed to create resource`;
      return $EitherErrorOr.error(resourceOrError.error.extend(errorMessage));
    }
    const resource = resourceOrError.value;

    // Validate

    if ((error = await $FileSystem.validateExistsDir(sourceDirPath))) {
      const errorMessage = `${errorPrefix}: source directory does not exist`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    if ((error = await $FileSystem.validateExistsFile(mainFilePath))) {
      await resource.delete();
      const errorMessage = `${errorPrefix}: main file does not exist`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    if (
      (error = await $FileSystem.validateContainsFile(
        sourceDirPath,
        mainFilePath,
      ))
    ) {
      await resource.delete();
      const errorMessage = `${errorPrefix}: main file is not in source directory`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Copy files

    if (
      (error = await $FileSystem.copyDirectory(
        sourceDirPath,
        resource.getDirectoryPath(),
        true,
      ))
    ) {
      resource.delete();
      const errorMessage = `${errorPrefix}: failed to copy patch files`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Instantiate patch

    const patch = new Patch({ resource });
    return $EitherErrorOr.value(patch);
  }

  static async createFromFile({
    locationDirPath,
    name,
    author,
    version,
    filePath,
  }: {
    locationDirPath: string;
    name: string;
    author: string;
    version: string;
    filePath: string;
  }): Promise<EitherErrorOr<Patch>> {
    const errorPrefix = 'Patch.createFromFile';
    let error: ErrorReport | undefined;

    // Resource

    const mainFileRelativePath = $FileSystem.basename(filePath);
    const info = { name, author, version, mainFileRelativePath };
    const resourceOrError = await Resource.create(locationDirPath, name, info);
    if (resourceOrError.isError) {
      const errorMessage = `${errorPrefix}: failed to create resource`;
      return $EitherErrorOr.error(resourceOrError.error.extend(errorMessage));
    }
    const resource = resourceOrError.value;

    // Validate

    if ((error = await $FileSystem.validateExistsFile(filePath))) {
      await resource.delete();
      const errorMessage = `${errorPrefix}: file does not exist`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Copy files

    const mainFilePath = await $FileSystem.join(
      resource.getDirectoryPath(),
      mainFileRelativePath,
    );
    if ((error = await $FileSystem.copyFile(filePath, mainFilePath))) {
      await resource.delete();
      const errorMessage = `${errorPrefix}: failed to copy patch file`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Instantiate patch

    const patch = new Patch({ resource });
    return $EitherErrorOr.value(patch);
  }

  static async open({
    directoryPath,
  }: {
    directoryPath: string;
  }): Promise<EitherErrorOr<Patch>> {
    const errorPrefix = 'Patch.open';

    const resourceOrError = await Resource.open(directoryPath, PatchInfoSchema);
    if (resourceOrError.isError) {
      const errorMessage = `${errorPrefix}: failed to open patch info`;
      return $EitherErrorOr.error(resourceOrError.error.extend(errorMessage));
    }
    const resource = resourceOrError.value;

    // Instantiate snapshot
    const patch = new Patch({ resource });
    return $EitherErrorOr.value(patch);
  }

  delete = async (): Promise<ErrorReport | undefined> => {
    const error = await this.resource.delete();
    if (error) {
      const errorMessage = 'Patch.delete: failed to delete resource';
      return error.extend(errorMessage);
    }
    return undefined;
  };

  static getInfoDeps = ['Patch.info'];
  getInfo = (): PatchInfo => {
    return this.resource.getInfo();
  };

  static updateInfoTriggers = ['Patch.info'];
  updateInfo = async ({
    name,
    author,
    version,
    mainFilePath,
  }: {
    name: string;
    author: string;
    version: string;
    mainFilePath: string;
  }): Promise<ErrorReport | undefined> => {
    const errorPrefix = 'Patch.updateInfo';
    let error: ErrorReport | undefined;

    const mainFileRelativePath = await $FileSystem.computeRelativePath(
      this.resource.getDirectoryPath(),
      mainFilePath,
    );

    if ((error = await $FileSystem.validateExistsFile(mainFilePath))) {
      const errorMessage = `${errorPrefix}: main file does not exist`;
      return error.extend(errorMessage);
    }

    if (
      (error = await $FileSystem.validateContainsFile(
        this.resource.getDirectoryPath(),
        mainFilePath,
      ))
    ) {
      const errorMessage = `${errorPrefix}: main file is not in source directory`;
      return error.extend(errorMessage);
    }

    if (name !== this.resource.getInfo().name) {
      error = await this.resource.rename(name);
      if (error) {
        const errorMessage = `${errorPrefix}: failed to rename resource`;
        return error.extend(errorMessage);
      }
    }

    error = await this.resource.setInfo({
      name,
      author,
      version,
      mainFileRelativePath,
    });
    if (error) {
      const errorMessage = `${errorPrefix}: failed to set new info`;
      return error.extend(errorMessage);
    }
  };

  getMainFilePath = async (): Promise<string> => {
    const mainFileRelativePath = this.getInfo().mainFileRelativePath;
    return await $FileSystem.join(
      this.resource.getDirectoryPath(),
      mainFileRelativePath,
    );
  };
}
