const prisma = require("../../config/db");
const {
    issueTokenPair,
    verifyRefreshToken,
    ACCESS_COOKIE_OPTIONS,
    REFRESH_COOKIE_OPTIONS,
} = require("../../utils/jwt.utils");

function setAuthCookies(res, user){
    const {accessToken, refreshToken} = issueTokenPair(user);
    res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
    return { accessToken, refreshToken};
}


function clearAuthCookies(res){
    res.clearCookie("accessToken", {path: "/"});
    res.clearCookie("refreshToken", {path: "/"});
}

async function refreshAccessToken(refreshToken){
    const decoded = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
        where: {id: decoded.id},
        select: {id: true, email: true, role: true},
    });

    if(!user){
        throw new Error("user no longer exits.");
    }

    return issueTokenPair(user);
}

function sanitizeUser(user){
    const{githubToken, googleId, githubId, ...safe} = user;
    return safe;
}

module.exports = {
    setAuthCookies,
    clearAuthCookies,
    refreshAccessToken,
    sanitizeUser
};