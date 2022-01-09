import { VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { useAddProjectSnapshotToCollection } from '../../../../core-hooks/Collection';
import { useCollection, useToolchain } from '../../../../core-hooks/Core';
import {
  useCreateProjectBackup,
  useCreateProjectRelease,
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
import ProjectTemplateAdditionDrawer from '../../../drawers/ProjectTemplateAdditionDrawer';
import useAsyncCallback from '../../../../hooks/useAsyncCallback';
import useSafeState from '../../../../hooks/usSafeState';
import Button from '../../../../ui-atoms/Button';
import useToast from '../../../../hooks/useToast';
import ReleaseCreationDrawer from '../../../drawers/ReleaseCreationDrawer';
import { ReleaseInfo } from '../../../../core/Release';

interface ProjectScreenSidebarActionsProps {
  project: Project;
}

export default function ProjectScreenSidebarActions({
  project,
}: ProjectScreenSidebarActionsProps): ReactElement {
  const toast = useToast();

  const [
    isProjectTemplateAdditionDrawerVisible,
    setIsProjectTemplateAdditionDrawerVisible,
  ] = useSafeState(false);

  const [isReleaseCreationDrawerVisible, setIsReleaseCreationDrawerVisible] =
    useSafeState(false);

  const collection = useCollection();
  const snapshot = useProjectLatestSnapshot(project);
  const toolchain = useToolchain();

  const lunarMagic = useGetEmbeddedTool(toolchain, 'lunarMagic');
  const openInLunarMagic = useOpenProjectSnapshotInLunarMagic(snapshot);
  const handleOpenInLunarMagic = useAsyncCallback(async () => {
    const error = await openInLunarMagic(toolchain);
    if (error) toast.failure('Failed to open in Lunar Magic', error);
    return error;
  }, [toolchain, openInLunarMagic, toast]);

  const emulator = useGetCustomTool(toolchain, 'emulator');
  const launchInEmulator = useLaunchProjectSnapshotInEmulator(snapshot);
  const handleLaunchInEmulator = useAsyncCallback(async () => {
    const error = await launchInEmulator(toolchain);
    if (error) toast.failure('Failed to launch in emulator', error);
    return error;
  }, [toolchain, launchInEmulator, toast]);

  const createBackup = useCreateProjectBackup(project);
  const handleCreateBackup = useAsyncCallback(async () => {
    const error = await createBackup();
    toast('Backup created!', 'Failed to create backup', error);
    return error;
  }, [createBackup, toast]);

  const createRelease = useCreateProjectRelease(project);
  const handleCreateRelease = useAsyncCallback(
    async (info: ReleaseInfo) => {
      const error = await createRelease(info);
      toast('Release created!', 'Failed to create release', error);
      return error;
    },
    [createRelease, toast],
  );

  const addProjectSnapshotToCollection =
    useAddProjectSnapshotToCollection(collection);
  const handleAddProjectSnapshotToCollection = useAsyncCallback(
    async (name: string) => {
      const error = await addProjectSnapshotToCollection(name, snapshot);
      toast(
        'Project saved as template',
        'Failed to add project to collection',
        error,
      );
      return error;
    },
    [snapshot, addProjectSnapshotToCollection, toast],
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
        <Button
          isDisabled={handleCreateRelease.isLoading}
          label='Create release'
          onClick={() => setIsReleaseCreationDrawerVisible(true)}
          w='100%'
        />
        <Button
          isDisabled={handleAddProjectSnapshotToCollection.isLoading}
          label='Save as template'
          onClick={() => setIsProjectTemplateAdditionDrawerVisible(true)}
          w='100%'
        />
      </VStack>

      {isProjectTemplateAdditionDrawerVisible && (
        <ProjectTemplateAdditionDrawer
          onClose={() => setIsProjectTemplateAdditionDrawerVisible(false)}
          onAdd={handleAddProjectSnapshotToCollection.call}
        />
      )}

      {isReleaseCreationDrawerVisible && (
        <ReleaseCreationDrawer
          onClose={() => setIsReleaseCreationDrawerVisible(false)}
          onCreate={handleCreateRelease.call}
          project={project}
        />
      )}
    </>
  );
}
