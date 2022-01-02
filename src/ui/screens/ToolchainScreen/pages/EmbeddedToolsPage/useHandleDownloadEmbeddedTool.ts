import { useToolchain } from '../../../../../core-hooks/Core';
import {
  useDownloadEmbeddedTool,
  useGetEmbeddedTool,
} from '../../../../../core-hooks/Toolchain';
import { ToolchainEmbedded } from '../../../../../core/Toolchain';
import useAsyncCallback from '../../../../../hooks/useAsyncCallback';
import useHandleError from '../../../../../hooks/useHandleError';

export default function useHandleDownloadEmbeddedTool({
  name,
  key,
}: {
  name: string;
  key: ToolchainEmbedded;
}): [() => void, 'loading' | 'installed' | 'not-installed' | 'deprecated'] {
  const handleError = useHandleError();

  const toolchain = useToolchain();
  const tool = useGetEmbeddedTool(toolchain, key);
  const downloadTool = useDownloadEmbeddedTool(toolchain, key);

  const handleDownload = useAsyncCallback(async () => {
    const error = await downloadTool();
    handleError(error, `Failed to download ${name}`);
    return error;
  }, [handleError, name, downloadTool]);

  const status = handleDownload.isLoading ? 'loading' : tool.status;

  return [handleDownload.call, status];
}
