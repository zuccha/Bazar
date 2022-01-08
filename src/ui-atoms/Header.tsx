import { Flex, Text } from '@chakra-ui/react';
import { ReactElement } from 'react';

interface HeaderProps {
  title: string;
  hideBorderBottom?: boolean;
  hideBorderLeft?: boolean;
  hideBorderRight?: boolean;
  hideBorderTop?: boolean;
  variant?: 'solid' | 'minimal';
}

const stylesByVariant = {
  solid: {
    container: {
      bg: 'app.bg2',
    },
  },
  minimal: {
    container: {},
  },
};

export default function Header({
  title,
  hideBorderBottom,
  hideBorderLeft,
  hideBorderRight,
  hideBorderTop,
  variant = 'solid',
}: HeaderProps): ReactElement {
  const styles = stylesByVariant[variant];

  return (
    <Flex
      px={4}
      py={4}
      {...styles.container}
      borderBottomWidth={hideBorderBottom ? 0 : 1}
      borderLeftWidth={hideBorderLeft ? 0 : 1}
      borderRightWidth={hideBorderRight ? 0 : 1}
      borderTopWidth={hideBorderTop ? 0 : 1}
      borderColor='app.bg1'
    >
      <Text textTransform='uppercase' fontWeight='bold' fontSize='xs'>
        {title}
      </Text>
    </Flex>
  );
}
