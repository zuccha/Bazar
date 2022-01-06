import { getter, setter } from '../utils/Accessors';
import { ErrorReport } from '../utils/ErrorReport';
import Project from './Project';
import Settings from './Settings';
import Toolchain from './Toolchain';

export default class Core {
  public readonly TypeName = 'Core';

  private project: Project | undefined;
  private settings: Settings;
  private toolchain: Toolchain;

  private constructor() {
    this.project = undefined;
    this.settings = Settings.create();
    this.toolchain = Toolchain.create();
  }

  static create(): Core {
    return new Core();
  }

  getProject = getter(['project'], (): Project | undefined => {
    return this.project;
  });

  setProject = setter(
    ['project'],
    (project: Project): ErrorReport | undefined => {
      this.project = project;
      return undefined;
    },
  );

  getSettings = getter(['settings'], (): Settings => {
    return this.settings;
  });

  getToolchain = getter(['toolchain'], (): Toolchain => {
    return this.toolchain;
  });
}
