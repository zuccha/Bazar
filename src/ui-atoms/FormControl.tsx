import * as Chakra from '@chakra-ui/react';
import { Flex } from '@chakra-ui/react';
import { ReactElement, ReactNode } from 'react';
import ErrorReport from '../utils/ErrorReport';
import FormError from './FormError';
import FormLabel from './FormLabel';

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
      {errorReport && (
        <>
          <Flex h={2} />
          <FormError errorReport={errorReport} />
        </>
      )}
    </Chakra.FormControl>
  );
}
