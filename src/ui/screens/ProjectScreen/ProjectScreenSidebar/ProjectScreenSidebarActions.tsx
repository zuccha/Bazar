import { VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { useCore } from '../../../../contexts/CoreContext';
import Core from '../../../../core2/Core';
import Project from '../../../../core2/Project';
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
  const core = useCore();
  const toolchain = useGet(core, core.getToolchain, Core.getToolchainDeps);
  const handleError = useHandleError();

  const snapshot = useGet(project, project.getLatest, Project.getLatestDeps);
  const openInLunarMagic = useSetAsync(snapshot, snapshot.openInLunarMagic, []);
  const launchInEmulator = useSetAsync(snapshot, snapshot.launchInEmulator, []);

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
