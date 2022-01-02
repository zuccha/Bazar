import * as Chakra from '@chakra-ui/react';
import { LayoutProps, SpaceProps } from '@chakra-ui/react';
import { forwardRef, ReactElement, Ref } from 'react';
import useColorScheme from '../../theme/useColorScheme';

interface ButtonProps extends LayoutProps, SpaceProps {
  isDisabled?: boolean;
  isFullWidth?: boolean;
  label: string;
  onClick: () => void;
  scheme?: 'normal' | 'destructive';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
}

function Button(
  {
    isDisabled,
    isFullWidth = false,
    label,
    onClick,
    scheme = 'normal',
    size = 'sm',
    variant = 'solid',
    ...props
  }: ButtonProps,
  ref: Ref<HTMLButtonElement>,
): ReactElement {
  const normalColorScheme = useColorScheme();

  const colorScheme = {
    normal: normalColorScheme,
    destructive: 'red',
  }[scheme];

  return (
    <Chakra.Button
      aria-label={label}
      borderRadius='0'
      colorScheme={colorScheme}
      disabled={isDisabled}
      isFullWidth={isFullWidth}
      onClick={onClick}
      py={1}
      ref={ref}
      size={size}
      variant={variant}
      {...props}
    >
      {label}
    </Chakra.Button>
  );
}

export default forwardRef(Button);
