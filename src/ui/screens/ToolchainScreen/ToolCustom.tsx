import { Flex, Heading, Text } from '@chakra-ui/react';
import { ReactElement } from 'react';
import useAsyncCallback from '../../../hooks/useAsyncCallback';
import useHandleError from '../../../hooks/useHandleError';
import Button from '../../../ui-atoms/input/Button';
import { $Dialog } from '../../../utils/Dialog';

interface ToolCustomProps {
  exePath: string;
  isDisabled: boolean;
  name: string;
  onChoose: (exePath: string) => void;
}

export default function ToolCustom({
  exePath,
  isDisabled,
  name,
  onChoose,
}: ToolCustomProps): ReactElement {
  const handleError = useHandleError();

  const handleBrowse = useAsyncCallback(async () => {
    const maybePathOrError = await $Dialog.open({
      type: 'file',
      filters: [{ name: 'Executable', extensions: ['exe'] }],
    });
    if (maybePathOrError.isError) {
      handleError(maybePathOrError.error, 'Failed to open file dialog');
      return maybePathOrError.error;
    }
    if (maybePathOrError.value) {
      onChoose(maybePathOrError.value);
    }
  }, [onChoose]);

  return (
    <Flex w='100%' minH='60px' alignItems='center'>
      <Flex flexDir='column' flex={1}>
        <Heading size='sm'>{name}</Heading>
        <Text size='sm' fontStyle='italic' maxW={400}>
          {exePath || '<Not specified>'}
        </Text>
      </Flex>
      <Button
        isDisabled={handleBrowse.isLoading || isDisabled}
        label='Browse...'
        onClick={handleBrowse.call}
        variant='outline'
      />
    </Flex>
  );
}
