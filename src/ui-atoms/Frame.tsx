import { Flex, Text } from '@chakra-ui/react';
import { ReactElement, ReactNode } from 'react';

interface Frame {
  actions?: ReactNode;
  children: ReactNode;
  title: string;

  flex?: number;
  height?: number | string;
  width?: number | string;
}

export default function FrameInfo({
  actions,
  children,
  title,
  flex,
  height,
  width,
}: Frame): ReactElement {
  return (
    <Flex
      flexDir='column'
      height={height}
      width={width}
      flex={flex}
      borderColor='gray.300'
      borderWidth='1px'
      overflow='hidden'
    >
      <Flex
        h={50}
        alignItems='center'
        justifyContent='space-between'
        bg={'gray.200'}
        borderColor='gray.300'
        borderBottomWidth='1px'
        px={5}
        py={2}
      >
        <Text textTransform='uppercase' fontWeight='bold' fontSize='xs'>
          {title}
        </Text>
        {actions}
      </Flex>

      {children}
    </Flex>
  );
}
