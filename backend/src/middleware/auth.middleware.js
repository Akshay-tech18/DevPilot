//verifyJWT — attaches req.user

const {verifyAccessToken} = require("../utils/jwt.utils");
const {unauthorized, forbidden} = require("../utils/response.utils");

function protect(req, res, next){
    try{
        let token = req.cookies?.accessToken;

        if(!token){
            const header = req.header.authorization;
            if(header?.startsWith("Bearer ")){
                token = header.split(" ")[1];
            }
        }

        if(!token){
            return unauthorized(res, "No token provided. Please log in. ");
        }

        const decoded = verifyAccessToken(token);
        req.user = {id : decoded.id, email:decoded.email, role: decoded.role};
        next();
    }catch(err){
        if(err.name === "TokenExpiredError"){
            return unauthorized(res, "Token expired. please refresh your session. ");
        }
        return unauthorized(res, "Invalid token.");
    }
}

function checkRole(...roles){
    return (req, res, next) => {
        if(!req.user){
            return unauthorized(res);
        }
        if(!role.includes(req.user.role)){
            return forbidden(res, `Role '${req.user.role}' is not allowed. Required: ${roles.join(" | ")}`);
        }
        next();
    };
}

function optionalAuth(req, res, next){
    try{
        const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
        if(token){
            req.user = verifyAccessToken(token);
        }
    }catch {
        // no need of this rn
    }
    next();
}

module.exports = {protect, checkRole, optionalAuth};