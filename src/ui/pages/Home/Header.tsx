import { Heading, VStack } from '@chakra-ui/layout';
import { ReactElement } from 'react';

export default function Header(): ReactElement {
  return (
    <VStack alignItems='center' w='100%'>
      <Heading size='md' color='app.fg1'>
        SMW's Bazar
      </Heading>
      <Heading size='xs' color='app.fg1'>
        A tool for hacking Super Mario World
      </Heading>
    </VStack>
  );
}
