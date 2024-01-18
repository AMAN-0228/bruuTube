class ApiResponse  {
    constructor(
        statusCode = 200,
        message = "success",
        data = null,
    ){
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode < 400 ? true : false;
    }
}