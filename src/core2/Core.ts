import { ErrorReport } from '../utils/ErrorReport';
import Project from './Project';
import Toolchain from './Toolchain';

export default class Core {
  private project: Project | undefined;
  private toolchain: Toolchain;

  private constructor() {
    this.project = undefined;
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

  static getToolchainDeps = ['Core.toolchain'];
  getToolchain = (): Toolchain => {
    return this.toolchain;
  };
}
