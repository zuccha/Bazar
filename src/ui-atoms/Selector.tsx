import * as Chakra from '@chakra-ui/react';
import { LayoutProps, SpaceProps } from '@chakra-ui/react';
import { ChangeEvent, forwardRef, ReactElement, Ref, useCallback } from 'react';
import useColorScheme from '../theme/useColorScheme';

export interface SelectorOption {
  label: string;
  value: string;
}

interface SelectorProps extends LayoutProps, SpaceProps {
  isDisabled?: boolean;
  isFullWidth?: boolean;
  onChange: (value: string) => void;
  options: SelectorOption[];
  placeholder: string;
  value: string;
}

function Selector(
  {
    isDisabled,
    isFullWidth = false,
    onChange,
    options,
    placeholder,
    value,
    ...props
  }: SelectorProps,
  ref: Ref<HTMLSelectElement>,
): ReactElement {
  const colorScheme = useColorScheme();

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      onChange(event.target.value);
    },
    [onChange],
  );

  return (
    <Chakra.Select
      bg='transparent'
      borderColor={`${colorScheme}.600`}
      borderRadius='0'
      colorScheme={colorScheme}
      disabled={isDisabled || options.length <= 1}
      isFullWidth={isFullWidth}
      onChange={handleChange}
      ref={ref}
      size='sm'
      value={value}
      variant='outline'
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Chakra.Select>
  );
}

export default forwardRef(Selector);
