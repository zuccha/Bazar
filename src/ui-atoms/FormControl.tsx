import * as Chakra from '@chakra-ui/react';
import { Flex } from '@chakra-ui/react';
import { ReactElement, ReactNode } from 'react';
import ErrorReport from '../utils/ErrorReport';
import FormError from './FormError';
import FormLabel from './FormLabel';

interface FormControlProps {
  children: ReactNode;
  errorReport?: ErrorReport;
  hideError?: boolean;
  infoMessage?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  isSuccinct?: boolean;
  isTurnedOff?: boolean;
  label: string;
  width?: number | string;
}

export default function FormControl({
  children,
  errorReport,
  hideError = false,
  infoMessage,
  isDisabled,
  isInvalid,
  isRequired = false,
  isSuccinct = false,
  isTurnedOff = false,
  label,
  width,
}: FormControlProps): ReactElement {
  return (
    <Chakra.FormControl
      isRequired={isRequired}
      label={label}
      isDisabled={isDisabled || isTurnedOff}
      isInvalid={isInvalid && !isTurnedOff}
      width={width}
    >
      {!isSuccinct && <FormLabel label={label} infoMessage={infoMessage} />}
      {children}
      {errorReport && !isTurnedOff && !hideError && (
        <>
          <Flex h={2} />
          <FormError errorReport={errorReport} />
        </>
      )}
    </Chakra.FormControl>
  );
}
