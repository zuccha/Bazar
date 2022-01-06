import Project, { ProjectInfo } from '../core/Project';
import ProjectSnapshot from '../core/ProjectSnapshot';
import { useGet, useSetAsync } from '../hooks/useAccessors';
import { ErrorReport } from '../utils/ErrorReport';

export const useProjectLatestSnapshot = (project: Project): ProjectSnapshot => {
  return useGet(project, project.getLatest);
};

export const useProjectInfo = (project: Project): ProjectInfo => {
  return useGet(project, project.getInfo);
};

export const useSetProjectInfo = (
  project: Project,
): ((info: ProjectInfo) => Promise<ErrorReport | undefined>) => {
  return useSetAsync(project, project.setInfo);
};

export const useProjectBackups = (project: Project): string[] => {
  return useGet(project, project.getBackups);
};

export const useCreateProjectBackup = (
  project: Project,
): (() => Promise<ErrorReport | undefined>) => {
  return useSetAsync(project, project.createBackup);
};

export const useDeleteProjectBackup = (
  project: Project,
): ((backup: string) => Promise<ErrorReport | undefined>) => {
  return useSetAsync(project, project.deleteBackup);
};

export const useRestoreProjectBackup = (
  project: Project,
): ((backup: string) => Promise<ErrorReport | undefined>) => {
  return useSetAsync(project, project.restoreBackup);
};
