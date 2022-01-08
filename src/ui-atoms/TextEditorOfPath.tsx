import { Flex, HStack } from '@chakra-ui/react';
import { ReactElement, useCallback } from 'react';
import useToast from '../hooks/useToast';
import { $Dialog } from '../utils/Dialog';
import Button from './Button';
import TextEditor from './TextEditor';

interface TextEditorOfPathProps {
  filters?: { name: string; extensions: string[] }[];
  isDisabled?: boolean;
  isInvalid?: boolean;
  isManualEditDisabled?: boolean;
  mode: 'file' | 'directory';
  onBlur?: () => void;
  onClear?: () => void;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}

export default function TextEditorOfPath({
  filters,
  isDisabled,
  isInvalid,
  isManualEditDisabled,
  mode,
  onBlur,
  onClear,
  onChange,
  placeholder,
  value,
}: TextEditorOfPathProps): ReactElement {
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
      toast.failure('Failed to browse path', pathOrError.error);
    }
  }, [onChange]);

  return (
    <HStack width='100%'>
      <Flex flex={1}>
        <TextEditor
          isDisabled={isDisabled}
          isInvalid={isInvalid}
          isReadonly={isManualEditDisabled}
          onBlur={onBlur}
          onClear={onClear}
          onChange={onChange}
          placeholder={placeholder}
          value={value}
        />
      </Flex>
      <Button
        label='...'
        isDisabled={isDisabled}
        onClick={handleBrowse}
        variant='outline'
      />
    </HStack>
  );
}
