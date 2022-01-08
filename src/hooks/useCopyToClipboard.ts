import * as Tauri from '@tauri-apps/api';
import ErrorReport from '../utils/ErrorReport';
import useAsyncCallback from './useAsyncCallback';
import useToast from './useToast';

export default function useCopyToClipboard() {
  const toast = useToast();

  return useAsyncCallback(
    async (text: string): Promise<ErrorReport | undefined> => {
      let error: ErrorReport | undefined;
      try {
        await Tauri.clipboard.writeText(text);
      } catch (tauriError) {
        error = ErrorReport.from(`Tauri.clipboard.writeText: ${error}`);
      }
      toast('Copied to clipboard', 'Failed to copy to clipboard', error);
      return error;
    },
    [toast],
  );
}
