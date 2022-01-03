import {
  Flex,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
} from '@chakra-ui/react';
import { ReactElement, useState } from 'react';
import {
  useAddPatchToProjectSnapshotFromDirectory,
  useAddPatchToProjectSnapshotFromFile,
} from '../../core-hooks/ProjectSnapshot';
import ProjectSnapshot from '../../core/ProjectSnapshot';
import useColorScheme from '../../theme/useColorScheme';
import Alert from '../../ui-atoms/display/Alert';
import BrowserInput from '../../ui-atoms/input/BrowserInput';
import Button from '../../ui-atoms/input/Button';
import FormControl, {
  useForm,
  useFormField,
} from '../../ui-atoms/input/FormControl';
import FormError from '../../ui-atoms/input/FormError';
import SelectFiles from '../../ui-atoms/input/SelectFiles';
import TextInput from '../../ui-atoms/input/TextInput';
import Drawer from '../../ui-atoms/overlay/Drawer';
import { $FileSystem } from '../../utils/FileSystem';

interface PatchAdditionDrawerProps {
  onClose: () => void;
  projectSnapshot: ProjectSnapshot;
}

export default function PatchAdditionDrawer({
  onClose,
  projectSnapshot,
}: PatchAdditionDrawerProps): ReactElement {
  const colorScheme = useColorScheme();
  const [isSingleFile, setIsSingleFile] = useState(true);

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

  const addPatchFromFile =
    useAddPatchToProjectSnapshotFromFile(projectSnapshot);

  const addPatchFromDirectory =
    useAddPatchToProjectSnapshotFromDirectory(projectSnapshot);

  const form = useForm(
    isSingleFile
      ? {
          fields: [nameField, singleFilePathField],
          onSubmit: () =>
            addPatchFromFile({
              name: nameField.value.trim(),
              author: authorField.value.trim(),
              version: versionField.value.trim(),
              filePath: singleFilePathField.value.trim(),
            }),
        }
      : {
          fields: [nameField, mainFileRelativePathField, sourceDirPathField],
          onSubmit: () =>
            addPatchFromDirectory({
              name: nameField.value.trim(),
              author: authorField.value.trim(),
              version: versionField.value.trim(),
              sourceDirPath: sourceDirPathField.value.trim(),
              mainFileRelativePath: mainFileRelativePathField.value.trim(),
            }),
        },
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
      onClose={onClose}
      title='Add patch'
    >
      <Flex direction='column' h='100%'>
        <VStack w='100%' spacing={4} flex={1}>
          <HStack w='100%'>
            <FormControl {...nameField.control}>
              <TextInput
                isDisabled={form.isSubmitting}
                onBlur={nameField.handleBlur}
                onChange={nameField.handleChange}
                placeholder={nameField.control.label}
                value={nameField.value}
              />
            </FormControl>
            <FormControl {...versionField.control} width={150}>
              <TextInput
                isDisabled={form.isSubmitting}
                onBlur={versionField.handleBlur}
                onChange={versionField.handleChange}
                placeholder={versionField.control.label}
                value={versionField.value}
              />
            </FormControl>
          </HStack>

          <FormControl {...authorField.control}>
            <TextInput
              isDisabled={form.isSubmitting}
              onBlur={authorField.handleBlur}
              onChange={authorField.handleChange}
              placeholder={authorField.control.label}
              value={authorField.value}
            />
          </FormControl>

          <Tabs
            isFitted
            w='100%'
            index={isSingleFile ? 0 : 1}
            onChange={(index) => setIsSingleFile(index === 0)}
            colorScheme={colorScheme}
          >
            <TabList>
              <Tab>File</Tab>
              <Tab>Directory</Tab>
            </TabList>
            <TabPanels>
              <TabPanel paddingBottom={0} paddingX={0}>
                <FormControl {...singleFilePathField.control}>
                  <BrowserInput
                    filters={[{ name: 'File', extensions: ['asm'] }]}
                    isDisabled={form.isSubmitting}
                    mode='file'
                    onBlur={singleFilePathField.handleBlur}
                    onChange={singleFilePathField.handleChange}
                    placeholder={singleFilePathField.control.label}
                    value={singleFilePathField.value}
                  />
                </FormControl>
              </TabPanel>
              <TabPanel paddingBottom={0} paddingX={0}>
                <VStack width='100%' spacing={4} flex={1}>
                  <FormControl {...sourceDirPathField.control}>
                    <BrowserInput
                      isDisabled={form.isSubmitting}
                      mode='directory'
                      onBlur={sourceDirPathField.handleBlur}
                      onChange={sourceDirPathField.handleChange}
                      placeholder={sourceDirPathField.control.label}
                      value={sourceDirPathField.value}
                    />
                  </FormControl>

                  <FormControl {...mainFileRelativePathField.control}>
                    <SelectFiles
                      directoryPath={sourceDirPathField.value}
                      extension={['.asm']}
                      isDisabled={form.isSubmitting}
                      onChange={mainFileRelativePathField.handleChange}
                      placeholder='Main file'
                      value={mainFileRelativePathField.value}
                    />
                  </FormControl>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>

          <Alert status='info'>
            The patch will be added to the project, copying the original files.
          </Alert>
        </VStack>

        {form.error && <FormError errorReport={form.error} />}
      </Flex>
    </Drawer>
  );
}
