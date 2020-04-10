class ValidationError extends Error {
  constructor(code, message, errors) {
    super(message);
    this.code = code;
    this.errors = errors;
  }
}

module.exports = ValidationError;
