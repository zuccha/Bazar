import { HStack, VStack } from '@chakra-ui/react';
import { ReactElement, useCallback } from 'react';
import {
  usePatchDirectoryPath,
  useUpdatePatchInfo,
} from '../../../../../../core-hooks/Patch';
import Patch from '../../../../../../core/Patch';
import useEffectAsync from '../../../../../../hooks/useEffectAsync';
import useForm from '../../../../../../hooks/useForm';
import useFormField from '../../../../../../hooks/useFormField';
import Button from '../../../../../../ui-atoms/Button';
import FormError from '../../../../../../ui-atoms/FormError';
import SelectorOfFiles from '../../../../../../ui-atoms/SelectorOfFiles';
import TextEditor from '../../../../../../ui-atoms/TextEditor';
import { $FileSystem } from '../../../../../../utils/FileSystem';

interface PatchesTabInfoProps {
  patch?: Patch;
}

const PatchesTabInfoWithPatch = ({
  patch,
}: Required<PatchesTabInfoProps>): ReactElement => {
  const directoryPath = usePatchDirectoryPath(patch);
  const updatePatchInfo = useUpdatePatchInfo(patch);

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

  const mainFileRelativePathField = useFormField({
    infoMessage: 'Entry point of the patch',
    initialValue: '',
    isRequired: true,
    label: 'Main file',
  });

  const handleReset = useCallback(() => {
    if (patch) {
      nameField.handleChange(patch.getInfo().name);
      versionField.handleChange(patch.getInfo().version);
      authorField.handleChange(patch.getInfo().author);
      mainFileRelativePathField.handleChange(
        patch.getInfo().mainFileRelativePath,
      );
    }
    return undefined;
  }, [patch, nameField, versionField, authorField, mainFileRelativePathField]);

  const handleClear = useCallback(() => {
    nameField.handleChange('');
    versionField.handleChange('');
    authorField.handleChange('');
    mainFileRelativePathField.handleChange('');
    return undefined;
  }, [nameField, versionField, authorField, mainFileRelativePathField]);

  const form = useForm({
    fields: [nameField, mainFileRelativePathField],
    onSubmit: () =>
      updatePatchInfo({
        name: nameField.value.trim(),
        author: authorField.value.trim(),
        version: versionField.value.trim(),
        mainFileRelativePath: mainFileRelativePathField.value.trim(),
      }),
  });

  useEffectAsync(async () => {
    patch ? handleReset() : handleClear();
  }, [patch]);

  const error =
    nameField.control.errorReport ||
    mainFileRelativePathField.control.errorReport ||
    form.error;

  const isDisabled = !patch || form.isSubmitting;

  return (
    <VStack spacing={2} flex={1} alignItems='flex-start'>
      <HStack w='100%'>
        <TextEditor
          isDisabled={isDisabled}
          onChange={nameField.handleChange}
          placeholder='Name'
          value={nameField.value}
        />
        <TextEditor
          isDisabled={isDisabled}
          onChange={versionField.handleChange}
          placeholder='Version'
          value={versionField.value}
          width={150}
        />
      </HStack>
      <TextEditor
        isDisabled={isDisabled}
        onChange={authorField.handleChange}
        placeholder='Author(s)'
        value={authorField.value}
      />
      <SelectorOfFiles
        directoryPath={directoryPath}
        extension={['.asm']}
        isDisabled={isDisabled}
        onChange={mainFileRelativePathField.handleChange}
        placeholder='Main file'
        value={mainFileRelativePathField.value}
      />
      {error && <FormError errorReport={error} />}
      <HStack w='100%' justifyContent='flex-end'>
        <Button
          isDisabled={isDisabled}
          label='Reset'
          onClick={handleReset}
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
        <TextEditor
          isDisabled
          onChange={() => {}}
          placeholder='Name'
          value=''
        />
        <TextEditor
          isDisabled
          onChange={() => {}}
          placeholder='Version'
          value=''
          width={150}
        />
      </HStack>
      <TextEditor
        isDisabled
        onChange={() => {}}
        placeholder='Author(s)'
        value=''
      />
      <SelectorOfFiles
        directoryPath=''
        isDisabled
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
