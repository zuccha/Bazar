import { VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Project from '../../../../core2/Project';
import { useGet, useSetAsync } from '../../../../hooks/useAccessors';
import useAsyncCallback from '../../../../hooks/useAsyncCallback';
import useHandleError from '../../../../hooks/useHandleError';
import { AppDispatch } from '../../../../store';
import { getToolchain } from '../../../../store/slices/core/slices/toolchain';
import Button from '../../../../ui-atoms/input/Button';

interface ProjectScreenSidebarActionsProps {
  project: Project;
}

export default function ProjectScreenSidebarActions({
  project,
}: ProjectScreenSidebarActionsProps): ReactElement {
  const dispatch = useDispatch<AppDispatch>();
  const toolchain = useSelector(getToolchain());
  const handleError = useHandleError();

  const snapshot = useGet(project, project.getLatest, Project.getLatestDeps);
  const openInLunarMagic = useSetAsync(snapshot, snapshot.openInLunarMagic, []);
  const launchInEmulator = useSetAsync(snapshot, snapshot.launchInEmulator, []);

  const handleOpenInLunarMagic = useAsyncCallback(
    () => openInLunarMagic(toolchain),
    [dispatch, toolchain],
  );

  const handleLaunchInEmulator = useAsyncCallback(
    () => launchInEmulator(toolchain),
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
