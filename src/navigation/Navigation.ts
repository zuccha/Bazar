import Router from './Router';

export enum RootRouteName {
  About = 'About',
  Help = 'Help',
  Home = 'Home',
  Project = 'Project',
  Settings = 'Settings',
  Templates = 'Templates',
  Toolchain = 'Toolchain',
}

export enum ProjectRouteName {
  Blocks = 'Blocks',
  Music = 'Music',
  Patches = 'Patches',
  Sprites = 'Sprites',
  UberAsm = 'UberAsm',
  GFX = 'GFX',
  ExGFX = 'ExGFX',
  Backups = 'Backups',
  Releases = 'Releases',
}

export enum SettingsRouteName {
  Appearance = 'Appearance',
  NewProject = 'NewProject',
}

export enum TemplatesRouteName {
  Projects = 'Projects',
  Blocks = 'Blocks',
  Music = 'Music',
  Patches = 'Patches',
  Sprites = 'Sprites',
  UberAsm = 'UberAsm',
  GFX = 'GFX',
  ExGFX = 'ExGFX',
}

export enum ToolchainRouteName {
  Custom = 'Custom',
  Embedded = 'Embedded',
}

export default class Navigation {
  private root: Router<RootRouteName>;
  private project: Router<ProjectRouteName>;
  private settings: Router<SettingsRouteName>;
  private templates: Router<TemplatesRouteName>;
  private toolchain: Router<ToolchainRouteName>;

  private constructor() {
    this.root = Router.create<RootRouteName>(RootRouteName.Home);
    this.project = Router.create<ProjectRouteName>(ProjectRouteName.Patches);
    this.settings = Router.create<SettingsRouteName>(
      SettingsRouteName.Appearance,
    );
    this.templates = Router.create<TemplatesRouteName>(
      TemplatesRouteName.Projects,
    );
    this.toolchain = Router.create<ToolchainRouteName>(
      ToolchainRouteName.Embedded,
    );
  }

  static create(): Navigation {
    return new Navigation();
  }

  static getRootDeps = ['Navigation.root'];
  getRoot = (): Router<RootRouteName> => this.root;

  static getProjectDeps = ['Navigation.project'];
  getProject = (): Router<ProjectRouteName> => this.project;

  static getSettingsDeps = ['Navigation.settings'];
  getSettings = (): Router<SettingsRouteName> => this.settings;

  static getTemplatesDeps = ['Navigation.templates'];
  getTemplates = (): Router<TemplatesRouteName> => this.templates;

  static getToolchainDeps = ['Navigation.toolchain'];
  getToolchain = (): Router<ToolchainRouteName> => this.toolchain;
}
