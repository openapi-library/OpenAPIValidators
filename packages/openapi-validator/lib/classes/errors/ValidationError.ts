export enum ErrorCode {
  ServerNotFound,
  BasePathNotFound,
  PathNotFound,
  MethodNotFound,
  StatusNotFound,
  InvalidBody,
  InvalidObject,
}

export default class ValidationError extends Error {
  constructor(public code: ErrorCode, message?: string) {
    super(message);
  }

  override toString(): string {
    return this.message;
  }
}
