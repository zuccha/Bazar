import { VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { useCore } from '../../../../contexts/CoreContext';
import { useToolchain } from '../../../../core-hooks/Core';
import { useProjectLatestSnapshot } from '../../../../core-hooks/Project';
import {
  useLaunchProjectSnapshotInEmulator,
  useOpenProjectSnapshotInLunarMagic,
} from '../../../../core-hooks/ProjectSnapshot';
import Core from '../../../../core/Core';
import Project from '../../../../core/Project';
import { useGet, useSetAsync } from '../../../../hooks/useAccessors';
import useAsyncCallback from '../../../../hooks/useAsyncCallback';
import useHandleError from '../../../../hooks/useHandleError';
import Button from '../../../../ui-atoms/input/Button';

interface ProjectScreenSidebarActionsProps {
  project: Project;
}

export default function ProjectScreenSidebarActions({
  project,
}: ProjectScreenSidebarActionsProps): ReactElement {
  const toolchain = useToolchain();
  const handleError = useHandleError();

  const snapshot = useProjectLatestSnapshot(project);
  const openInLunarMagic = useOpenProjectSnapshotInLunarMagic(snapshot);
  const launchInEmulator = useLaunchProjectSnapshotInEmulator(snapshot);

  const handleOpenInLunarMagic = useAsyncCallback(
    () => openInLunarMagic(toolchain),
    [toolchain],
  );

  const handleLaunchInEmulator = useAsyncCallback(
    () => launchInEmulator(toolchain),
    [toolchain],
  );

  return (
    <VStack w='100%'>
      <Button
        isDisabled={
          toolchain.getLunarMagic().status !== 'installed' ||
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
          !toolchain.getEmulator().exePath || handleLaunchInEmulator.isLoading
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
