export class ApiError extends Error {
  constructor(statusCode, message, errors = [], stack = '') {
    super(message);
    this.message = message || 'Something went wrong';
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;

    console.log(this.message);
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
