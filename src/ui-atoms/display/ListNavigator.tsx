import { Button, Flex, Text, VStack } from '@chakra-ui/react';
import { ReactElement, ReactNode, useMemo } from 'react';
import useColorScheme from '../../theme/useColorScheme';

interface ListNavigatorProps<T extends string> {
  selectedPage: T;
  pages: {
    id: T;
    label: string;
    content: ReactNode;
  }[];
  onSelectPage: (page: T) => void;

  flex?: number;
  height?: number | string;
  width?: number | string;
}

const ListNavigatorButton = ({
  label,
  onClick,
  isSelected,
}: {
  label: string;
  onClick: () => void;
  isSelected: boolean;
}): ReactElement => {
  const colorScheme = useColorScheme();
  return (
    <Button
      onClick={onClick}
      variant='link'
      colorScheme={isSelected ? colorScheme : 'black'}
      fontWeight={isSelected ? 'bold' : 'normal'}
    >
      {label}
    </Button>
  );
};

export default function ListNavigator<T extends string>({
  selectedPage,
  pages,
  onSelectPage,

  flex,
  height,
  width,
}: ListNavigatorProps<T>): ReactElement {
  const content = useMemo(() => {
    const page = pages.find((page) => page.id === selectedPage);
    return page?.content;
  }, [pages, selectedPage]);
  return (
    <Flex flex={flex} h={height} w={width} justifyContent='center'>
      <Flex flex={1} borderColor='app.bg1' borderWidth={1}>
        <VStack
          spacing={2}
          w={200}
          p={4}
          alignItems='flex-start'
          overflow='auto'
        >
          {pages.map((page) => (
            <ListNavigatorButton
              key={page.id}
              label={page.label}
              onClick={() => onSelectPage(page.id)}
              isSelected={page.id === selectedPage}
            />
          ))}
        </VStack>
        <Flex bg='app.bg1' w='1px' />
        <Flex flex={1} p={4} flexDir='column' overflow='auto'>
          {content}
        </Flex>
      </Flex>
    </Flex>
  );
}
