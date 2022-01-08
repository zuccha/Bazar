import { useToast as useChakraToast } from '@chakra-ui/react';
import { useCallback, useMemo } from 'react';
import ErrorReport from '../utils/ErrorReport';

export default function useToast(): ((
  successMessage: string,
  failureMessage: string,
  error?: ErrorReport,
) => void) & {
  failure: (message: string, error: ErrorReport) => void;
  success: (message: string) => void;
} {
  const chakraToast = useChakraToast();

  const failure = useCallback(
    (message: string, error: ErrorReport) => {
      // TODO: Copy error trace when pressing toast.
      chakraToast({
        title: message,
        status: 'error',
      });
    },
    [chakraToast],
  );

  const success = useCallback(
    (message: string) => {
      chakraToast({
        title: message,
        status: 'success',
      });
    },
    [chakraToast],
  );

  return useMemo(() => {
    const toast = (
      successMessage: string,
      failureMessage: string,
      error?: ErrorReport,
    ) => {
      error ? failure(failureMessage, error) : success(successMessage);
    };
    toast.failure = failure;
    toast.success = success;
    return toast;
  }, [failure, success]);
}
