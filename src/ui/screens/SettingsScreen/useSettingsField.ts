import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../store';
import {
  getSetting,
  setSetting,
  SettingsState,
} from '../../../store/slices/settings';
import {
  FormField,
  FormFieldParams,
  useFormField,
} from '../../../ui-atoms/input/FormControl';
import { ErrorReport } from '../../../utils/ErrorReport';

export default function useSettingField<S extends keyof SettingsState>(
  setting: S,
  params: Omit<FormFieldParams<SettingsState[S]>, 'initialValue'>,
): {
  field: FormField<SettingsState[S]>;
  save: () => Promise<ErrorReport | undefined>;
  reset: () => void;
} {
  const initialValue = useSelector(getSetting(setting));
  const field = useFormField<SettingsState[S]>({ initialValue, ...params });

  const dispatch = useDispatch<AppDispatch>();

  const save = useCallback(() => {
    return dispatch(setSetting(setting, field.value));
  }, [dispatch, field.value, setting]);

  const reset = useCallback(() => {
    return field.handleChange(initialValue);
  }, [field.handleChange, initialValue]);

  return { field, save, reset };
}
