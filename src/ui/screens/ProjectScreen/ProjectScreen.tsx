import { Center, Flex } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { useCore } from '../../../contexts/CoreContext';
import Core from '../../../core2/Core';
import { useGet } from '../../../hooks/useAccessors';
import ProjectScreenContent from './ProjectScreenContent';
import ProjectScreenSidebar from './ProjectScreenSidebar';

export default function ProjectScreen(): ReactElement {
  const core = useCore();
  const project = useGet(core, core.getProject, Core.getProjectDeps);

  if (!project) {
    return (
      <Center h='100%' w='100%'>
        No project
      </Center>
    );
  }

  return (
    <Flex flex={1} h='100%'>
      <ProjectScreenSidebar project={project} />
      <ProjectScreenContent project={project} />
    </Flex>
  );
}
