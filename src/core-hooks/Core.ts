import { useCore } from '../contexts/CoreContext';
import Collection from '../core/Collection';
import Project from '../core/Project';
import Settings from '../core/Settings';
import Toolchain from '../core/Toolchain';
import { useGet, useSet } from '../hooks/useAccessors';
import ErrorReport from '../utils/ErrorReport';

export const useCollection = (): Collection => {
  const core = useCore();
  return useGet(core, core.getCollection);
};

export const useProject = (): Project | undefined => {
  const core = useCore();
  return useGet(core, core.getProject);
};

export const useSetProject = (): ((
  project: Project,
) => ErrorReport | undefined) => {
  const core = useCore();
  return useSet(core, core.setProject);
};

export const useSettings = (): Settings => {
  const core = useCore();
  return useGet(core, core.getSettings);
};

export const useToolchain = (): Toolchain => {
  const core = useCore();
  return useGet(core, core.getToolchain);
};
