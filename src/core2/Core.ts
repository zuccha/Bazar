import { ErrorReport } from '../utils/ErrorReport';
import Project from './Project';
import Settings from './Settings';
import Toolchain from './Toolchain';

export default class Core {
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

  static getProjectDeps = ['Core.project'];
  getProject = (): Project | undefined => {
    return this.project;
  };

  static setProjectTriggers = ['Core.project'];
  setProject = (project: Project): ErrorReport | undefined => {
    this.project = project;
    return undefined;
  };

  static getSettingsDeps = ['Core.settings'];
  getSettings = (): Settings => {
    return this.settings;
  };

  static getToolchainDeps = ['Core.toolchain'];
  getToolchain = (): Toolchain => {
    return this.toolchain;
  };
}
