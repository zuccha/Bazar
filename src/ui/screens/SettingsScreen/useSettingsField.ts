import { useCallback } from 'react';
import { useSettings } from '../../../core-hooks/Core';
import { useSetSetting, useSetting } from '../../../core-hooks/Settings';
import { GenericSetting, GenericSettingsStore } from '../../../core/Settings';
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
  const settings = useSettings();

  const initialValue = useSetting(settings, setting);
  const field = useFormField<GenericSettingsStore[S]>({
    initialValue,
    ...params,
  });

  const setSetting = useSetSetting(settings, setting);

  const save = useCallback(() => {
    return setSetting(setting, field.value);
  }, [field.value, setting]);

  const reset = useCallback(() => {
    return field.handleChange(initialValue);
  }, [field.handleChange, initialValue]);

  return { field, save, reset };
}
