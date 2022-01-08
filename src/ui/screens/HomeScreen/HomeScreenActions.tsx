import { Box, VStack } from '@chakra-ui/layout';
import { ReactElement } from 'react';
import { useSetProject, useSettings } from '../../../core-hooks/Core';
import { usePrioritizeRecentProject } from '../../../core-hooks/Settings';
import Project from '../../../core/Project';
import useAsyncCallback from '../../../hooks/useAsyncCallback';
import useSafeState from '../../../hooks/usSafeState';
import { useNavigateRoot } from '../../../navigation/hooks';
import { RootRouteName } from '../../../navigation/Navigation';
import Button from '../../../ui-atoms/Button';
import FormError from '../../../ui-atoms/FormError';
import { $Dialog } from '../../../utils/Dialog';
import ProjectCreationFromRomDrawer from '../../drawers/ProjectCreationFromRomDrawer';
import ProjectCreationFromTemplateDrawer from '../../drawers/ProjectCreationFromTemplateDrawer';

export default function HomeScreenActions(): ReactElement {
  const settings = useSettings();

  const [isProjectCreationFromRomVisible, setIsProjectCreationFromRomVisible] =
    useSafeState(false);

  const [
    isProjectCreationFromTemplateVisible,
    setIsProjectCreationFromTemplateVisible,
  ] = useSafeState(false);

  const setProject = useSetProject();

  const prioritizeRecentProject = usePrioritizeRecentProject(settings);

  const navigateRoot = useNavigateRoot();

  const handleCreateProject = useAsyncCallback(
    async (project: Project) => {
      const maybeError = setProject(project);
      if (maybeError) return maybeError;
      navigateRoot(RootRouteName.Project);
      prioritizeRecentProject(project.getPath());
    },
    [prioritizeRecentProject, setProject],
  );

  const handleOpenProject = useAsyncCallback(async () => {
    const pathOrError = await $Dialog.open({ type: 'directory' });
    if (pathOrError.isError) return pathOrError.error;
    if (!pathOrError.value) return undefined;
    const errorOrProject = await Project.open(pathOrError.value);
    if (errorOrProject.isError) return errorOrProject.error;
    const maybeError = setProject(errorOrProject.value);
    if (maybeError) return maybeError;
    navigateRoot(RootRouteName.Project);
    prioritizeRecentProject(pathOrError.value);
  }, [navigateRoot, prioritizeRecentProject, setProject]);

  const isDisabled =
    handleOpenProject.isLoading || handleCreateProject.isLoading;

  return (
    <>
      <VStack spacing={2} w='100%'>
        <Button
          isDisabled={isDisabled}
          label='New project'
          onClick={() => setIsProjectCreationFromRomVisible(true)}
          isFullWidth
          maxW='250px'
        />
        <Button
          isDisabled={isDisabled}
          label='New project from template'
          onClick={() => setIsProjectCreationFromTemplateVisible(true)}
          isFullWidth
          maxW='250px'
        />
        <Button
          isDisabled={isDisabled}
          label='Open project'
          onClick={handleOpenProject.call}
          isFullWidth
          maxW='250px'
        />
        {handleOpenProject.error && (
          <Box alignSelf='center'>
            <FormError errorReport={handleOpenProject.error} />
          </Box>
        )}
      </VStack>

      {isProjectCreationFromRomVisible && (
        <ProjectCreationFromRomDrawer
          onClose={() => setIsProjectCreationFromRomVisible(false)}
          onCreate={handleCreateProject.call}
        />
      )}

      {isProjectCreationFromTemplateVisible && (
        <ProjectCreationFromTemplateDrawer
          onClose={() => setIsProjectCreationFromTemplateVisible(false)}
          onCreate={handleCreateProject.call}
        />
      )}
    </>
  );
}
