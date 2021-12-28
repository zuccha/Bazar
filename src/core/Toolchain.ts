import { z } from 'zod';
import { $EitherErrorOr, EitherErrorOr } from '../utils/EitherErrorOr';
import { ErrorReport } from '../utils/ErrorReport';
import { $FileSystem } from '../utils/FileSystem';
import { $SettingsStore } from '../utils/SettingsStore';

// #region Settings

const ToolchainSettingsStoreSchema = z.object({
  editorExePath: z.string(),
  emulatorExePath: z.string(),
});

export type ToolchainSettingsStore = z.infer<
  typeof ToolchainSettingsStoreSchema
>;

const $ToolchainSettingsStore = $SettingsStore.create({
  defaults: {
    editorExePath: '',
    emulatorExePath: '',
  },
  fileName: 'toolchain.json',
  schema: ToolchainSettingsStoreSchema,
});

// #endregion Settings

// #region Types

export interface ToolCustom {
  exePath: string;
}

interface ToolCustomOptions {
  name: string;
  settingKey: keyof ToolchainSettingsStore;
}

export type ToolEmbedded =
  | {
      status: 'installed';
      exePath: string;
      directoryPath: string;
    }
  | { status: 'not-installed' };

interface ToolEmbeddedOptions {
  name: string;
  directoryName: string;
  exeName: string;
  version: string;
  downloadUrl: string;
}

// #endregion Types

// #region Constants

// const TOOLCHAIN_DIR_PATH = await $FileSystem.getDataPath('toolchain');

const EDITOR_OPTIONS: ToolCustomOptions = {
  name: 'editor',
  settingKey: 'editorExePath',
};

const EMULATOR_OPTIONS: ToolCustomOptions = {
  name: 'emulator',
  settingKey: 'emulatorExePath',
};

const LUNAR_MAGIC_OPTIONS: ToolEmbeddedOptions = {
  name: 'Lunar Magic',
  directoryName: 'LunarMagic',
  exeName: 'Lunar Magic.exe',
  version: '3.31',
  downloadUrl: 'https://dl.smwcentral.net/28429/lm331.zip',
};

const ASAR_OPTIONS: ToolEmbeddedOptions = {
  name: 'Asar',
  directoryName: 'Asar',
  exeName: 'asar.exe',
  version: '1.81',
  downloadUrl: 'https://dl.smwcentral.net/25953/asar181.zip',
};

const FLIPS_OPTIONS: ToolEmbeddedOptions = {
  name: 'Flips',
  directoryName: 'Flips',
  exeName: 'flips.exe',
  version: '1.31',
  downloadUrl: 'https://dl.smwcentral.net/11474/floating.zip',
};

const GPS_OPTIONS: ToolEmbeddedOptions = {
  name: 'GPS',
  directoryName: 'GPS',
  exeName: 'gps.exe',
  version: '1.4.21',
  downloadUrl: 'https://dl.smwcentral.net/25810/GPS%20%28V1.4.21%29.zip',
};

const PIXI_OPTIONS: ToolEmbeddedOptions = {
  name: 'PIXI',
  directoryName: 'PIXI',
  exeName: 'pixi.exe',
  version: '1.32',
  downloadUrl: 'https://dl.smwcentral.net/26026/pixi_v1.32.zip',
};

const UBER_ASM_OPTIONS: ToolEmbeddedOptions = {
  name: 'UberASM',
  directoryName: 'UberASM',
  exeName: 'UberASMTool.exe',
  version: '1.4',
  downloadUrl: 'https://dl.smwcentral.net/19982/UberASMTool14.zip',
};

// #endregion Constants

// #region Utils

const getToolchainDirPath = (): Promise<string> =>
  $FileSystem.getDataPath('toolchain');

const readCustom = async (
  options: ToolCustomOptions,
): Promise<EitherErrorOr<ToolCustom>> => {
  const exePathOrError = await $ToolchainSettingsStore.get(options.settingKey);
  if (exePathOrError.isError) return $EitherErrorOr.error(exePathOrError.error);
  return $EitherErrorOr.value({ exePath: exePathOrError.value });
};

const readEmbedded = async ({
  directoryName,
  exeName,
  version,
}: ToolEmbeddedOptions): Promise<EitherErrorOr<ToolEmbedded>> => {
  const toolchainDirPath = await getToolchainDirPath();
  const directoryPath = await $FileSystem.join(toolchainDirPath, directoryName);
  if (await $FileSystem.validateExistsDir(directoryPath)) {
    return $EitherErrorOr.value({ status: 'not-installed' });
  }
  const exePath = await $FileSystem.join(directoryPath, version, exeName);
  if (await $FileSystem.validateExistsFile(exePath)) {
    return $EitherErrorOr.value({ status: 'not-installed' });
  }
  return $EitherErrorOr.value({ status: 'installed', exePath, directoryPath });
};

// #endregion Utils

export type ToolchainCustom = 'editor' | 'emulator';
export type ToolchainEmbedded =
  | 'lunarMagic'
  | 'asar'
  | 'flips'
  | 'gps'
  | 'pixi'
  | 'uberAsm';

export default class Toolchain {
  private editor: ToolCustom;
  private emulator: ToolCustom;

  private lunarMagic: ToolEmbedded;
  private asar: ToolEmbedded;
  private flips: ToolEmbedded;
  private gps: ToolEmbedded;
  private pixi: ToolEmbedded;
  private uberAsm: ToolEmbedded;

