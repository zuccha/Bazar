import { useToast } from '@chakra-ui/react';
import { useCallback } from 'react';
import ErrorReport from '../utils/ErrorReport';

export default function useHandleError(): (
  error: ErrorReport | undefined,
  title: string,
) => void {
  const toast = useToast();
  const handleError = useCallback(
    (error: ErrorReport | undefined, title: string) => {
      if (error) {
        toast({
          title,
          description: error.message,
          status: 'error',
        });
      }
    },
    [toast],
  );
  return handleError;
}
