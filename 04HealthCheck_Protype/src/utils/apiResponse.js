class apiResponse {
    constructor(
        status,
        mess = 'you have done the good jog in here',
        signal = "OK",
        data,
    ){
        this.data = data,
        this.mess = mess,
        this.signal = signal,
        this.status = status < 400
    }
} 

export {apiResponse}