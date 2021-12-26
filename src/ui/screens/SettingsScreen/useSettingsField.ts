import { useCallback } from 'react';
import { useCore } from '../../../contexts/CoreContext';
import Core from '../../../core/Core';
import { GenericSetting, GenericSettingsStore } from '../../../core/Settings';
import { useGet, useSetAsync } from '../../../hooks/useAccessors';
import {
  FormField,
  FormFieldParams,
  useFormField,
} from '../../../ui-atoms/input/FormControl';
import { ErrorReport } from '../../../utils/ErrorReport';

export default function useSettingField<S extends GenericSetting>(
  setting: S,
  params: Omit<FormFieldParams<GenericSettingsStore[S]>, 'initialValue'>,
): {
  field: FormField<GenericSettingsStore[S]>;
  save: () => Promise<ErrorReport | undefined>;
  reset: () => void;
} {
  const core = useCore();
  const settings = useGet(core, core.getSettings, Core.getSettingsDeps);

  const initialValue = useGet(settings, () => settings.get(setting), [setting]);
  const field = useFormField<GenericSettingsStore[S]>({
    initialValue,
    ...params,
  });

  const setSetting = useSetAsync(settings, settings.set, [setting]);

  const save = useCallback(() => {
    return setSetting(setting, field.value);
  }, [field.value, setting]);

  const reset = useCallback(() => {
    return field.handleChange(initialValue);
  }, [field.handleChange, initialValue]);

  return { field, save, reset };
}