  private constructor({
    editor,
    emulator,
    lunarMagic,
    asar,
    flips,
    gps,
    pixi,
    uberAsm,
  }: {
    editor: ToolCustom;
    emulator: ToolCustom;
    lunarMagic: ToolEmbedded;
    asar: ToolEmbedded;
    flips: ToolEmbedded;
    gps: ToolEmbedded;
    pixi: ToolEmbedded;
    uberAsm: ToolEmbedded;
  }) {
    this.editor = editor;
    this.emulator = emulator;
    this.lunarMagic = lunarMagic;
    this.asar = asar;
    this.flips = flips;
    this.gps = gps;
    this.pixi = pixi;
    this.uberAsm = uberAsm;
  }

  static create(): Toolchain {
    return new Toolchain({
      editor: { exePath: '' },
      emulator: { exePath: '' },
      lunarMagic: { status: 'not-installed' },
      asar: { status: 'not-installed' },
      flips: { status: 'not-installed' },
      gps: { status: 'not-installed' },
      pixi: { status: 'not-installed' },
      uberAsm: { status: 'not-installed' },
    });
  }

  static loadTriggers = [
    'Toolchain.editor',
    'Toolchain.emulator',
    'Toolchain.lunarMagic',
    'Toolchain.asar',
    'Toolchain.flips',
    'Toolchain.gps',
    'Toolchain.pixi',
    'Toolchain.uberAsm',
  ];
  load = async (): Promise<ErrorReport | undefined> => {
    const editorOrError = await readCustom(EDITOR_OPTIONS);
    if (editorOrError.isError) return editorOrError.error;
    const emulatorOrError = await readCustom(EMULATOR_OPTIONS);
    if (emulatorOrError.isError) return emulatorOrError.error;
    const lunarMagicOrError = await readEmbedded(LUNAR_MAGIC_OPTIONS);
    if (lunarMagicOrError.isError) return lunarMagicOrError.error;
    const asarOrError = await readEmbedded(ASAR_OPTIONS);
    if (asarOrError.isError) return asarOrError.error;
    const flipsOrError = await readEmbedded(FLIPS_OPTIONS);
    if (flipsOrError.isError) return flipsOrError.error;
    const gpsOrError = await readEmbedded(GPS_OPTIONS);
    if (gpsOrError.isError) return gpsOrError.error;
    const pixiOrError = await readEmbedded(PIXI_OPTIONS);
    if (pixiOrError.isError) return pixiOrError.error;
    const uberAsmOrError = await readEmbedded(UBER_ASM_OPTIONS);
    if (uberAsmOrError.isError) return uberAsmOrError.error;

    this.editor = editorOrError.value;
    this.emulator = emulatorOrError.value;
    this.lunarMagic = lunarMagicOrError.value;
    this.asar = asarOrError.value;
    this.flips = flipsOrError.value;
    this.gps = gpsOrError.value;
    this.pixi = pixiOrError.value;
    this.uberAsm = uberAsmOrError.value;
  };

  editCustom = async (
    toolCustom: ToolchainCustom,
    exePath: string,
  ): Promise<ErrorReport | undefined> => {
    const { settingKey } = {
      editor: EDITOR_OPTIONS,
      emulator: EMULATOR_OPTIONS,
    }[toolCustom];

    let error: ErrorReport | undefined;
    const errorMessage = `Toolchain.editCustom(${toolCustom}): Failed to set path`;
    error = await $ToolchainSettingsStore.set(settingKey, exePath);
    if (error) return error.extend(errorMessage);
    this[toolCustom].exePath = exePath;
  };

  downloadEmbedded = async (
    toolEmbedded: ToolchainEmbedded,
  ): Promise<ErrorReport | undefined> => {
    const { directoryName, exeName, version, downloadUrl } = {
      lunarMagic: LUNAR_MAGIC_OPTIONS,
      asar: ASAR_OPTIONS,
      flips: FLIPS_OPTIONS,
      gps: GPS_OPTIONS,
      pixi: PIXI_OPTIONS,
      uberAsm: UBER_ASM_OPTIONS,
    }[toolEmbedded];

    const errorPrefix = `Toolchain.downloadEmbedded(${toolEmbedded})`;
    let error: ErrorReport | undefined;

    const toolchainDirPath = await getToolchainDirPath();
    const directoryPath = await $FileSystem.join(
      toolchainDirPath,
      directoryName,
    );
    const versionPath = await $FileSystem.join(directoryPath, version);
    const exePath = await $FileSystem.join(versionPath, exeName);
    const zipPath = await $FileSystem.join(directoryPath, `${version}.zip`);

    if (await $FileSystem.exists(zipPath)) {
      error = await $FileSystem.removeFile(zipPath);
      if (error) {
        const errorMessage = `${errorPrefix}: Failed to remove existing zip`;
        return error.extend(errorMessage);
      }
    }

    error = await $FileSystem.downloadFile(zipPath, downloadUrl);
    if (error) {
      const errorMessage = `${errorPrefix}: Failed to download`;
      return error.extend(errorMessage);
    }

    error = await $FileSystem.unzip(zipPath, versionPath);
    if (error) {
      await $FileSystem.removeFile(zipPath);
      const errorMessage = `${errorPrefix}: Failed to unzip`;
      return error.extend(errorMessage);
    }

    await $FileSystem.removeFile(zipPath);

    this[toolEmbedded] = { status: 'installed', exePath, directoryPath };
  };

  getCustom = (propertyName: ToolchainCustom): ToolCustom => {
    return this[propertyName];
  };

  getEmbedded = (propertyName: ToolchainEmbedded): ToolEmbedded => {
    return this[propertyName];
  };
}
