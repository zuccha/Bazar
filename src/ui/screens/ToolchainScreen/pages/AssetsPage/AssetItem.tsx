import { CheckIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { Flex, Heading, Text } from '@chakra-ui/react';
import { ReactElement, useCallback } from 'react';
import useAsyncCallback from '../../../../../hooks/useAsyncCallback';
import useToast from '../../../../../hooks/useToast';
import Button from '../../../../../ui-atoms/Button';
import { $Dialog } from '../../../../../utils/Dialog';

interface AssetItemProps {
  name: string;
  description: string;
  isDisabled: boolean;
  isSetup: boolean;
  onSetup: (path: string) => void;
}

export default function AssetItem({
  name,
  description,
  isDisabled,
  isSetup,
  onSetup,
}: AssetItemProps): ReactElement {
  const toast = useToast();

  const handleSetup = useAsyncCallback(async () => {
    const pathOrError = await $Dialog.open({
      filters: [{ name: 'SFC', extensions: ['sfc'] }],
      type: 'file',
    });
    if (pathOrError.isError) {
      toast.failure('Failed to open file browser', pathOrError.error);
      return pathOrError.error;
    }
    if (pathOrError.value) onSetup(pathOrError.value);
  }, [toast, onSetup]);

  return (
    <Flex w='100%'>
      <Flex flex={1} flexDir='column'>
        <Heading size='sm' flex={1} display='flex'>
          <Text>{name}&nbsp;</Text>
          {isSetup && <CheckIcon color='green' />}
          {!isSetup && <SmallCloseIcon color='red' />}
        </Heading>
        <Text mt={1}>{description}</Text>
      </Flex>
      <Flex w={90}>
        <Button
          isDisabled={isDisabled || handleSetup.isLoading}
          label='Setup'
          onClick={handleSetup.call}
          size='xs'
          variant='outline'
          w='100%'
        />
      </Flex>
    </Flex>
  );
}
