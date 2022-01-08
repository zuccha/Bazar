import * as Tauri from '@tauri-apps/api';
import { $EitherErrorOr, EitherErrorOr } from './EitherErrorOr';
import ErrorReport from './ErrorReport';
import { $FileSystem } from './FileSystem';

interface OpenDialogOptions {
  defaultPath?: string;
  filters?: {
    name: string;
    extensions: string[];
  }[];
  type: 'file' | 'directory';
}

export const $Dialog = {
  open: async (
    options: OpenDialogOptions,
  ): Promise<EitherErrorOr<string | undefined>> => {
    try {
      const pathOrPaths = await Tauri.dialog.open({
        defaultPath:
          options.defaultPath && (await $FileSystem.exists(options.defaultPath))
            ? options.defaultPath
            : undefined,
        filters: options.filters,
        directory: options.type === 'directory',
      });
      const path =
        typeof pathOrPaths === 'string'
          ? pathOrPaths
          : Array.isArray(pathOrPaths) && pathOrPaths.length > 0
          ? pathOrPaths[0]
          : undefined;
      return $EitherErrorOr.value(path);
    } catch (error) {
      const errorMessage = `Dialog.open: Could not open ${options.type} dialog`;
      return $EitherErrorOr.error(ErrorReport.from(errorMessage));
    }
  },
};
