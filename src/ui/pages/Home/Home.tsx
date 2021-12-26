import { Center, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import Actions from './Actions';
import Header from './Header';
import RecentProjects from './RecentProjects';

export default function Home(): ReactElement {
  return (
    <Center flex={1} height='100%'>
      <VStack alignItems='flex-start' spacing={8} maxW={400}>
        <Header />
        <Actions />
        <RecentProjects />
      </VStack>
    </Center>
  );
}
