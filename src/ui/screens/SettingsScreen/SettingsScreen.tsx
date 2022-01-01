import { ReactElement, useMemo } from 'react';
import {
  useNavigateSettings,
  useSettingsRoute,
} from '../../../navigation/hooks';
import { SettingsRouteName } from '../../../navigation/Navigation';
import ListNavigator from '../../../ui-atoms/display/ListNavigator';
import AppearanceSettingsPage from './pages/AppearanceSettingsPage';
import NewProjectSettingsPage from './pages/NewProjectSettingsPage';

export default function SettingsScreen(): ReactElement {
  const settingsRoute = useSettingsRoute();
  const navigateSettings = useNavigateSettings();

  const pages = useMemo(
    () => [
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
    ],
    [],
  );

  return (
    <ListNavigator
      selectedPage={settingsRoute}
      pages={pages}
      onSelectPage={navigateSettings}
      flex={1}
      height='100%'
    />
  );
}
