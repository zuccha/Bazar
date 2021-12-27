import { useCore } from '../contexts/CoreContext';
import Core from '../core/Core';
import Project from '../core/Project';
import Settings from '../core/Settings';
import Toolchain from '../core/Toolchain';
import { useGet, useSet, useSetAsync } from '../hooks/useAccessors';
import { ErrorReport } from '../utils/ErrorReport';

export const useProject = (): Project | undefined => {
  const core = useCore();
  return useGet(core, core.getProject, Core.getProjectDeps);
};

export const useSetProject = (): ((
  project: Project,
) => ErrorReport | undefined) => {
  const core = useCore();
  return useSet(core, core.setProject, Core.setProjectTriggers);
};

export const useSettings = (): Settings => {
  const core = useCore();
  return useGet(core, core.getSettings, Core.getSettingsDeps);
};

export const useToolchain = (): Toolchain => {
  const core = useCore();
  return useGet(core, core.getToolchain, Core.getToolchainDeps);
};
