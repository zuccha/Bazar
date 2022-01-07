import { VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import FormControl from '../../../../ui-atoms/FormControl';
import TextEditor from '../../../../ui-atoms/TextEditor';
import TextEditorOfPath from '../../../../ui-atoms/TextEditorOfPath';
import useSettingField from '../useSettingsField';

export default function NewProjectSettingsPage(): ReactElement {
  const author = useSettingField(
    'newProjectDefaultAuthor',
    {
      infoMessage: 'Default author for new projects',
      label: 'Default author',
    },
    { debounce: 1000 },
  );

  const locationDirPath = useSettingField('newProjectDefaultLocationDirPath', {
    infoMessage: 'Default directory for new projects',
    label: 'Default destination directory',
  });

  const romFilePath = useSettingField('newProjectDefaultRomFilePath', {
    infoMessage: 'ROM used for the project (a copy will be made).',
    label: 'Default ROM file',
  });

  return (
    <VStack spacing={4} alignItems='flex-start' p={4}>
      <FormControl {...author.field.control}>
        <TextEditor
          isDisabled={author.isSaving}
          onChange={author.set}
          placeholder={author.field.control.label}
          value={author.field.value}
        />
      </FormControl>

      <FormControl {...locationDirPath.field.control}>
        <TextEditorOfPath
          isDisabled={locationDirPath.isSaving}
          isManualEditDisabled
          mode='directory'
          onClear={() => locationDirPath.set('')}
          onChange={locationDirPath.set}
          placeholder={locationDirPath.field.control.label}
          value={locationDirPath.field.value}
        />
      </FormControl>

      <FormControl {...romFilePath.field.control}>
        <TextEditorOfPath
          isDisabled={romFilePath.isSaving}
          isManualEditDisabled
          filters={[{ name: 'ROM', extensions: ['smc'] }]}
          mode='file'
          onClear={() => romFilePath.set('')}
          onChange={romFilePath.set}
          placeholder={romFilePath.field.control.label}
          value={romFilePath.field.value}
        />
      </FormControl>
    </VStack>
  );
}
