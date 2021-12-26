import { Box, VStack } from '@chakra-ui/react';
import { ReactElement, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ProjectInfo } from '../../../../core/Project';
import Project from '../../../../core2/Project';
import { useGet, useSet, useSetAsync } from '../../../../hooks/useAccessors';
import useAsyncCallback from '../../../../hooks/useAsyncCallback';
import { AppDispatch } from '../../../../store';
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
      <Box w='100%' h='1px' bg='app.fg3' />
      <ProjectScreenSidebarActions project={project} />
    </VStack>
  );
}
