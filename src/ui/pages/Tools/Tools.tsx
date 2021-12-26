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
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../store';
import {
  downloadAsar,
  downloadFlips,
  downloadGps,
  downloadLunarMagic,
  downloadPixi,
  downloadUberAsm,
  getToolchain,
  setEditor,
  setEmulator,
} from '../../../store/slices/core/slices/toolchain';
import useColorScheme from '../../../theme/useColorScheme';
import ToolCustom from './ToolCustom';
import ToolEmbedded from './ToolEmbedded';
import useDownloadToolEmbedded from './useDownloadToolEmbedded';

export default function Tools(): ReactElement {
  const colorScheme = useColorScheme();
  const dispatch = useDispatch<AppDispatch>();
  const toolchain = useSelector(getToolchain());

  const [handleDownloadLunarMagic, lunarMagicStatus] = useDownloadToolEmbedded({
    name: 'Lunar Magic',
    key: 'lunarMagic',
    download: downloadLunarMagic,
  });

  const [handleDownloadAsar, asarStatus] = useDownloadToolEmbedded({
    name: 'Asar',
    key: 'asar',
    download: downloadAsar,
  });

  const [handleDownloadFlips, flipsStatus] = useDownloadToolEmbedded({
    name: 'Flips',
    key: 'flips',
    download: downloadFlips,
  });

  const [handleDownloadGps, gpsStatus] = useDownloadToolEmbedded({
    name: 'GPS',
    key: 'gps',
    download: downloadGps,
  });

  const [handleDownloadPixi, pixiStatus] = useDownloadToolEmbedded({
    name: 'PIXI',
    key: 'pixi',
    download: downloadPixi,
  });

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
                exePath={toolchain.custom.editor.exePath}
                name='Editor'
                onChoose={(exePath) => dispatch(setEditor(exePath))}
              />
              <ToolCustom
                exePath={toolchain.custom.emulator.exePath}
                name='Emulator'
                onChoose={(exePath) => dispatch(setEmulator(exePath))}
              />
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
}
