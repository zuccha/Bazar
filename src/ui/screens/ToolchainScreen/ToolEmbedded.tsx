import { Flex, Heading, Progress, Text } from '@chakra-ui/react';
import { ReactElement } from 'react';
import useColorScheme from '../../../theme/useColorScheme';
import Button from '../../../ui-atoms/input/Button';

interface ToolEmbeddedProps {
  name: string;
  onDownload: () => void;
  status: 'installed' | 'not-installed' | 'downloading' | 'deprecated';
}

export default function ToolEmbedded({
  name,
  onDownload,
  status,
}: ToolEmbeddedProps): ReactElement {
  const colorScheme = useColorScheme();
  return (
    <Flex w='100%' h='60px' alignItems='center'>
      <Heading size='sm' flex={1}>
        {name}
      </Heading>
      <Flex w={100}>
        {status === 'not-installed' && (
          <Button
            label='Download'
            onClick={onDownload}
            variant='outline'
            w='100%'
          />
        )}
        {status === 'deprecated' && (
          <Button
            label='Update'
            onClick={onDownload}
            variant='outline'
            w='100%'
          />
        )}
        {status === 'downloading' && (
          <Progress
            isIndeterminate
            size='sm'
            colorScheme={colorScheme}
            color={`${colorScheme}.500`}
            w='100%'
          />
        )}
        {status === 'installed' && (
          <Text color='green' w='100%' textAlign='right'>
            Installed
          </Text>
        )}
      </Flex>
    </Flex>
  );
}
