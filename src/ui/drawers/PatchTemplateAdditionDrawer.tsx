import { ReactElement } from 'react';
import Patch, { PatchInfo } from '../../core/Patch';
import useForm from '../../hooks/useForm';
import Button from '../../ui-atoms/Button';
import Drawer from '../../ui-atoms/Drawer';
import ErrorReport from '../../utils/ErrorReport';
import { PatchInfoFields, usePatchInfoFields } from '../forms/PatchInfoForm';

interface PatchTemplateAdditionDrawerProps {
  patch: Patch;
  onClose: () => void;
  onAdd: (info: PatchInfo) => Promise<ErrorReport | undefined>;
}

export default function PatchTemplateAdditionDrawer({
  patch,
  onClose,
  onAdd,
}: PatchTemplateAdditionDrawerProps): ReactElement {
  const infoFields = usePatchInfoFields(patch.getInfo());

  const form = useForm({
    fields: [infoFields.nameField, infoFields.mainFileRelativePathField],
    onSubmit: () =>
      onAdd({
        name: infoFields.nameField.value.trim(),
        version: infoFields.versionField.value.trim(),
        author: infoFields.authorField.value.trim(),
        mainFileRelativePath: infoFields.mainFileRelativePathField.value.trim(),
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
      <PatchInfoFields
        directoryPath={patch.getPath()}
        {...infoFields}
        width='100%'
      />
    </Drawer>
  );
}
