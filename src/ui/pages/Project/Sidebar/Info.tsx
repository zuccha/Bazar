import { EditIcon } from '@chakra-ui/icons';
import { Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { ReactElement, useState } from 'react';
import { ProjectInfo } from '../../../../core/Project';
import IconButton from '../../../../ui-atoms/input/IconButton';
import { ErrorReport } from '../../../../utils/ErrorReport';
import InfoEditor from './InfoEditor';

interface InfoProps {
  info: ProjectInfo;
  isDisabled: boolean;
  onEdit: (config: ProjectInfo) => Promise<ErrorReport | undefined>;
}

export default function Info({
  info,
  isDisabled,
  onEdit,
}: InfoProps): ReactElement {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  return (
    <>
      <VStack width='100%' alignItems='flex-start'>
        <Flex alignItems='center' width='100%'>
          <Heading
            flex={1}
            mr={2}
            size='sm'
            fontStyle={isDisabled ? 'italic' : undefined}
          >
            {info.name}
          </Heading>
          <IconButton
            icon={<EditIcon />}
            isDisabled={isDisabled}
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
        <InfoEditor
          info={info}
          onCancel={() => setIsEditorOpen(false)}
          onConfirm={(newConfig) => {
            setIsEditorOpen(false);
            return onEdit(newConfig);
          }}
        />
      )}
    </>
  );
}
