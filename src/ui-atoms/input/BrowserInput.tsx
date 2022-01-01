import * as Chakra from '@chakra-ui/react';
import { useToast } from '@chakra-ui/react';
import { ReactElement, useCallback } from 'react';
import { $Dialog } from '../../utils/Dialog';
import Button from './Button';
import TextInput from './TextInput';

interface BrowserInputProps {
  filters?: { name: string; extensions: string[] }[];
  isDisabled?: boolean;
  isInvalid?: boolean;
  isManualEditDisabled?: boolean;
  mode: 'file' | 'directory';
  onBlur?: () => void;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}

export default function BrowserInput({
  filters,
  isDisabled,
  isInvalid,
  isManualEditDisabled,
  mode,
  onBlur,
  onChange,
  placeholder,
  value,
}: BrowserInputProps): ReactElement {
  const toast = useToast();

  const handleBrowse = useCallback(async () => {
    const pathOrError = await $Dialog.open({
      defaultPath: value ?? undefined,
      filters,
      type: mode,
    });
    if (pathOrError.isValue) {
      if (pathOrError.value) {
        onChange(pathOrError.value);
      }
    } else {
      toast({
        title: 'Failed to open dialog',
        description: pathOrError.error.main,
      });
    }
  }, [onChange]);

  return (
    <Chakra.HStack width='100%'>
      <Chakra.Flex flex={1}>
        <TextInput
          isDisabled={isDisabled}
          isInvalid={isInvalid}
          isReadonly={isManualEditDisabled}
          onBlur={onBlur}
          onChange={onChange}
          placeholder={placeholder}
          value={value}
        />
      </Chakra.Flex>
      <Button
        label='...'
        isDisabled={isDisabled}
        onClick={handleBrowse}
        variant='outline'
      />
    </Chakra.HStack>
  );
}
