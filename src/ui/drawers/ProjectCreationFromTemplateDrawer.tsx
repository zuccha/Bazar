import { Flex, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import Project from '../../core/Project';
import { useCollection, useSettings } from '../../core-hooks/Core';
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
import Selector from '../../ui-atoms/Selector';
import { useCollectionProjectSnapshotNames } from '../../core-hooks/Collection';
import { useList } from '../../hooks/useAccessors';

interface ProjectCreationFromSourceProps {
  onClose: () => void;
  onCreate: (project: Project) => Promise<ErrorReport | undefined>;
}

export default function ProjectCreationFromRomDrawer({
  onClose,
  onCreate,
}: ProjectCreationFromSourceProps): ReactElement {
  const collection = useCollection();
  const projectSnapshotNames = useCollectionProjectSnapshotNames(collection);

  const settings = useSettings();

  const nameField = useFormField({
    infoMessage: 'This will be the name fo the project directory',
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

  const templateNameField = useFormField({
    infoMessage:
      'Project template that will be used as a base for the new project',
    initialValue: projectSnapshotNames[0] ?? '',
    isRequired: true,
    label: 'Template',
  });

  const form = useForm({
    fields: [nameField, templateNameField, locationDirPathField],
    onSubmit: async () => {
      const name = nameField.value.trim();
      const author = authorField.value.trim();
      const templateName = templateNameField.value.trim();
      const templatePath = await collection.getProjectSnapshotPath(
        templateName,
      );
      const errorOrProject = await Project.createFromTemplate(
        locationDirPathField.value.trim(),
        { name, author },
        templatePath,
      );
      if (errorOrProject.isError) return errorOrProject.error;
      return onCreate(errorOrProject.value);
    },
  });

  const projectSnapshotNameOptions = useList(projectSnapshotNames).map(
    (projectSnapshotName) => ({
      label: projectSnapshotName,
      value: projectSnapshotName,
    }),
  );

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
      info='A new directory named after the chosen project name will be created in the selected location, containing a copy of the project template. Later changes to the project will not change the template.'
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

          <FormControl {...templateNameField.control}>
            <Selector
              isDisabled={form.isSubmitting}
              onChange={templateNameField.handleChange}
              options={projectSnapshotNameOptions}
              placeholder={templateNameField.control.label}
              value={templateNameField.value}
            />
          </FormControl>
        </VStack>
      </Flex>
    </Drawer>
  );
}
