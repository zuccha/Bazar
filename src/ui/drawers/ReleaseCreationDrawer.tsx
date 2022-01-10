import { Flex, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import Project from '../../core/Project';
import { ReleaseInfo } from '../../core/Release';
import useForm from '../../hooks/useForm';
import useFormField from '../../hooks/useFormField';
import Button from '../../ui-atoms/Button';
import Drawer from '../../ui-atoms/Drawer';
import FormControl from '../../ui-atoms/FormControl';
import TextEditor from '../../ui-atoms/TextEditor';
import ErrorReport from '../../utils/ErrorReport';
import { $FileSystem } from '../../utils/FileSystem';

interface ReleaseCreationDrawerProps {
  onClose: () => void;
  onCreate: (info: ReleaseInfo) => Promise<ErrorReport | undefined>;
  project: Project;
}

export default function ReleaseCreationDrawer({
  onClose,
  onCreate,
  project,
}: ReleaseCreationDrawerProps): ReactElement {
  const nameField = useFormField({
    infoMessage: 'Name of the release',
    initialValue: project.getName(),
    isRequired: true,
    label: 'Patch name',
    onValidate: $FileSystem.validateIsValidName,
  });

  const versionField = useFormField({
    infoMessage: 'Version of the release',
    initialValue: project.getInfo().version,
    isRequired: true,
    label: 'Version',
    onValidate: $FileSystem.validateIsValidName,
  });

  const form = useForm({
    fields: [nameField, versionField],
    onSubmit: () =>
      onCreate({
        name: nameField.value.trim(),
        creationDate: new Date(),
        version: versionField.value.trim(),
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
            label='Create'
            onClick={async () => {
              const maybeError = await form.handleSubmit();
              if (!maybeError) onClose();
            }}
          />
        </>
      }
      info='The release will consist of a BPS file.'
      error={form.error}
      onClose={onClose}
      title='Release'
    >
      <Flex direction='column' flex={1}>
        <VStack w='100%' spacing={4} flex={1}>
          <FormControl {...nameField.control}>
            <TextEditor
              isDisabled={form.isSubmitting}
              onBlur={nameField.handleBlur}
              onChange={nameField.handleChange}
              placeholder={nameField.control.label}
              value={nameField.value}
            />
          </FormControl>
          <FormControl {...versionField.control}>
            <TextEditor
              isDisabled={form.isSubmitting}
              onBlur={versionField.handleBlur}
              onChange={versionField.handleChange}
              placeholder={versionField.control.label}
              value={versionField.value}
            />
          </FormControl>
        </VStack>
      </Flex>
    </Drawer>
  );
}
