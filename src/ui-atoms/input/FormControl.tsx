import * as Chakra from '@chakra-ui/react';
import { ReactElement, ReactNode, useCallback, useMemo, useState } from 'react';
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
}

export default function FormControl({
  children,
  errorReport,
  infoMessage,
  isDisabled,
  isInvalid,
  isRequired = false,
  label,
}: FormControlProps): ReactElement {
  return (
    <Chakra.FormControl
      isRequired={isRequired}
      label={label}
      isDisabled={isDisabled}
      isInvalid={isInvalid}
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
  onValidate?: (value: T) => ErrorReport | undefined;
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
  onValidate = () => undefined,
}: FormFieldParams<T>): FormField<T> {
  const [value, setValue] = useState(initialValue);
  const [isDirty, setIsDirty] = useState(!!initialValue);
  const [errorReport, setErrorReport] = useState<ErrorReport | undefined>(
    isDirty ? onValidate(value) : undefined,
  );

  const handleChange = useCallback(
    (newValue: T) => {
      const newErrorReport = onValidate(newValue);
      setErrorReport(newErrorReport);
      setIsDirty(true);
      setValue(newValue);
    },
    [onValidate],
  );

  const handleBlur = useCallback(() => {
    const newErrorReport = onValidate(value);
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
  handleSubmit: () => ErrorReport | undefined;
  isValid: boolean;
}

export function useForm({
  fields,
  onSubmit,
}: {
  fields: FormField<any>[];
  onSubmit: () => ErrorReport | undefined;
}): Form {
  const [error, setError] = useState<ErrorReport | undefined>();

  const isValid = useMemo(() => {
    return fields.every((field) => !field.control.isRequired || field.isValid);
  }, [fields]);

  const handleSubmit = useCallback(() => {
    const maybeError = onSubmit();
    setError(maybeError);
    return maybeError;
  }, [onSubmit]);

  return {
    error,
    handleSubmit,
    isValid,
  };
}
