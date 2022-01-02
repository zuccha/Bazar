import { StackDivider, Text, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import EmbeddedToolItem from './EmbeddedToolItem';
import useDownloadEmbeddedTool from './useHandleDownloadEmbeddedTool';

export default function ToolchainScreen(): ReactElement {
  const [handleDownloadLunarMagic, lunarMagicStatus] = useDownloadEmbeddedTool({
    name: 'Lunar Magic',
    key: 'lunarMagic',
  });

  const [handleDownloadAsar, asarStatus] = useDownloadEmbeddedTool({
    name: 'Asar',
    key: 'asar',
  });

  const [handleDownloadFlips, flipsStatus] = useDownloadEmbeddedTool({
    name: 'Flips',
    key: 'flips',
  });

  const [handleDownloadGps, gpsStatus] = useDownloadEmbeddedTool({
    name: 'GPS',
    key: 'gps',
  });

  const [handleDownloadPixi, pixiStatus] = useDownloadEmbeddedTool({
    name: 'PIXI',
    key: 'pixi',
  });

  const [handleDownloadUberAsm, uberAsmStatus] = useDownloadEmbeddedTool({
    name: 'UberASM',
    key: 'uberAsm',
  });

  return (
    <VStack
      h='100%'
      spacing={4}
      divider={<StackDivider borderColor='app.bg1' />}
      alignItems='flex-start'
    >
      <Text pb={2}>
        Bazar needs specific versions of the following tools to work properly,
        so you cannot customize them. These tools will be downloaded from SMW
        Central.
      </Text>
      <EmbeddedToolItem
        name='Lunar Magic'
        description='Fundamental tool for editing levels, colors, map16, and more.'
        onInstall={handleDownloadLunarMagic}
        onUninstall={() => {}}
        status={lunarMagicStatus}
      />
      <EmbeddedToolItem
        name='Asar'
        description='SNES assembler for applying patches to ROM images.'
        onInstall={handleDownloadAsar}
        onUninstall={() => {}}
        status={asarStatus}
      />
      <EmbeddedToolItem
        name='Flips'
        description='Utility for creating BPS patches.'
        onInstall={handleDownloadFlips}
        onUninstall={() => {}}
        status={flipsStatus}
      />
      <EmbeddedToolItem
        name='GPS'
        description='Tool for inserting custom blocks.'
        onInstall={handleDownloadGps}
        onUninstall={() => {}}
        status={gpsStatus}
      />
      <EmbeddedToolItem
        name='PIXI'
        description='Tool for inserting custom sprites.'
        onInstall={handleDownloadPixi}
        onUninstall={() => {}}
        status={pixiStatus}
      />
      <EmbeddedToolItem
        name='UberASM'
        description='Tool for inserting custom ASM, made specifically for SMW.'
        onInstall={handleDownloadUberAsm}
        onUninstall={() => {}}
        status={uberAsmStatus}
      />
    </VStack>
  );
}
