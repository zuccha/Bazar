import { HStack, VStack } from '@chakra-ui/react';
import { ReactElement, useCallback, useEffect } from 'react';
import { PatchInfo } from '../../../core/Patch';
import useForm from '../../../hooks/useForm';
import Button from '../../../ui-atoms/Button';
import FormError from '../../../ui-atoms/FormError';
import ErrorReport from '../../../utils/ErrorReport';
import PatchInfoFields, { usePatchInfoFields } from './PatchInfoFields';

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
  const infoFields = usePatchInfoFields(info);

  const handleReset = useCallback(() => {
    infoFields.nameField.handleChange(info.name);
    infoFields.versionField.handleChange(info.version);
    infoFields.authorField.handleChange(info.author);
    infoFields.mainFileRelativePathField.handleChange(
      info.mainFileRelativePath,
    );
    return undefined;
  }, [
    info,
    infoFields.nameField.handleChange,
    infoFields.versionField.handleChange,
    infoFields.authorField.handleChange,
    infoFields.mainFileRelativePathField.handleChange,
  ]);

  const form = useForm({
    fields: [infoFields.nameField, infoFields.mainFileRelativePathField],
    onSubmit: () => {
      return onSubmit({
        name: infoFields.nameField.value.trim(),
        author: infoFields.authorField.value.trim(),
        version: infoFields.versionField.value.trim(),
        mainFileRelativePath: infoFields.mainFileRelativePathField.value.trim(),
      });
    },
  });

  useEffect(() => {
    handleReset();
  }, [info]);

  const formControl = { isTurnedOff, isSuccinct };

  return (
    <VStack spacing={2} flex={1} alignItems='flex-start'>
      <PatchInfoFields
        directoryPath={directoryPath}
        isDisabled={form.isSubmitting}
        {...formControl}
        {...infoFields}
        width='100%'
      />
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
