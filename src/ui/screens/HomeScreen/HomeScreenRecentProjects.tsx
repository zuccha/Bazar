import { Flex, Heading, Text, VStack } from '@chakra-ui/layout';
import { Box } from '@chakra-ui/react';
import { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useAsyncCallback from '../../../hooks/useAsyncCallback';
import { AppDispatch } from '../../../store';
import { openProject } from '../../../store/slices/core/slices/project';
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
  const dispatch = useDispatch<AppDispatch>();

  const recentProjectDirPaths = useSelector(getSetting('recentProjects'));

  const handleOpenRecentProject = useAsyncCallback(
    async (path: string) => {
      const error = await dispatch(openProject({ directoryPath: path }));
      if (error) {
        await dispatch(removeRecentProject(path));
        return error;
      }
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
