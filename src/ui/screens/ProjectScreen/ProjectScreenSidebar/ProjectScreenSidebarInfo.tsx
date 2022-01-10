import { EditIcon } from '@chakra-ui/icons';
import { Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { ReactElement, useState } from 'react';
import {
  useProjectInfo,
  useSetProjectInfo,
} from '../../../../core-hooks/Project';
import Project from '../../../../core/Project';
import IconButton from '../../../../ui-atoms/IconButton';
import ProjectSnapshotInfoEditorDrawer from '../../../drawers/ProjectSnapshotInfoEditorDrawer';

interface ProjectScreenSidebarInfoProps {
  project: Project;
}

export default function ProjectScreenSidebarInfo({
  project,
}: ProjectScreenSidebarInfoProps): ReactElement {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const info = useProjectInfo(project);
  const setInfo = useSetProjectInfo(project);

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
          <Text fontSize={14}>
            <b>Author:</b> {info.author || '-'}
          </Text>
          <Text fontSize={14}>
            <b>Version:</b> {info.version || '-'}
          </Text>
        </VStack>
      </VStack>

      {isEditorOpen && (
        <ProjectSnapshotInfoEditorDrawer
          info={info}
          onClose={() => setIsEditorOpen(false)}
          onEdit={setInfo}
        />
      )}
    </>
  );
}
