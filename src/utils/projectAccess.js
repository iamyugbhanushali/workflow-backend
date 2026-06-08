const projectRepo = require("../repositories/project.repo");
const { isSystemAdmin } = require("../constants/roleConstants");

const getProjectForUser = async (projectId, userId, roleId) => {
  if (isSystemAdmin(roleId)) {
    return await projectRepo.findById(projectId);
  }

  return await projectRepo.findByIdAndUser(projectId, userId);
};

const assertProjectAccess = async (projectId, userId, roleId) => {
  const project = await getProjectForUser(projectId, userId, roleId);

  if (!project) {
    throw new Error("Unauthorized or project not found");
  }

  return project;
};

const checkProjectPermission = async (
  projectId,
  userId,
  allowedRoles = [],
  roleId
) => {
  if (isSystemAdmin(roleId)) {
    return;
  }

  const project = await projectRepo.findByIdAndUser(projectId, userId);

  if (project) {
    return;
  }

  const member = await projectRepo.getProjectMemberRole(projectId, userId);

  if (!member || !allowedRoles.includes(member.role)) {
    throw new Error("Forbidden: insufficient permissions");
  }
};

module.exports = {
  getProjectForUser,
  assertProjectAccess,
  checkProjectPermission,
};
