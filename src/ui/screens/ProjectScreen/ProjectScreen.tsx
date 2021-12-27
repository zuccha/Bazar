import { Center, Flex } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { useProject } from '../../../core-hooks/Core';
import ProjectScreenContent from './ProjectScreenContent';
import ProjectScreenSidebar from './ProjectScreenSidebar';

export default function ProjectScreen(): ReactElement {
  const project = useProject();

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
