import { Flex } from '@chakra-ui/react';
import { ReactElement } from 'react';
import Content from './Content';
import Sidebar from './Sidebar';

export default function Project(): ReactElement {
  return (
    <Flex flex={1} h='100%'>
      <Sidebar />
      <Content />
    </Flex>
  );
}
