class apiError extends Error {
    constructor(
        status,
        mess = " man try again",
        stack = ''
    ) {
        this.status = status,
        this.mess = mess,
        this.stack ? this.stack : Error.captureStackTrace(this,this.constructor)
    }
}

export {apiError}