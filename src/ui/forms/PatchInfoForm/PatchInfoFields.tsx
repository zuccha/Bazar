import { VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { PatchInfo } from '../../../core/Patch';
import useFormField, { FormField } from '../../../hooks/useFormField';
import FormControl from '../../../ui-atoms/FormControl';
import SelectorOfFiles from '../../../ui-atoms/SelectorOfFiles';
import TextEditor from '../../../ui-atoms/TextEditor';
import { $FileSystem } from '../../../utils/FileSystem';
import NameVersionFields from '../NameVersionFields';

export const usePatchInfoFields = (info: PatchInfo) => {
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
    isRequired: true,
    label: 'Version',
    onValidate: $FileSystem.validateIsValidVersion,
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

  return {
    nameField,
    versionField,
    authorField,
    mainFileRelativePathField,
  };
};

interface PatchInfoFieldsProps {
  directoryPath: string;

  isDisabled?: boolean;
  isSuccinct?: boolean;
  isTurnedOff?: boolean;

  nameField: FormField<string>;
  versionField: FormField<string>;
  authorField: FormField<string>;
  mainFileRelativePathField: FormField<string>;

  width?: string | number;
}

export default function PatchInfoFields({
  directoryPath,
  isDisabled,
  isSuccinct,
  isTurnedOff,
  nameField,
  versionField,
  authorField,
  mainFileRelativePathField,
  width,
}: PatchInfoFieldsProps): ReactElement {
  const formControl = { isTurnedOff, isSuccinct };

  return (
    <VStack spacing={2} w={width}>
      <NameVersionFields
        isDisabled={isDisabled}
        {...formControl}
        nameField={nameField}
        versionField={versionField}
      />
      <FormControl {...authorField.control} {...formControl}>
        <TextEditor
          isDisabled={isTurnedOff || isDisabled}
          onChange={authorField.handleChange}
          placeholder='Author(s)'
          value={authorField.value}
        />
      </FormControl>
      <FormControl {...mainFileRelativePathField.control} {...formControl}>
        <SelectorOfFiles
          directoryPath={directoryPath}
          extensions={['.asm']}
          isDisabled={isTurnedOff || isDisabled}
          onChange={mainFileRelativePathField.handleChange}
          placeholder='Main file'
          value={mainFileRelativePathField.value}
        />
      </FormControl>
    </VStack>
  );
}
