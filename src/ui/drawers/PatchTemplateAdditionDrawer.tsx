import { ReactElement } from 'react';
import Patch from '../../core/Patch';
import useForm from '../../hooks/useForm';
import useFormField from '../../hooks/useFormField';
import Button from '../../ui-atoms/Button';
import Drawer from '../../ui-atoms/Drawer';
import FormControl from '../../ui-atoms/FormControl';
import TextEditor from '../../ui-atoms/TextEditor';
import ErrorReport from '../../utils/ErrorReport';
import { $FileSystem } from '../../utils/FileSystem';

interface PatchTemplateAdditionDrawerProps {
  patch: Patch;
  onClose: () => void;
  onAdd: (name: string) => Promise<ErrorReport | undefined>;
}

export default function PatchTemplateAdditionDrawer({
  patch,
  onClose,
  onAdd,
}: PatchTemplateAdditionDrawerProps): ReactElement {
  const nameField = useFormField({
    infoMessage: 'Name of the patch template',
    initialValue: patch.getInfo().name,
    isRequired: true,
    label: 'Patch name',
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
              const error = await form.handleSubmit();
              if (!error) onClose();
            }}
          />
        </>
      }
      error={form.error}
      info='Future changes to the patch will not propagate to the template.'
      onClose={onClose}
      title='Save patch as template'
    >
      <FormControl {...nameField.control}>
        <TextEditor
          isDisabled
          onBlur={nameField.handleBlur}
          onChange={nameField.handleChange}
          placeholder={nameField.control.label}
          value={nameField.value}
        />
      </FormControl>
    </Drawer>
  );
}
