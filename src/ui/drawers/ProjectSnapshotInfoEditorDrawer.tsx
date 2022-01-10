import { VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { ProjectInfo } from '../../core/Project';
import useForm from '../../hooks/useForm';
import useFormField from '../../hooks/useFormField';
import Button from '../../ui-atoms/Button';
import Drawer from '../../ui-atoms/Drawer';
import FormControl from '../../ui-atoms/FormControl';
import TextEditor from '../../ui-atoms/TextEditor';
import ErrorReport from '../../utils/ErrorReport';
import { $FileSystem } from '../../utils/FileSystem';
import NameVersionFields from '../forms/NameVersionFields';

interface ProjectSnapshotInfoEditorDrawerProps {
  info: ProjectInfo;
  onClose: () => void;
  onEdit: (info: ProjectInfo) => Promise<ErrorReport | undefined>;
}

export default function ProjectSnapshotInfoEditorDrawer({
  info,
  onClose,
  onEdit,
}: ProjectSnapshotInfoEditorDrawerProps): ReactElement {
  const nameField = useFormField({
    infoMessage: 'This is the name of the project',
    initialValue: info.name,
    isRequired: true,
    label: 'Project name',
    onValidate: $FileSystem.validateIsValidName,
  });

  const versionField = useFormField({
    infoMessage: 'This is the version of the project',
    initialValue: info.version,
    isRequired: true,
    label: 'Version',
    onValidate: $FileSystem.validateIsValidVersion,
  });

  const authorField = useFormField({
    infoMessage: 'Author of the project',
    initialValue: info.author,
    isRequired: false,
    label: 'Author',
  });

  const form = useForm({
    fields: [nameField, versionField],
    onSubmit: () =>
      onEdit({
        name: nameField.value,
        version: versionField.value,
        author: authorField.value,
      }),
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
            label='Save'
            onClick={async () => {
              await form.handleSubmit();
              onClose();
            }}
          />
        </>
      }
      error={form.error}
      info='Changing the project name will not change the directory name.'
      onClose={onClose}
      title='Edit config'
    >
      <VStack flex={1}>
        <NameVersionFields
          isDisabled={form.isSubmitting}
          nameField={nameField}
          versionField={versionField}
        />

        <FormControl {...authorField.control}>
          <TextEditor
            isDisabled={form.isSubmitting}
            onBlur={authorField.handleBlur}
            onChange={authorField.handleChange}
            placeholder={authorField.control.label}
            value={authorField.value}
          />
        </FormControl>
      </VStack>
    </Drawer>
  );
}
