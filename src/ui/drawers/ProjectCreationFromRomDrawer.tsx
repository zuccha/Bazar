import { Flex, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import Project from '../../core/Project';
import { useSettings } from '../../core-hooks/Core';
import { useSetting } from '../../core-hooks/Settings';
import TextEditorOfPath from '../../ui-atoms/TextEditorOfPath';
import Button from '../../ui-atoms/Button';
import Drawer from '../../ui-atoms/Drawer';
import FormControl from '../../ui-atoms/FormControl';
import TextEditor from '../../ui-atoms/TextEditor';
import { $FileSystem } from '../../utils/FileSystem';
import useForm from '../../hooks/useForm';
import useFormField from '../../hooks/useFormField';
import ErrorReport from '../../utils/ErrorReport';

interface ProjectCreationFromSourceProps {
  onClose: () => void;
  onCreate: (project: Project) => Promise<ErrorReport | undefined>;
}

export default function ProjectCreationFromRomDrawer({
  onClose,
  onCreate,
}: ProjectCreationFromSourceProps): ReactElement {
  const settings = useSettings();

  const nameField = useFormField({
    infoMessage: 'This will be the name fo the project directory.',
    initialValue: 'MyProject',
    isRequired: true,
    label: 'Project name',
    onValidate: $FileSystem.validateIsValidName,
  });

  const defaultAuthor = useSetting(settings, 'newProjectDefaultAuthor');
  const authorField = useFormField({
    infoMessage: 'Author of the project',
    initialValue: defaultAuthor,
    isRequired: false,
    label: 'Author',
  });

  const defaultLocationDirPath = useSetting(
    settings,
    'newProjectDefaultLocationDirPath',
  );
  const locationDirPathField = useFormField({
    infoMessage: 'The project will be created in this directory',
    initialValue: defaultLocationDirPath,
    isRequired: true,
    label: 'Destination directory',
    onValidate: $FileSystem.validateExistsDir,
  });

  const defaultRomFilePath = useSetting(
    settings,
    'newProjectDefaultRomFilePath',
  );
  const romFilePathField = useFormField({
    infoMessage: 'ROM used for the project (a copy will be made)',
    initialValue: defaultRomFilePath,
    isRequired: true,
    label: 'ROM file',
    onValidate: async (value: string) =>
      (await $FileSystem.validateExistsFile(value)) ||
      (await $FileSystem.validateHasExtension(value, '.smc')),
  });

  const form = useForm({
    fields: [nameField, romFilePathField, locationDirPathField],
    onSubmit: async () => {
      const errorOrProject = await Project.createFromRom(
        locationDirPathField.value.trim(),
        {
          name: nameField.value.trim(),
          author: authorField.value.trim(),
        },
        romFilePathField.value.trim(),
      );
      if (errorOrProject.isError) return errorOrProject.error;
      return onCreate(errorOrProject.value);
    },
  });

  return (
    <Drawer
      buttons={
        <>
          <Button
            isDisabled={form.isSubmitting}
            label='Cancel'
            onClick={onClose}
            variant='outline'
            mr={3}
          />
          <Button
            isDisabled={!form.isValid || form.isSubmitting}
            label='Create'
            onClick={async () => {
              const maybeError = await form.handleSubmit();
              if (!maybeError) onClose();
            }}
          />
        </>
      }
      error={form.error}
      info='A new directory named after the chosen project name will be created in the selected location, containing a copy of the base ROM and generated files.'
      onClose={onClose}
      title='New project'
    >
      <Flex direction='column' flex={1}>
        <VStack width='100%' spacing={4} flex={1}>
          <FormControl {...nameField.control}>
            <TextEditor
              isDisabled={form.isSubmitting}
              onBlur={nameField.handleBlur}
              onChange={nameField.handleChange}
              placeholder={nameField.control.label}
              value={nameField.value}
            />
          </FormControl>

          <FormControl {...authorField.control}>
            <TextEditor
              isDisabled={form.isSubmitting}
              onBlur={authorField.handleBlur}
              onChange={authorField.handleChange}
              placeholder={authorField.control.label}
              value={authorField.value}
            />
          </FormControl>

          <FormControl {...locationDirPathField.control}>
            <TextEditorOfPath
              isDisabled={form.isSubmitting}
              mode='directory'
              onBlur={locationDirPathField.handleBlur}
              onChange={locationDirPathField.handleChange}
              placeholder={locationDirPathField.control.label}
              value={locationDirPathField.value}
            />
          </FormControl>

          <FormControl {...romFilePathField.control}>
            <TextEditorOfPath
              isDisabled={form.isSubmitting}
              filters={[{ name: 'ROM', extensions: ['smc'] }]}
              mode='file'
              onBlur={romFilePathField.handleBlur}
              onChange={romFilePathField.handleChange}
              placeholder={romFilePathField.control.label}
              value={romFilePathField.value}
            />
          </FormControl>
        </VStack>
      </Flex>
    </Drawer>
  );
}
