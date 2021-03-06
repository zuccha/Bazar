import { StackDivider, Text, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { useToolchain } from '../../../../../core-hooks/Core';
import {
  useEditCustomTool,
  useGetCustomTool,
} from '../../../../../core-hooks/Toolchain';
import useAsyncCallback from '../../../../../hooks/useAsyncCallback';
import useToast from '../../../../../hooks/useToast';
import CustomToolItem from './CustomToolItem';

export default function ToolchainScreen(): ReactElement {
  const toolchain = useToolchain();

  const editor = useGetCustomTool(toolchain, 'editor');
  const emulator = useGetCustomTool(toolchain, 'emulator');

  const editEditor = useEditCustomTool(toolchain, 'editor');
  const editEmulator = useEditCustomTool(toolchain, 'emulator');

  const toast = useToast();

  const handleEditEditor = useAsyncCallback(
    async (exePath: string) => {
      const error = await editEditor(exePath);
      if (error) toast.failure('Failed to edit editor', error);
      return error;
    },
    [editEditor, toast],
  );

  const handleEditEmulator = useAsyncCallback(
    async (exePath: string) => {
      const error = await editEmulator(exePath);
      if (error) toast.failure('Failed to edit emulator', error);
      return error;
    },
    [editEmulator, toast],
  );

  return (
    <VStack
      h='100%'
      spacing={4}
      divider={<StackDivider borderColor='app.bg1' />}
      alignItems='flex-start'
      p={4}
    >
      <Text pb={2}>
        These are tools of your personal choice, used to modify resources that
        Bazar doesn't handle directly.
      </Text>
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
