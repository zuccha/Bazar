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
import { useCore } from '../../../contexts/CoreContext';
import Core from '../../../core2/Core';
import Toolchain from '../../../core2/Toolchain';
import { useGet, useSetAsync } from '../../../hooks/useAccessors';
import useAsyncCallback from '../../../hooks/useAsyncCallback';
import useHandleError from '../../../hooks/useHandleError';
import useColorScheme from '../../../theme/useColorScheme';
import ToolCustom from './ToolCustom';
import ToolEmbedded from './ToolEmbedded';
import useDownloadToolEmbedded from './useDownloadToolEmbedded';

export default function ToolchainScreen(): ReactElement {
  const colorScheme = useColorScheme();

  const core = useCore();
  const toolchain = useGet(core, core.getToolchain, Core.getToolchainDeps);

  const editor = useGet(
    toolchain,
    toolchain.getEditor,
    Toolchain.getEditorDeps,
  );
  const emulator = useGet(
    toolchain,
    toolchain.getEmulator,
    Toolchain.getEmulatorDeps,
  );

  const editEditor = useSetAsync(
    toolchain,
    toolchain.editEditor,
    Toolchain.editEditorTriggers,
  );

  const editEmulator = useSetAsync(
    toolchain,
    toolchain.editEmulator,
    Toolchain.editEmulatorTriggers,
  );

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

  const downloadLunarMagic = useSetAsync(
    toolchain,
    toolchain.downloadLunarMagic,
    Toolchain.downloadLunarMagicTriggers,
  );
  const [handleDownloadLunarMagic, lunarMagicStatus] = useDownloadToolEmbedded({
    name: 'Lunar Magic',
    key: 'lunarMagic',
    download: downloadLunarMagic,
  });

  const downloadAsar = useSetAsync(
    toolchain,
    toolchain.downloadAsar,
    Toolchain.downloadAsarTriggers,
  );
  const [handleDownloadAsar, asarStatus] = useDownloadToolEmbedded({
    name: 'Asar',
    key: 'asar',
    download: downloadAsar,
  });

  const downloadFlips = useSetAsync(
    toolchain,
    toolchain.downloadFlips,
    Toolchain.downloadFlipsTriggers,
  );
  const [handleDownloadFlips, flipsStatus] = useDownloadToolEmbedded({
    name: 'Flips',
    key: 'flips',
    download: downloadFlips,
  });

  const downloadGps = useSetAsync(
    toolchain,
    toolchain.downloadGps,
    Toolchain.downloadGpsTriggers,
  );
  const [handleDownloadGps, gpsStatus] = useDownloadToolEmbedded({
    name: 'GPS',
    key: 'gps',
    download: downloadGps,
  });

  const downloadPixi = useSetAsync(
    toolchain,
    toolchain.downloadPixi,
    Toolchain.downloadPixiTriggers,
  );
  const [handleDownloadPixi, pixiStatus] = useDownloadToolEmbedded({
    name: 'PIXI',
    key: 'pixi',
    download: downloadPixi,
  });

  const downloadUberAsm = useSetAsync(
    toolchain,
    toolchain.downloadUberAsm,
    Toolchain.downloadUberAsmTriggers,
  );
  const [handleDownloadUberAsm, uberAsmStatus] = useDownloadToolEmbedded({
    name: 'UberASM',
    key: 'uberAsm',
    download: downloadUberAsm,
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
                downloaded from SMW Central into you home directory
                ("~/Bazar/tools").
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
