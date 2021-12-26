import { EditIcon } from '@chakra-ui/icons';
import { Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { ReactElement, useState } from 'react';
import Project from '../../../../core2/Project';
import { useGet } from '../../../../hooks/useAccessors';
import IconButton from '../../../../ui-atoms/input/IconButton';
import ProjectSnapshotInfoEditorDrawer from '../../../drawers/ProjectSnapshotInfoEditorDrawer';

interface ProjectScreenSidebarInfoProps {
  project: Project;
}

export default function ProjectScreenSidebarInfo({
  project,
}: ProjectScreenSidebarInfoProps): ReactElement {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const info = useGet(project, project.getInfo, Project.getInfoDeps);

  return (
    <>
      <VStack width='100%' alignItems='flex-start'>
        <Flex alignItems='center' width='100%'>
          <Heading flex={1} mr={2} size='sm'>
            {info.name}
          </Heading>
          <IconButton
            icon={<EditIcon />}
            isDisabled={isEditorOpen}
            label='Edit config'
            onClick={() => setIsEditorOpen(true)}
            size='xs'
            variant='ghost'
          />
        </Flex>

        <VStack spacing={1} alignItems='flex-start'>
          <Text fontSize={14}>Author: {info.author || '-'}</Text>
        </VStack>
      </VStack>

      {isEditorOpen && (
        <ProjectSnapshotInfoEditorDrawer
          onClose={() => setIsEditorOpen(false)}
          project={project}
        />
      )}
    </>
  );
}