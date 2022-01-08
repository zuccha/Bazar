import { Button, Flex, useToast as useChakraToast } from '@chakra-ui/react';
import { useCallback, useMemo } from 'react';
import { $Clipboard } from '../utils/Clipboard';
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
      chakraToast({
        containerStyle: { maxWidth: '350px' },
        title: message,
        description: (
          <Button
            size='sm'
            onClick={() => $Clipboard.write(error.trace().join('\n'))}
            isFullWidth
            bg='red.600'
            _hover={{ bg: 'red.700' }}
            _active={{ bg: 'red.800' }}
            mt={2}
          >
            Copy
          </Button>
        ),
        status: 'error',
        isClosable: true,
      });
    },
    [chakraToast],
  );

  const success = useCallback(
    (message: string) => {
      chakraToast({
        containerStyle: { maxWidth: '350px' },
        title: message,
        status: 'success',
        isClosable: true,
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
