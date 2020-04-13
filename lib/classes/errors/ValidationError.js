class ValidationError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }

  toString() {
    return this.message;
  }
}

module.exports = ValidationError;
