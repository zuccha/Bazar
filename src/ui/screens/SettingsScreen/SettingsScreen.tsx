import { Flex, Spinner, Text } from '@chakra-ui/react';
import { ReactElement, useMemo } from 'react';
import { useSettings } from '../../../core-hooks/Core';
import { useIsSavingSettings } from '../../../core-hooks/Settings';
import {
  useNavigateSettings,
  useSettingsRoute,
} from '../../../navigation/hooks';
import { SettingsRouteName } from '../../../navigation/Navigation';
import ListNavigator from '../../../ui-atoms/display/ListNavigator';
import AppearanceSettingsPage from './pages/AppearanceSettingsPage';
import NewProjectSettingsPage from './pages/NewProjectSettingsPage';

const LoadingRibbon = (): ReactElement | null => {
  const settings = useSettings();
  const isSaving = useIsSavingSettings(settings);
  return isSaving ? (
    <Flex
      position='absolute'
      right={0}
      bottom={0}
      px={4}
      py={2}
      alignItems='center'
    >
      <Spinner size='xs' mr={2} color='app.fg3' />
      <Text fontSize='xs'>Saving settings</Text>
    </Flex>
  ) : null;
};

const pages = [
  {
    id: SettingsRouteName.Appearance,
    label: 'Appearance',
    content: <AppearanceSettingsPage />,
  },
  {
    id: SettingsRouteName.NewProject,
    label: 'New project',
    content: <NewProjectSettingsPage />,
  },
];

export default function SettingsScreen(): ReactElement {
  const settingsRoute = useSettingsRoute();
  const navigateSettings = useNavigateSettings();

  return (
    <Flex flex={1} h='100%' p={10} justifyContent='center'>
      <Flex w='100%' minW={600} maxW={800} position='relative'>
        <ListNavigator
          selectedPage={settingsRoute}
          pages={pages}
          onSelectPage={navigateSettings}
          height='100%'
          width='100%'
        />
        <LoadingRibbon />
      </Flex>
    </Flex>
  );
}
