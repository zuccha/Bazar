import { Flex, Heading } from '@chakra-ui/react';
import { ReactElement } from 'react';

interface HeaderProps {
  title: string;
  hideBorderBottom?: boolean;
  hideBorderLeft?: boolean;
  hideBorderRight?: boolean;
  hideBorderTop?: boolean;
}

export default function Header({
  title,
  hideBorderBottom,
  hideBorderLeft,
  hideBorderRight,
  hideBorderTop,
}: HeaderProps): ReactElement {
  return (
    <Flex
      px={4}
      py={4}
      borderBottomWidth={hideBorderBottom ? 0 : 1}
      borderLeftWidth={hideBorderLeft ? 0 : 1}
      borderRightWidth={hideBorderRight ? 0 : 1}
      borderTopWidth={hideBorderTop ? 0 : 1}
      borderColor='app.bg1'
    >
      <Heading size='xs' textTransform='uppercase'>
        {title}
      </Heading>
    </Flex>
  );
}
