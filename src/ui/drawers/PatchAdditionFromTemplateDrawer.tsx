import { Flex, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { useCollectionPatchNames } from '../../core-hooks/Collection';
import { useCollection } from '../../core-hooks/Core';
import { useList } from '../../hooks/useAccessors';
import useForm from '../../hooks/useForm';
import useFormField from '../../hooks/useFormField';
import Alert from '../../ui-atoms/Alert';
import Button from '../../ui-atoms/Button';
import Drawer from '../../ui-atoms/Drawer';
import FormControl from '../../ui-atoms/FormControl';
import FormError from '../../ui-atoms/FormError';
import Selector from '../../ui-atoms/Selector';
import { ErrorReport } from '../../utils/ErrorReport';

interface PatchAdditionDrawerProps {
  onClose: () => void;
  onAdd: (name: string) => Promise<ErrorReport | undefined>;
}

export default function PatchAdditionFromTemplateDrawer({
  onClose,
  onAdd,
}: PatchAdditionDrawerProps): ReactElement {
  const collection = useCollection();
  const patchNames = useCollectionPatchNames(collection);

  const templateNameField = useFormField({
    infoMessage: 'Name of the patch template',
    initialValue: patchNames[0] || '',
    isRequired: true,
    label: 'Patch template',
  });

  const form = useForm({
    fields: [templateNameField],
    onSubmit: () => onAdd(templateNameField.value),
  });

  const templateNameOptions = useList(patchNames).map((patchName) => ({
    label: patchName,
    value: patchName,
  }));

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
            label='Create'
            onClick={async () => {
              const maybeError = await form.handleSubmit();
              if (!maybeError) onClose();
            }}
          />
        </>
      }
      onClose={onClose}
      title='Add patch from template'
    >
      <Flex direction='column' h='100%'>
        <VStack w='100%' spacing={4} flex={1}>
          <FormControl {...templateNameField.control}>
            <Selector
              isDisabled={form.isSubmitting}
              onChange={templateNameField.handleChange}
              options={templateNameOptions}
              placeholder={templateNameField.control.label}
              value={templateNameField.value}
            />
          </FormControl>

          <Flex flex={1} />

          <Alert status='info'>
            Changes that will be made to the patch in the project will not be
            applied to the template.
          </Alert>
        </VStack>

        {form.error && <FormError errorReport={form.error} />}
      </Flex>
    </Drawer>
  );
}
