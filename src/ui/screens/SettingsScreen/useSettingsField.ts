import { useCallback } from 'react';
import { useSettings } from '../../../core-hooks/Core';
import {
  useIsSavingSettings,
  useSetSetting,
  useSetting,
} from '../../../core-hooks/Settings';
import { GenericSetting, GenericSettingsStore } from '../../../core/Settings';
import useHandleError from '../../../hooks/useHandleError';
import {
  FormField,
  FormFieldParams,
  useFormField,
} from '../../../ui-atoms/input/FormControl';

// TODO: Add debounce.

export default function useSettingField<S extends GenericSetting>(
  setting: S,
  params: Omit<FormFieldParams<GenericSettingsStore[S]>, 'initialValue'>,
): {
  field: FormField<GenericSettingsStore[S]>;
  set: (value: GenericSettingsStore[S]) => void;
  isSaving: boolean;
} {
  const handleError = useHandleError();

  const settings = useSettings();
  const isSaving = useIsSavingSettings(settings);

  const initialValue = useSetting(settings, setting);
  const field = useFormField<GenericSettingsStore[S]>({
    initialValue,
    ...params,
  });

  const setSetting = useSetSetting(settings, setting);

  const set = useCallback(
    (newValue: GenericSettingsStore[S]) => {
      const oldValue = field.value;
      field.handleChange(newValue);
      setSetting(newValue).then((maybeError) => {
        if (maybeError) {
          field.handleChange(oldValue);
          handleError(maybeError, 'Failed to save setting');
        }
      });
    },
    [field.value, setting, isSaving],
  );

  return { field, set, isSaving };
}
