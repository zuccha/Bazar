import { useToast } from '@chakra-ui/react';
import * as Tauri from '@tauri-apps/api';
import { $ErrorReport, ErrorReport } from '../utils/ErrorReport';
import useAsyncCallback from './useAsyncCallback';
import useHandleError from './useHandleError';

export default function useCopyToClipboard() {
  const toast = useToast();
  const handleError = useHandleError();

  return useAsyncCallback(
    async (text: string): Promise<ErrorReport | undefined> => {
      try {
        await Tauri.clipboard.writeText(text);
        toast({
          title: 'Copied to clipboard',
          description: 'The output has been copied to your clipboard',
          status: 'success',
        });
      } catch {
        const error = $ErrorReport.make('Failed to copy to clipboard');
        handleError(error, 'Please, try again');
        return error;
      }
    },
    [handleError, toast],
  );
}
