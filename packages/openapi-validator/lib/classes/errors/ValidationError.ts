export default class ValidationError extends Error {
  public code: string;

  constructor(code, message?) {
    super(message);
    this.code = code;
  }

  toString() {
    return this.message;
  }
}
