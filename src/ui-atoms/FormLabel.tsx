import * as Chakra from '@chakra-ui/react';
import { QuestionIcon } from '@chakra-ui/icons';
import { ReactElement } from 'react';
import Tooltip from './Tooltip';

interface FormLabelProps {
  infoMessage?: string;
  label: string;
}

export default function FormLabel({
  infoMessage,
  label,
}: FormLabelProps): ReactElement {
  return (
    <Chakra.FormLabel display='flex' flexDirection='row' alignItems='center'>
      <Chakra.Text>{label}</Chakra.Text>
      {infoMessage && (
        <Tooltip label={infoMessage} placement='top'>
          <QuestionIcon w={3} h={3} ml={1} color='app.info' />
        </Tooltip>
      )}
    </Chakra.FormLabel>
  );
}
