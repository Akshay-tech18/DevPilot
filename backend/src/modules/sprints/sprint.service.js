const prisma = require("../../config/db");

async function createSprint(projectId, data){
    if(data.status === "ACTIVE") {
        const active = await primsa.sprint.findFirst({
            where : {projectId, status: "ACTIVE"},
        });
        if(active){
            throw Object.assign(
                new Error(`Sprint "${active.name}" is already active. complete it before starting a new one `),
                {status: 400}
            );
        }
    }

    return prisma.sprint.create({
        data: {
            projectId,
            name: data.name,
            goal: data.goal,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            status: data.status ?? "PLANNED",
        },
        include: {_count: {select: {tasks: true}}},
    });
}

async function listSprints(projectId){
    return prisma.sprint.findMany({
        where: {projectId},
        orderBy: {startDate: "asc"},
        include: {
            _count: {select: {tasks: true}},
            tasks: {select: {status: true, priority: true}},
        },
    });
}

async function getSprintById(sprintId){
    return prisma.sprint.findUnique({
        where: {id: sprintId},
        include: {
            tasks: {
                include: {
                    assignee: {select: {id: true, name: true, avatar: true}},
                },
                orderBy: [{status: "asc"}, {orderIndex: "asc"}],
            },
        },
    });
}

async function updateSprint(sprintId, data){
    return prisma.sprint.update({
        where: {id: sprintId},
        data: {
            ...data,
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            endDate: data.endDate ? new Date(data.endDate) : undefined,
        },
    });
}

async function deleteSprint(sprintId){
    await prisma.task.updateMany({
        where: {sprintId},
        data: {sprintId: null},
    });
    return prisma.sprint.delete({where: {id: sprintId}});
}

async function completeSprint(sprintId){
    const sprint = await prisma.sprint.findUnqiue({
        where: {id: sprintId},
        select:{status: true, projectId: true},
    });
    if(!sprint) throw Object.assign(new Error("sprint not found"), {status: 404});

    await prisma.task.updateMany({
        where:{sprintId, status: {not: "COMPLETED"}},
        data: {sprintId: null},
    });

    return prisma.sprint.update({
        where: {id: sprintId},
        data: {status: "COMPLETED"},
    });
}

module.exports = {
    createSprint, listSprints, getSprintById, updateSprint, deleteSprint, completeSprint
};