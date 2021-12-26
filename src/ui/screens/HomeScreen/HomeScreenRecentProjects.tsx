import { Flex, Heading, Text, VStack } from '@chakra-ui/layout';
import { Box } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCore } from '../../../contexts/CoreContext';
import Core from '../../../core2/Core';
import Project from '../../../core2/Project';
import { useSet } from '../../../hooks/useAccessors';
import useAsyncCallback from '../../../hooks/useAsyncCallback';
import { AppDispatch } from '../../../store';
import { AppRouteName, setAppRoute } from '../../../store/slices/navigation';
import {
  getSetting,
  prioritizeRecentProject,
  removeRecentProject,
} from '../../../store/slices/settings';
import Button from '../../../ui-atoms/input/Button';
import FormError from '../../../ui-atoms/input/FormError';
import { $FileSystem } from '../../../utils/FileSystem';

export default function HomeScreenRecentProjects(): ReactElement {
  const core = useCore();
  const setProject = useSet(core, core.setProject, Core.setProjectTriggers);

  const dispatch = useDispatch<AppDispatch>();

  const recentProjectDirPaths = useSelector(getSetting('recentProjects'));

  const handleOpenRecentProject = useAsyncCallback(
    async (path: string) => {
      const errorOrProject = await Project.open({ directoryPath: path });
      if (errorOrProject.isError) {
        await dispatch(removeRecentProject(path));
        return errorOrProject.error;
      }
      const maybeError = setProject(errorOrProject.value);
      if (maybeError) return maybeError;
      dispatch(setAppRoute({ name: AppRouteName.Project }));
      dispatch(prioritizeRecentProject(path));
    },
    [dispatch],
  );

  const handleRemoveRecentProject = useAsyncCallback(
    (path: string) => dispatch(removeRecentProject(path)),
    [dispatch],
  );

  // useEffect(() => {
  //   const recentProjectDirPath = recentProjectDirPaths.items[0];
  //   if (recentProjectDirPath) {
  //     handleOpenRecentProject(recentProjectDirPath);
  //   }
  // }, []);

  return (
    <VStack spacing={1} alignItems='flex-start' w='100%'>
      <Heading size='sm' color='app.fg1'>
        Recent projects
      </Heading>
      {recentProjectDirPaths.items.map((projectDirPath) => {
        const projectName = $FileSystem.basename(projectDirPath);
        const truncatedPath =
          projectDirPath.length > 40
            ? `${projectDirPath.substring(0, 37)}...`
            : projectDirPath;
        return (
          <Flex flex={1} key={projectDirPath} alignItems='center'>
            <Button
              isDisabled={handleRemoveRecentProject.isLoading}
              label='⨉'
              onClick={() => handleRemoveRecentProject.call(projectDirPath)}
              variant='link'
            />
            <Button
              isDisabled={handleOpenRecentProject.isLoading}
              label={`${projectName}`}
              onClick={() => handleOpenRecentProject.call(projectDirPath)}
              variant='link'
            />
            <Text fontSize={14}>&emsp;{truncatedPath}</Text>
          </Flex>
        );
      })}
      {recentProjectDirPaths.items.length === 0 && (
        <Text color='app.fg1' fontStyle='italic'>
          No recent projects
        </Text>
      )}
      {handleOpenRecentProject.error && (
        <Box alignSelf='center'>
          <FormError errorReport={handleOpenRecentProject.error} />
        </Box>
      )}
    </VStack>
  );
}
