import { VStack } from '@chakra-ui/react';
import { ReactElement, useEffect, useLayoutEffect, useState } from 'react';
import {
  useCollectionPatch,
  useCollectionPatchNames,
} from '../../core-hooks/Collection';
import { useCollection } from '../../core-hooks/Core';
import Patch, { PatchInfo } from '../../core/Patch';
import { useList } from '../../hooks/useAccessors';
import useForm from '../../hooks/useForm';
import useFormField from '../../hooks/useFormField';
import useToast from '../../hooks/useToast';
import Button from '../../ui-atoms/Button';
import Drawer from '../../ui-atoms/Drawer';
import FormControl from '../../ui-atoms/FormControl';
import Selector from '../../ui-atoms/Selector';
import ErrorReport from '../../utils/ErrorReport';
import { PatchInfoFields, usePatchInfoFields } from '../forms/PatchInfoForm';

interface PatchAdditionDrawerProps {
  onClose: () => void;
  onAdd: (name: string, info: PatchInfo) => Promise<ErrorReport | undefined>;
}

export default function PatchAdditionFromTemplateDrawer({
  onClose,
  onAdd,
}: PatchAdditionDrawerProps): ReactElement {
  const toast = useToast();

  const collection = useCollection();
  const patchNames = useCollectionPatchNames(collection);

  const [patchName, setPatchName] = useState(patchNames[0] ?? '');
  const patch = useCollectionPatch(collection, patchName);

  const templateNameField = useFormField({
    infoMessage: 'Name of the patch template',
    initialValue: patchNames[0] || '',
    isRequired: true,
    label: 'Patch template',
    onChange: setPatchName,
  });

  const infoFields = usePatchInfoFields(
    patch.value?.getInfo() ?? Patch.InfoEmpty,
  );

  const form = useForm({
    fields: [
      templateNameField,
      infoFields.versionField,
      infoFields.mainFileRelativePathField,
    ],
    onSubmit: () =>
      onAdd(templateNameField.value, {
        name: infoFields.nameField.value.trim(),
        version: infoFields.versionField.value.trim(),
        author: infoFields.authorField.value.trim(),
        mainFileRelativePath: infoFields.mainFileRelativePathField.value.trim(),
      }),
  });

  const templateNameOptions = useList(patchNames).map((patchName) => ({
    label: patchName,
    value: patchName,
  }));

  useLayoutEffect(() => {
    infoFields.nameField.handleChange(patch.value?.getInfo().name ?? '');
    infoFields.versionField.handleChange(patch.value?.getInfo().version ?? '');
    infoFields.authorField.handleChange(patch.value?.getInfo().author ?? '');
    infoFields.mainFileRelativePathField.handleChange(
      patch.value?.getInfo().mainFileRelativePath ?? '',
    );
  }, [patch.value]);

  useLayoutEffect(() => {
    if (patch.error) {
      toast.failure(
        'Failed to find valid info for the selected template',
        patch.error,
      );
    }
  }, [patch.error]);

  return (
    <Drawer
      buttons={
        <>
          <Button
            isDisabled={form.isSubmitting || patch.isLoading}
            label='Cancel'
            onClick={onClose}
            variant='outline'
            mr={3}
          />
          <Button
            isDisabled={!form.isValid || form.isSubmitting || patch.isLoading}
            label='Create'
            onClick={async () => {
              const maybeError = await form.handleSubmit();
              if (!maybeError) onClose();
            }}
          />
        </>
      }
      error={form.error}
      info='Changes that will be made to the patch in the project will not be applied to the template.'
      onClose={onClose}
      title='Add patch from template'
    >
      <VStack flex={1} w='100%' spacing={2} alignItems='stretch'>
        <FormControl {...templateNameField.control}>
          <Selector
            isDisabled={form.isSubmitting}
            onChange={templateNameField.handleChange}
            options={templateNameOptions}
            placeholder={templateNameField.control.label}
            value={templateNameField.value}
          />
        </FormControl>
        <PatchInfoFields
          directoryPath={patch.value?.getPath() ?? ''}
          isTurnedOff={patch.isLoading}
          {...infoFields}
        />
      </VStack>
    </Drawer>
  );
}
