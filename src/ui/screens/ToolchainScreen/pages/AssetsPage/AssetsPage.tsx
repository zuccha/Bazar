import { Flex, Heading, StackDivider, Text, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import AssetItem from './AssetItem';

export default function Assets(): ReactElement {
  return (
    <VStack
      h='100%'
      spacing={4}
      divider={<StackDivider borderColor='app.bg1' />}
      alignItems='flex-start'
      p={4}
    >
      <Text pb={2}>
        Assets used for different reasons. When you setup an asset, it will be
        copied in Bazar directory. The original file will not be modified in any
        way.
      </Text>
      <AssetItem
        name='Vanilla ROM'
        description='The vanilla ROM hack is needed for creating BPS patches. Make sure the ROM has not undergone any changes.'
        isSetup={false}
        onSetup={() => {}}
      />
    </VStack>
  );
}
