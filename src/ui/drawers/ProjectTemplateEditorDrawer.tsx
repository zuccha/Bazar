import { ReactElement } from 'react';
import useForm from '../../hooks/useForm';
import useFormField from '../../hooks/useFormField';
import Button from '../../ui-atoms/Button';
import Drawer from '../../ui-atoms/Drawer';
import FormControl from '../../ui-atoms/FormControl';
import TextEditor from '../../ui-atoms/TextEditor';
import { ErrorReport } from '../../utils/ErrorReport';
import { $FileSystem } from '../../utils/FileSystem';

interface ProjectTemplateEditorDrawerProps {
  name: string;
  onClose: () => void;
  onEdit: (name: string) => Promise<ErrorReport | undefined>;
}

export default function ProjectTemplateEditorDrawer({
  name,
  onClose,
  onEdit,
}: ProjectTemplateEditorDrawerProps): ReactElement {
  const nameField = useFormField({
    infoMessage: 'Name of the project template',
    initialValue: name,
    isRequired: true,
    label: 'Template name',
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
      error={form.error}
      info="Renaming the template will also rename the directory that contains it. Make sure you are not editing the template's files during the process."
      onClose={onClose}
      title='Edit project template'
    >
      <FormControl {...nameField.control}>
        <TextEditor
          isDisabled={form.isSubmitting}
          onBlur={nameField.handleBlur}
          onChange={nameField.handleChange}
          placeholder={nameField.control.label}
          value={nameField.value}
        />
      </FormControl>
    </Drawer>
  );
}
