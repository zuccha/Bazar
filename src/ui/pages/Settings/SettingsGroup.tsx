import { Flex, Heading, VStack } from '@chakra-ui/react';
import { ReactElement, ReactNode } from 'react';

interface SettingsGroupProps {
  children: ReactNode;
  title: string;
}

export default function SettingsGroup({
  children,
  title,
}: SettingsGroupProps): ReactElement {
  return (
    <Flex direction='column' w='100%'>
      <Heading size='md' color='app.fg1' mb={3}>
        {title}
      </Heading>
      <VStack alignItems='flex-start' w='100%' spacing={3}>
        {children}
      </VStack>
    </Flex>
  );
}
