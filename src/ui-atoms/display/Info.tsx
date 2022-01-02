import { Flex, Text } from '@chakra-ui/react';
import { ReactElement, ReactNode } from 'react';

interface InfoProps {
  children: ReactNode;

  flex?: number;
  height?: number | string;
  width?: number | string;
}

export default function Info({
  children,
  flex,
  height,
  width,
}: InfoProps): ReactElement {
  return (
    <Flex
      flexDir='column'
      height={height}
      width={width}
      flex={flex}
      overflow='hidden'
      borderColor={'gray.300'}
      borderWidth='1px'
    >
      <Flex
        h={50}
        alignItems='center'
        justifyContent='space-between'
        bg={'gray.200'}
        borderColor={'gray.300'}
        borderBottomWidth='1px'
        px={5}
        py={2}
      >
        <Text textTransform='uppercase' fontWeight='bold' fontSize='xs'>
          Info
        </Text>
      </Flex>

      <Flex p={4} overflow='auto'>
        {children}
      </Flex>
    </Flex>
  );
}
