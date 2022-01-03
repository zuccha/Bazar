import * as Chakra from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import { ReactElement } from 'react';
import { ErrorReport } from '../utils/ErrorReport';
import Tooltip from './Tooltip';

interface FormErrorProps {
  errorReport: ErrorReport;
}

function ErrorTooltipLabel({ messages }: { messages: string[] }): ReactElement {
  return (
    <Chakra.VStack alignItems='flex-start' spacing={1}>
      {messages.map((message) => (
        <Chakra.Text key={message}>{message}</Chakra.Text>
      ))}
    </Chakra.VStack>
  );
}

export default function FormError({
  errorReport,
}: FormErrorProps): ReactElement {
  return (
    <Chakra.Flex alignItems='center' mt={2}>
      <Chakra.Text fontSize='sm' color='app.error'>
        {errorReport.main}
      </Chakra.Text>
      {errorReport.others.length > 0 && (
        <Tooltip
          label={<ErrorTooltipLabel messages={errorReport.all()} />}
          placement='top'
        >
          <WarningIcon w={3} h={3} ml={1} color='app.error' />
        </Tooltip>
      )}
    </Chakra.Flex>
  );
}
