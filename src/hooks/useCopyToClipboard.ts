import { $Clipboard } from '../utils/Clipboard';
import ErrorReport from '../utils/ErrorReport';
import useAsyncCallback from './useAsyncCallback';
import useToast from './useToast';

export default function useCopyToClipboard() {
  const toast = useToast();

  return useAsyncCallback(
    async (text: string): Promise<ErrorReport | undefined> => {
      const error = await $Clipboard.write(text);
      toast('Copied to clipboard', 'Failed to copy to clipboard', error);
      return error;
    },
    [toast],
  );
}
