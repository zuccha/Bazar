import { getter, setter } from '../utils/Accessors';

export default class Router<T> {
  private route: T;

  private constructor(route: T) {
    this.route = route;
  }

  static create<T>(initialRoute: T): Router<T> {
    return new Router(initialRoute);
  }

  getRoute = getter(['Router.route'], () => {
    return this.route;
  });

  navigate = setter(['Router.route'], (route: T): undefined => {
    this.route = route;
    return undefined;
  });
}
