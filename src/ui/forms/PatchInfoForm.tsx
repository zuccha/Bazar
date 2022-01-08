import { HStack, VStack } from '@chakra-ui/react';
import { ReactElement, useCallback, useEffect } from 'react';
import { PatchInfo } from '../../core/Patch';
import useForm from '../../hooks/useForm';
import useFormField from '../../hooks/useFormField';
import Button from '../../ui-atoms/Button';
import FormError from '../../ui-atoms/FormError';
import FormControl from '../../ui-atoms/FormControl';
import SelectorOfFiles from '../../ui-atoms/SelectorOfFiles';
import TextEditor from '../../ui-atoms/TextEditor';
import ErrorReport from '../../utils/ErrorReport';
import { $FileSystem } from '../../utils/FileSystem';

interface PatchInfoFormProps {
  directoryPath: string;
  isTurnedOff?: boolean;
  isSuccinct?: boolean;
  onSubmit: (info: PatchInfo) => Promise<ErrorReport | undefined>;
  info: PatchInfo;
}

export default function PatchInfoForm({
  directoryPath,
  isTurnedOff,
  isSuccinct,
  info,
  onSubmit,
}: PatchInfoFormProps): ReactElement {
  const nameField = useFormField({
    infoMessage: 'Name of the patch',
    initialValue: info.name,
    isRequired: true,
    label: 'Patch name',
    onValidate: $FileSystem.validateIsValidName,
  });

  const versionField = useFormField({
    infoMessage: 'Version of the patch',
    initialValue: info.version,
    label: 'Version',
  });

  const authorField = useFormField({
    infoMessage: 'Author(s) of the patch',
    initialValue: info.author,
    label: 'Author(s)',
  });

  const mainFileRelativePathField = useFormField({
    infoMessage: 'Entry point of the patch',
    initialValue: info.mainFileRelativePath,
    isRequired: true,
    label: 'Main file',
  });

  const handleReset = useCallback(() => {
    nameField.handleChange(info.name);
    versionField.handleChange(info.version);
    authorField.handleChange(info.author);
    mainFileRelativePathField.handleChange(info.mainFileRelativePath);
    return undefined;
  }, [
    info,
    nameField.handleChange,
    versionField.handleChange,
    authorField.handleChange,
    mainFileRelativePathField.handleChange,
  ]);

  const form = useForm({
    fields: [nameField, mainFileRelativePathField],
    onSubmit: () => {
      return onSubmit({
        name: nameField.value.trim(),
        author: authorField.value.trim(),
        version: versionField.value.trim(),
        mainFileRelativePath: mainFileRelativePathField.value.trim(),
      });
    },
  });

  useEffect(() => {
    handleReset();
  }, [info]);

  const formControl = { isTurnedOff, isSuccinct };

  return (
    <VStack spacing={2} flex={1} alignItems='flex-start'>
      <HStack w='100%' alignItems='flex-start'>
        <FormControl {...nameField.control} {...formControl}>
          <TextEditor
            isDisabled={isTurnedOff || form.isSubmitting}
            onChange={nameField.handleChange}
            placeholder='Name'
            value={nameField.value}
          />
        </FormControl>
        <FormControl {...versionField.control} {...formControl} width={150}>
          <TextEditor
            isDisabled={isTurnedOff || form.isSubmitting}
            onChange={versionField.handleChange}
            placeholder='Version'
            value={versionField.value}
          />
        </FormControl>
      </HStack>
      <FormControl {...authorField.control} {...formControl}>
        <TextEditor
          isDisabled={isTurnedOff || form.isSubmitting}
          onChange={authorField.handleChange}
          placeholder='Author(s)'
          value={authorField.value}
        />
      </FormControl>
      <FormControl {...mainFileRelativePathField.control} {...formControl}>
        <SelectorOfFiles
          directoryPath={directoryPath}
          extensions={['.asm']}
          isDisabled={isTurnedOff || form.isSubmitting}
          onChange={mainFileRelativePathField.handleChange}
          placeholder='Main file'
          value={mainFileRelativePathField.value}
        />
      </FormControl>
      {form.error && <FormError errorReport={form.error} />}
      <HStack w='100%' justifyContent='flex-end'>
        <Button
          isDisabled={isTurnedOff || form.isSubmitting}
          label='Reset'
          onClick={handleReset}
          variant='outline'
        />
        <Button
          isDisabled={isTurnedOff || form.isSubmitting || !form.isValid}
          label='Save'
          onClick={form.handleSubmit}
        />
      </HStack>
    </VStack>
  );
}
