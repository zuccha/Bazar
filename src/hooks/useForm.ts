import { useCallback, useMemo } from 'react';
import ErrorReport from '../utils/ErrorReport';
import { FormField } from './useFormField';
import useSafeState from './usSafeState';

interface Form {
  error: ErrorReport | undefined;
  handleSubmit: () => Promise<ErrorReport | undefined>;
  isSubmitting: boolean;
  isValid: boolean;
}

export default function useForm({
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
