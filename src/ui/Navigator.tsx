import {
  CopyIcon,
  DragHandleIcon,
  InfoIcon,
  LinkIcon,
  QuestionIcon,
  SettingsIcon,
  StarIcon,
} from '@chakra-ui/icons';
import { Flex, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import SidebarButton from './SidebarButton';
import AboutScreen from './screens/AboutScreen';
import HelpScreen from './screens/HelpScreen';
import HomeScreen from './screens/HomeScreen';
import ProjectScreen from './screens/ProjectScreen';
import SettingsScreen from './screens/SettingsScreen';
import CollectionScreen from './screens/CollectionScreen';
import ToolchainScreen from './screens/ToolchainScreen';
import { useProject } from '../core-hooks/Core';
import { useNavigateRoot, useRootRoute } from '../navigation/hooks';
import { RootRouteName } from '../navigation/Navigation';

const ScreenByAppRouteName: Record<RootRouteName, () => ReactElement> = {
  [RootRouteName.About]: AboutScreen,
  [RootRouteName.Collection]: CollectionScreen,
  [RootRouteName.Help]: HelpScreen,
  [RootRouteName.Home]: HomeScreen,
  [RootRouteName.Project]: ProjectScreen,
  [RootRouteName.Settings]: SettingsScreen,
  [RootRouteName.Toolchain]: ToolchainScreen,
} as const;

export default function Navigator(): ReactElement {
  const rootRoute = useRootRoute();
  const navigateRoot = useNavigateRoot();

  const Screen = ScreenByAppRouteName[rootRoute];
  const project = useProject();

  return (
    <Flex h='100%'>
      <VStack p='3' bg='app.bg1' overflowY='auto' flexShrink={0}>
        <SidebarButton
          icon={<DragHandleIcon />}
          isActive={rootRoute === RootRouteName.Home}
          label='Home'
          onClick={() => navigateRoot(RootRouteName.Home)}
        />
        <SidebarButton
          icon={<StarIcon />}
          isActive={rootRoute === RootRouteName.Project}
          isDisabled={!project}
          label='Project'
          onClick={() => navigateRoot(RootRouteName.Project)}
        />
        <SidebarButton
          icon={<CopyIcon />}
          isActive={rootRoute === RootRouteName.Collection}
          label='Templates'
          onClick={() => navigateRoot(RootRouteName.Collection)}
        />
        <SidebarButton
          icon={<LinkIcon />}
          isActive={rootRoute === RootRouteName.Toolchain}
          label='Tools'
          onClick={() => navigateRoot(RootRouteName.Toolchain)}
        />
        <SidebarButton
          icon={<SettingsIcon />}
          isActive={rootRoute === RootRouteName.Settings}
          label='Settings'
          onClick={() => navigateRoot(RootRouteName.Settings)}
        />
        <Flex flex={1} />
        <SidebarButton
          icon={<InfoIcon />}
          isActive={rootRoute === RootRouteName.About}
          label='About'
          onClick={() => navigateRoot(RootRouteName.About)}
        />
        <SidebarButton
          icon={<QuestionIcon />}
          isActive={rootRoute === RootRouteName.Help}
          label='Help'
          onClick={() => navigateRoot(RootRouteName.Help)}
        />
      </VStack>
      <Flex
        flex={1}
        h='100%'
        bg='app.bg3'
        alignItems='flex-start'
        justifyContent='flex-start'
      >
        <Screen />
      </Flex>
    </Flex>
  );
}
