import { useCallback } from 'react';
import Settings, {
  GenericSetting,
  GenericSettingsStore,
} from '../core/Settings';
import { useGet, useSetAsync } from '../hooks/useAccessors';
import { ErrorReport } from '../utils/ErrorReport';

export const useLoadSettings = (
  settings: Settings,
): (() => Promise<ErrorReport | undefined>) => {
  return useSetAsync(settings, settings.load, Settings.loadTriggers);
};

export const useSetting = <Setting extends GenericSetting>(
  settings: Settings,
  setting: Setting,
): GenericSettingsStore[Setting] => {
  const getSetting = useCallback(
    () => settings.get(setting),
    [settings, setting],
  );
  return useGet(settings, getSetting, [`Settings.${setting}`]);
};

export const useSetSetting = <Setting extends GenericSetting>(
  settings: Settings,
  setting: Setting,
): ((
  key: Setting,
  value: GenericSettingsStore[Setting],
) => Promise<ErrorReport | undefined>) => {
  return useSetAsync(settings, settings.set, [`Settings.${setting}`]);
};

export const usePrioritizeRecentProject = (
  settings: Settings,
): ((dirPath: string) => Promise<ErrorReport | undefined>) => {
  return useSetAsync(
    settings,
    settings.prioritizeRecentProject,
    Settings.prioritizeRecentProjectTriggers,
  );
};

export const useRemoveRecentProject = (
  settings: Settings,
): ((dirPath: string) => Promise<ErrorReport | undefined>) => {
  return useSetAsync(
    settings,
    settings.removeRecentProject,
    Settings.removeRecentProjectTriggers,
  );
};
