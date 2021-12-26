import { useCore } from '../../../contexts/CoreContext';
import Core from '../../../core/Core';
import { ToolchainEmbedded } from '../../../core/Toolchain';
import { useGet } from '../../../hooks/useAccessors';
import useAsyncCallback from '../../../hooks/useAsyncCallback';
import useHandleError from '../../../hooks/useHandleError';
import { ErrorReport } from '../../../utils/ErrorReport';

export default function useDownloadToolEmbedded({
  name,
  key,
  download,
}: {
  name: string;
  key: ToolchainEmbedded;
  download: () => Promise<ErrorReport | undefined>;
}): [() => void, 'downloading' | 'installed' | 'not-installed' | 'deprecated'] {
  const handleError = useHandleError();

  const core = useCore();
  const toolchain = useGet(core, core.getToolchain, Core.getToolchainDeps);
  const tool = useGet(toolchain, () => toolchain.getEmbedded(key), [key]);

  const handleDownload = useAsyncCallback(async () => {
    const error = await download();
    handleError(error, `Failed to download  ${name}`);
    return error;
  }, [handleError, name, download]);

  const status = handleDownload.isLoading ? 'downloading' : tool.status;

  return [handleDownload.call, status];
}
