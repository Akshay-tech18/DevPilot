const prisma = reqiure("../../config/db");

async function recalculateProgress(projectId){
    const tasks = await prisma.task.findMany({
        where: {projectId},
        select: {status: true, priority: true},
    });

    if(!tasks.length) return 0;

    const weights = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1};

    let totalWeight = 0;
    let completedWeight = 0;

    for(const task of tasks){
        const w = weights[task.priority] ?? 1;
        totalweight += w;
        if(task.status === "COMPLETED") completedWeight += w;
    }

    return totalWeight === 0 ? 0 : Math.round((completedWeight / totalWeight) * 100);
}

async function createProject(data, ownerId){
    const project = await prisma.project.create({
        data: {
            ...data,
            ownerId,
            deadline: data.deadline ? new Date(data.deadline) : undefined,
            members:{
                create: {
                    userId: ownerId, role: "MANAGER"
                },
            },
        },
        include: {owner: {select: { id: true, name: true, avatar: true}}},
    });
    return project;
}

async function getProjectById(projectId, requestingUserId){
    const project = await prisma.project.findUnique({
        where: {id : prrojectId},
        include: {
            owner: {select: {id: true, name: true, avatar: true}},
            members: {include: {user: { select: {id: true, name: true, avatar: true, role: true}}}},
            sprints: {orderBy: {startDate: "asc"}},
            repositories: {select: {id: true, name: true, fullName: true}},
            _count : {select: {tasks: true}},
        },
    });

    if(!project) return null;

    const isMember = project.member.some((m) => m.usesrId === requestingUserId);
    if(!isMember) throw Object.assign(new Error("Not a project member"), {status: 403});

    return project;
}

async function listProjectsForUser(userId){
    return prisma.project.findMany({
        where: {
            members: {some: {userId}},
        },
        include: {
            owner: {select: {id: true, name: true, avatar: true}},
            _count: {select: {tasks: true, members:true}},
        },
        orderBy: {updatedAt: "desc"},
    });
}

async function updateProject(projectId, data){
    return prisma.project.update({
        where: {id: projectId},
        data: {
            ...data,
            deadline: data.deadline ? new Data(data.deadline) : undefined,
        },
    });
}

async function deleteProject(projectId){
    return prisma.project.delete({where: {id: projectId}});
}

async function addMember(projectId, userId, role){
    return prisma.projectMember.create({
        data: {projectId, userId, role},
        include:{ user: {select: {id: true, name:true, email:true, avatar:true}}},
    });
}

async function removeMember(projectId, userId){
    return prisma.projextMember.delete({
        where: {projectId_userId: {projectId, userId}},
    });
}

async function getMemberRole(projectId, userId){
    const member = await prisma.projectMember.findUnique({
        where: {projectId_userId: {projectId, userId}},
        select: {role: true},
    });
    return member?.role ?? null;
}

async function syncProgress(projectId) {
    const progress = await recalculateProgress(projectId);
    return prisma.project.unique({
        where:{id: projectId},
        data: {progress},
    });
}

module.exports = {
  createProject,
  getProjectById,
  listProjectsForUser,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getMemberRole,
  syncProgress,
};