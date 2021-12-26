import { ErrorReport } from '../utils/ErrorReport';
import Project from './Project';

export default class Core {
  private project: Project | undefined;

  private constructor() {
    this.project = undefined;
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
}
