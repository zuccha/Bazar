export default class Router<T> {
  private route: T;

  private constructor(route: T) {
    this.route = route;
  }

  static create<T>(initialRoute: T): Router<T> {
    return new Router(initialRoute);
  }

  static getRouteDeps = ['Router.route'];
  getRoute = () => {
    return this.route;
  };

  static navigateTriggers = ['Router.route'];
  navigate = (route: T): undefined => {
    this.route = route;
    return undefined;
  };
}
