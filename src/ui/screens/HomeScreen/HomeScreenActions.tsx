import { Box, VStack } from '@chakra-ui/layout';
import { ReactElement, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import useAsyncCallback from '../../../hooks/useAsyncCallback';
import useSafeState from '../../../hooks/usSafeState';
import { AppDispatch } from '../../../store';
import { openProject } from '../../../store/slices/core/slices/project';
import { AppRouteName, setAppRoute } from '../../../store/slices/navigation';
import { prioritizeRecentProject } from '../../../store/slices/settings';
import Button from '../../../ui-atoms/input/Button';
import FormError from '../../../ui-atoms/input/FormError';
import { $Dialog } from '../../../utils/Dialog';
import ProjectCreationFromSourceDrawer from '../../drawers/ProjectCreationFromSourceDrawer';

export default function HomeScreenActions(): ReactElement {
  const dispatch = useDispatch<AppDispatch>();

  const [isProjectCreationFromSourceOpen, setIsProjectCreationFromSourceOpen] =
    useSafeState(false);

  const handleCreateProjectFromSource = useCallback(() => {
    setIsProjectCreationFromSourceOpen(true);
  }, []);

  const handleOpenProject = useAsyncCallback(async () => {
    const pathOrError = await $Dialog.open({ type: 'directory' });
    if (pathOrError.isError) return pathOrError.error;
    if (!pathOrError.value) return undefined;
    const error = await dispatch(
      openProject({ directoryPath: pathOrError.value }),
    );
    if (error) return error;
    dispatch(setAppRoute({ name: AppRouteName.Project }));
    dispatch(prioritizeRecentProject(pathOrError.value));
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
