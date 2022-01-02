import { Flex, Heading, Text } from '@chakra-ui/react';
import { ReactElement, useCallback } from 'react';
import useAsyncCallback from '../../../../../hooks/useAsyncCallback';
import useHandleError from '../../../../../hooks/useHandleError';
import BrowserInput from '../../../../../ui-atoms/input/BrowserInput';
import FormControl from '../../../../../ui-atoms/input/FormControl';
import { $Dialog } from '../../../../../utils/Dialog';

interface CustomToolItemProps {
  description: string;
  exePath: string;
  isDisabled: boolean;
  name: string;
  onChoose: (exePath: string) => void;
}

export default function CustomToolItem({
  description,
  exePath,
  isDisabled,
  name,
  onChoose,
}: CustomToolItemProps): ReactElement {
  const handleError = useHandleError();

  const handleBrowse = useAsyncCallback(
    async (value: string) => {
      onChoose(value);
      return undefined;
    },
    [onChoose, handleError],
  );

  const handleClear = useCallback(() => {
    onChoose('');
  }, [onChoose]);

  return (
    <Flex flexDir='column' w='100%'>
      <Flex flex={1} flexDir='column' mb={2}>
        <Heading size='sm' flex={1} display='flex'>
          {name}
        </Heading>
        <Text mt={1}>{description}</Text>
      </Flex>

      <FormControl
        infoMessage='The path to the executable of the tool'
        label='Executable'
      >
        <BrowserInput
          isDisabled={handleBrowse.isLoading || isDisabled}
          isManualEditDisabled
          filters={[{ name: 'Executable', extensions: ['exe'] }]}
          mode='file'
          onClear={handleClear}
          onChange={handleBrowse.call}
          placeholder='Choose executable'
          value={exePath}
        />
      </FormControl>
    </Flex>
  );
}
