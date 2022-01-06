import { Flex, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import Project from '../../core/Project';
import { useSetProject, useSettings } from '../../core-hooks/Core';
import {
  usePrioritizeRecentProject,
  useSetting,
} from '../../core-hooks/Settings';
import useAsyncCallback from '../../hooks/useAsyncCallback';
import { RootRouteName } from '../../navigation/Navigation';
import { useNavigateRoot } from '../../navigation/hooks';
import TextEditorOfPath from '../../ui-atoms/TextEditorOfPath';
import Alert from '../../ui-atoms/Alert';
import Button from '../../ui-atoms/Button';
import Drawer from '../../ui-atoms/Drawer';
import FormControl from '../../ui-atoms/FormControl';
import FormError from '../../ui-atoms/FormError';
import TextEditor from '../../ui-atoms/TextEditor';
import { $FileSystem } from '../../utils/FileSystem';
import useForm from '../../hooks/useForm';
import useFormField from '../../hooks/useFormField';

interface ProjectCreationFromSourceProps {
  onClose: () => void;
}

export default function ProjectCreationFromSourceDrawer({
  onClose,
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

  const setProject = useSetProject();

  const prioritizeRecentProject = usePrioritizeRecentProject(settings);

  const navigateRoot = useNavigateRoot();

  const form = useForm({
    fields: [nameField, romFilePathField, locationDirPathField],
    onSubmit: async () => {
      const errorOrProject = await Project.createFromSource(
        locationDirPathField.value.trim(),
        {
          name: nameField.value.trim(),
          author: authorField.value.trim(),
          romFilePath: romFilePathField.value.trim(),
        },
      );
      if (errorOrProject.isError) return errorOrProject.error;
      const maybeError = setProject(errorOrProject.value);
      if (maybeError) return maybeError;
      const projectDirPath = await $FileSystem.join(
        locationDirPathField.value,
        nameField.value,
      );
      await prioritizeRecentProject(projectDirPath);
    },
  });

  const handleCreate = useAsyncCallback(async () => {
    const maybeError = await form.handleSubmit();
    if (maybeError) return maybeError;
    navigateRoot(RootRouteName.Project);
    onClose();
  }, [form, navigateRoot, onClose]);

  return (
    <Drawer
      buttons={
        <>
          <Button
            isDisabled={handleCreate.isLoading}
            label='Cancel'
            onClick={onClose}
            variant='outline'
            mr={3}
          />
          <Button
            isDisabled={!form.isValid || handleCreate.isLoading}
            label='Create'
            onClick={handleCreate.call}
          />
        </>
      }
      onClose={onClose}
      title='New project'
    >
      <Flex direction='column' h='100%'>
        <VStack width='100%' spacing={4} flex={1}>
          <FormControl {...nameField.control}>
            <TextEditor
              isDisabled={handleCreate.isLoading}
              onBlur={nameField.handleBlur}
              onChange={nameField.handleChange}
              placeholder={nameField.control.label}
              value={nameField.value}
            />
          </FormControl>

          <FormControl {...authorField.control}>
            <TextEditor
              isDisabled={handleCreate.isLoading}
              onBlur={authorField.handleBlur}
              onChange={authorField.handleChange}
              placeholder={authorField.control.label}
              value={authorField.value}
            />
          </FormControl>

          <FormControl {...locationDirPathField.control}>
            <TextEditorOfPath
              isDisabled={handleCreate.isLoading}
              mode='directory'
              onBlur={locationDirPathField.handleBlur}
              onChange={locationDirPathField.handleChange}
              placeholder={locationDirPathField.control.label}
              value={locationDirPathField.value}
            />
          </FormControl>

          <FormControl {...romFilePathField.control}>
            <TextEditorOfPath
              isDisabled={handleCreate.isLoading}
              filters={[{ name: 'ROM', extensions: ['smc'] }]}
              mode='file'
              onBlur={romFilePathField.handleBlur}
              onChange={romFilePathField.handleChange}
              placeholder={romFilePathField.control.label}
              value={romFilePathField.value}
            />
          </FormControl>

          <Alert status='info'>
            A new directory named after the chosen project name will be created
            in the selected location, containing a copy of the base ROM and
            generated files.
          </Alert>
        </VStack>

        {form.error && <FormError errorReport={form.error} />}
      </Flex>
    </Drawer>
  );
}
