const projectRepo = require("../repositories/project.repo");
const userRepo = require("../repositories/user.repo");
const { isSystemAdmin } = require("../constants/roleConstants");
const {
  getProjectForUser,
  assertProjectAccess,
  checkProjectPermission,
} = require("../utils/projectAccess");

const createProject = async ({ name, description, userId }) => {
  return await projectRepo.createProject({
    name,
    description,
    createdBy: userId,
  });
};

const getProjects = async (userId, roleId) => {
  if (isSystemAdmin(roleId)) {
    return await projectRepo.getAllProjects();
  }

  return await projectRepo.getProjectsByUser(userId);
};

const getProjectById = async (projectId, userId, roleId) => {
  return await getProjectForUser(projectId, userId, roleId);
};

const addProjectMember = async (projectId, userIdToAdd, actorId, roleId) => {
  await checkProjectPermission(projectId, actorId, ["ADMIN"], roleId);

  const user = await userRepo.findUserById(userIdToAdd);

  if (!user) {
    throw new Error("User not found");
  }

  const existingMember = await projectRepo.getProjectMember(
    projectId,
    userIdToAdd
  );

  if (existingMember) {
    throw new Error("User is already a member of this project");
  }

  await projectRepo.addProjectMember(projectId, userIdToAdd);
};

const getProjectMembers = async (projectId, userId, roleId) => {
  await assertProjectAccess(projectId, userId, roleId);

  return await projectRepo.getProjectMembers(projectId);
};

const updateMemberRole = async (projectId, memberId, role, actorId, roleId) => {
  await assertProjectAccess(projectId, actorId, roleId);

  const allowedRoles = ["ADMIN", "MEMBER"];

  if (!allowedRoles.includes(role)) {
    throw new Error("Invalid role");
  }

  const member = await projectRepo.getProjectMember(projectId, memberId);

  if (!member) {
    throw new Error("Member not found in this project");
  }

  await projectRepo.updateMemberRole(projectId, memberId, role);
};

const removeProjectMember = async (projectId, memberId, actorId, roleId) => {
  await assertProjectAccess(projectId, actorId, roleId);

  const member = await projectRepo.getProjectMember(projectId, memberId);

  if (!member) {
    throw new Error("Member not found in this project");
  }

  await projectRepo.removeProjectMember(projectId, memberId);
};

const getProjectStats = async (projectId, userId, roleId) => {
  await checkProjectPermission(projectId, userId, ["ADMIN", "MEMBER"], roleId);

  return await projectRepo.getProjectStats(projectId);
};

const getProjectActivity = async (projectId, userId, roleId) => {
  await checkProjectPermission(projectId, userId, ["ADMIN", "MEMBER"], roleId);

  return await projectRepo.getProjectActivity(projectId);
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  addProjectMember,
  getProjectMembers,
  updateMemberRole,
  checkProjectPermission,
  removeProjectMember,
  getProjectStats,
  getProjectActivity,
};
