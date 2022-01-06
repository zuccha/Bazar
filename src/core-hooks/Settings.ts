import { useMemo } from 'react';
import Settings, {
  GenericSetting,
  GenericSettingsStore,
} from '../core/Settings';
import { useGet, useSet, useSetAsync } from '../hooks/useAccessors';
import { getter, setter } from '../utils/Accessors';
import { $ErrorReport, ErrorReport } from '../utils/ErrorReport';

export const useLoadSettings = (
  settings: Settings,
): (() => Promise<ErrorReport | undefined>) => {
  return useSetAsync(settings, settings.load);
};

export const useIsSavingSettings = (settings: Settings): boolean => {
  return useGet(settings, settings.getIsSavingGeneric);
};

export const useStartSavingSettings = (
  settings: Settings,
): (() => ErrorReport | undefined) => {
  return useSet(settings, settings.startSavingGeneric);
};

export const useStopSavingSettings = (
  settings: Settings,
): (() => ErrorReport | undefined) => {
  return useSet(settings, settings.stopSavingGeneric);
};

export const useSetting = <Setting extends GenericSetting>(
  settings: Settings,
  setting: Setting,
): GenericSettingsStore[Setting] => {
  const getSetting = useMemo(
    () => getter([setting], () => settings.get(setting)),
    [settings, setting],
  );
  return useGet(settings, getSetting);
};

export const useSetSetting = <Setting extends GenericSetting>(
  settings: Settings,
  setting: Setting,
): ((
  value: GenericSettingsStore[Setting],
) => Promise<ErrorReport | undefined>) => {
  const startSaving = useStartSavingSettings(settings);
  const stopSaving = useStopSavingSettings(settings);
  const set = useMemo(
    () =>
      setter([setting], async (value: GenericSettingsStore[Setting]) => {
        if (settings.getIsSavingGeneric()) {
          const errorMessage = `Settings.set: failed to set ${setting}, already saving another one`;
          return $ErrorReport.make(errorMessage, []);
        }
        startSaving();
        const error = await settings.set(setting, value);
        stopSaving();
        return error;
      }),
    [
      setting,
      settings.getIsSavingGeneric,
      settings.set,
      startSaving,
      stopSaving,
    ],
  );
  return useSetAsync(settings, set);
};

export const usePrioritizeRecentProject = (
  settings: Settings,
): ((dirPath: string) => Promise<ErrorReport | undefined>) => {
  return useSetAsync(settings, settings.prioritizeRecentProject);
};

export const useRemoveRecentProject = (
  settings: Settings,
): ((dirPath: string) => Promise<ErrorReport | undefined>) => {
  return useSetAsync(settings, settings.removeRecentProject);
};
