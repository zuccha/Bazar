import * as Tauri from '@tauri-apps/api';
import { $EitherErrorOr, EitherErrorOr } from '../utils/EitherErrorOr';
import ErrorReport from '../utils/ErrorReport';
import { invoke } from '@tauri-apps/api';

const HTTP = Tauri.http;
const FS = Tauri.fs;
const Path = Tauri.path;

export const $FileSystem = {
  basename: (path: string): string => {
    const basename = path.endsWith(Path.sep)
      ? path.slice(0, -1).split(Path.sep).pop()
      : path.split(Path.sep).pop();
    return basename || '';
  },

  computeRelativePath: async (
    basePath: string,
    targetPath: string,
  ): Promise<string> => {
    const normalizedBasePath = await $FileSystem.normalize(basePath);
    const normalizedTargetPath = await $FileSystem.normalize(targetPath);
    return normalizedTargetPath.startsWith(normalizedBasePath + Path.sep)
      ? normalizedTargetPath.replace(normalizedBasePath + Path.sep, '')
      : normalizedTargetPath;
  },

  copyDirectory: async (
    sourceDirPath: string,
    targetDirPath: string,
  ): Promise<ErrorReport | undefined> => {
    try {
      // Create directory if it doesn't exist.
      const targetDirExist = await $FileSystem.exists(targetDirPath);
      if (!targetDirExist) {
        await FS.createDir(targetDirPath, { recursive: true });
      }

      // Copy files.
      const fileNames = await $FileSystem.getFileNames(sourceDirPath);
      for (const fileName of fileNames) {
        const sourceFilePath = await $FileSystem.join(sourceDirPath, fileName);
        const targetFilePath = await $FileSystem.join(targetDirPath, fileName);
        const maybeError = await $FileSystem.copyFile(
          sourceFilePath,
          targetFilePath,
        );
        if (maybeError) return maybeError;
      }

      const subDirNames = await $FileSystem.getDirNames(sourceDirPath);
      for (const subDirName of subDirNames) {
        const sourceSubDirPath = await $FileSystem.join(
          sourceDirPath,
          subDirName,
        );
        const targetSubDirPath = await $FileSystem.join(
          targetDirPath,
          subDirName,
        );
        const maybeError = await $FileSystem.copyDirectory(
          sourceSubDirPath,
          targetSubDirPath,
        );
        if (maybeError) {
          return maybeError;
        }
      }
    } catch (error) {
      const errorMessage = `FileSystem.copyDirectory: failed to copy directory "${sourceDirPath}" to "${targetDirPath}"`;
      return ErrorReport.from(errorMessage);
    }
  },

  copyFile: async (
    sourcePath: string,
    targetPath: string,
  ): Promise<ErrorReport | undefined> => {
    try {
      const directoryPath = $FileSystem.dirpath(targetPath);
      if (!(await $FileSystem.exists(directoryPath))) {
        $FileSystem.createDirectory(directoryPath);
      }
      await FS.copyFile(sourcePath, targetPath);
    } catch (error) {
      const errorMessage = `FileSystem.copyFile: failed to copy file from "${sourcePath}" to "${targetPath}"`;
      return ErrorReport.from(errorMessage);
    }
  },

  createDirectory: async (path: string): Promise<ErrorReport | undefined> => {
    try {
      await FS.createDir(path, { recursive: true });
    } catch {
      const errorMessage = `FileSystem.createDirectory: failed to create directory "${path}"`;
      return ErrorReport.from(errorMessage);
    }
  },

  dirpath: (path: string): string => {
    const basename = $FileSystem.basename(path);
    return path.replace(new RegExp(`${basename}$`), '');
  },

  downloadFile: async (
    filePath: string,
    url: string,
  ): Promise<ErrorReport | undefined> => {
    const response = await HTTP.fetch<ArrayBuffer>(url, {
      method: 'GET',
      responseType: HTTP.ResponseType.Binary,
    });
    if (response.status !== 200) {
      return ErrorReport.from(`Failed to download file "${url}"`);
    }

    try {
      const dirPath = await Path.dirname(filePath);
      await FS.createDir(dirPath, { recursive: true });
      await FS.writeBinaryFile({
        path: filePath,
        contents: response.data,
      });
    } catch {
      return ErrorReport.from(`Failed to save file "${filePath}"`);
    }
  },

  exists: async (path: string): Promise<boolean> => {
    try {
      return await invoke('exists', { path });
    } catch {
      return false;
    }
  },

  isDirectory: async (path: string): Promise<boolean> => {
    try {
      return await invoke('is_dir', { path });
    } catch {
      return false;
    }
  },

  isFile: async (path: string): Promise<boolean> => {
    try {
      return await invoke('is_file', { path });
    } catch {
      return false;
    }
  },

  getDirNames: async (directoryPath: string): Promise<string[]> => {
    try {
      const filesAndDirs = await FS.readDir(directoryPath);
      return filesAndDirs
        .filter((fileOrDir) => !!fileOrDir.children)
        .map((dir) => dir.name ?? '');
    } catch {
      return [];
    }
  },

  getDataPath: async (subPath: string): Promise<string> => {
    const localDataDir = await Path.localDataDir();
    const dataPath = await $FileSystem.join(localDataDir, 'Bazar', subPath);
    return dataPath;
  },

  getFileNames: async (
    dirPath: string,
    isRecursive: boolean = false,
  ): Promise<string[]> => {
    try {
      const filesAndDirs = await FS.readDir(dirPath);
      const fileNames = filesAndDirs
        .filter((fileOrDir) => !fileOrDir.children)
        .map((file) => file.name ?? '');

      if (isRecursive) {
        const subDirNames = await $FileSystem.getDirNames(dirPath);
        for (const subDirName of subDirNames) {
          const subDirPath = await $FileSystem.join(dirPath, subDirName);
          const subFileNames = await $FileSystem.getFileNames(subDirPath, true);
          for (const subFileName of subFileNames) {
            fileNames.push(await $FileSystem.join(subDirName, subFileName));
          }
        }
      }

      return fileNames;
    } catch {
      return [];
    }
  },

  join: async (...paths: string[]): Promise<string> => {
    try {
      let joinedPath = '';
      for (const path of paths) {
        joinedPath = await invoke('join', { path1: joinedPath, path2: path });
      }
      return joinedPath;
    } catch (error) {
      return '';
    }
  },

  loadJson: async (path: string): Promise<EitherErrorOr<unknown>> => {
    try {
      const content = await FS.readTextFile(path);
      return $EitherErrorOr.value(JSON.parse(content));
    } catch {
      const errorMessage = `FileSystem.loadJson: failed to load JSON file "${path}"`;
      return $EitherErrorOr.error(ErrorReport.from(errorMessage));
    }
  },

  normalize: async (path: string): Promise<string> => {
    try {
      return await invoke('normalize', { path });
    } catch {
      return path;
    }
  },

  removeFile: async (filePath: string): Promise<ErrorReport | undefined> => {
    try {
      await FS.removeFile(filePath);
    } catch {
      const errorMessage = `FileSystem.removeFile: failed to delete file "${filePath}"`;
      return ErrorReport.from(errorMessage);
    }
  },

  removeDir: async (dirPath: string): Promise<ErrorReport | undefined> => {
    try {
      await FS.removeDir(dirPath, { recursive: true });
    } catch {
      const errorMessage = `FileSystem.removeDir: failed to delete directory "${dirPath}"`;
      return ErrorReport.from(errorMessage);
    }
  },

  rename: async (
    oldPath: string,
    newPath: string,
  ): Promise<ErrorReport | undefined> => {
    let error: ErrorReport | undefined;
    const errorPrefix = 'FileSystem.rename';

    try {
      if (await $FileSystem.isDirectory(oldPath)) {
        error = await $FileSystem.copyDirectory(oldPath, newPath);
        if (error)
          return error.extend(`${errorPrefix}: failed to copy directory`);
        error = await $FileSystem.removeDir(oldPath);
        if (error)
          return error.extend(`${errorPrefix}: failed to remove old directory`);
      }
      if (await $FileSystem.isFile(oldPath)) {
        error = await $FileSystem.copyFile(oldPath, newPath);
        if (error) return error.extend(`${errorPrefix}: failed to copy file`);
        error = await $FileSystem.removeDir(oldPath);
        if (error)
          return error.extend(`${errorPrefix}: failed to remove old file`);
      }
    } catch {
      return ErrorReport.from(
        `${errorPrefix}: failed to rename "${oldPath}" to "${newPath}"`,
      );
    }
  },

  saveJson: async (
    path: string,
    data: unknown,
  ): Promise<ErrorReport | undefined> => {
    try {
      await FS.writeFile({
        path,
        contents: JSON.stringify(data, null, 2),
      });
    } catch (error) {
      const errorMessage = `FileSystem.saveJson: failed to save JSON file "${path}"`;
      return ErrorReport.from(errorMessage);
    }
  },

  unzip: async (
    zipPath: string,
    targetPath: string,
  ): Promise<ErrorReport | undefined> => {
    try {
      if (!(await $FileSystem.exists(targetPath))) {
        const maybeError = await $FileSystem.createDirectory(targetPath);
        if (maybeError) return maybeError;
      }
      await invoke('extract', { zipPath, targetPath });
      return undefined;
    } catch {
      const errorMessage = `FileSystem.unzip: failed to unzip file "${zipPath}"`;
      return ErrorReport.from(errorMessage);
    }
  },

  validateExistsDir: async (path: string): Promise<ErrorReport | undefined> => {
    const errorPrefix = 'FileSystem.validateExistsDir';
    return !path
      ? ErrorReport.from(`${errorPrefix}: path is empty`)
      : !(await $FileSystem.exists(path))
      ? ErrorReport.from(`${errorPrefix}: path "${path}" does not exist`)
      : !(await $FileSystem.isDirectory(path))
      ? ErrorReport.from(`${errorPrefix}: path "${path}" is not a directory`)
      : undefined;
  },

  validateExistsFile: async (
    path: string,
  ): Promise<ErrorReport | undefined> => {
    const errorPrefix = 'FileSystem.validateExistsFile';
    return !path
      ? ErrorReport.from(`${errorPrefix}: path is empty`)
      : !(await $FileSystem.exists(path))
      ? ErrorReport.from(`${errorPrefix}: path "${path}" does not exist`)
      : !(await $FileSystem.isFile(path))
      ? ErrorReport.from(`${errorPrefix}: path "${path}" is not a file`)
      : undefined;
  },

  validateHasExtension: async (
    path: string,
    extension: string,
  ): Promise<ErrorReport | undefined> => {
    const errorPrefix = 'FileSystem.validateHasExtension';
    return !path
      ? ErrorReport.from(`${errorPrefix}: path is empty`)
      : !path.endsWith(extension)
      ? ErrorReport.from(
          `${errorPrefix}: path "${path}" does not have extension "${extension}"`,
        )
      : undefined;
  },

  validateContainsFile: async (
    directoryPath: string,
    filePath: string,
  ): Promise<ErrorReport | undefined> => {
    const normalizedFilePath = await $FileSystem.normalize(filePath);
    const normalizedDirectoryPath = await $FileSystem.normalize(directoryPath);
    const errorMessage = `FileSystem.validateContainsFile: directory "${normalizedDirectoryPath}" does not contain file "${normalizedFilePath}"`;
    return normalizedFilePath.startsWith(normalizedDirectoryPath)
      ? undefined
      : ErrorReport.from(errorMessage);
  },

  validateIsValidName: async (
    name: string,
  ): Promise<ErrorReport | undefined> => {
    const errorPrefix = 'FileSystem.validateIsValidName';
    return !name
      ? ErrorReport.from(`${errorPrefix}: name is empty`)
      : !/^[a-zA-Z0-9_.-]+$/.test(name)
      ? ErrorReport.from(
          `${errorPrefix}: name "${name}" contains invalid characters`,
        )
      : undefined;
  },

  validateIsValidVersion: async (
    version: string,
  ): Promise<ErrorReport | undefined> => {
    const errorPrefix = 'FileSystem.validateIsValidVersion';
    return !version
      ? ErrorReport.from(`${errorPrefix}: version is empty`)
      : !/^[a-zA-Z0-9_.-]+$/.test(version)
      ? ErrorReport.from(
          `${errorPrefix}: version "${version}" contains invalid characters`,
        )
      : undefined;
  },

  validateNotExists: async (path: string): Promise<ErrorReport | undefined> => {
    const errorPrefix = 'FileSystem.validateNotExists';
    return !path
      ? ErrorReport.from(`${errorPrefix}: path is empty`)
      : (await $FileSystem.exists(path))
      ? ErrorReport.from(`${errorPrefix}: path "${path}" already exist`)
      : undefined;
  },

  zip: async (dirPath: string): Promise<ErrorReport | undefined> => {
    try {
      if (!(await $FileSystem.exists(dirPath))) {
        const errorMessage = `FileSystem.zip: directory "${dirPath}" does not exist`;
        return ErrorReport.from(errorMessage);
      }
      if (await $FileSystem.exists(`${dirPath}.zip`)) {
        const errorMessage = `FileSystem.zip: zip "${dirPath}.zip" already exists`;
        return ErrorReport.from(errorMessage);
      }
      await invoke('archive', { dirPath });
      return undefined;
    } catch {
      const errorMessage = `FileSystem.zip: failed to zip directory "${dirPath}"`;
      return ErrorReport.from(errorMessage);
    }
  },
};
