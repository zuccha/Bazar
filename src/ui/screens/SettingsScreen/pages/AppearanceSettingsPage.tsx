import { VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import FormControl from '../../../../ui-atoms/FormControl';
import Selector from '../../../../ui-atoms/Selector';
import useSettingField from '../useSettingsField';

const appearanceColorSchemeOptions = [
  { label: 'Blue', value: 'blue' },
  { label: 'Cyan', value: 'cyan' },
  { label: 'Green', value: 'green' },
  { label: 'Orange', value: 'orange' },
  { label: 'Pink', value: 'pink' },
  { label: 'Purple', value: 'purple' },
  { label: 'Red', value: 'red' },
  { label: 'Teal', value: 'teal' },
  { label: 'Yellow', value: 'yellow' },
];

export default function AppearanceSettingsPage(): ReactElement {
  const colorScheme = useSettingField('appearanceColorScheme', {
    infoMessage: 'Accent color for inputs',
    label: 'Color scheme',
  });

  return (
    <VStack spacing={4} alignItems='flex-start' p={4}>
      <FormControl {...colorScheme.field.control}>
        <Selector
          isDisabled={colorScheme.isSaving}
          onChange={colorScheme.set}
          options={appearanceColorSchemeOptions}
          placeholder={colorScheme.field.control.label}
          value={colorScheme.field.value}
        />
      </FormControl>
    </VStack>
  );
}
