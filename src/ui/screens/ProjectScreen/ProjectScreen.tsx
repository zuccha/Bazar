import { Flex } from '@chakra-ui/react';
import { ReactElement } from 'react';
import ProjectScreenContent from './ProjectScreenContent';
import ProjectScreenSidebar from './ProjectScreenSidebar';

export default function ProjectScreen(): ReactElement {
  return (
    <Flex flex={1} h='100%'>
      <ProjectScreenSidebar />
      <ProjectScreenContent />
    </Flex>
  );
}
