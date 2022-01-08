import { Flex, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import useForm from '../../hooks/useForm';
import useFormField from '../../hooks/useFormField';
import Alert from '../../ui-atoms/Alert';
import Button from '../../ui-atoms/Button';
import Drawer from '../../ui-atoms/Drawer';
import FormControl from '../../ui-atoms/FormControl';
import FormError from '../../ui-atoms/FormError';
import TextEditor from '../../ui-atoms/TextEditor';
import { ErrorReport } from '../../utils/ErrorReport';
import { $FileSystem } from '../../utils/FileSystem';

interface PatchTemplateEditorDrawerProps {
  name: string;
  onClose: () => void;
  onEdit: (name: string) => Promise<ErrorReport | undefined>;
}

export default function PatchTemplateEditorDrawer({
  name,
  onClose,
  onEdit,
}: PatchTemplateEditorDrawerProps): ReactElement {
  const nameField = useFormField({
    infoMessage: 'Name of the patch template',
    initialValue: name,
    isRequired: true,
    label: 'Patch name',
    onValidate: $FileSystem.validateIsValidName,
  });

  const form = useForm({
    fields: [nameField],
    onSubmit: () => onEdit(nameField.value),
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
            isDisabled={
              name === nameField.value || !form.isValid || form.isSubmitting
            }
            label='Save'
            onClick={async () => {
              const error = await form.handleSubmit();
              if (!error) onClose();
            }}
          />
        </>
      }
      onClose={onClose}
      title='Edit patch template'
    >
      <VStack h='100%'>
        <FormControl {...nameField.control}>
          <TextEditor
            isDisabled={form.isSubmitting}
            onBlur={nameField.handleBlur}
            onChange={nameField.handleChange}
            placeholder={nameField.control.label}
            value={nameField.value}
          />
        </FormControl>
        <Alert status='info'>
          Renaming the template will also rename the directory that contains it.
          Make sure you are not editing the template's files during the process.
        </Alert>

        <Flex flex={1} />

        {form.error && <FormError errorReport={form.error} />}
      </VStack>
    </Drawer>
  );
}