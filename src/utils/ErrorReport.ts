export default class ErrorReport {
  readonly message: string;
  readonly parent: ErrorReport | undefined;

  private constructor(message: string, parent: ErrorReport | undefined) {
    this.message = message;
    this.parent = parent;
  }

  static from(message: string): ErrorReport {
    return new ErrorReport(message, undefined);
  }

  extend = (message: string): ErrorReport => {
    return new ErrorReport(message, this);
  };

  trace = (): string[] => {
    let error: ErrorReport | undefined = this;
    let trace: string[] = [];
    while (error) {
      trace.push(error.message);
      error = error.parent;
    }
    return trace;
  };
}
