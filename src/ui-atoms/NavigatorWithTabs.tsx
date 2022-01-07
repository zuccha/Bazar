import {
  LayoutProps,
  SpaceProps,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import { ReactElement, ReactNode, useCallback, useMemo } from 'react';
import useColorScheme from '../theme/useColorScheme';

interface NavigatorWithTabsProps<T extends string> {
  selectedPage: T;
  pages: {
    id: T;
    label: string;
    content: ReactNode;
    isDisabled?: boolean;
  }[];
  onSelectPage: (page: T) => void;

  isBorderLess?: boolean;
  isFitted?: boolean;

  flex?: number;
  height?: number | string;
  width?: number | string;

  contentStyle?: Partial<LayoutProps & SpaceProps>;
}

export default function NavigatorWithTabs<T extends string>({
  selectedPage,
  pages,
  onSelectPage,

  isBorderLess,
  isFitted,

  flex,
  height,
  width,

  contentStyle,
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
      isFitted={isFitted}
      index={tabIndex}
      onChange={handleTabChange}
      borderWidth={isBorderLess ? 0 : 1}
      colorScheme={colorScheme}
    >
      <TabList>
        {pages.map((page) => (
          <Tab key={page.id} w={100} isDisabled={page.isDisabled}>
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
            p={0}
            {...contentStyle}
          >
            {page.content}
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
}
