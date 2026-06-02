//zod schema validation

const { fail } = require("../utils/response.utils");

function validate(schema) {
    return (req, res, next) =>{
        const result = schema.safeParse(req.body);

        if(!result.success) {
            const errors = result.error.error.map((e) => ({
                field : e.path.join("."),
                message: e.message,
            }));
            return fail(res, "validation failed", 400, errors);
        }

        req.body = result.data;
        next();
    };
}

function validateQuery(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.query);

        if(!result.success) {
            const errors = result.error.error.map((e) => ({
                field: e.path.join("."),
                message:e.message,
            }));
            return fail(res, "Invalid query parameters", 400, errors);
        }

        req.query = result.data;
        next();
    };
}

module.exports = {validate, validateQuery};