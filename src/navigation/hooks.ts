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
  return useGet(navigation, navigation.getRoot);
};

export const useRootRoute = (): RootRouteName => {
  const root = useRoot();
  return useGet(root, root.getRoute);
};

export const useNavigateRoot = (): ((route: RootRouteName) => void) => {
  const root = useRoot();
  return useSet(root, root.navigate);
};

// #endregion Root

// #region Project

const useProject = (): Router<ProjectRouteName> => {
  const navigation = useNavigation();
  return useGet(navigation, navigation.getProject);
};

export const useProjectRoute = (): ProjectRouteName => {
  const project = useProject();
  return useGet(project, project.getRoute);
};

export const useNavigateProject = (): ((route: ProjectRouteName) => void) => {
  const project = useProject();
  return useSet(project, project.navigate);
};

// #endregion Project

// #region Settings

const useSettings = (): Router<SettingsRouteName> => {
  const navigation = useNavigation();
  return useGet(navigation, navigation.getSettings);
};

export const useSettingsRoute = (): SettingsRouteName => {
  const settings = useSettings();
  return useGet(settings, settings.getRoute);
};

export const useNavigateSettings = (): ((route: SettingsRouteName) => void) => {
  const settings = useSettings();
  return useSet(settings, settings.navigate);
};

// #endregion Settings

// #region Templates

const useTemplates = (): Router<TemplatesRouteName> => {
  const navigation = useNavigation();
  return useGet(navigation, navigation.getTemplates);
};

export const useTemplatesRoute = (): TemplatesRouteName => {
  const templates = useTemplates();
  return useGet(templates, templates.getRoute);
};

export const useNavigateTemplates = (): ((
  route: TemplatesRouteName,
) => void) => {
  const templates = useTemplates();
  return useSet(templates, templates.navigate);
};

// #endregion Toolchain

// #region Toolchain

const useToolchain = (): Router<ToolchainRouteName> => {
  const navigation = useNavigation();
  return useGet(navigation, navigation.getToolchain);
};

export const useToolchainRoute = (): ToolchainRouteName => {
  const toolchain = useToolchain();
  return useGet(toolchain, toolchain.getRoute);
};

export const useNavigateToolchain = (): ((
  route: ToolchainRouteName,
) => void) => {
  const toolchain = useToolchain();
  return useSet(toolchain, toolchain.navigate);
};

// #endregion Toolchain
