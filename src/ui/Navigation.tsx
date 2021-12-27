import {
  CopyIcon,
  DragHandleIcon,
  InfoIcon,
  LinkIcon,
  QuestionIcon,
  SettingsIcon,
} from '@chakra-ui/icons';
import { Flex, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppRouteName,
  selectAppRoute,
  setAppRoute,
} from '../store/slices/navigation';
import SidebarButton from './SidebarButton';
import AboutScreen from './screens/AboutScreen';
import HelpScreen from './screens/HelpScreen';
import HomeScreen from './screens/HomeScreen';
import ProjectScreen from './screens/ProjectScreen';
import SettingsScreen from './screens/SettingsScreen';
import ToolsScreen from './screens/ToolchainScreen';
import { useProject } from '../core-hooks/Core';

const ScreenByAppRouteName: Record<AppRouteName, () => ReactElement> = {
  [AppRouteName.About]: AboutScreen,
  [AppRouteName.Help]: HelpScreen,
  [AppRouteName.Home]: HomeScreen,
  [AppRouteName.Project]: ProjectScreen,
  [AppRouteName.Settings]: SettingsScreen,
  [AppRouteName.Tools]: ToolsScreen,
} as const;

export default function Navigation(): ReactElement {
  const appRoute = useSelector(selectAppRoute);
  const dispatch = useDispatch();
  const Screen = ScreenByAppRouteName[appRoute.name];
  const project = useProject();

  return (
    <Flex h='100%'>
      <VStack p='3' bg='app.bg1' overflowY='auto' flexShrink={0}>
        <SidebarButton
          icon={<DragHandleIcon />}
          isActive={appRoute.name === AppRouteName.Home}
          label='Home'
          onClick={() => dispatch(setAppRoute({ name: AppRouteName.Home }))}
        />
        <SidebarButton
          icon={<CopyIcon />}
          isActive={appRoute.name === AppRouteName.Project}
          isDisabled={!project}
          label='Project'
          onClick={() => dispatch(setAppRoute({ name: AppRouteName.Project }))}
        />
        <SidebarButton
          icon={<LinkIcon />}
          isActive={appRoute.name === AppRouteName.Tools}
          label='Tools'
          onClick={() => dispatch(setAppRoute({ name: AppRouteName.Tools }))}
        />
        <SidebarButton
          icon={<SettingsIcon />}
          isActive={appRoute.name === AppRouteName.Settings}
          label='Settings'
          onClick={() => dispatch(setAppRoute({ name: AppRouteName.Settings }))}
        />
        <Flex flex={1} />
        <SidebarButton
          icon={<InfoIcon />}
          isActive={appRoute.name === AppRouteName.About}
          label='About'
          onClick={() => dispatch(setAppRoute({ name: AppRouteName.About }))}
        />
        <SidebarButton
          icon={<QuestionIcon />}
          isActive={appRoute.name === AppRouteName.Help}
          label='Help'
          onClick={() => dispatch(setAppRoute({ name: AppRouteName.Help }))}
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
