import { z } from 'zod';
import { ErrorReport } from '../utils/ErrorReport';
import { $PriorityList } from '../utils/PriorityList';
import { $SettingsStore } from '../utils/SettingsStore';

// #region Settings

const GenericSettingsStoreSchema = z.object({
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
  private generic;

  private constructor() {
    // Nothing to do here.
    this.generic = $SettingsStore.create({
      defaults: {
        newProjectDefaultAuthor: '',
        newProjectDefaultLocationDirPath: '',
        newProjectDefaultRomFilePath: '',
        patchAskConfirmationBeforeApply: true,
        recentProjects: $PriorityList.create([], 6),
      },
      fileName: 'generic.json',
      schema: GenericSettingsStoreSchema,
    });
  }

  static create(): Settings {
    return new Settings();
  }

  static loadTriggers = [
    'Settings.newProjectDefaultAuthor',
    'Settings.newProjectDefaultLocationDirPath',
    'Settings.newProjectDefaultRomFilePath',
    'Settings.patchAskConfirmationBeforeApply',
    'Settings.recentProjects',
  ];
  load = async (): Promise<ErrorReport | undefined> => {
    const errorMessage = `Settings.load: failed to load settings`;
    const settingsOrError = await this.generic.getAll();
    if (settingsOrError.isError)
      return settingsOrError.error.extend(errorMessage);
  };

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

  static prioritizeRecentProjectTriggers = ['Settings.recentProjects'];
  prioritizeRecentProject = async (
    dirPath: string,
  ): Promise<ErrorReport | undefined> => {
    const errorMessage = `Settings.prioritizeRecentProject: failed to prioritize recent project`;
    const recentProjects = this.generic.getCache('recentProjects');
    const value = $PriorityList.prioritize(recentProjects, dirPath);
    const error = await this.generic.set('recentProjects', value);
    if (error) return error.extend(errorMessage);
  };

  static removeRecentProjectTriggers = ['Settings.recentProjects'];
  removeRecentProject = async (
    dirPath: string,
  ): Promise<ErrorReport | undefined> => {
    const errorMessage = `Settings.removeRecentProject: failed to remove recent project`;
    const recentProjects = this.generic.getCache('recentProjects');
    const value = $PriorityList.remove(recentProjects, dirPath);
    const error = await this.generic.set('recentProjects', value);
    if (error) return error.extend(errorMessage);
  };
}
