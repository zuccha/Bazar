import { useToolchain } from '../../../../../core-hooks/Core';
import {
  useInstallEmbeddedTool,
  useGetEmbeddedTool,
  useUninstallEmbeddedTool,
} from '../../../../../core-hooks/Toolchain';
import { ToolchainEmbedded } from '../../../../../core/Toolchain';
import useAsyncCallback from '../../../../../hooks/useAsyncCallback';
import useToast from '../../../../../hooks/useToast';

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
  const toast = useToast();

  const toolchain = useToolchain();
  const tool = useGetEmbeddedTool(toolchain, key);
  const installTool = useInstallEmbeddedTool(toolchain, key);
  const uninstallTool = useUninstallEmbeddedTool(toolchain, key);

  const handleInstall = useAsyncCallback(async () => {
    const error = await installTool();
    if (error) toast.failure(`Failed to install ${name}`, error);
    return error;
  }, [toast, name, installTool]);

  const handleUninstall = useAsyncCallback(async () => {
    const error = await uninstallTool();
    if (error) toast.failure(`Failed to uninstall ${name}`, error);
    return error;
  }, [toast, name, uninstallTool]);

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
