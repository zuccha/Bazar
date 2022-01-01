import { useCallback } from 'react';
import { useSettings } from '../../../core-hooks/Core';
import { useSetSetting, useSetting } from '../../../core-hooks/Settings';
import { GenericSetting, GenericSettingsStore } from '../../../core/Settings';
import useHandleError from '../../../hooks/useHandleError';
import useSafeState from '../../../hooks/usSafeState';
import {
  FormField,
  FormFieldParams,
  useFormField,
} from '../../../ui-atoms/input/FormControl';

// TODO: Add debounce.
// TODO: Handle global settings saving.

export default function useSettingField<S extends GenericSetting>(
  setting: S,
  params: Omit<FormFieldParams<GenericSettingsStore[S]>, 'initialValue'>,
): {
  field: FormField<GenericSettingsStore[S]>;
  set: (value: GenericSettingsStore[S]) => void;
  isSaving: boolean;
} {
  const handleError = useHandleError();

  const [isSaving, setIsSaving] = useSafeState(false);
  const settings = useSettings();

  const initialValue = useSetting(settings, setting);
  const field = useFormField<GenericSettingsStore[S]>({
    initialValue,
    ...params,
  });

  const setSetting = useSetSetting(settings, setting);

  const set = useCallback(
    (newValue: GenericSettingsStore[S]) => {
      const oldValue = field.value;
      setIsSaving(true);
      field.handleChange(newValue);
      setSetting(setting, newValue).then((maybeError) => {
        setIsSaving(false);
        if (maybeError) {
          field.handleChange(oldValue);
          handleError(maybeError, 'Failed to save setting');
        }
      });
    },
    [field.value, setting],
  );

  return { field, set, isSaving };
}
