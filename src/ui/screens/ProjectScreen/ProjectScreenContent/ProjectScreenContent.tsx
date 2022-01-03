import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { ReactElement, useCallback } from 'react';
import { useProjectLatestSnapshot } from '../../../../core-hooks/Project';
import Project from '../../../../core/Project';
import {
  useNavigateProject,
  useProjectRoute,
} from '../../../../navigation/hooks';
import { ProjectRouteName } from '../../../../navigation/Navigation';
import useColorScheme from '../../../../theme/useColorScheme';
import ComingSoon from '../../../../ui-atoms/other/ComingSoon';
import PatchesTab from './tabs/PatchesTab';

const tabPanelProps = {
  flex: 1,
  h: '100%',
  display: 'flex',
  flexDir: 'column',
} as const;

const projectRouteNameToTabIndex: Record<ProjectRouteName, number> = {
  [ProjectRouteName.Blocks]: 0,
  [ProjectRouteName.Music]: 1,
  [ProjectRouteName.Patches]: 2,
  [ProjectRouteName.Sprites]: 3,
  [ProjectRouteName.UberAsm]: 4,
  [ProjectRouteName.GFX]: 5,
  [ProjectRouteName.ExGFX]: 6,
  [ProjectRouteName.Backups]: 7,
  [ProjectRouteName.Releases]: 8,
};

const tabIndexToProjectRouteName: Record<number, ProjectRouteName> = {
  0: ProjectRouteName.Blocks,
  1: ProjectRouteName.Music,
  2: ProjectRouteName.Patches,
  3: ProjectRouteName.Sprites,
  4: ProjectRouteName.UberAsm,
  5: ProjectRouteName.GFX,
  6: ProjectRouteName.ExGFX,
  7: ProjectRouteName.Backups,
  8: ProjectRouteName.Releases,
};

interface ProjectScreenContent {
  project: Project;
}

export default function ProjectScreenContent({
  project,
}: ProjectScreenContent): ReactElement {
  const colorScheme = useColorScheme();

  const latestSnapshot = useProjectLatestSnapshot(project);

  const projectRoute = useProjectRoute();
  const navigateProject = useNavigateProject();

  const tabIndex = projectRouteNameToTabIndex[projectRoute];
  const handleTabsChange = useCallback(
    (index: number): void => {
      navigateProject(
        tabIndexToProjectRouteName[index] ?? ProjectRouteName.Blocks,
      );
    },
    [navigateProject],
  );

  return (
    <Tabs
      borderWidth={1}
      flex={1}
      h='100%'
      display='flex'
      flexDir='column'
      defaultIndex={2}
      colorScheme={colorScheme}
      index={tabIndex}
      onChange={handleTabsChange}
    >
      <TabList>
        <Tab>Blocks</Tab>
        <Tab>Music</Tab>
        <Tab>Patches</Tab>
        <Tab>Sprites</Tab>
        <Tab>UberASM</Tab>
        <Tab>GFX</Tab>
        <Tab>ExGFX</Tab>
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
          <PatchesTab projectSnapshot={latestSnapshot} />
        </TabPanel>
        <TabPanel {...tabPanelProps}>
          <ComingSoon title='Sprites' />
        </TabPanel>
        <TabPanel {...tabPanelProps}>
          <ComingSoon title='UberASM' />
        </TabPanel>
        <TabPanel {...tabPanelProps}>
          <ComingSoon title='GFX' />
        </TabPanel>
        <TabPanel {...tabPanelProps}>
          <ComingSoon title='ExGFX' />
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
