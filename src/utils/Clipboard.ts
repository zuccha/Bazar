import * as Tauri from '@tauri-apps/api';
import ErrorReport from './ErrorReport';

export const $Clipboard = {
  write: async (text: string): Promise<ErrorReport | undefined> => {
    try {
      await Tauri.clipboard.writeText(text);
      return undefined;
    } catch (error) {
      return ErrorReport.from(`Tauri.clipboard.writeText: ${error}`).extend(
        `Clipboard.write: failed to copy to clipboard`,
      );
    }
  },
};
