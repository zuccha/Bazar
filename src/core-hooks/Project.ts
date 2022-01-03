import Project, { ProjectInfo } from '../core/Project';
import ProjectSnapshot from '../core/ProjectSnapshot';
import { useGet, useSetAsync } from '../hooks/useAccessors';
import { ErrorReport } from '../utils/ErrorReport';

export const useProjectLatestSnapshot = (project: Project): ProjectSnapshot => {
  return useGet(project, project.getLatest, Project.getLatestDeps);
};

export const useProjectInfo = (project: Project): ProjectInfo => {
  return useGet(project, project.getInfo, Project.getInfoDeps);
};

export const useSetProjectInfo = (
  project: Project,
): ((info: ProjectInfo) => Promise<ErrorReport | undefined>) => {
  return useSetAsync(project, project.setInfo, Project.setInfoTriggers);
};

export const useCreateProjectBackup = (
  project: Project,
): (() => Promise<ErrorReport | undefined>) => {
  return useSetAsync(
    project,
    project.createBackup,
    Project.createBackupTriggers,
  );
};
