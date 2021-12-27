import Router from './Router';

export enum RootRouteName {
  About = 'About',
  Help = 'Help',
  Home = 'Home',
  Project = 'Project',
  Settings = 'Settings',
  Tools = 'Tools',
}

export enum ProjectRouteName {
  Blocks = 'Blocks',
  Music = 'Music',
  Patches = 'Patches',
  Sprites = 'Sprites',
  UberAsm = 'UberAsm',
  Backups = 'Backups',
  Releases = 'Releases',
}

export default class Navigation {
  private root: Router<RootRouteName>;
  private project: Router<ProjectRouteName>;

  private constructor() {
    this.root = Router.create<RootRouteName>(RootRouteName.Home);
    this.project = Router.create<ProjectRouteName>(ProjectRouteName.Blocks);
  }

  static create(): Navigation {
    return new Navigation();
  }

  static getRootDeps = ['Navigation.root'];
  getRoot = (): Router<RootRouteName> => this.root;

  static getProjectDeps = ['Navigation.project'];
  getProject = (): Router<ProjectRouteName> => this.project;
}
