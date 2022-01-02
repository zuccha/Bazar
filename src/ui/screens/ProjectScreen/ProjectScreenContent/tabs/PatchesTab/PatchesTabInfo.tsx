import { HStack, VStack } from '@chakra-ui/react';
import { ReactElement, useCallback } from 'react';
import { useUpdatePatchInfo } from '../../../../../../core-hooks/Patch';
import Patch from '../../../../../../core/Patch';
import useAsyncCallback from '../../../../../../hooks/useAsyncCallback';
import useEffectAsync from '../../../../../../hooks/useEffectAsync';
import BrowserInput from '../../../../../../ui-atoms/input/BrowserInput';
import Button from '../../../../../../ui-atoms/input/Button';
import {
  useForm,
  useFormField,
} from '../../../../../../ui-atoms/input/FormControl';
import FormError from '../../../../../../ui-atoms/input/FormError';
import TextInput from '../../../../../../ui-atoms/input/TextInput';
import { $FileSystem } from '../../../../../../utils/FileSystem';

interface PatchesTabInfoProps {
  patch?: Patch;
}

const PatchesTabInfoWithPatch = ({
  patch,
}: Required<PatchesTabInfoProps>): ReactElement => {
  const nameField = useFormField({
    infoMessage: 'Name of the patch',
    initialValue: '',
    isRequired: true,
    label: 'Patch name',
    onValidate: $FileSystem.validateIsValidName,
  });

  const versionField = useFormField({
    infoMessage: 'Version of the patch',
    initialValue: '',
    label: 'Version',
  });

  const authorField = useFormField({
    infoMessage: 'Author(s) of the patch',
    initialValue: '',
    label: 'Author(s)',
  });

  const mainFilePathField = useFormField({
    infoMessage: 'Entry point of the patch',
    initialValue: '',
    isRequired: true,
    label: 'Main file',
    onValidate: async (value: string) =>
      (await $FileSystem.validateExistsFile(value)) ||
      (await $FileSystem.validateHasExtension(value, '.asm')),
  });

  const handleReset = useAsyncCallback(async () => {
    if (patch) {
      nameField.handleChange(patch.getInfo().name);
      versionField.handleChange(patch.getInfo().version);
      authorField.handleChange(patch.getInfo().author);
      mainFilePathField.handleChange(await patch.getMainFilePath());
    }
    return undefined;
  }, [patch, nameField, versionField, authorField, mainFilePathField]);

  const handleClear = useAsyncCallback(async () => {
    nameField.handleChange('');
    versionField.handleChange('');
    authorField.handleChange('');
    mainFilePathField.handleChange('');
    return undefined;
  }, [nameField, versionField, authorField, mainFilePathField]);

  const updatePatchInfo = useUpdatePatchInfo(patch);

  const form = useForm({
    fields: [nameField, mainFilePathField],
    onSubmit: () =>
      updatePatchInfo({
        name: nameField.value.trim(),
        author: authorField.value.trim(),
        version: versionField.value.trim(),
        mainFilePath: mainFilePathField.value.trim(),
      }),
  });

  useEffectAsync(async () => {
    patch ? handleReset.call() : handleClear.call();
  }, [patch]);

  const error =
    nameField.control.errorReport ||
    mainFilePathField.control.errorReport ||
    form.error;

  const isDisabled =
    !patch ||
    handleClear.isLoading ||
    handleReset.isLoading ||
    form.isSubmitting;

  return (
    <VStack spacing={2} flex={1} alignItems='flex-start'>
      <HStack w='100%'>
        <TextInput
          isDisabled={isDisabled}
          onChange={nameField.handleChange}
          placeholder='Name'
          value={nameField.value}
        />
        <TextInput
          isDisabled={isDisabled}
          onChange={versionField.handleChange}
          placeholder='Version'
          value={versionField.value}
          width={150}
        />
      </HStack>
      <TextInput
        isDisabled={isDisabled}
        onChange={authorField.handleChange}
        placeholder='Author(s)'
        value={authorField.value}
      />
      <BrowserInput
        filters={[{ name: 'File', extensions: ['asm'] }]}
        isDisabled={isDisabled}
        isManualEditDisabled
        mode='file'
        onChange={mainFilePathField.handleChange}
        placeholder='Main file'
        value={mainFilePathField.value}
      />
      {error && <FormError errorReport={error} />}
      <HStack w='100%' justifyContent='flex-end'>
        <Button
          isDisabled={isDisabled}
          label='Reset'
          onClick={handleReset.call}
          variant='outline'
        />
        <Button
          isDisabled={isDisabled || !form.isValid}
          label='Save'
          onClick={form.handleSubmit}
        />
      </HStack>
    </VStack>
  );
};

const PatchesTabInfoWithoutPatch = (): ReactElement => {
  return (
    <VStack spacing={2} flex={1}>
      <HStack w='100%'>
        <TextInput isDisabled onChange={() => {}} placeholder='Name' value='' />
        <TextInput
          isDisabled
          onChange={() => {}}
          placeholder='Version'
          value=''
          width={150}
        />
      </HStack>
      <TextInput
        isDisabled
        onChange={() => {}}
        placeholder='Author(s)'
        value=''
      />
      <BrowserInput
        filters={[{ name: 'File', extensions: ['asm'] }]}
        isDisabled
        isManualEditDisabled
        mode='file'
        onChange={() => {}}
        placeholder='Main file'
        value=''
      />
      <HStack w='100%' justifyContent='flex-end'>
        <Button isDisabled label='Reset' onClick={() => {}} variant='outline' />
        <Button isDisabled label='Save' onClick={() => {}} />
      </HStack>
    </VStack>
  );
};

export default function PatchesTabInfo({
  patch,
}: PatchesTabInfoProps): ReactElement {
  return patch ? (
    <PatchesTabInfoWithPatch patch={patch} />
  ) : (
    <PatchesTabInfoWithoutPatch />
  );
}
