import * as Chakra from '@chakra-ui/react';
import { ChangeEvent, ReactElement, useCallback } from 'react';
import useColorScheme from '../theme/useColorScheme';

interface TextEditorProps extends Chakra.LayoutProps {
  isDisabled?: boolean;
  isInvalid?: boolean;
  isReadonly?: boolean;
  onBlur?: () => void;
  onClear?: () => void;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}

export default function TextEditor({
  isDisabled,
  isInvalid,
  isReadonly,
  onBlur,
  onClear,
  onChange,
  placeholder,
  value,
  ...props
}: TextEditorProps): ReactElement {
  const colorScheme = useColorScheme();

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange],
  );

  return (
    <Chakra.InputGroup alignItems='center' size='sm' {...props}>
      <Chakra.Input
        borderRadius={0}
        colorScheme={colorScheme}
        isDisabled={isDisabled}
        isInvalid={isInvalid}
        isReadOnly={isReadonly}
        onBlur={onBlur}
        onChange={handleChange}
        placeholder={placeholder}
        _placeholder={{ color: 'gray.700' }}
        size='sm'
        value={value}
        variant='outline'
      />
      {!!onClear && (
        <Chakra.InputRightElement
          children={
            <Chakra.CloseButton
              isDisabled={!value}
              onClick={onClear}
              size='sm'
            />
          }
        />
      )}
    </Chakra.InputGroup>
  );
}
