import { Button, Flex, VStack } from '@chakra-ui/react';
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
          w={200}
          alignItems='flex-start'
          overflow='auto'
          spacing={0}
          divider={
            <Flex w='100%' borderColor='app.bg1' borderBottomWidth={1} />
          }
          borderColor='app.bg1'
        >
          {pages.map((page) => {
            const isSelected = page.id === selectedPage;
            return (
              <Button
                key={page.id}
                borderRadius={0}
                color={isSelected ? `${colorScheme}.500` : 'app.fg1'}
                colorScheme={colorScheme}
                fontWeight={isSelected ? 'bold' : 'normal'}
                isDisabled={page.isDisabled}
                justifyContent='flex-start'
                onClick={() => onSelectPage(page.id)}
                p={4}
                variant='ghost'
                w='100%'
              >
                {page.label}
              </Button>
            );
          })}
          <Flex />
        </VStack>
        <Flex bg='app.bg1' w='1px' />
        <Flex flex={1} p={4} flexDir='column' overflow='auto'>
          {content}
        </Flex>
      </Flex>
    </Flex>
  );
}
