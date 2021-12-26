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
import { hasProject } from '../store/slices/core/slices/project';
import {
  AppRouteName,
  selectAppRoute,
  setAppRoute,
} from '../store/slices/navigation';
import PageButton from './PageButton';
import About from './pages/About';
import Help from './pages/Help';
import Home from './pages/Home';
import Project from './pages/Project';
import Settings from './pages/Settings';
import Tools from './pages/Tools';

const PageByAppRouteName: Record<AppRouteName, () => ReactElement> = {
  [AppRouteName.About]: About,
  [AppRouteName.Help]: Help,
  [AppRouteName.Home]: Home,
  [AppRouteName.Project]: Project,
  [AppRouteName.Settings]: Settings,
  [AppRouteName.Tools]: Tools,
} as const;

export default function Navigation(): ReactElement {
  const appRoute = useSelector(selectAppRoute);
  const dispatch = useDispatch();
  const Page = PageByAppRouteName[appRoute.name];
  const projectExists = useSelector(hasProject);

  return (
    <Flex h='100%'>
      <VStack p='3' bg='app.bg1' overflowY='auto' flexShrink={0}>
        <PageButton
          icon={<DragHandleIcon />}
          isActive={appRoute.name === AppRouteName.Home}
          label='Home'
          onClick={() => dispatch(setAppRoute({ name: AppRouteName.Home }))}
        />
        <PageButton
          icon={<CopyIcon />}
          isActive={appRoute.name === AppRouteName.Project}
          isDisabled={!projectExists}
          label='Project'
          onClick={() => dispatch(setAppRoute({ name: AppRouteName.Project }))}
        />
        <PageButton
          icon={<LinkIcon />}
          isActive={appRoute.name === AppRouteName.Tools}
          label='Tools'
          onClick={() => dispatch(setAppRoute({ name: AppRouteName.Tools }))}
        />
        <PageButton
          icon={<SettingsIcon />}
          isActive={appRoute.name === AppRouteName.Settings}
          label='Settings'
          onClick={() => dispatch(setAppRoute({ name: AppRouteName.Settings }))}
        />
        <Flex flex={1} />
        <PageButton
          icon={<InfoIcon />}
          isActive={appRoute.name === AppRouteName.About}
          label='About'
          onClick={() => dispatch(setAppRoute({ name: AppRouteName.About }))}
        />
        <PageButton
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
        <Page />
      </Flex>
    </Flex>
  );
}
