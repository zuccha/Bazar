import { useCallback, useMemo } from 'react';
import Settings, {
  GenericSetting,
  GenericSettingsStore,
} from '../core/Settings';
import { useGet, useSet, useSetAsync } from '../hooks/useAccessors';
import { $ErrorReport, ErrorReport } from '../utils/ErrorReport';

export const useLoadSettings = (
  settings: Settings,
): (() => Promise<ErrorReport | undefined>) => {
  return useSetAsync(settings, settings.load, Settings.loadTriggers);
};

export const useIsSavingSettings = (settings: Settings): boolean => {
  return useGet(
    settings,
    settings.getIsSavingGeneric,
    Settings.getIsSavingGenericDeps,
  );
};

export const useStartSavingSettings = (
  settings: Settings,
): (() => ErrorReport | undefined) => {
  return useSet(
    settings,
    settings.startSavingGeneric,
    Settings.startSavingTriggers,
  );
};

export const useStopSavingSettings = (
  settings: Settings,
): (() => ErrorReport | undefined) => {
  return useSet(
    settings,
    settings.stopSavingGeneric,
    Settings.stopSavingTriggers,
  );
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
  value: GenericSettingsStore[Setting],
) => Promise<ErrorReport | undefined>) => {
  const setSettingTriggers = useMemo(() => [`Settings.${setting}`], [setting]);
  const startSaving = useStartSavingSettings(settings);
  const stopSaving = useStopSavingSettings(settings);
  const set = useCallback(
    async (value: GenericSettingsStore[Setting]) => {
      if (settings.getIsSavingGeneric()) {
        const errorMessage = `Settings.set: failed to set ${setting}, already saving another one`;
        return $ErrorReport.make(errorMessage, []);
      }
      startSaving();
      const error = await settings.set(setting, value);
      stopSaving();
      return error;
    },
    [settings.getIsSavingGeneric, settings.set, startSaving, stopSaving],
  );
  return useSetAsync(settings, set, setSettingTriggers);
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
