const ok = (res, data = {}, message = "Success!",statusCode = 200) => 
    res.status(statusCode).json({success: true, message, data});

const created = (res, data= {}, message = "Created") => 
    ok(res,data, message, 201);

const fail = (res, message = "Bad Request !!!!", statusCode = 400, error = null) =>
    res.status(statusCode).json({
        success: false,
        message,
        ...(error && {errors}),
    });

const notFound = (res, message = "Resource not found") =>
    fail(res, message, 404);

const unauthorized = (res, message = "Unauthorizeddddd") =>
    fail(res, message, 401);

const forbidden = (res, message = " Forbidden = insufficient permission") =>
    fail(res, message, 403);

const conflict = (res, message= " confilct - rosource already exists") =>
    fail(res, message, 409);

const serverError = (res, message="Internal server error") =>
    fail(res, message, 500);

module.exports = {ok, created, fail, notFound, unauthorized, forbidden, conflict, serverError};