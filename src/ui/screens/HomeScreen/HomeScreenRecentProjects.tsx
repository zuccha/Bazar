import { Flex, Heading, Text, VStack } from '@chakra-ui/layout';
import { Box } from '@chakra-ui/react';
import { ReactElement, useEffect } from 'react';
import { useSetProject, useSettings } from '../../../core-hooks/Core';
import {
  useSetting,
  usePrioritizeRecentProject,
  useRemoveRecentProject,
} from '../../../core-hooks/Settings';
import Project from '../../../core/Project';
import useAsyncCallback from '../../../hooks/useAsyncCallback';
import { useNavigateRoot } from '../../../navigation/hooks';
import { RootRouteName } from '../../../navigation/Navigation';
import Button from '../../../ui-atoms/Button';
import FormError from '../../../ui-atoms/FormError';
import { $FileSystem } from '../../../utils/FileSystem';

export default function HomeScreenRecentProjects(): ReactElement {
  const settings = useSettings();
  const setProject = useSetProject();
  const recentProjectDirPaths = useSetting(settings, 'recentProjects');

  const prioritizeRecentProject = usePrioritizeRecentProject(settings);
  const removeRecentProject = useRemoveRecentProject(settings);

  const navigateRoot = useNavigateRoot();

  const handleOpenRecentProject = useAsyncCallback(
    async (path: string) => {
      const errorOrProject = await Project.open({ directoryPath: path });
      if (errorOrProject.isError) {
        await removeRecentProject(path);
        return errorOrProject.error;
      }
      const maybeError = setProject(errorOrProject.value);
      if (maybeError) return maybeError;
      navigateRoot(RootRouteName.Project);
      prioritizeRecentProject(path);
    },
    [navigateRoot, prioritizeRecentProject, removeRecentProject, setProject],
  );

  const handleRemoveRecentProject = useAsyncCallback(
    (path: string) => removeRecentProject(path),
    [removeRecentProject],
  );

  // useEffect(() => {
  //   const recentProjectDirPath = recentProjectDirPaths.items[0];
  //   if (recentProjectDirPath) {
  //     handleOpenRecentProject.call(recentProjectDirPath);
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
