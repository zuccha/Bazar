import { z } from 'zod';
import { getter, setter } from '../utils/Accessors';
import { ErrorReport } from '../utils/ErrorReport';
import { $PriorityList } from '../utils/PriorityList';
import { $SettingsStore } from '../utils/SettingsStore';

// #region Settings

const GenericSettingsStoreSchema = z.object({
  appearanceColorScheme: z.string(),
  newProjectDefaultAuthor: z.string(),
  newProjectDefaultLocationDirPath: z.string(),
  newProjectDefaultRomFilePath: z.string(),
  patchAskConfirmationBeforeApply: z.boolean(),
  recentProjects: $PriorityList.schema(z.string()),
});

export type GenericSettingsStore = z.infer<typeof GenericSettingsStoreSchema>;
export type GenericSetting = keyof GenericSettingsStore;

// #endregion Settings

export default class Settings {
  public readonly TypeName = 'Settings';

  private generic;
  private isSavingGeneric;

  private constructor() {
    // Nothing to do here.
    this.generic = $SettingsStore.create<GenericSettingsStore>({
      defaults: {
        appearanceColorScheme: 'blue',
        newProjectDefaultAuthor: '',
        newProjectDefaultLocationDirPath: '',
        newProjectDefaultRomFilePath: '',
        patchAskConfirmationBeforeApply: true,
        recentProjects: $PriorityList.create([], 6),
      },
      fileName: 'generic.json',
      schema: GenericSettingsStoreSchema.partial(),
    });
    this.isSavingGeneric = false;
  }

  static create(): Settings {
    return new Settings();
  }

  load = setter(
    [
      'appearanceColorScheme',
      'newProjectDefaultAuthor',
      'newProjectDefaultLocationDirPath',
      'newProjectDefaultRomFilePath',
      'patchAskConfirmationBeforeApply',
      'recentProjects',
    ],
    async (): Promise<ErrorReport | undefined> => {
      const errorMessage = `Settings.load: failed to load settings`;
      const settingsOrError = await this.generic.getAll();
      if (settingsOrError.isError)
        return settingsOrError.error.extend(errorMessage);
    },
  );

  get = <Setting extends keyof GenericSettingsStore>(
    key: Setting,
  ): GenericSettingsStore[Setting] => {
    return this.generic.getCache(key);
  };

  set = async <Setting extends keyof GenericSettingsStore>(
    key: Setting,
    value: GenericSettingsStore[Setting],
  ): Promise<ErrorReport | undefined> => {
    const errorMessage = `Settings.set: failed to set setting "${key}"`;
    const error = await this.generic.set(key, value);
    if (error) return error.extend(errorMessage);
  };

  prioritizeRecentProject = setter(
    ['recentProjects'],
    async (dirPath: string): Promise<ErrorReport | undefined> => {
      const errorMessage = `Settings.prioritizeRecentProject: failed to prioritize recent project`;
      const recentProjects = this.generic.getCache('recentProjects');
      const value = $PriorityList.prioritize(recentProjects, dirPath);
      const error = await this.generic.set('recentProjects', value);
      if (error) return error.extend(errorMessage);
    },
  );

  removeRecentProject = setter(
    ['recentProjects'],
    async (dirPath: string): Promise<ErrorReport | undefined> => {
      const errorMessage = `Settings.removeRecentProject: failed to remove recent project`;
      const recentProjects = this.generic.getCache('recentProjects');
      const value = $PriorityList.remove(recentProjects, dirPath);
      const error = await this.generic.set('recentProjects', value);
      if (error) return error.extend(errorMessage);
    },
  );

  getIsSavingGeneric = getter(['isSavingGeneric'], (): boolean => {
    return this.isSavingGeneric;
  });

  startSavingGeneric = setter(['isSavingGeneric'], (): undefined => {
    this.isSavingGeneric = true;
    return undefined;
  });

  stopSavingGeneric = setter(['isSavingGeneric'], (): undefined => {
    this.isSavingGeneric = false;
    return undefined;
  });
}
