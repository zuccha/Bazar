import { Flex, Heading, Progress, Text } from '@chakra-ui/react';
import { ReactElement } from 'react';
import useColorScheme from '../../../../../theme/useColorScheme';
import Button from '../../../../../ui-atoms/input/Button';

interface EmbeddedToolItemProps {
  name: string;
  description: string;
  onInstall: () => void;
  onUninstall: () => void;
  status: 'installed' | 'not-installed' | 'deprecated' | 'loading';
}

export default function EmbeddedToolItem({
  name,
  description,
  onInstall,
  onUninstall,
  status,
}: EmbeddedToolItemProps): ReactElement {
  const colorScheme = useColorScheme();
  return (
    <Flex w='100%'>
      <Flex flex={1} flexDir='column'>
        <Heading size='sm' flex={1} display='flex'>
          <Text>{name}&nbsp;</Text>
          {status === 'deprecated' && <Text color='red.600'>[deprecated]</Text>}
          {status === 'installed' && <Text color='green.600'>[installed]</Text>}
        </Heading>
        <Text fontSize='sm' mt={1}>
          {description}
        </Text>
      </Flex>
      <Flex w={90}>
        {status === 'not-installed' && (
          <Button
            label='Download'
            onClick={onInstall}
            size='xs'
            variant='outline'
            w='100%'
          />
        )}
        {status === 'deprecated' && (
          <Button
            label='Update'
            onClick={onInstall}
            size='xs'
            variant='outline'
            w='100%'
          />
        )}
        {status === 'loading' && (
          <Progress
            isIndeterminate
            size='sm'
            colorScheme={colorScheme}
            color={`${colorScheme}.500`}
            w='100%'
          />
        )}
        {status === 'installed' && (
          <Button
            label='Uninstall'
            onClick={onUninstall}
            scheme='destructive'
            size='xs'
            variant='outline'
            w='100%'
          />
        )}
      </Flex>
    </Flex>
  );
}
