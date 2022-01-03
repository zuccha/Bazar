import * as Chakra from '@chakra-ui/react';
import { ReactElement, ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  label: ReactNode;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({
  children,
  label,
  placement,
}: TooltipProps): ReactElement {
  return (
    <Chakra.Tooltip
      label={label}
      placement={placement}
      hasArrow
      openDelay={200}
    >
      <Chakra.Box>{children}</Chakra.Box>
    </Chakra.Tooltip>
  );
}
