import { Text, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';

export default function AppearanceSettingsPage(): ReactElement {
  return (
    <VStack spacing={4} alignItems='flex-start'>
      <Text>Appearance</Text>
    </VStack>
  );
}
