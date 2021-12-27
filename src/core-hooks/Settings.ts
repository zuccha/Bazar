import { useCallback, useMemo } from 'react';
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
  const getSettingDeps = useMemo(() => [`Settings.${setting}`], [setting]);
  return useGet(settings, getSetting, getSettingDeps);
};

export const useSetSetting = <Setting extends GenericSetting>(
  settings: Settings,
  setting: Setting,
): ((
  key: Setting,
  value: GenericSettingsStore[Setting],
) => Promise<ErrorReport | undefined>) => {
  const setSettingTriggers = useMemo(() => [`Settings.${setting}`], [setting]);
  return useSetAsync(settings, settings.set, setSettingTriggers);
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
