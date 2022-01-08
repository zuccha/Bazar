import { useCallback } from 'react';
import { useSettings } from '../../../core-hooks/Core';
import {
  useIsSavingSettings,
  useSetSetting,
  useSetting,
} from '../../../core-hooks/Settings';
import { GenericSetting, GenericSettingsStore } from '../../../core/Settings';
import useFormField, {
  FormField,
  FormFieldParams,
} from '../../../hooks/useFormField';
import useToast from '../../../hooks/useToast';
import { $Function } from '../../../utils/Function';

interface Options {
  debounce?: number;
}

export default function useSettingField<S extends GenericSetting>(
  setting: S,
  params: Omit<FormFieldParams<GenericSettingsStore[S]>, 'initialValue'>,
  options: Options = {},
): {
  field: FormField<GenericSettingsStore[S]>;
  set: (value: GenericSettingsStore[S]) => void;
  isSaving: boolean;
} {
  const toast = useToast();

  const settings = useSettings();
  const isSaving = useIsSavingSettings(settings);

  const initialValue = useSetting(settings, setting);
  const field = useFormField<GenericSettingsStore[S]>({
    initialValue,
    ...params,
  });

  const setSetting = useSetSetting(settings, setting);
  const setSettingDebounce = useCallback(
    $Function.debounce(setSetting, options.debounce),
    [setSetting, options.debounce],
  );

  const set = useCallback(
    (newValue: GenericSettingsStore[S]) => {
      const oldValue = field.value;
      field.handleChange(newValue);
      setSettingDebounce(newValue).then((error) => {
        if (error) {
          field.handleChange(oldValue);
          toast.failure('Failed to save setting', error);
        }
      });
    },
    [field.handleChange, field.value, setSettingDebounce, toast],
  );

  return { field, set, isSaving };
}
