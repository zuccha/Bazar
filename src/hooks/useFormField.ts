import { useCallback, useLayoutEffect, useMemo } from 'react';
import ErrorReport from '../utils/ErrorReport';
import useSafeState from './usSafeState';

export interface FormFieldParams<T> {
  infoMessage?: string;
  initialValue: T;
  isRequired?: boolean;
  label: string;
  onChange?: (value: T) => void;
  onValidate?: (value: T) => Promise<ErrorReport | undefined>;
}

export interface FormField<T> {
  control: {
    errorReport: ErrorReport | undefined;
    infoMessage: string | undefined;
    isInvalid: boolean;
    isRequired: boolean;
    label: string;
  };
  handleBlur: () => void;
  handleChange: (value: T) => void;
  isValid: boolean;
  value: T;
}

export default function useFormField<T>({
  infoMessage,
  initialValue,
  isRequired = false,
  label,
  onChange,
  onValidate,
}: FormFieldParams<T>): FormField<T> {
  const [value, setValue] = useSafeState(initialValue);
  const [isDirty, setIsDirty] = useSafeState(!!initialValue);
  const [errorReport, setErrorReport] = useSafeState<ErrorReport | undefined>(
    undefined,
  );

  useLayoutEffect(() => {
    if (isDirty) onValidate?.(value).then(setErrorReport);
  }, []);

  const handleChange = useCallback(
    async (newValue: T) => {
      const newErrorReport = await onValidate?.(newValue);
      onChange?.(newValue);
      setErrorReport(newErrorReport);
      setIsDirty(true);
      setValue(newValue);
    },
    [onValidate],
  );

  const handleBlur = useCallback(async () => {
    const newErrorReport = await onValidate?.(value);
    setErrorReport(newErrorReport);
    setIsDirty(true);
  }, [onValidate, value]);

  const isValid = useMemo(() => {
    return isDirty ? !errorReport : !onValidate?.(initialValue);
  }, [isDirty, errorReport, initialValue, onValidate]);

  return {
    control: {
      errorReport,
      infoMessage,
      isInvalid: Boolean(errorReport) && isDirty,
      isRequired,
      label,
    },
    handleBlur,
    handleChange,
    isValid,
    value,
  };
}
