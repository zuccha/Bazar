import { getter, setter } from '../utils/Accessors';
import { ErrorReport } from '../utils/ErrorReport';
import Collection from './Collection';
import Project from './Project';
import Settings from './Settings';
import Toolchain from './Toolchain';

export default class Core {
  public readonly TypeName = 'Core';

  private _project: Project | undefined;
  private _settings: Settings;
  private _toolchain: Toolchain;
  private _collection: Collection;

  private constructor() {
    this._project = undefined;
    this._settings = Settings.create();
    this._toolchain = Toolchain.create();
    this._collection = Collection.create();
  }

  static create(): Core {
    return new Core();
  }

  getCollection = getter(['collection'], (): Collection => {
    return this._collection;
  });

  getProject = getter(['project'], (): Project | undefined => {
    return this._project;
  });

  setProject = setter(
    ['project'],
    (project: Project): ErrorReport | undefined => {
      this._project = project;
      return undefined;
    },
  );

  getSettings = getter(['settings'], (): Settings => {
    return this._settings;
  });

  getToolchain = getter(['toolchain'], (): Toolchain => {
    return this._toolchain;
  });
}
