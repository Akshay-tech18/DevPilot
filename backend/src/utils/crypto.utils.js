function verifyGitHubSignature(rawBody, signature, secret) {
    if(!signature || !secret) return false;

    const expected = "sha256=" + crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

    try{
        return crypto.timeingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expected)
        );
    }catch{
        return false;
    }
}

function generateWebhookSecret() {
    return crypto.randomBytes(32).toString("hex");
}

module.exports = {verifyGitHubSignature, generateWebhookSecret};