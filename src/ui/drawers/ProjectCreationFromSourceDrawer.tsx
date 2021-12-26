import { Flex, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { AppRouteName, setAppRoute } from '../../store/slices/navigation';
import BrowserInput from '../../ui-atoms/input/BrowserInput';
import Button from '../../ui-atoms/input/Button';
import FormControl, {
  useForm,
  useFormField,
} from '../../ui-atoms/input/FormControl';
import TextInput from '../../ui-atoms/input/TextInput';
import Drawer from '../../ui-atoms/overlay/Drawer';
import FormError from '../../ui-atoms/input/FormError';
import Alert from '../../ui-atoms/display/Alert';
import { $FileSystem } from '../../utils/FileSystem';
import useAsyncCallback from '../../hooks/useAsyncCallback';
import Project from '../../core2/Project';
import { useGet, useSet, useSetAsync } from '../../hooks/useAccessors';
import Core from '../../core2/Core';
import { useCore } from '../../contexts/CoreContext';

interface ProjectCreationFromSourceProps {
  onClose: () => void;
}

export default function ProjectCreationFromSourceDrawer({
  onClose,
}: ProjectCreationFromSourceProps): ReactElement {
  const core = useCore();
  const settings = useGet(core, core.getSettings, Core.getSettingsDeps);

  const nameField = useFormField({
    infoMessage: 'This will be the name fo the project directory.',
    initialValue: 'MyProject',
    isRequired: true,
    label: 'Project name',
    onValidate: $FileSystem.validateIsValidName,
  });

  const defaultAuthor = useGet(
    settings,
    () => settings.get('newProjectDefaultAuthor'),
    ['newProjectDefaultAuthor'],
  );
  const authorField = useFormField({
    infoMessage: 'Author of the project.',
    initialValue: defaultAuthor,
    isRequired: false,
    label: 'Author',
  });

  const defaultLocationDirPath = useGet(
    settings,
    () => settings.get('newProjectDefaultLocationDirPath'),
    ['newProjectDefaultLocationDirPath'],
  );
  const locationDirPathField = useFormField({
    infoMessage: 'The project will be created in this directory.',
    initialValue: defaultLocationDirPath,
    isRequired: true,
    label: 'Destination directory',
    onValidate: $FileSystem.validateExistsDir,
  });

  const defaultRomFilePath = useGet(
    settings,
    () => settings.get('newProjectDefaultRomFilePath'),
    ['newProjectDefaultRomFilePath'],
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

  const setProject = useSet(core, core.setProject, Core.setProjectTriggers);

  const prioritizeRecentProject = useSetAsync(
    settings,
    settings.prioritizeRecentProject,
    ['recentProjects'],
  );

  const form = useForm({
    fields: [nameField, romFilePathField, locationDirPathField],
    onSubmit: async () => {
      const errorOrProject = await Project.createFromSource({
        name: nameField.value.trim(),
        author: authorField.value.trim(),
        romFilePath: romFilePathField.value.trim(),
        locationDirPath: locationDirPathField.value.trim(),
      });
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
