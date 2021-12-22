import { Center, Heading, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';

interface ComingSoonProps {
  title?: string;
}

export default function ComingSoon({ title }: ComingSoonProps): ReactElement {
  return (
    <Center h='100%' w='100%'>
      <VStack>
        <Heading size='lg'>Coming Soon</Heading>
        {title && <Heading size='md'>({title})</Heading>}
      </VStack>
    </Center>
  );
}
