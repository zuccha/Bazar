import { getter } from '../utils/Accessors';
import Router from './Router';

export enum RootRouteName {
  About = 'About',
  Collection = 'Collection',
  Help = 'Help',
  Home = 'Home',
  Project = 'Project',
  Settings = 'Settings',
  Toolchain = 'Toolchain',
}

export enum CollectionRouteName {
  Projects = 'Projects',
  Blocks = 'Blocks',
  Music = 'Music',
  Patches = 'Patches',
  Sprites = 'Sprites',
  UberAsm = 'UberAsm',
  GFX = 'GFX',
  ExGFX = 'ExGFX',
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

export enum ToolchainRouteName {
  Custom = 'Custom',
  Embedded = 'Embedded',
}

export default class Navigation {
  private _root: Router<RootRouteName>;
  private _collection: Router<CollectionRouteName>;
  private _project: Router<ProjectRouteName>;
  private _settings: Router<SettingsRouteName>;
  private _toolchain: Router<ToolchainRouteName>;

  private constructor() {
    this._root = Router.create<RootRouteName>(RootRouteName.Collection);
    this._collection = Router.create<CollectionRouteName>(
      CollectionRouteName.Projects,
    );
    this._project = Router.create<ProjectRouteName>(ProjectRouteName.Patches);
    this._settings = Router.create<SettingsRouteName>(
      SettingsRouteName.Appearance,
    );
    this._toolchain = Router.create<ToolchainRouteName>(
      ToolchainRouteName.Embedded,
    );
  }

  static create(): Navigation {
    return new Navigation();
  }

  getRoot = getter(['root'], (): Router<RootRouteName> => this._root);

  getCollection = getter(
    ['collection'],
    (): Router<CollectionRouteName> => this._collection,
  );

  getProject = getter(
    ['project'],
    (): Router<ProjectRouteName> => this._project,
  );

  getSettings = getter(
    ['settings'],
    (): Router<SettingsRouteName> => this._settings,
  );

  getToolchain = getter(
    ['toolchain'],
    (): Router<ToolchainRouteName> => this._toolchain,
  );
}
