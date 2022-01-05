import { Button, Flex, Text, VStack } from '@chakra-ui/react';
import { ReactElement, ReactNode, useMemo } from 'react';
import useColorScheme from '../theme/useColorScheme';

interface NavigatorWithListProps<T extends string> {
  selectedPage: T;
  pages: {
    id: T;
    label: string;
    content: ReactNode;
    isDisabled?: boolean;
  }[];
  onSelectPage: (page: T) => void;

  flex?: number;
  height?: number | string;
  width?: number | string;
}

export default function NavigatorWithList<T extends string>({
  selectedPage,
  pages,
  onSelectPage,

  flex,
  height,
  width,
}: NavigatorWithListProps<T>): ReactElement {
  const colorScheme = useColorScheme();

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
          {pages.map((page) => {
            const isSelected = page.id === selectedPage;
            return (
              <Button
                key={page.id}
                colorScheme={isSelected ? colorScheme : 'black'}
                fontWeight={isSelected ? 'bold' : 'normal'}
                isDisabled={page.isDisabled}
                onClick={() => onSelectPage(page.id)}
                minW={0}
                variant='link'
              >
                {page.label}
              </Button>
            );
          })}
        </VStack>
        <Flex bg='app.bg1' w='1px' />
        <Flex flex={1} p={4} flexDir='column' overflow='auto'>
          {content}
        </Flex>
      </Flex>
    </Flex>
  );
}
