import { Flex } from '@chakra-ui/react';
import { ReactElement } from 'react';
import useCopyToClipboard from '../hooks/useCopyToClipboard';
import { ErrorReport } from '../utils/ErrorReport';
import Alert from './Alert';

interface FormErrorProps {
  errorReport: ErrorReport;
}

export default function FormError({
  errorReport,
}: FormErrorProps): ReactElement {
  const copyToClipboard = useCopyToClipboard();

  return (
    <Flex
      _hover={{ cursor: 'pointer' }}
      onClick={() => {
        copyToClipboard.call(errorReport.all().join('\n'));
      }}
    >
      <Alert status='error'>
        <Flex alignItems='center'>{errorReport.main}</Flex>
      </Alert>
    </Flex>
  );
}
