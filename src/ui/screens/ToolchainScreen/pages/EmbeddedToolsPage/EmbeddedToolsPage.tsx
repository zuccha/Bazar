import { StackDivider, Text, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import EmbeddedToolItem from './EmbeddedToolItem';
import useHandleEmbeddedTool from './useHandleEmbeddedTool';

export default function ToolchainScreen(): ReactElement {
  const lunarMagic = useHandleEmbeddedTool({
    name: 'Lunar Magic',
    key: 'lunarMagic',
  });

  const asar = useHandleEmbeddedTool({
    name: 'Asar',
    key: 'asar',
  });

  const flips = useHandleEmbeddedTool({
    name: 'Flips',
    key: 'flips',
  });

  const gps = useHandleEmbeddedTool({
    name: 'GPS',
    key: 'gps',
  });

  const pixi = useHandleEmbeddedTool({
    name: 'PIXI',
    key: 'pixi',
  });

  const uberAsm = useHandleEmbeddedTool({
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
        onInstall={lunarMagic.install}
        onUninstall={lunarMagic.uninstall}
        status={lunarMagic.status}
      />
      <EmbeddedToolItem
        name='Asar'
        description='SNES assembler for applying patches to ROM images.'
        onInstall={asar.install}
        onUninstall={asar.uninstall}
        status={asar.status}
      />
      <EmbeddedToolItem
        name='Flips'
        description='Utility for creating BPS patches.'
        onInstall={flips.install}
        onUninstall={flips.uninstall}
        status={flips.status}
      />
      <EmbeddedToolItem
        name='GPS'
        description='Tool for inserting custom blocks.'
        onInstall={gps.install}
        onUninstall={gps.uninstall}
        status={gps.status}
      />
      <EmbeddedToolItem
        name='PIXI'
        description='Tool for inserting custom sprites.'
        onInstall={pixi.install}
        onUninstall={pixi.uninstall}
        status={pixi.status}
      />
      <EmbeddedToolItem
        name='UberASM'
        description='Tool for inserting custom ASM, made specifically for SMW.'
        onInstall={uberAsm.install}
        onUninstall={uberAsm.uninstall}
        status={uberAsm.status}
      />
    </VStack>
  );
}
