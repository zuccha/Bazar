import { z } from 'zod';
import { $EitherErrorOr, EitherErrorOr } from '../utils/EitherErrorOr';
import { $ErrorReport, ErrorReport } from '../utils/ErrorReport';
import { $FileSystem } from '../utils/FileSystem';
import { $Shell } from '../utils/Shell';
import Resource from './Resource';
import Toolchain from './Toolchain';

const PatchInfoSchema = z.object({
  name: z.string(),
  mainFileRelativePath: z.string(),
});

export type PatchInfo = z.infer<typeof PatchInfoSchema>;

export default class Patch {
  private resource: Resource<PatchInfo>;

  private constructor({ resource }: { resource: Resource<PatchInfo> }) {
    this.resource = resource;
  }

  static async createFromDirectory({
    locationDirPath,
    name,
    sourceDirPath,
    mainFilePath,
  }: {
    locationDirPath: string;
    name: string;
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
    const info = { name, mainFileRelativePath };
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
    filePath,
  }: {
    locationDirPath: string;
    name: string;
    filePath: string;
  }): Promise<EitherErrorOr<Patch>> {
    const errorPrefix = 'Patch.createFromFile';
    let error: ErrorReport | undefined;

    // Resource

    const mainFileRelativePath = $FileSystem.basename(filePath);
    const info = { name, mainFileRelativePath };
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

  static setInfoTriggers = ['Patch.info'];
  setInfo = async (info: PatchInfo): Promise<ErrorReport | undefined> => {
    const errorMessage = 'Patch.setInfo: failed to set info';
    const maybeError = await this.resource.setInfo(info);
    return maybeError ? maybeError.extend(errorMessage) : undefined;
  };

  getMainFilePath = async (): Promise<string> => {
    const mainFileRelativePath = this.getInfo().mainFileRelativePath;
    return await $FileSystem.join(
      this.resource.getDirectoryPath(),
      mainFileRelativePath,
    );
  };
}
