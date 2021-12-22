import * as Chakra from '@chakra-ui/react';
import { ReactElement, ReactNode } from 'react';

interface AlertProps {
  children: ReactNode;
  status: 'success' | 'warning' | 'error' | 'info';
  title?: string;
}

export default function Alert({
  children,
  status,
  title,
}: AlertProps): ReactElement {
  return (
    <Chakra.Alert status={status}>
      <Chakra.AlertIcon />
      {title && <Chakra.AlertTitle>{title}</Chakra.AlertTitle>}
      <Chakra.AlertDescription>{children}</Chakra.AlertDescription>
    </Chakra.Alert>
  );
}
