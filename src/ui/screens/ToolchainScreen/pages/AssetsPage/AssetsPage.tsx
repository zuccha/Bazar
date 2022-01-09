import { StackDivider, Text, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { useToolchain } from '../../../../../core-hooks/Core';
import {
  useGetAsset,
  useSetupAsset,
} from '../../../../../core-hooks/Toolchain';
import useAsyncCallback from '../../../../../hooks/useAsyncCallback';
import useToast from '../../../../../hooks/useToast';
import AssetItem from './AssetItem';

export default function Assets(): ReactElement {
  const toolchain = useToolchain();

  const vanillaRom = useGetAsset(toolchain, 'vanillaRom');

  const setupVanillaRom = useSetupAsset(toolchain, 'vanillaRom');

  const toast = useToast();

  const handleSetupVanillaRom = useAsyncCallback(
    async (path: string) => {
      const error = await setupVanillaRom(path);
      if (error) toast.failure('Failed to setup vanilla ROM', error);
      return error;
    },
    [setupVanillaRom, toast],
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
        Assets used for different reasons. When you setup an asset, it will be
        copied in Bazar directory. The original file will not be modified in any
        way.
      </Text>
      <AssetItem
        name='Vanilla ROM'
        description='The vanilla ROM hack is needed for creating BPS patches. Make sure the ROM has not undergone any changes.'
        isDisabled={handleSetupVanillaRom.isLoading}
        isSetup={vanillaRom.status === 'present'}
        onSetup={handleSetupVanillaRom.call}
      />
    </VStack>
  );
}
