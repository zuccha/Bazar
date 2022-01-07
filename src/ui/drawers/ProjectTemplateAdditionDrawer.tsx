import { VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import useForm from '../../hooks/useForm';
import useFormField from '../../hooks/useFormField';
import Button from '../../ui-atoms/Button';
import Drawer from '../../ui-atoms/Drawer';
import FormControl from '../../ui-atoms/FormControl';
import TextEditor from '../../ui-atoms/TextEditor';
import { ErrorReport } from '../../utils/ErrorReport';
import { $FileSystem } from '../../utils/FileSystem';

interface ProjectTemplateAdditionDrawerProps {
  onClose: () => void;
  onAdd: (name: string) => Promise<ErrorReport | undefined>;
}

export default function ProjectTemplateAdditionDrawer({
  onClose,
  onAdd,
}: ProjectTemplateAdditionDrawerProps): ReactElement {
  const nameField = useFormField({
    infoMessage: 'Name of the project template',
    initialValue: '',
    isRequired: true,
    label: 'Template name',
    onValidate: $FileSystem.validateIsValidName,
  });

  const form = useForm({
    fields: [nameField],
    onSubmit: () => onAdd(nameField.value),
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
      onClose={onClose}
      title='Save project as template'
    >
      <VStack flex={1}>
        <FormControl {...nameField.control}>
          <TextEditor
            onBlur={nameField.handleBlur}
            onChange={nameField.handleChange}
            placeholder={nameField.control.label}
            value={nameField.value}
          />
        </FormControl>
      </VStack>
    </Drawer>
  );
}
