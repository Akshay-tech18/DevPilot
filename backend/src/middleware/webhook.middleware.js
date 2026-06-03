//verify X-Hub-Signature-256
const prisma = require("../config/db");
const { verifyGitubSignature } = require("../utils/crypto.utils");
const { fail, unauthorized } = require("../utils/response.utils");

async function verifyGitHubWebhook(req, res, next){
    try{
        const signature = req.headers["x-hub-signature-256"];
        const event = req.header["x-github-event"];

        if(!signature) {
            return unauthorized(res, "Missing X-Hub-signature-256 header");
        }

        if(!event){
            return fail(res,"missing x-github-event header", 400);
        }

        const rawBody = req.body;
        if(!Buffer.isBuffer(rawBody)){
            return fail(res, " webhook body must be raw. check middleware order in app js", 400);
        }

        let payload;
        try{
            payload = JSON.parse(rawBody.toString("utf8"));
        }catch {
            return fail(res, "Invalid JSON in webhook payload", 400);
        }

        const githubRepoId = string(payload?.repository?.id);
        if(!githubRepoId){
            return fail(res, "Could not extract repo id from the webhook payload", 400);
        }

        const repo = await prisma.repository.findUnique({
            where: {githubRepoId},
            select: {id:true, webhookSecret: true, projectId:true},
        });

        if(!repo){
            return fail(res, `Repo ${githubRepoId} not registered in DEvPilot.`,404);
        }

        const valid = verfiyGitHubSignature(rawBody, signature, repo.webhookSecret);
        if(!valid){
            return unauthorized(res,"Webhook signature verification failed");
        }

        req.webhookEvent = event;
        req.webhookPayload = payload;
        req.webhookRepo = repo;
        next();
    }catch (err){
        console.error("[Webhook middleware]", err);
        next(err);
    }
}

module.exports = {verifyGitHubWebhook};