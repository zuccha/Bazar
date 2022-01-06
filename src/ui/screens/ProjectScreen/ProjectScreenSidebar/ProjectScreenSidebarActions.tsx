import { useToast, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { useAddProjectSnapshotToCollection } from '../../../../core-hooks/Collection';
import { useCollection, useToolchain } from '../../../../core-hooks/Core';
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
import useSafeState from '../../../../hooks/usSafeState';
import Button from '../../../../ui-atoms/Button';
import ProjectAdditionToCollectionDrawer from '../../../drawers/ProjectAdditionToCollectionDrawer';

interface ProjectScreenSidebarActionsProps {
  project: Project;
}

export default function ProjectScreenSidebarActions({
  project,
}: ProjectScreenSidebarActionsProps): ReactElement {
  const handleError = useHandleError();
  const toast = useToast();

  const [
    isProjectAdditionToCollectionDrawerVisible,
    setIsProjectAdditionToCollectionDrawerVisible,
  ] = useSafeState(false);

  const collection = useCollection();
  const snapshot = useProjectLatestSnapshot(project);
  const toolchain = useToolchain();

  const lunarMagic = useGetEmbeddedTool(toolchain, 'lunarMagic');
  const openInLunarMagic = useOpenProjectSnapshotInLunarMagic(snapshot);
  const handleOpenInLunarMagic = useAsyncCallback(async () => {
    const error = await openInLunarMagic(toolchain);
    handleError(error, 'Failed to open in Lunar Magic');
    return error;
  }, [toolchain, openInLunarMagic, handleError]);

  const emulator = useGetCustomTool(toolchain, 'emulator');
  const launchInEmulator = useLaunchProjectSnapshotInEmulator(snapshot);
  const handleLaunchInEmulator = useAsyncCallback(async () => {
    const error = await launchInEmulator(toolchain);
    handleError(error, 'Failed to run emulator');
    return error;
  }, [toolchain, launchInEmulator, handleError]);

  const createBackup = useCreateProjectBackup(project);
  const handleCreateBackup = useAsyncCallback(async () => {
    const error = await createBackup();
    if (error) handleError(error, 'Failed to create backup');
    else toast({ title: 'Backup created!', status: 'success' });
    return error;
  }, [createBackup, handleError, toast]);

  const addProjectSnapshotToCollection =
    useAddProjectSnapshotToCollection(collection);
  const handleAddProjectSnapshotToCollection = useAsyncCallback(
    async (name: string) => {
      const error = await addProjectSnapshotToCollection(name, snapshot);
      if (error) handleError(error, 'Failed to add project to collection');
      else toast({ title: 'Project saved as template', status: 'success' });
      return error;
    },
    [snapshot, addProjectSnapshotToCollection, handleError, toast],
  );

  return (
    <>
      <VStack w='100%'>
        <Button
          isDisabled={
            lunarMagic.status !== 'installed' ||
            handleOpenInLunarMagic.isLoading
          }
          label='Open in Lunar Magic'
          onClick={handleOpenInLunarMagic.call}
          w='100%'
        />
        <Button
          isDisabled={!emulator.exePath || handleLaunchInEmulator.isLoading}
          label='Run on emulator'
          onClick={handleLaunchInEmulator.call}
          w='100%'
        />
        <Button
          isDisabled={handleCreateBackup.isLoading}
          label='Create backup'
          onClick={handleCreateBackup.call}
          w='100%'
        />
        <Button label='Create BPS' onClick={() => null} w='100%' isDisabled />
        <Button
          isDisabled={handleAddProjectSnapshotToCollection.isLoading}
          label='Save as template'
          onClick={() => setIsProjectAdditionToCollectionDrawerVisible(true)}
          w='100%'
        />
      </VStack>

      {isProjectAdditionToCollectionDrawerVisible && (
        <ProjectAdditionToCollectionDrawer
          onClose={() => setIsProjectAdditionToCollectionDrawerVisible(false)}
          onAdd={handleAddProjectSnapshotToCollection.call}
        />
      )}
    </>
  );
}
