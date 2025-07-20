class apiError extends Error {
  constructor(
    status,
    mess = 'something is fishy in here',
    error = [],
    stack = ''
  ) {
    super(mess);
    this.data = null;
    this.status = status;
    this.mess = mess;
    this.error = error;
    this.stack = stack;
    this.stack ? this.stack : Error.captureStackTrace(this, this.constructor);
  }
}

export {apiError}
