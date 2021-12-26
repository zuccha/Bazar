import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { ReactElement } from 'react';
import useColorScheme from '../../../../theme/useColorScheme';
import ComingSoon from '../../../../ui-atoms/other/ComingSoon';
import Patches from './tabs/Patches';

const tabPanelProps = {
  flex: 1,
  h: '100%',
  display: 'flex',
  flexDir: 'column',
} as const;

export default function Content(): ReactElement {
  const colorScheme = useColorScheme();
  return (
    <Tabs
      borderWidth={1}
      flex={1}
      h='100%'
      display='flex'
      flexDir='column'
      defaultIndex={2}
      colorScheme={colorScheme}
    >
      <TabList>
        <Tab>Blocks</Tab>
        <Tab>Music</Tab>
        <Tab>Patches</Tab>
        <Tab>Sprites</Tab>
        <Tab>UberASM</Tab>
        <Tab>Backups</Tab>
        <Tab>Releases</Tab>
      </TabList>
      <TabPanels flex={1} display='flex' flexDir='column' h={1}>
        <TabPanel {...tabPanelProps}>
          <ComingSoon title='Blocks' />
        </TabPanel>
        <TabPanel {...tabPanelProps}>
          <ComingSoon title='Music' />
        </TabPanel>
        <TabPanel {...tabPanelProps}>
          <Patches />
        </TabPanel>
        <TabPanel {...tabPanelProps}>
          <ComingSoon title='Sprites' />
        </TabPanel>
        <TabPanel {...tabPanelProps}>
          <ComingSoon title='UberASM' />
        </TabPanel>
        <TabPanel {...tabPanelProps}>
          <ComingSoon title='Backups' />
        </TabPanel>
        <TabPanel {...tabPanelProps}>
          <ComingSoon title='Releases' />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
