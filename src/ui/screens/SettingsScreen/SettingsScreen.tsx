import { Center, Flex, HStack, useToast, VStack } from '@chakra-ui/react';
import { ReactElement, useCallback, useRef, useState } from 'react';
import useAsyncCallback from '../../../hooks/useAsyncCallback';
import useHandleError from '../../../hooks/useHandleError';
import Button from '../../../ui-atoms/input/Button';
import NewProjectSettings, {
  NewProjectSettingsRef,
} from './groups/NewProjectSettings';

export default function SettingsScreen(): ReactElement {
  const toast = useToast();
  const handleError = useHandleError();

  const newProjectSettingsRef = useRef<NewProjectSettingsRef>(null);

  const handleReset = useCallback(() => {
    newProjectSettingsRef.current?.reset();
  }, [newProjectSettingsRef.current?.reset]);

  const handleSave = useAsyncCallback(async () => {
    if (newProjectSettingsRef.current) {
      const maybeErrors = await newProjectSettingsRef.current.save();
      const error = maybeErrors.find((maybeError) => !!maybeError);
      handleError(error, 'Failed to save settings');
      if (error) return error;
      toast({
        title: 'Settings saved',
        description: 'Your settings have been saved',
        status: 'success',
        isClosable: true,
      });
    }
  }, [newProjectSettingsRef.current?.save]);

  return (
    <Center flex={1} p={10} h='100%'>
      <Flex direction='column' h='100%' w='100%' maxW='600px'>
        <Flex direction='column' flex={1} w='100%' overflowY='auto'>
          <VStack alignItems='flex-start' spacing={8} w='100%' margin='auto'>
            <NewProjectSettings
              isDisabled={handleSave.isLoading}
              ref={newProjectSettingsRef}
            />
          </VStack>
        </Flex>
        <HStack w='100%' justifyContent='flex-end' pt={6}>
          <Button label='Reset' onClick={handleReset} variant='outline' />
          <Button label='Save' onClick={handleSave.call} />
        </HStack>
      </Flex>
    </Center>
  );
}
