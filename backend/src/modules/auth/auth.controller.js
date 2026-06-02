const {
    setAuthCookies,
    clearAuthCookies,
    refreshAccessToken,
    sanitizeUser
} = require("./auth.service");
const {ok, unauthorized, serverError} = require("../../utils/response.utils");

const CLINET_URL = process.env.CLIENT_URL || "http://localhost:3000";

function oauthCallback(req, res){
    try {
        setAuthCookies(req, res.user);
        res.redirect(`${CLIENT_URL/dashboard}`);
    }catch (err){
        console.error("[auth] OAuth callback error : ", err);
        res.redirect(`${CLIENT_URL}/login?error=oauth_failed`);
    }
}

async function refresh(req, res){
    try{
        const token = req.cookies?.refreshToken;
        if(!token){
            return unauthorized(res, "No refresh Token provided.");
        }

        const {accessToken, refreshToken } = await refreshAccessToken(token);

        const {ACCESS_COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS} = require("../../utils/jwt.utils");
        res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
        res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
        
        return ok(res, {accessToken}, "Token refreshed");
    }catch (err){
        return unauthorized(res, err.message || "Invalid or expired refresh token");
    }
}

function logout(req, res){
    clearAuthCookies(res);
    return ok(res,{}, "Logged out successfully");
}

function me(req, res){
    return ok(res, sanitizeUser(req.user), "Authenticated user");
}

module.exports = {oauthCallback, refresh, logout, me};