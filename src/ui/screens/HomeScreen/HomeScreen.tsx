import { Center, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import HomeScreenActions from './HomeScreenActions';
import HomeScreenHeader from './HomeScreenHeader';
import HomeScreenRecentProjects from './HomeScreenRecentProjects';

export default function HomeScreen(): ReactElement {
  return (
    <Center flex={1} height='100%'>
      <VStack alignItems='flex-start' spacing={8} maxW={400}>
        <HomeScreenHeader />
        <HomeScreenActions />
        <HomeScreenRecentProjects />
      </VStack>
    </Center>
  );
}
