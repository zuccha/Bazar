import { VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useAsyncCallback from '../../../../hooks/useAsyncCallback';
import useHandleError from '../../../../hooks/useHandleError';
import { AppDispatch } from '../../../../store';
import {
  launchInEmulator,
  openInLunarMagic,
} from '../../../../store/slices/core/slices/project';
import { getToolchain } from '../../../../store/slices/core/slices/toolchain';
import Button from '../../../../ui-atoms/input/Button';

export default function ProjectScreenSidebarActions(): ReactElement {
  const dispatch = useDispatch<AppDispatch>();
  const toolchain = useSelector(getToolchain());
  const handleError = useHandleError();

  const handleOpenInLunarMagic = useAsyncCallback(
    () => dispatch(openInLunarMagic(toolchain)),
    [dispatch, toolchain],
  );

  const handleLaunchInEmulator = useAsyncCallback(
    () => dispatch(launchInEmulator(toolchain)),
    [dispatch, toolchain],
  );

  return (
    <VStack w='100%'>
      <Button
        isDisabled={
          toolchain.embedded.lunarMagic.status !== 'installed' ||
          handleOpenInLunarMagic.isLoading
        }
        label='Open in Lunar Magic'
        onClick={async () => {
          const error = await handleOpenInLunarMagic.call();
          handleError(error, 'Failed to open in Lunar Magic');
        }}
        w='100%'
      />
      <Button
        isDisabled={
          !toolchain.custom.emulator.exePath || handleLaunchInEmulator.isLoading
        }
        label='Run on emulator'
        onClick={async () => {
          const error = await handleLaunchInEmulator.call();
          handleError(error, 'Failed to open in Lunar Magic');
        }}
        w='100%'
      />
      <Button label='Backup' onClick={() => null} w='100%' isDisabled />
      <Button label='Create BPS' onClick={() => null} w='100%' isDisabled />
    </VStack>
  );
}
