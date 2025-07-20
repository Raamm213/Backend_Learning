class apiResponse {
    constructor(status,data,mess = 'success'){
        this.status = status
        this.data = data
        this.mess = mess
        this.success = status < 400
    }
}

export {apiResponse}