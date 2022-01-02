import { useToolchain } from '../../../../../core-hooks/Core';
import {
  useInstallEmbeddedTool,
  useGetEmbeddedTool,
  useUninstallEmbeddedTool,
} from '../../../../../core-hooks/Toolchain';
import { ToolchainEmbedded } from '../../../../../core/Toolchain';
import useAsyncCallback from '../../../../../hooks/useAsyncCallback';
import useHandleError from '../../../../../hooks/useHandleError';

export default function useHandleEmbeddedTool({
  name,
  key,
}: {
  name: string;
  key: ToolchainEmbedded;
}): {
  install: () => void;
  uninstall: () => void;
  status: 'loading' | 'installed' | 'not-installed' | 'deprecated';
} {
  const handleError = useHandleError();

  const toolchain = useToolchain();
  const tool = useGetEmbeddedTool(toolchain, key);
  const installTool = useInstallEmbeddedTool(toolchain, key);
  const uninstallTool = useUninstallEmbeddedTool(toolchain, key);

  const handleInstall = useAsyncCallback(async () => {
    const error = await installTool();
    handleError(error, `Failed to install ${name}`);
    return error;
  }, [handleError, name, installTool]);

  const handleUninstall = useAsyncCallback(async () => {
    const error = await uninstallTool();
    handleError(error, `Failed to uninstall ${name}`);
    return error;
  }, [handleError, name, uninstallTool]);

  const status =
    handleInstall.isLoading || handleUninstall.isLoading
      ? 'loading'
      : tool.status;

  return {
    install: handleInstall.call,
    uninstall: handleUninstall.call,
    status,
  };
}
