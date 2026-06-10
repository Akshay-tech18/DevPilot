const { z } = require("zod");

const createSprintSchema = z.object({
    name: z.string().min(2).max(100),
    goal: z.string().max(500).optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    status: z.enum(["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
}).refine((d) => new Date(d.endDate) > new Date(d.startDate), {
    message: "endDate must be after startDate",
    path: ["endDate"],
});

const updateSprintSchema = createSprintSchema.partial();

module.exports = {createSprintSchema, updateSprintSchema};