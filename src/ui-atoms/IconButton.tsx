import * as Chakra from '@chakra-ui/react';
import { ReactElement } from 'react';
import useColorScheme from '../theme/useColorScheme';
import Tooltip from './Tooltip';

interface IconButtonProps {
  icon: ReactElement;
  isDisabled?: boolean;
  label: string;
  onClick: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
}

export default function IconButton({
  icon,
  isDisabled,
  label,
  onClick,
  size,
  tooltipPlacement = 'bottom',
  variant = 'solid',
}: IconButtonProps): ReactElement {
  const colorScheme = useColorScheme();
  return (
    <Tooltip label={label} placement={tooltipPlacement}>
      <Chakra.IconButton
        aria-label={label}
        colorScheme={colorScheme}
        isDisabled={isDisabled}
        icon={icon}
        onClick={onClick}
        size={size}
        variant={variant}
      />
    </Tooltip>
  );
}
