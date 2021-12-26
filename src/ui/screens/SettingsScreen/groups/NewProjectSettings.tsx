import {
  ForwardedRef,
  forwardRef,
  ReactElement,
  useImperativeHandle,
} from 'react';
import BrowserInput from '../../../../ui-atoms/input/BrowserInput';
import FormControl from '../../../../ui-atoms/input/FormControl';
import TextInput from '../../../../ui-atoms/input/TextInput';
import { ErrorReport } from '../../../../utils/ErrorReport';
import { $FileSystem } from '../../../../utils/FileSystem';
import SettingsGroup from '../SettingsGroup';
import useSettingField from '../useSettingsField';

interface NewProjectSettingsProps {
  isDisabled?: boolean;
}

export interface NewProjectSettingsRef {
  reset: () => void;
  save: () => Promise<(ErrorReport | undefined)[]>;
}

function NewProjectSettings(
  { isDisabled }: NewProjectSettingsProps,
  ref: ForwardedRef<NewProjectSettingsRef>,
): ReactElement {
  const author = useSettingField('newProjectDefaultAuthor', {
    infoMessage: 'Default author for new projects',
    label: 'Default author',
  });

  const locationDirPath = useSettingField('newProjectDefaultLocationDirPath', {
    infoMessage: 'Default directory for new projects',
    label: 'Default destination directory',
    onValidate: $FileSystem.validateExistsDir,
  });

  const romFilePath = useSettingField('newProjectDefaultRomFilePath', {
    infoMessage: 'ROM used for the project (a copy will be made).',
    label: 'Default ROM file',
    onValidate: async (value: string) =>
      (await $FileSystem.validateExistsFile(value)) ||
      (await $FileSystem.validateHasExtension(value, '.smc')),
  });

  useImperativeHandle(ref, () => ({
    save: () => {
      return Promise.all([
        author.save(),
        locationDirPath.save(),
        romFilePath.save(),
      ]);
    },
    reset: () => {
      author.reset();
      locationDirPath.reset();
      romFilePath.reset();
    },
  }));

  return (
    <SettingsGroup title='New project'>
      <FormControl {...author.field.control}>
        <TextInput
          isDisabled={isDisabled}
          onBlur={author.field.handleBlur}
          onChange={author.field.handleChange}
          placeholder={author.field.control.label}
          value={author.field.value}
        />
      </FormControl>

      <FormControl {...locationDirPath.field.control}>
        <BrowserInput
          isDisabled={isDisabled}
          mode='directory'
          onBlur={locationDirPath.field.handleBlur}
          onChange={locationDirPath.field.handleChange}
          placeholder={locationDirPath.field.control.label}
          value={locationDirPath.field.value}
        />
      </FormControl>

      <FormControl {...romFilePath.field.control}>
        <BrowserInput
          isDisabled={isDisabled}
          filters={[{ name: 'ROM', extensions: ['smc'] }]}
          mode='file'
          onBlur={romFilePath.field.handleBlur}
          onChange={romFilePath.field.handleChange}
          placeholder={romFilePath.field.control.label}
          value={romFilePath.field.value}
        />
      </FormControl>
    </SettingsGroup>
  );
}

export default forwardRef<NewProjectSettingsRef, NewProjectSettingsProps>(
  NewProjectSettings,
);
