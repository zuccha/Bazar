import { HStack, VStack } from '@chakra-ui/react';
import { ReactElement, useCallback, useEffect } from 'react';
import {
  usePatchDirectoryPath,
  usePatchInfo,
  useRenameSetPatchInfo,
} from '../../../../../../core-hooks/Patch';
import Patch from '../../../../../../core/Patch';
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
  const patchInfo = usePatchInfo(patch);
  const updatePatchInfo = useRenameSetPatchInfo(patch);

  const nameField = useFormField({
    infoMessage: 'Name of the patch',
    initialValue: patchInfo.name,
    isRequired: true,
    label: 'Patch name',
    onValidate: $FileSystem.validateIsValidName,
  });

  const versionField = useFormField({
    infoMessage: 'Version of the patch',
    initialValue: patchInfo.version,
    label: 'Version',
  });

  const authorField = useFormField({
    infoMessage: 'Author(s) of the patch',
    initialValue: patchInfo.author,
    label: 'Author(s)',
  });

  const mainFileRelativePathField = useFormField({
    infoMessage: 'Entry point of the patch',
    initialValue: patchInfo.mainFileRelativePath,
    isRequired: true,
    label: 'Main file',
  });

  const handleReset = useCallback(() => {
    nameField.handleChange(patchInfo.name);
    versionField.handleChange(patchInfo.version);
    authorField.handleChange(patchInfo.author);
    mainFileRelativePathField.handleChange(patchInfo.mainFileRelativePath);
    return undefined;
  }, [
    patchInfo,
    nameField.handleChange,
    versionField.handleChange,
    authorField.handleChange,
    mainFileRelativePathField.handleChange,
  ]);

  const form = useForm({
    fields: [nameField, mainFileRelativePathField],
    onSubmit: async () => {
      const error = await updatePatchInfo({
        name: nameField.value.trim(),
        author: authorField.value.trim(),
        version: versionField.value.trim(),
        mainFileRelativePath: mainFileRelativePathField.value.trim(),
      });
      if (error) return error;
    },
  });

  useEffect(() => {
    handleReset();
  }, [patchInfo]);

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
        extensions={['.asm']}
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
