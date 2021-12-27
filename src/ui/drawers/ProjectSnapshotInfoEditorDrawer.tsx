import { Alert, AlertIcon, Box, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { useProjectInfo, useSetProjectInfo } from '../../core-hooks/Project';
import Project from '../../core/Project';
import useAsyncCallback from '../../hooks/useAsyncCallback';
import Button from '../../ui-atoms/input/Button';
import FormControl, {
  useForm,
  useFormField,
} from '../../ui-atoms/input/FormControl';
import TextInput from '../../ui-atoms/input/TextInput';
import Drawer from '../../ui-atoms/overlay/Drawer';
import { $FileSystem } from '../../utils/FileSystem';

interface ProjectSnapshotInfoEditorDrawerProps {
  onClose: () => void;
  project: Project;
}

export default function ProjectSnapshotInfoEditorDrawer({
  onClose,
  project,
}: ProjectSnapshotInfoEditorDrawerProps): ReactElement {
  const info = useProjectInfo(project);
  const setInfo = useSetProjectInfo(project);
  const handleEditInfo = useAsyncCallback(setInfo, [setInfo]);

  const nameField = useFormField({
    infoMessage: 'This is the name of the project',
    initialValue: info.name,
    isRequired: true,
    label: 'Project name',
    onValidate: $FileSystem.validateIsValidName,
  });

  const authorField = useFormField({
    infoMessage: 'Author of the project',
    initialValue: info.author,
    isRequired: false,
    label: 'Author',
  });

  const form = useForm({
    fields: [nameField],
    onSubmit: () =>
      handleEditInfo.call({ name: nameField.value, author: authorField.value }),
  });

  return (
    <Drawer
      buttons={
        <>
          <Button label='Cancel' onClick={onClose} variant='outline' mr={3} />
          <Button
            label='Save'
            onClick={async () => {
              await form.handleSubmit();
              onClose();
            }}
            isDisabled={!form.isValid}
          />
        </>
      }
      onClose={onClose}
      title='Edit config'
    >
      <VStack flex={1}>
        <FormControl {...nameField.control}>
          <TextInput
            onBlur={nameField.handleBlur}
            onChange={nameField.handleChange}
            placeholder={nameField.control.label}
            value={nameField.value}
          />
        </FormControl>

        <FormControl {...authorField.control}>
          <TextInput
            onBlur={authorField.handleBlur}
            onChange={authorField.handleChange}
            placeholder={authorField.control.label}
            value={authorField.value}
          />
        </FormControl>

        <Box flex={1} />

        <Alert status='info'>
          <AlertIcon />
          Changing the project name will not change the directory name.
        </Alert>
      </VStack>
    </Drawer>
  );
}
