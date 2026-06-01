const jwt = require("jsonwebtoken");

const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXP = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_EXP = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

function signAccessToken(payload){
    return jwt.sign(payload, ACCESS_SECRET, {expiresIn: ACCESS_EXP});
}

function signRefreshToken(payload){
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXP});
}

function verifyAccessToken(token){
    return jwt.verify(token, ACCESS_SECRET);
}

function verifyRefreshToken(token){
    return jwt.verify(token, REFRESH_SECRET);
}

function issueTokenPair(user){
    const payload = {id: user.id, email:user.email, role:user.role};
    return {
        accessToken: signAccessToken(payload),
        refreshToken: signRefreshToken(payload),
    };
}

const COOKIE_OPTIONS = {
    httponly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
};

const ACCESS_COOKIE_OPTIONS = {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000,
};

const REFRESH_COOKIE_OPTIONS = {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

module.exports = {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    issueTokenPair,
    ACCESS_COOKIE_OPTIONS,
    REFRESH_COOKIE_OPTIONS,
};
