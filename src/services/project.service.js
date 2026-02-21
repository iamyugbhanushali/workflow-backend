const projectRepo = require('../repositories/project.repo');
const userRepo = require("../repositories/user.repo");



const createProject = async ({ name , description , userId}) => {
  return await projectRepo.createProject({ name , description , createdBy: userId,});
};

const getProjects = async (userId) => {
  return await projectRepo.getProjectsByUser(userId);
};

const getProjectById = async (projectId , userId) => {
  return await projectRepo.getProjectById(projectId , userId);
};

const addProjectMember = async (projectId, userIdToAdd, ownerId) => {
  const project = await projectService.checkProjectPermission(
  projectId,
  ownerId,
  ["ADMIN"]
);

  if (!project) {
    throw new Error("Unauthorized or project not found");
  }

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

const getProjectMembers = async (projectId, ownerId) => {
  const project = await projectRepo.findByIdAndUser(projectId, ownerId);

  if (!project) {
    throw new Error("Unauthorized or project not found");
  }

  return await projectRepo.getProjectMembers(projectId);
};

const updateMemberRole = async (
  projectId,
  memberId,
  role,
  ownerId
) => {
  const project = await projectRepo.findByIdAndUser(projectId, ownerId);

  if (!project) {
    throw new Error("Unauthorized or project not found");
  }

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

const checkProjectPermission = async (
  projectId,
  userId,
  allowedRoles = []
) => {
  // OWNER check
  const project = await projectRepo.findByIdAndUser(projectId, userId);

  if (project) return;

  // MEMBER role check
  const member = await projectRepo.getProjectMemberRole(
    projectId,
    userId
  );

  if (!member || !allowedRoles.includes(member.role)) {
    throw new Error("Forbidden: insufficient permissions");
  }
};


module.exports = {
  createProject,
  getProjects,
  getProjectById,
  addProjectMember,
  getProjectMembers,
  updateMemberRole,
  checkProjectPermission
};