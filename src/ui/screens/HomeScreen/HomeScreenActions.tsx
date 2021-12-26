import { Box, VStack } from '@chakra-ui/layout';
import { ReactElement, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useCore } from '../../../contexts/CoreContext';
import Core from '../../../core/Core';
import Project from '../../../core/Project';
import { useGet, useSet, useSetAsync } from '../../../hooks/useAccessors';
import useAsyncCallback from '../../../hooks/useAsyncCallback';
import useSafeState from '../../../hooks/usSafeState';
import { AppDispatch } from '../../../store';
import { AppRouteName, setAppRoute } from '../../../store/slices/navigation';
import Button from '../../../ui-atoms/input/Button';
import FormError from '../../../ui-atoms/input/FormError';
import { $Dialog } from '../../../utils/Dialog';
import ProjectCreationFromSourceDrawer from '../../drawers/ProjectCreationFromSourceDrawer';

export default function HomeScreenActions(): ReactElement {
  const core = useCore();
  const settings = useGet(core, core.getSettings, Core.getSettingsDeps);

  const dispatch = useDispatch<AppDispatch>();

  const [isProjectCreationFromSourceOpen, setIsProjectCreationFromSourceOpen] =
    useSafeState(false);

  const handleCreateProjectFromSource = useCallback(() => {
    setIsProjectCreationFromSourceOpen(true);
  }, []);

  const setProject = useSet(core, core.setProject, Core.setProjectTriggers);

  const prioritizeRecentProject = useSetAsync(
    settings,
    settings.prioritizeRecentProject,
    ['recentProjects'],
  );

  const handleOpenProject = useAsyncCallback(async () => {
    const pathOrError = await $Dialog.open({ type: 'directory' });
    if (pathOrError.isError) return pathOrError.error;
    if (!pathOrError.value) return undefined;
    const errorOrProject = await Project.open({
      directoryPath: pathOrError.value,
    });
    if (errorOrProject.isError) return errorOrProject.error;
    const maybeError = setProject(errorOrProject.value);
    if (maybeError) return maybeError;
    dispatch(setAppRoute({ name: AppRouteName.Project }));
    prioritizeRecentProject(pathOrError.value);
  }, [dispatch]);

  return (
    <>
      <VStack spacing={2} w='100%'>
        <Button
          label='New project'
          onClick={handleCreateProjectFromSource}
          isFullWidth
          maxW='200px'
        />
        <Button
          label='Open project'
          onClick={handleOpenProject.call}
          isFullWidth
          maxW='200px'
        />
        {handleOpenProject.error && (
          <Box alignSelf='center'>
            <FormError errorReport={handleOpenProject.error} />
          </Box>
        )}
      </VStack>

      {isProjectCreationFromSourceOpen && (
        <ProjectCreationFromSourceDrawer
          onClose={() => setIsProjectCreationFromSourceOpen(false)}
        />
      )}
    </>
  );
}
