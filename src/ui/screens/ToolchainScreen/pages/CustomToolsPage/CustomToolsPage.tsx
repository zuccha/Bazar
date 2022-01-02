import { StackDivider, Text, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { useToolchain } from '../../../../../core-hooks/Core';
import {
  useEditCustomTool,
  useGetCustomTool,
} from '../../../../../core-hooks/Toolchain';
import useAsyncCallback from '../../../../../hooks/useAsyncCallback';
import useHandleError from '../../../../../hooks/useHandleError';
import CustomToolItem from './CustomToolItem';

export default function ToolchainScreen(): ReactElement {
  const toolchain = useToolchain();

  const editor = useGetCustomTool(toolchain, 'editor');
  const emulator = useGetCustomTool(toolchain, 'emulator');

  const editEditor = useEditCustomTool(toolchain, 'editor');
  const editEmulator = useEditCustomTool(toolchain, 'emulator');

  const handleError = useHandleError();

  const handleEditEditor = useAsyncCallback(
    async (exePath: string) => {
      const maybeError = await editEditor(exePath);
      handleError(maybeError, 'Failed to edit editor');
      return maybeError;
    },
    [editEditor, handleError],
  );

  const handleEditEmulator = useAsyncCallback(
    async (exePath: string) => {
      const maybeError = await editEmulator(exePath);
      handleError(maybeError, 'Failed to edit emulator');
      return maybeError;
    },
    [editEmulator, handleError],
  );

  return (
    <VStack
      h='100%'
      spacing={4}
      divider={<StackDivider borderColor='app.bg1' />}
      alignItems='flex-start'
    >
      <Text pb={2}>These are tools of your personal choice.</Text>
      <CustomToolItem
        description='The editor is used to open source code files (e.g., patches and blocks).'
        exePath={editor.exePath}
        isDisabled={handleEditEditor.isLoading}
        name='Editor'
        onChoose={handleEditEditor.call}
      />
      <CustomToolItem
        description='The emulator is used to run the game.'
        exePath={emulator.exePath}
        isDisabled={handleEditEmulator.isLoading}
        name='Emulator'
        onChoose={handleEditEmulator.call}
      />
    </VStack>
  );
}
