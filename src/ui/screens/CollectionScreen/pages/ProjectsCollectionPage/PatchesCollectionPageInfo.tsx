import { HStack, VStack } from '@chakra-ui/react';
import { ReactElement, useCallback, useEffect } from 'react';
import { useEditProjectSnapshotInCollection } from '../../../../../core-hooks/Collection';
import { useCollection } from '../../../../../core-hooks/Core';
import useForm from '../../../../../hooks/useForm';
import useFormField from '../../../../../hooks/useFormField';
import Button from '../../../../../ui-atoms/Button';
import FormControl from '../../../../../ui-atoms/FormControl';
import FormError from '../../../../../ui-atoms/FormError';
import TextEditor from '../../../../../ui-atoms/TextEditor';
import { $FileSystem } from '../../../../../utils/FileSystem';

interface ProjectsCollectionPageInfoProps {
  name: string;
}

export default function ProjectsCollectionPageInfo({
  name,
}: ProjectsCollectionPageInfoProps): ReactElement {
  const collection = useCollection();
  const editProject = useEditProjectSnapshotInCollection(collection);

  const nameField = useFormField({
    infoMessage: 'Name of the project template',
    initialValue: name,
    isRequired: true,
    label: 'Template name',
    onValidate: $FileSystem.validateIsValidName,
  });

  const form = useForm({
    fields: [nameField],
    onSubmit: () => editProject(name, nameField.value),
  });

  const handleReset = useCallback(() => {
    nameField.handleChange(name);
    return undefined;
  }, [name]);

  useEffect(() => {
    handleReset();
  }, [name]);

  return (
    <VStack spacing={2} flex={1} alignItems='flex-start'>
      <FormControl {...nameField.control} isSuccinct>
        <TextEditor
          isDisabled={form.isSubmitting}
          onBlur={nameField.handleBlur}
          onChange={nameField.handleChange}
          placeholder={nameField.control.label}
          value={nameField.value}
        />
      </FormControl>
      {form.error && <FormError errorReport={form.error} />}
      <HStack w='100%' justifyContent='flex-end'>
        <Button
          isDisabled={form.isSubmitting}
          label='Reset'
          onClick={handleReset}
          variant='outline'
        />
        <Button
          isDisabled={form.isSubmitting || !form.isValid}
          label='Save'
          onClick={form.handleSubmit}
        />
      </HStack>
    </VStack>
  );
}
