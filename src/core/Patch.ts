import { z } from 'zod';
import { getter, setter } from '../utils/Accessors';
import { $EitherErrorOr, EitherErrorOr } from '../utils/EitherErrorOr';
import ErrorReport from '../utils/ErrorReport';
import { $FileSystem } from '../utils/FileSystem';
import Resource, { ResourceFields } from './Resource';

const infoSchema = z.object({
  name: z.string(),
  author: z.string(),
  version: z.string(),
  mainFileRelativePath: z.string(),
});

export type PatchInfo = Required<z.infer<typeof infoSchema>>;

export default class Patch extends Resource<PatchInfo> {
  public readonly TypeName = 'Patch';

  private constructor(props: ResourceFields<PatchInfo>) {
    super(props);
  }

  static async createFromDirectory(
    directoryPath: string,
    {
      name,
      author,
      version,
      sourceDirPath,
      mainFileRelativePath,
    }: {
      name: string;
      author: string;
      version: string;
      sourceDirPath: string;
      mainFileRelativePath: string;
    },
  ): Promise<EitherErrorOr<Patch>> {
    const errorPrefix = 'Patch.createFromDirectory';
    let error: ErrorReport | undefined;

    // Source directory
    if ((error = await $FileSystem.validateExistsDir(sourceDirPath))) {
      const errorMessage = `${errorPrefix}: source directory does not exist`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Main file
    const mainFilePath = await $FileSystem.join(
      sourceDirPath,
      mainFileRelativePath,
    );
    if ((error = await $FileSystem.validateExistsFile(mainFilePath))) {
      const errorMessage = `${errorPrefix}: main file does not exist`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Main file in source directory
    if (
      (error = await $FileSystem.validateContainsFile(
        sourceDirPath,
        mainFilePath,
      ))
    ) {
      const errorMessage = `${errorPrefix}: main file is not in source directory`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Resource
    const info = { name, author, version, mainFileRelativePath };
    const patch = new Patch({ directoryPath, name, info });
    if ((error = await patch.save())) {
      const errorMessage = `${errorPrefix}: failed to create resource`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Copy files
    if (
      (error = await $FileSystem.copyDirectory(sourceDirPath, patch.getPath()))
    ) {
      patch.delete();
      const errorMessage = `${errorPrefix}: failed to copy patch files`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Return patch
    return $EitherErrorOr.value(patch);
  }

  static async createFromFile(
    directoryPath: string,
    {
      name,
      author,
      version,
      filePath,
    }: {
      name: string;
      author: string;
      version: string;
      filePath: string;
    },
  ): Promise<EitherErrorOr<Patch>> {
    const errorPrefix = 'Patch.createFromFile';
    let error: ErrorReport | undefined;

    // Main file
    if ((error = await $FileSystem.validateExistsFile(filePath))) {
      const errorMessage = `${errorPrefix}: file does not exist`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Resource
    const mainFileRelativePath = $FileSystem.basename(filePath);
    const info = { name, author, version, mainFileRelativePath };
    const patch = new Patch({ directoryPath, name, info });
    if ((error = await patch.save())) {
      const errorMessage = `${errorPrefix}: failed to create resource`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Copy main file
    const mainFilePath = await patch.getSubPath(mainFileRelativePath);
    if ((error = await $FileSystem.copyFile(filePath, mainFilePath))) {
      await patch.delete();
      const errorMessage = `${errorPrefix}: failed to copy patch file`;
      return $EitherErrorOr.error(error.extend(errorMessage));
    }

    // Return patch
    return $EitherErrorOr.value(patch);
  }

  static async open(path: string): Promise<EitherErrorOr<Patch>> {
    const errorPrefix = 'Patch.open';

    const errorOrFields = await Resource.load(path, infoSchema);
    if (errorOrFields.isError) {
      const errorMessage = `${errorPrefix}: failed to open patch info`;
      return $EitherErrorOr.error(errorOrFields.error.extend(errorMessage));
    }

    const patch = new Patch(errorOrFields.value);

    return $EitherErrorOr.value(patch);
  }

  renameAndSetInfo = setter(
    ['info'],
    async ({
      name,
      author,
      version,
      mainFileRelativePath,
    }: PatchInfo): Promise<ErrorReport | undefined> => {
      const errorPrefix = `${this.TypeName}.setInfo`;
      let error: ErrorReport | undefined;

      const mainFilePath = await this.getSubPath(mainFileRelativePath);

      if ((error = await $FileSystem.validateExistsFile(mainFilePath))) {
        const errorMessage = `${errorPrefix}: main file does not exist`;
        return error.extend(errorMessage);
      }

      if (
        (error = await $FileSystem.validateContainsFile(
          this.getPath(),
          mainFilePath,
        ))
      ) {
        const errorMessage = `${errorPrefix}: main file is not in source directory`;
        return error.extend(errorMessage);
      }

      if (name !== this.getName()) {
        if ((error = await this.rename(name))) {
          const errorMessage = `${errorPrefix}: failed to rename resource`;
          return error.extend(errorMessage);
        }
      }

      const info = { name, author, version, mainFileRelativePath };
      if ((error = await this.setInfo(info))) {
        const errorMessage = `${errorPrefix}: failed to set new info`;
        return error.extend(errorMessage);
      }
    },
  );

  getMainFilePath = getter(['info'], async (): Promise<string> => {
    const mainFileRelativePath = this.getInfo().mainFileRelativePath;
    return await this.getSubPath(mainFileRelativePath);
  });
}
