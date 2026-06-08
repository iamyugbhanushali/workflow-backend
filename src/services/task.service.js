const taskRepo = require("../repositories/task.repo");
const projectService = require("./project.service");
const {
  assertProjectAccess,
  checkProjectPermission,
} = require("../utils/projectAccess");

const assertTaskProjectAccess = async (task, userId, roleId) => {
  await assertProjectAccess(task.project_id, userId, roleId);
};

const createTask = async ({
  title,
  description,
  priority,
  assigned_to,
  due_date,
  projectId,
  userId,
  roleId,
}) => {
  await projectService.checkProjectPermission(
    projectId,
    userId,
    ["ADMIN"],
    roleId
  );

  return await taskRepo.createTask({
    title,
    description,
    priority,
    assigned_to,
    due_date,
    projectId,
    userId,
  });
};

const getTasksByProject = async (projectId, userId, roleId) => {
  await assertProjectAccess(projectId, userId, roleId);

  return await taskRepo.getTasksByProject(projectId);
};

const ALLOWED_STATUS = ["todo", "in_progress", "completed", "blocked"];

const updateTaskStatus = async (taskId, status, userId, roleId) => {
  if (!ALLOWED_STATUS.includes(status)) {
    throw new Error("Invalid status value");
  }

  const task = await taskRepo.getTaskById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  try {
    await projectService.checkProjectPermission(
      task.project_id,
      userId,
      ["ADMIN"],
      roleId
    );
  } catch (err) {
    if (task.assigned_to !== userId) {
      throw new Error("Forbidden: insufficient permissions");
    }
  }

  const oldStatus = task.status;

  if (oldStatus === status) {
    return task;
  }

  const updatedTask = await taskRepo.updateTaskStatus(taskId, status);

  await taskRepo.createTaskAuditLog({
    taskId,
    userId,
    oldStatus,
    newStatus: status,
  });

  return updatedTask;
};

const getTaskAuditLogs = async (taskId, userId, roleId) => {
  const task = await taskRepo.getTaskById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  await assertTaskProjectAccess(task, userId, roleId);

  return await taskRepo.getTaskAuditLogs(taskId);
};

const userRepo = require("../repositories/user.repo");

const assignTask = async (taskId, assignedTo, userId, roleId) => {
  const task = await taskRepo.getTaskById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  await assertTaskProjectAccess(task, userId, roleId);

  const user = await userRepo.findUserById(assignedTo);

  if (!user) {
    throw new Error("User to assign not found");
  }

  const oldAssigned = task.assigned_to;

  if (oldAssigned === assignedTo) {
    return task;
  }

  const updatedTask = await taskRepo.updateTaskAssignee(taskId, assignedTo);

  await taskRepo.createTaskAssignmentLog({
    taskId,
    oldAssigned,
    newAssigned: assignedTo,
    changedBy: userId,
  });

  return updatedTask;
};

const getTaskAssignmentHistory = async (taskId, userId, roleId) => {
  const task = await taskRepo.getTaskById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  await assertTaskProjectAccess(task, userId, roleId);

  return await taskRepo.getTaskAssignmentHistory(taskId);
};

const getMyTasks = async (userId, filters) => {
  return await taskRepo.getTasksAssignedToUser(userId, filters);
};

const updateTask = async (taskId, updates, userId, roleId) => {
  const task = await taskRepo.getTaskById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  try {
    await projectService.checkProjectPermission(
      task.project_id,
      userId,
      ["ADMIN"],
      roleId
    );
  } catch (err) {
    if (task.assigned_to !== userId) {
      throw new Error("Forbidden: insufficient permissions");
    }
  }

  if (updates.status) {
    delete updates.status;
  }

  const allowedFields = [
    "title",
    "description",
    "priority",
    "due_date",
    "assigned_to",
  ];

  const filteredUpdates = {};

  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      filteredUpdates[key] = updates[key];
    }
  }

  if (Object.keys(filteredUpdates).length === 0) {
    throw new Error("No valid fields provided for update");
  }

  return await taskRepo.updateTask(taskId, filteredUpdates);
};

const deleteTask = async (taskId, userId, roleId) => {
  const task = await taskRepo.getTaskById(taskId);

  if (!task || task.is_deleted) {
    throw new Error("Task not found");
  }

  await assertTaskProjectAccess(task, userId, roleId);

  await taskRepo.softDeleteTask(taskId);
};

module.exports = {
  createTask,
  getTasksByProject,
  updateTaskStatus,
  getTaskAuditLogs,
  assignTask,
  getTaskAssignmentHistory,
  getMyTasks,
  updateTask,
  deleteTask,
};
