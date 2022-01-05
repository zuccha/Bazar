import { useNavigation } from '../contexts/NavigationContext';
import { useGet, useSet } from '../hooks/useAccessors';
import Navigation, {
  ProjectRouteName,
  RootRouteName,
  SettingsRouteName,
  TemplatesRouteName,
  ToolchainRouteName,
} from './Navigation';
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

// #region Settings

const useSettings = (): Router<SettingsRouteName> => {
  const navigation = useNavigation();
  return useGet(navigation, navigation.getSettings, Navigation.getSettingsDeps);
};

export const useSettingsRoute = (): SettingsRouteName => {
  const settings = useSettings();
  return useGet(settings, settings.getRoute, Router.getRouteDeps);
};

export const useNavigateSettings = (): ((route: SettingsRouteName) => void) => {
  const settings = useSettings();
  return useSet(settings, settings.navigate, Router.navigateTriggers);
};

// #endregion Settings

// #region Templates

const useTemplates = (): Router<TemplatesRouteName> => {
  const navigation = useNavigation();
  return useGet(
    navigation,
    navigation.getTemplates,
    Navigation.getTemplatesDeps,
  );
};

export const useTemplatesRoute = (): TemplatesRouteName => {
  const templates = useTemplates();
  return useGet(templates, templates.getRoute, Router.getRouteDeps);
};

export const useNavigateTemplates = (): ((
  route: TemplatesRouteName,
) => void) => {
  const templates = useTemplates();
  return useSet(templates, templates.navigate, Router.navigateTriggers);
};

// #endregion Toolchain

// #region Toolchain

const useToolchain = (): Router<ToolchainRouteName> => {
  const navigation = useNavigation();
  return useGet(
    navigation,
    navigation.getToolchain,
    Navigation.getToolchainDeps,
  );
};

export const useToolchainRoute = (): ToolchainRouteName => {
  const toolchain = useToolchain();
  return useGet(toolchain, toolchain.getRoute, Router.getRouteDeps);
};

export const useNavigateToolchain = (): ((
  route: ToolchainRouteName,
) => void) => {
  const toolchain = useToolchain();
  return useSet(toolchain, toolchain.navigate, Router.navigateTriggers);
};

// #endregion Toolchain
