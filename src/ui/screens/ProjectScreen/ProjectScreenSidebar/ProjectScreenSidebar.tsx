import { Box, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import Project from '../../../../core/Project';
import ProjectScreenSidebarActions from './ProjectScreenSidebarActions';
import ProjectScreenSidebarInfo from './ProjectScreenSidebarInfo';

interface ProjectScreenSidebarProps {
  project: Project;
}

export default function ProjectScreenSidebar({
  project,
}: ProjectScreenSidebarProps): ReactElement {
  return (
    <VStack
      bg='app.bg2'
      w='256px'
      h='100%'
      p={6}
      spacing={6}
      alignItems='flex-start'
    >
      <ProjectScreenSidebarInfo project={project} />
      <Box w='100%' h='1px' bg='app.bg1' />
      <ProjectScreenSidebarActions project={project} />
    </VStack>
  );
}
