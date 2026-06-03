const { z } = require("zod");

const createProjectSchema = z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(500).option(),
    deadline: z.string().datetime().optional(),
    status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]).optional(),
});

const updateProjectSchema = createProjectSchema.partial();

const addMemberSchema = z.object({
    userId: z.string().uuid(),
    role: z.enum(["MANAGER", "DEVELOPER", "QA_TESTER", "VIEWER"]),
});

module.exports = {createProjectSchema, updateProjectSchema, addMemberSchema};