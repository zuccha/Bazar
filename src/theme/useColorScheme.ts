import { useSettings } from '../core-hooks/Core';
import { useSetting } from '../core-hooks/Settings';

export default function useColorScheme(): string {
  const settings = useSettings();
  const colorScheme = useSetting(settings, 'appearanceColorScheme');
  return colorScheme;
}
