import AdmZip from 'adm-zip';
import * as Tauri from '@tauri-apps/api';
import { $EitherErrorOr, EitherErrorOr } from '../utils/EitherErrorOr';
import { $ErrorReport, ErrorReport } from '../utils/ErrorReport';

const HTTP = Tauri.http;
const FS = Tauri.fs;
const Path = Tauri.path;

export const $FileSystem = {
  basename: Path.basename,

  computeRelativePath: async (
    basePath: string,
    targetPath: string,
  ): Promise<string> => {
    const normalizedBasePath = await Path.normalize(basePath);
    const normalizedTargetPath = await Path.normalize(targetPath);
    return normalizedTargetPath.startsWith(normalizedBasePath)
      ? normalizedTargetPath.replace(normalizedBasePath, '')
      : normalizedTargetPath;
  },

  copyDirectory: async (
    sourceDirPath: string,
    targetDirPath: string,
    isRecursive: boolean = false,
  ): Promise<ErrorReport | undefined> => {
    try {
      // Create directory if it doesn't exist.
      const sourceDirExist = await $FileSystem.exists(sourceDirPath);
      if (!sourceDirExist) {
        await FS.createDir(sourceDirPath);
      }

      // Copy files.
      const fileNames = await $FileSystem.getFileNames(sourceDirPath);
      for (const fileName of fileNames) {
        const sourceFilePath = await Path.join(sourceDirPath, fileName);
        const targetFilePath = await Path.join(targetDirPath, fileName);
        await FS.copyFile(sourceFilePath, targetFilePath);
      }

      if (isRecursive) {
        const subDirNames = await $FileSystem.getDirNames(sourceDirPath);
        for (const subDirName of subDirNames) {
          const sourceSubDirPath = await Path.join(sourceDirPath, subDirName);
          const targetSubDirPath = await Path.join(targetDirPath, subDirName);
          const maybeError = $FileSystem.copyDirectory(
            sourceSubDirPath,
            targetSubDirPath,
            true,
          );
          if (maybeError) {
            return maybeError;
          }
        }
      }
    } catch (error) {
      return $ErrorReport.make(
        `Copy directory failed: failed to copy directory "${sourceDirPath}" to "${targetDirPath}"`,
      );
    }
  },

  copyFile: async (
    sourcePath: string,
    targetPath: string,
  ): Promise<ErrorReport | undefined> => {
    try {
      await FS.copyFile(sourcePath, targetPath);
    } catch (error) {
      return $ErrorReport.make(
        `Failed to copy file from "${sourcePath}" to "${targetPath}"`,
      );
    }
  },

  createDirectory: async (path: string): Promise<ErrorReport | undefined> => {
    try {
      await FS.createDir(path);
    } catch {
      return $ErrorReport.make(`Failed to create directory "${path}"`);
    }
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
      return $ErrorReport.make(`Failed to download file "${url}"`);
    }

    try {
      const dirPath = await Path.dirname(filePath);
      await FS.createDir(dirPath, { recursive: true });
      await FS.writeBinaryFile({
        path: filePath,
        contents: response.data,
      });
    } catch {
      return $ErrorReport.make(`Failed to save file "${filePath}"`);
    }
  },

  exists: async (path: string): Promise<boolean> => {
    if (path === '/') return true;
    try {
      const name = await Path.basename(path);
      const dirPath = await Path.dirname(path);
      const filesAndDirs = await FS.readDir(dirPath);
      return filesAndDirs.some((fileOrDir) => fileOrDir.name === name);
    } catch {
      return false;
    }
  },

  isDirectory: async (path: string): Promise<boolean> => {
    if (path === '/') return true;
    if (!(await $FileSystem.exists(path))) return false;
    const name = await Path.basename(path);
    const dirPath = await Path.dirname(path);
    const dirNames = await $FileSystem.getDirNames(dirPath);
    return dirNames.includes(name);
  },

  isFile: async (path: string): Promise<boolean> => {
    if (path === '/') return false;
    if (!(await $FileSystem.exists(path))) return false;
    const name = await Path.basename(path);
    const dirPath = await Path.dirname(path);
    const fileNames = await $FileSystem.getFileNames(dirPath);
    return fileNames.includes(name);
  },

  getDirNames: async (directoryPath: string): Promise<string[]> => {
    const filesAndDirs = await FS.readDir(directoryPath);
    return filesAndDirs
      .filter((fileOrDir) => !!fileOrDir.children)
      .map((dir) => dir.name ?? '');
  },

  getDataDirPath: async (): Promise<string> => {
    const localDataDir = await Path.localDataDir();
    return Path.join(localDataDir, 'Bazar');
  },

  getFileNames: async (directoryPath: string): Promise<string[]> => {
    const filesAndDirs = await FS.readDir(directoryPath);
    return filesAndDirs
      .filter((fileOrDir) => !fileOrDir.children)
      .map((file) => file.name ?? '');
  },

  join: (...paths: string[]): Promise<string> => {
    return Path.join(...paths);
  },

  loadJson: async (path: string): Promise<EitherErrorOr<unknown>> => {
    try {
      const content = await FS.readTextFile(path);
      return $EitherErrorOr.value(JSON.parse(content));
    } catch {
      const errorMessage = `Failed to load JSON file "${path}"`;
      return $EitherErrorOr.error($ErrorReport.make(errorMessage));
    }
  },

  removeFile: async (filePath: string): Promise<ErrorReport | undefined> => {
    try {
      await FS.removeFile(filePath);
    } catch {
      return $ErrorReport.make(`Failed to delete file "${filePath}"`);
    }
  },

  removeDir: async (dirPath: string): Promise<ErrorReport | undefined> => {
    try {
      await FS.removeDir(dirPath, { recursive: true });
    } catch {
      return $ErrorReport.make(`Failed to delete directory "${dirPath}"`);
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
      return $ErrorReport.make(`Failed to save JSON file "${path}"`);
    }
  },

  unzip: async (
    zipPath: string,
    targetPath: string,
  ): Promise<ErrorReport | undefined> => {
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(targetPath, true);
    return undefined;
  },

  validateExistsDir: async (path: string): Promise<ErrorReport | undefined> => {
    const errorPrefix = 'Directory does not exist';
    return !path
      ? $ErrorReport.make(`${errorPrefix}: path is empty`)
      : !(await $FileSystem.exists(path))
      ? $ErrorReport.make(`${errorPrefix}: path "${path}" does not exist`)
      : !(await $FileSystem.isDirectory(path))
      ? $ErrorReport.make(`${errorPrefix}: path "${path}" is not a directory`)
      : undefined;
  },

  validateExistsFile: async (
    path: string,
  ): Promise<ErrorReport | undefined> => {
    const errorPrefix = 'File does not exist';
    return !path
      ? $ErrorReport.make(`${errorPrefix}: path is empty`)
      : !(await $FileSystem.exists(path))
      ? $ErrorReport.make(`${errorPrefix}: path "${path}" does not exist`)
      : !(await $FileSystem.isFile(path))
      ? $ErrorReport.make(`${errorPrefix}: path "${path}" is not a file`)
      : undefined;
  },

  validateHasExtension: async (
    path: string,
    extension: string,
  ): Promise<ErrorReport | undefined> => {
    const errorPrefix = 'File does not have extension';
    return !path
      ? $ErrorReport.make(`${errorPrefix}: path is empty`)
      : !path.endsWith(extension)
      ? $ErrorReport.make(
          `${errorPrefix}: path "${path}" does not have extension "${extension}"`,
        )
      : undefined;
  },

  validateContainsFile: async (
    directoryPath: string,
    filePath: string,
  ): Promise<ErrorReport | undefined> => {
    const normalizedFilePath = await Path.normalize(filePath);
    const normalizedDirectoryPath = await Path.normalize(directoryPath);
    return normalizedFilePath.startsWith(normalizedDirectoryPath)
      ? undefined
      : $ErrorReport.make(
          `Directory "${normalizedDirectoryPath}" does not contain file "${normalizedFilePath}"`,
        );
  },

  validateIsValidName: async (
    name: string,
  ): Promise<ErrorReport | undefined> => {
    const errorPrefix = 'Name is not valid';
    return !name
      ? $ErrorReport.make(`${errorPrefix}: name is empty`)
      : !/^[a-zA-Z0-9_.-]+$/.test(name)
      ? $ErrorReport.make(
          `${errorPrefix}: name "${name}" contains invalid characters`,
        )
      : undefined;
  },

  validateNotExists: async (path: string): Promise<ErrorReport | undefined> => {
    const errorPrefix = 'Path already exists';
    return !path
      ? $ErrorReport.make(`${errorPrefix}: path is empty`)
      : (await $FileSystem.exists(path))
      ? $ErrorReport.make(`${errorPrefix}: path "${path}" already exist`)
      : undefined;
  },
};
