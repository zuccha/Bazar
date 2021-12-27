import { useNavigation } from '../contexts/NavigationContext';
import { useGet, useSet } from '../hooks/useAccessors';
import Navigation, { ProjectRouteName, RootRouteName } from './Navigation';
import Router from './Router';

// #region Root

const useRoot = (): Router<RootRouteName> => {
  const navigation = useNavigation();
  return useGet(navigation, navigation.getRoot, Navigation.getRootDeps);
};

export const useRootRoute = (): RootRouteName => {
  const root = useRoot();
  return useGet(root, root.getRoute, Router.getRouteDeps);
};

export const useNavigateRoot = (): ((route: RootRouteName) => void) => {
  const root = useRoot();
  return useSet(root, root.navigate, Router.navigateTriggers);
};

// #endregion Root

// #region Project

const useProject = (): Router<ProjectRouteName> => {
  const navigation = useNavigation();
  return useGet(navigation, navigation.getProject, Navigation.getProjectDeps);
};

export const useProjectRoute = (): ProjectRouteName => {
  const project = useProject();
  return useGet(project, project.getRoute, Router.getRouteDeps);
};

export const useNavigateProject = (): ((route: ProjectRouteName) => void) => {
  const project = useProject();
  return useSet(project, project.navigate, Router.navigateTriggers);
};

// #endregion Project
