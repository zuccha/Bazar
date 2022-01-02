import { ZodObject, ZodType } from 'zod';
import { $ErrorReport, ErrorReport } from './ErrorReport';
import { $EitherErrorOr, EitherErrorOr } from './EitherErrorOr';
import { $FileSystem } from './FileSystem';

type Serializable = any;

export const $SettingsStore = {
  create: <Schema extends Record<string, Serializable>>({
    defaults,
    fileName,
    schema,
  }: {
    defaults: Schema;
    fileName: string;
    schema: ZodType<Partial<Schema>>;
  }): {
    get: <Key extends keyof Schema>(
      key: Key,
    ) => Promise<EitherErrorOr<Schema[Key]>>;
    getAll: () => Promise<EitherErrorOr<Schema>>;
    getCache: <Key extends keyof Schema>(key: Key) => Schema[Key];
    set: <Key extends keyof Schema>(
      key: Key,
      value: Schema[Key],
    ) => Promise<ErrorReport | undefined>;
  } => {
    const getSettingsFilePath = async (): Promise<string> => {
      const settingsDir = await $FileSystem.getDataPath('settings');
      await $FileSystem.createDirectory(settingsDir);
      const filePath = await $FileSystem.join(settingsDir, fileName);
      return filePath;
    };

    let cache: Schema = defaults;

    const get = async <Key extends keyof Schema>(
      key: Key,
    ): Promise<EitherErrorOr<Schema[Key]>> => {
      const settingsFilePath = await getSettingsFilePath();

      if (!(await $FileSystem.exists(settingsFilePath))) {
        return $EitherErrorOr.value(cache[key]);
      }

      const maybeSettingsOrError = await $FileSystem.loadJson(settingsFilePath);
      if (maybeSettingsOrError.isError) {
        const errorMessage = 'Settings.get: failed to load settings file';
        return $EitherErrorOr.error(
          maybeSettingsOrError.error.extend(errorMessage),
        );
      }

      const maybeSettings = maybeSettingsOrError.value;
      const settingsOrError = schema.safeParse(maybeSettings);
      if (!settingsOrError.success) {
        const error = $ErrorReport.make(settingsOrError.error.message);
        const errorMessage = 'Settings.get: failed to parse settings file';
        return $EitherErrorOr.error(error.extend(errorMessage));
      }

      cache = {
        ...defaults,
        ...settingsOrError.data,
      };
      return $EitherErrorOr.value(cache[key]);
    };

    const getCache = <Key extends keyof Schema>(key: Key): Schema[Key] => {
      return cache[key];
    };

    const getAll = async (): Promise<EitherErrorOr<Schema>> => {
      const settingsFilePath = await getSettingsFilePath();

      if (!(await $FileSystem.exists(settingsFilePath))) {
        return $EitherErrorOr.value(cache);
      }

      const maybeSettingsOrError = await $FileSystem.loadJson(settingsFilePath);
      if (maybeSettingsOrError.isError) {
        const errorMessage = 'Settings.getAll: failed to load settings file';
        return $EitherErrorOr.error(
          maybeSettingsOrError.error.extend(errorMessage),
        );
      }

      const maybeSettings = maybeSettingsOrError.value;
      const settingsOrError = schema.safeParse(maybeSettings);
      if (!settingsOrError.success) {
        const error = $ErrorReport.make(settingsOrError.error.message);
        const errorMessage = 'Settings.getAll: failed to parse settings file';
        return $EitherErrorOr.error(error.extend(errorMessage));
      }

      cache = {
        ...defaults,
        ...settingsOrError.data,
      };
      return $EitherErrorOr.value(cache);
    };

    const set = async <Key extends keyof Schema>(
      key: Key,
      value: Schema[Key],
    ): Promise<ErrorReport | undefined> => {
      const settingsFilePath = await getSettingsFilePath();

      cache = { ...cache, [key]: value };

      const maybeError = await $FileSystem.saveJson(settingsFilePath, cache);
      if (maybeError) {
        const errorMessage = 'Settings.get: failed to load settings file';
        return maybeError.extend(errorMessage);
      }
    };

    return {
      get,
      getAll,
      getCache,
      set,
    };
  },
};
