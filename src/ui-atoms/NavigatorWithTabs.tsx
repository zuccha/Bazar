import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { ReactElement, ReactNode, useCallback, useMemo } from 'react';
import useColorScheme from '../theme/useColorScheme';

interface NavigatorWithTabsProps<T extends string> {
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

export default function NavigatorWithTabs<T extends string>({
  selectedPage,
  pages,
  onSelectPage,

  flex,
  height,
  width,
}: NavigatorWithTabsProps<T>): ReactElement {
  const colorScheme = useColorScheme();

  const tabIndex = useMemo(() => {
    return pages.findIndex((page) => page.id === selectedPage);
  }, [pages, selectedPage]);

  const handleTabChange = useCallback(
    (index: number) => {
      const page = pages[index];
      if (page) onSelectPage(page.id);
    },
    [pages, onSelectPage],
  );

  return (
    <Tabs
      flex={flex}
      height={height}
      width={width}
      display='flex'
      flexDir='column'
      index={tabIndex}
      onChange={handleTabChange}
      borderWidth={1}
      colorScheme={colorScheme}
    >
      <TabList>
        {pages.map((page) => (
          <Tab key={page.id} w={100}>
            {page.label}
          </Tab>
        ))}
      </TabList>
      <TabPanels flex={1} display='flex' flexDir='column' h={1}>
        {pages.map((page) => (
          <TabPanel
            key={page.id}
            flex={1}
            display='flex'
            flexDir='column'
            h='100%'
          >
            {page.content}
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
}
