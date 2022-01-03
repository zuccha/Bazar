import { VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { useToolchain } from '../../../../core-hooks/Core';
import {
  useCreateProjectBackup,
  useProjectLatestSnapshot,
} from '../../../../core-hooks/Project';
import {
  useLaunchProjectSnapshotInEmulator,
  useOpenProjectSnapshotInLunarMagic,
} from '../../../../core-hooks/ProjectSnapshot';
import {
  useGetCustomTool,
  useGetEmbeddedTool,
} from '../../../../core-hooks/Toolchain';
import Project from '../../../../core/Project';
import useAsyncCallback from '../../../../hooks/useAsyncCallback';
import useHandleError from '../../../../hooks/useHandleError';
import Button from '../../../../ui-atoms/Button';

interface ProjectScreenSidebarActionsProps {
  project: Project;
}

export default function ProjectScreenSidebarActions({
  project,
}: ProjectScreenSidebarActionsProps): ReactElement {
  const toolchain = useToolchain();
  const handleError = useHandleError();

  const snapshot = useProjectLatestSnapshot(project);
  const lunarMagic = useGetEmbeddedTool(toolchain, 'lunarMagic');
  const emulator = useGetCustomTool(toolchain, 'emulator');
  const openInLunarMagic = useOpenProjectSnapshotInLunarMagic(snapshot);
  const launchInEmulator = useLaunchProjectSnapshotInEmulator(snapshot);
  const createBackup = useCreateProjectBackup(project);

  const handleOpenInLunarMagic = useAsyncCallback(
    () => openInLunarMagic(toolchain),
    [toolchain],
  );

  const handleLaunchInEmulator = useAsyncCallback(
    () => launchInEmulator(toolchain),
    [toolchain],
  );

  const handleCreateBackup = useAsyncCallback(createBackup, [createBackup]);

  return (
    <VStack w='100%'>
      <Button
        isDisabled={
          lunarMagic.status !== 'installed' || handleOpenInLunarMagic.isLoading
        }
        label='Open in Lunar Magic'
        onClick={async () => {
          const error = await handleOpenInLunarMagic.call();
          handleError(error, 'Failed to open in Lunar Magic');
        }}
        w='100%'
      />
      <Button
        isDisabled={!emulator.exePath || handleLaunchInEmulator.isLoading}
        label='Run on emulator'
        onClick={async () => {
          const error = await handleLaunchInEmulator.call();
          handleError(error, 'Failed to run in emulator');
        }}
        w='100%'
      />
      <Button
        isDisabled={handleCreateBackup.isLoading}
        label='Create backup'
        onClick={handleCreateBackup.call}
        w='100%'
      />
      <Button label='Create BPS' onClick={() => null} w='100%' isDisabled />
    </VStack>
  );
}
