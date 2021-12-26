import { ReactElement } from 'react';
import IconButton from '../ui-atoms/input/IconButton';

interface SidebarButtonProps {
  icon: ReactElement;
  isActive?: boolean;
  isDisabled?: boolean;
  label: string;
  onClick: () => void;
}

export default function SidebarButton({
  icon,
  isActive = false,
  isDisabled = false,
  label,
  onClick,
}: SidebarButtonProps): ReactElement {
  return (
    <IconButton
      label={label}
      icon={icon}
      isDisabled={isDisabled}
      onClick={onClick}
      size='lg'
      tooltipPlacement='right'
      variant={isActive ? 'outline' : 'ghost'}
    />
  );
}
