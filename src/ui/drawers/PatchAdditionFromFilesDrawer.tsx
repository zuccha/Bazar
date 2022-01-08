import { Flex, HStack, VStack } from '@chakra-ui/react';
import { ReactElement, useState } from 'react';
import useForm from '../../hooks/useForm';
import useFormField from '../../hooks/useFormField';
import Button from '../../ui-atoms/Button';
import Drawer from '../../ui-atoms/Drawer';
import FormControl from '../../ui-atoms/FormControl';
import NavigatorWithTabs from '../../ui-atoms/NavigatorWithTabs';
import SelectorOfFiles from '../../ui-atoms/SelectorOfFiles';
import TextEditor from '../../ui-atoms/TextEditor';
import TextEditorOfPath from '../../ui-atoms/TextEditorOfPath';
import ErrorReport from '../../utils/ErrorReport';
import { $FileSystem } from '../../utils/FileSystem';

type Source = 'file' | 'directory';

interface PatchAdditionFromFilesDrawerProps {
  onClose: () => void;
  onAddFromDirectory: (args: {
    name: string;
    author: string;
    version: string;
    sourceDirPath: string;
    mainFileRelativePath: string;
  }) => Promise<ErrorReport | undefined>;
  onAddFromFile: (args: {
    name: string;
    author: string;
    version: string;
    filePath: string;
  }) => Promise<ErrorReport | undefined>;
}

export default function PatchAdditionFromFilesDrawer({
  onClose,
  onAddFromDirectory,
  onAddFromFile,
}: PatchAdditionFromFilesDrawerProps): ReactElement {
  const [source, setSource] = useState<Source>('file');

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

  const sourceDirPathField = useFormField({
    infoMessage: 'Directory containing the patch file(s)',
    initialValue: '',
    isRequired: true,
    label: 'Location',
    onValidate: $FileSystem.validateExistsDir,
  });

  const mainFileRelativePathField = useFormField({
    infoMessage: 'Entry point of the patch',
    initialValue: '',
    isRequired: true,
    label: 'Main file',
  });

  const singleFilePathField = useFormField({
    infoMessage: 'Patch file',
    initialValue: '',
    isRequired: true,
    label: 'File',
    onValidate: (value: string) =>
      $FileSystem.validateExistsFile(value) ||
      $FileSystem.validateHasExtension(value, '.asm'),
  });

  const form = useForm(
    {
      file: {
        fields: [nameField, singleFilePathField],
        onSubmit: () =>
          onAddFromFile({
            name: nameField.value.trim(),
            author: authorField.value.trim(),
            version: versionField.value.trim(),
            filePath: singleFilePathField.value.trim(),
          }),
      },
      directory: {
        fields: [nameField, mainFileRelativePathField, sourceDirPathField],
        onSubmit: () =>
          onAddFromDirectory({
            name: nameField.value.trim(),
            author: authorField.value.trim(),
            version: versionField.value.trim(),
            sourceDirPath: sourceDirPathField.value.trim(),
            mainFileRelativePath: mainFileRelativePathField.value.trim(),
          }),
      },
    }[source],
  );

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
      info='The patch will be added to the project, copying the original files.'
      error={form.error}
      onClose={onClose}
      title='Add patch'
    >
      <Flex direction='column' flex={1}>
        <VStack w='100%' spacing={4} flex={1}>
          <HStack w='100%' alignItems='flex-start'>
            <FormControl {...nameField.control}>
              <TextEditor
                isDisabled={form.isSubmitting}
                onBlur={nameField.handleBlur}
                onChange={nameField.handleChange}
                placeholder={nameField.control.label}
                value={nameField.value}
              />
            </FormControl>
            <FormControl {...versionField.control} width={150}>
              <TextEditor
                isDisabled={form.isSubmitting}
                onBlur={versionField.handleBlur}
                onChange={versionField.handleChange}
                placeholder={versionField.control.label}
                value={versionField.value}
              />
            </FormControl>
          </HStack>

          <FormControl {...authorField.control}>
            <TextEditor
              isDisabled={form.isSubmitting}
              onBlur={authorField.handleBlur}
              onChange={authorField.handleChange}
              placeholder={authorField.control.label}
              value={authorField.value}
            />
          </FormControl>

          <NavigatorWithTabs
            width='100%'
            flex={1}
            contentStyle={{ mt: 4 }}
            isBorderLess
            isFitted
            selectedPage={source}
            onSelectPage={setSource}
            pages={[
              {
                id: 'file',
                label: 'File',
                content: (
                  <FormControl {...singleFilePathField.control}>
                    <TextEditorOfPath
                      filters={[{ name: 'File', extensions: ['asm'] }]}
                      isDisabled={form.isSubmitting}
                      mode='file'
                      onBlur={singleFilePathField.handleBlur}
                      onChange={singleFilePathField.handleChange}
                      placeholder={singleFilePathField.control.label}
                      value={singleFilePathField.value}
                    />
                  </FormControl>
                ),
                isDisabled: form.isSubmitting,
              },
              {
                id: 'directory',
                label: 'Directory',
                content: (
                  <VStack width='100%' spacing={4} flex={1}>
                    <FormControl {...sourceDirPathField.control}>
                      <TextEditorOfPath
                        isDisabled={form.isSubmitting}
                        mode='directory'
                        onBlur={sourceDirPathField.handleBlur}
                        onChange={sourceDirPathField.handleChange}
                        placeholder={sourceDirPathField.control.label}
                        value={sourceDirPathField.value}
                      />
                    </FormControl>

                    <FormControl {...mainFileRelativePathField.control}>
                      <SelectorOfFiles
                        directoryPath={sourceDirPathField.value}
                        extensions={['.asm']}
                        isDisabled={form.isSubmitting}
                        onChange={mainFileRelativePathField.handleChange}
                        placeholder='Main file'
                        value={mainFileRelativePathField.value}
                      />
                    </FormControl>
                  </VStack>
                ),
                isDisabled: form.isSubmitting,
              },
            ]}
          />
        </VStack>
      </Flex>
    </Drawer>
  );
}
