import * as Chakra from '@chakra-ui/react';
import {
  ReactElement,
  ReactNode,
  useCallback,
  useLayoutEffect,
  useMemo,
} from 'react';
import useSafeState from '../../hooks/usSafeState';
import { ErrorReport } from '../../utils/ErrorReport';
import FormError from './FormError';
import FormLabel from './FormLabel';

/**
 * FormControl
 */

interface FormControlProps {
  children: ReactNode;
  errorReport?: ErrorReport;
  infoMessage?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  label: string;
  width?: number | string;
}

export default function FormControl({
  children,
  errorReport,
  infoMessage,
  isDisabled,
  isInvalid,
  isRequired = false,
  label,
  width,
}: FormControlProps): ReactElement {
  return (
    <Chakra.FormControl
      isRequired={isRequired}
      label={label}
      isDisabled={isDisabled}
      isInvalid={isInvalid}
      width={width}
    >
      <FormLabel label={label} infoMessage={infoMessage} />
      {children}
      {errorReport && <FormError errorReport={errorReport} />}
    </Chakra.FormControl>
  );
}

/**
 * useFormField
 */

export interface FormFieldParams<T> {
  infoMessage?: string;
  initialValue: T;
  isRequired?: boolean;
  label: string;
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

export function useFormField<T>({
  infoMessage,
  initialValue,
  isRequired = false,
  label,
  onValidate = async () => undefined,
}: FormFieldParams<T>): FormField<T> {
  const [value, setValue] = useSafeState(initialValue);
  const [isDirty, setIsDirty] = useSafeState(!!initialValue);
  const [errorReport, setErrorReport] = useSafeState<ErrorReport | undefined>(
    undefined,
  );

  useLayoutEffect(() => {
    if (isDirty) onValidate(value).then(setErrorReport);
  }, []);

  const handleChange = useCallback(
    async (newValue: T) => {
      const newErrorReport = await onValidate(newValue);
      setErrorReport(newErrorReport);
      setIsDirty(true);
      setValue(newValue);
    },
    [onValidate],
  );

  const handleBlur = useCallback(async () => {
    const newErrorReport = await onValidate(value);
    setErrorReport(newErrorReport);
    setIsDirty(true);
  }, [onValidate, value]);

  const isValid = useMemo(() => {
    return isDirty ? !errorReport : !onValidate(initialValue);
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

/**
 * useForm
 */

interface Form {
  error: ErrorReport | undefined;
  handleSubmit: () => Promise<ErrorReport | undefined>;
  isSubmitting: boolean;
  isValid: boolean;
}

export function useForm({
  fields,
  onSubmit,
}: {
  fields: FormField<any>[];
  onSubmit: () => Promise<ErrorReport | undefined>;
}): Form {
  const [isSubmitting, setIsSubmitting] = useSafeState(false);
  const [error, setError] = useSafeState<ErrorReport | undefined>(undefined);

  const isValid = useMemo(() => {
    return fields.every((field) => !field.control.isRequired || field.isValid);
  }, [fields]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    const maybeError = await onSubmit();
    setIsSubmitting(false);
    setError(maybeError);
    return maybeError;
  }, [onSubmit]);

  return {
    error,
    handleSubmit,
    isSubmitting,
    isValid,
  };
}
