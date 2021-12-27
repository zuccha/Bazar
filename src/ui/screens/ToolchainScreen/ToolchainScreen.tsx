import {
  Flex,
  StackDivider,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react';
import { ReactElement } from 'react';
import { useToolchain } from '../../../core-hooks/Core';
import {
  useDownloadEmbeddedTool,
  useEditCustomTool,
  useGetCustomTool,
} from '../../../core-hooks/Toolchain';
import useAsyncCallback from '../../../hooks/useAsyncCallback';
import useHandleError from '../../../hooks/useHandleError';
import useColorScheme from '../../../theme/useColorScheme';
import ToolCustom from './ToolCustom';
import ToolEmbedded from './ToolEmbedded';
import useHandleDownloadEmbeddedTool from './useDownloadToolEmbedded';

export default function ToolchainScreen(): ReactElement {
  const colorScheme = useColorScheme();

  const toolchain = useToolchain();

  const editor = useGetCustomTool(toolchain, 'editor');
  const emulator = useGetCustomTool(toolchain, 'emulator');

  const editEditor = useEditCustomTool(toolchain, 'editor');
  const editEmulator = useEditCustomTool(toolchain, 'emulator');

  const handleError = useHandleError();

  const handleEditEditor = useAsyncCallback(
    async (exePath: string) => {
      const maybeError = await editEditor(exePath);
      handleError(maybeError, 'Failed to edit editor');
      return maybeError;
    },
    [editEditor],
  );

  const handleEditEmulator = useAsyncCallback(
    async (exePath: string) => {
      const maybeError = await editEmulator(exePath);
      handleError(maybeError, 'Failed to edit emulator');
      return maybeError;
    },
    [editEmulator],
  );

  const [handleDownloadLunarMagic, lunarMagicStatus] =
    useHandleDownloadEmbeddedTool({
      name: 'Lunar Magic',
      key: 'lunarMagic',
    });

  const [handleDownloadAsar, asarStatus] = useHandleDownloadEmbeddedTool({
    name: 'Asar',
    key: 'asar',
  });

  const [handleDownloadFlips, flipsStatus] = useHandleDownloadEmbeddedTool({
    name: 'Flips',
    key: 'flips',
  });

  const [handleDownloadGps, gpsStatus] = useHandleDownloadEmbeddedTool({
    name: 'GPS',
    key: 'gps',
  });

  const downloadPixi = useDownloadEmbeddedTool(toolchain, 'pixi');
  const [handleDownloadPixi, pixiStatus] = useHandleDownloadEmbeddedTool({
    name: 'PIXI',
    key: 'pixi',
  });

  const [handleDownloadUberAsm, uberAsmStatus] = useHandleDownloadEmbeddedTool({
    name: 'UberASM',
    key: 'uberAsm',
  });

  return (
    <Flex h='100%' w='100%' alignItems='center' justifyContent='center' p={10}>
      <Tabs
        h='100%'
        w='100%'
        maxW={512}
        isFitted
        colorScheme={colorScheme}
        overflowY='auto'
      >
        <TabList>
          <Tab>Embedded</Tab>
          <Tab>Custom</Tab>
        </TabList>
        <TabPanels>
          <TabPanel paddingBottom={0} paddingX={0}>
            <VStack h='100%' divider={<StackDivider />}>
              <Text pb={2}>
                Bazar needs specific versions of the following tools to work
                properly, so you cannot customize them. These tools will be
                downloaded from SMW Central.
              </Text>
              <ToolEmbedded
                name='Lunar Magic'
                onDownload={handleDownloadLunarMagic}
                status={lunarMagicStatus}
              />
              <ToolEmbedded
                name='Asar'
                onDownload={handleDownloadAsar}
                status={asarStatus}
              />
              <ToolEmbedded
                name='Flips'
                onDownload={handleDownloadFlips}
                status={flipsStatus}
              />
              <ToolEmbedded
                name='GPS'
                onDownload={handleDownloadGps}
                status={gpsStatus}
              />
              <ToolEmbedded
                name='PIXI'
                onDownload={handleDownloadPixi}
                status={pixiStatus}
              />
              <ToolEmbedded
                name='UberASM'
                onDownload={handleDownloadUberAsm}
                status={uberAsmStatus}
              />
            </VStack>
          </TabPanel>
          <TabPanel paddingBottom={0} paddingX={0}>
            <VStack h='100%' divider={<StackDivider />}>
              <Text pb={2}>
                These are tools of your personal choice. The editor (e.g., VS
                Code) will be used to open source code files (e.g., patches and
                blocks). The emulator will be used to run the game.
              </Text>
              <ToolCustom
                exePath={editor.exePath}
                isDisabled={handleEditEditor.isLoading}
                name='Editor'
                onChoose={handleEditEditor.call}
              />
              <ToolCustom
                exePath={emulator.exePath}
                isDisabled={handleEditEmulator.isLoading}
                name='Emulator'
                onChoose={handleEditEmulator.call}
              />
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
}
