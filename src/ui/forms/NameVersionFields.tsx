import { HStack, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { FormField } from '../../hooks/useFormField';
import FormControl from '../../ui-atoms/FormControl';
import FormError from '../../ui-atoms/FormError';
import TextEditor from '../../ui-atoms/TextEditor';

interface NameVersionFieldsProps {
  isDisabled?: boolean;
  isTurnedOff?: boolean;
  isSuccinct?: boolean;
  nameField: FormField<string>;
  versionField: FormField<string>;
}

export default function NameVersionFields({
  isDisabled,
  isTurnedOff = false,
  isSuccinct = false,
  nameField,
  versionField,
}: NameVersionFieldsProps): ReactElement {
  const controls = { isSuccinct, isTurnedOff };

  return (
    <VStack flexDir='column' w='100%' spacing={2}>
      <HStack w='100%' alignItems='flex-start'>
        <FormControl {...nameField.control} {...controls} hideError>
          <TextEditor
            isDisabled={isTurnedOff || isDisabled}
            onBlur={nameField.handleBlur}
            onChange={nameField.handleChange}
            placeholder={nameField.control.label}
            value={nameField.value}
          />
        </FormControl>
        <FormControl
          {...versionField.control}
          {...controls}
          hideError
          width={150}
        >
          <TextEditor
            isDisabled={isTurnedOff || isDisabled}
            onBlur={versionField.handleBlur}
            onChange={versionField.handleChange}
            placeholder={versionField.control.label}
            value={versionField.value}
          />
        </FormControl>
      </HStack>
      {nameField.control.errorReport && !isTurnedOff && (
        <FormError errorReport={nameField.control.errorReport} />
      )}
      {versionField.control.errorReport && !isTurnedOff && (
        <FormError errorReport={versionField.control.errorReport} />
      )}
    </VStack>
  );
}
