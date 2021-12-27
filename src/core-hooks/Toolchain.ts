import Toolchain from '../core/Toolchain';
import { useSetAsync } from '../hooks/useAccessors';
import { ErrorReport } from '../utils/ErrorReport';

export const useLoadToolchain = (
  toolchain: Toolchain,
): (() => Promise<ErrorReport | undefined>) =>
  useSetAsync(toolchain, toolchain.load, Toolchain.loadTriggers);
