import { Flex, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { AppRouteName, setAppRoute } from '../../store/slices/navigation';
import { createProjectFromSource } from '../../store/slices/core/slices/project';
import BrowserInput from '../../ui-atoms/input/BrowserInput';
import Button from '../../ui-atoms/input/Button';
import FormControl, {
  useForm,
  useFormField,
} from '../../ui-atoms/input/FormControl';
import TextInput from '../../ui-atoms/input/TextInput';
import {
  getSetting,
  prioritizeRecentProject,
} from '../../store/slices/settings';
import Drawer from '../../ui-atoms/overlay/Drawer';
import FormError from '../../ui-atoms/input/FormError';
import Alert from '../../ui-atoms/display/Alert';
import { $FileSystem } from '../../utils/FileSystem';
import useAsyncCallback from '../../hooks/useAsyncCallback';

interface ProjectCreationFromSourceProps {
  onClose: () => void;
}

export default function ProjectCreationFromSourceDrawer({
  onClose,
}: ProjectCreationFromSourceProps): ReactElement {
  const nameField = useFormField({
    infoMessage: 'This will be the name fo the project directory.',
    initialValue: 'MyProject',
    isRequired: true,
    label: 'Project name',
    onValidate: $FileSystem.validateIsValidName,
  });

  const defaultAuthor = useSelector(getSetting('newProjectDefaultAuthor'));
  const authorField = useFormField({
    infoMessage: 'Author of the project.',
    initialValue: defaultAuthor,
    isRequired: false,
    label: 'Author',
  });

  const defaultLocationDirPath = useSelector(
    getSetting('newProjectDefaultLocationDirPath'),
  );
  const locationDirPathField = useFormField({
    infoMessage: 'The project will be created in this directory.',
    initialValue: defaultLocationDirPath,
    isRequired: true,
    label: 'Destination directory',
    onValidate: $FileSystem.validateExistsDir,
  });

  const defaultRomFilePath = useSelector(
    getSetting('newProjectDefaultRomFilePath'),
  );
  const romFilePathField = useFormField({
    infoMessage: 'ROM used for the project (a copy will be made).',
    initialValue: defaultRomFilePath,
    isRequired: true,
    label: 'ROM file',
    onValidate: (value: string) =>
      $FileSystem.validateExistsFile(value) ||
      $FileSystem.validateHasExtension(value, '.smc'),
  });

  const dispatch = useDispatch<AppDispatch>();

  const form = useForm({
    fields: [nameField, romFilePathField, locationDirPathField],
    onSubmit: async () => {
      const error = await dispatch(
        createProjectFromSource({
          name: nameField.value.trim(),
          author: authorField.value.trim(),
          romFilePath: romFilePathField.value.trim(),
          locationDirPath: locationDirPathField.value.trim(),
        }),
      );
      if (error) return error;
      const projectDirPath = await $FileSystem.join(
        locationDirPathField.value,
        nameField.value,
      );
      await dispatch(prioritizeRecentProject(projectDirPath));
    },
  });

  const handleCreate = useAsyncCallback(async () => {
    const maybeError = await form.handleSubmit();
    if (maybeError) return maybeError;
    dispatch(setAppRoute({ name: AppRouteName.Project }));
    onClose();
  }, [form, dispatch, onClose]);

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
            <TextInput
              isDisabled={handleCreate.isLoading}
              onBlur={nameField.handleBlur}
              onChange={nameField.handleChange}
              placeholder={nameField.control.label}
              value={nameField.value}
            />
          </FormControl>

          <FormControl {...authorField.control}>
            <TextInput
              isDisabled={handleCreate.isLoading}
              onBlur={authorField.handleBlur}
              onChange={authorField.handleChange}
              placeholder={authorField.control.label}
              value={authorField.value}
            />
          </FormControl>

          <FormControl {...locationDirPathField.control}>
            <BrowserInput
              isDisabled={handleCreate.isLoading}
              mode='directory'
              onBlur={locationDirPathField.handleBlur}
              onChange={locationDirPathField.handleChange}
              placeholder={locationDirPathField.control.label}
              value={locationDirPathField.value}
            />
          </FormControl>

          <FormControl {...romFilePathField.control}>
            <BrowserInput
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
