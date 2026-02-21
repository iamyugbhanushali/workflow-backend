const taskRepo = require("../repositories/task.repo");
const projectRepo = require("../repositories/project.repo");
const projectService = require("./project.service");

const createTask = async ({
  title,
  description,
  priority,
  assigned_to,
  due_date,
  projectId,
  userId,
}) => {

  await projectService.checkProjectPermission(
    projectId,
    userId,
    ["ADMIN"]
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

const getTasksByProject = async (projectId, userId) => {
  // 1️⃣ verify project belongs to user
  const project = await projectRepo.findByIdAndUser(projectId, userId);
  
  if (!project) {
    throw new Error("Unauthorized or project not found");
  }

  // 2️⃣ fetch tasks
  return await taskRepo.getTasksByProject(projectId);
};

const ALLOWED_STATUS = ["todo", "in_progress", "completed", "blocked"];

const updateTaskStatus = async (taskId, status, userId) => {

  if (!ALLOWED_STATUS.includes(status)) {
    throw new Error("Invalid status value");
  }

  const task = await taskRepo.getTaskById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  // 🔐 RBAC CHECK
  try {
    // OWNER or ADMIN → allowed
    await projectService.checkProjectPermission(
      task.project_id,
      userId,
      ["ADMIN"]
    );
  } catch (err) {

    // MEMBER → allowed only if task is assigned to them
    if (task.assigned_to !== userId) {
      throw new Error("Forbidden: insufficient permissions");
    }

  }

  const oldStatus = task.status;

  // 🧠 idempotent behaviour (unchanged)
  if (oldStatus === status) {
    return task;
  }

  const updatedTask = await taskRepo.updateTaskStatus(taskId, status);

  // 🧾 audit log (unchanged)
  await taskRepo.createTaskAuditLog({
    taskId,
    userId,
    oldStatus,
    newStatus: status,
  });

  return updatedTask;
};

const getTaskAuditLogs = async (taskId, userId) => {
  const task = await taskRepo.getTaskById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  // verify ownership via project
  const project = await projectRepo.findByIdAndUser(
    task.project_id,
    userId
  );

  if (!project) {
    throw new Error("Unauthorized");
  }

  return await taskRepo.getTaskAuditLogs(taskId);
};

const userRepo = require("../repositories/user.repo");

const assignTask = async (taskId, assignedTo, userId) => {
  const task = await taskRepo.getTaskById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  const project = await projectRepo.findByIdAndUser(
    task.project_id,
    userId
  );

  if (!project) {
    throw new Error("Unauthorized");
  }

  const user = await userRepo.findUserById(assignedTo);

  if (!user) {
    throw new Error("User to assign not found");
  }

  const oldAssigned = task.assigned_to;

  if (oldAssigned === assignedTo) {
    return task;
  }

  const updatedTask = await taskRepo.updateTaskAssignee(
    taskId,
    assignedTo
  );

  await taskRepo.createTaskAssignmentLog({
    taskId,
    oldAssigned,
    newAssigned: assignedTo,
    changedBy: userId,
  });

  return updatedTask;
};

const getTaskAssignmentHistory = async (taskId, userId) => {
  const task = await taskRepo.getTaskById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  const project = await projectRepo.findByIdAndUser(
    task.project_id,
    userId
  );

  if (!project) {
    throw new Error("Unauthorized");
  }

  return await taskRepo.getTaskAssignmentHistory(taskId);
};

const getMyTasks = async (userId, filters) => {
  return await taskRepo.getTasksAssignedToUser(userId, filters);
};


const updateTask = async (taskId, updates, userId) => {

  const task = await taskRepo.getTaskById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  // 🔐 RBAC CHECK
  try {
    // OWNER or ADMIN can update any task
    await projectService.checkProjectPermission(
      task.project_id,
      userId,
      ["ADMIN"]
    );
  } catch (err) {

    // If not OWNER/ADMIN → allow only if task is assigned to the user
    if (task.assigned_to !== userId) {
      throw new Error("Forbidden: insufficient permissions");
    }

  }

  // prevent status update from this endpoint
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

const deleteTask = async (taskId, userId) => {
  const task = await taskRepo.getTaskById(taskId);

  if (!task || task.is_deleted) {
    throw new Error("Task not found");
  }

  const project = await projectRepo.findByIdAndUser(
    task.project_id,
    userId
  );

  if (!project) {
    throw new Error("Unauthorized");
  }

  await taskRepo.softDeleteTask(taskId);
};

module.exports = { createTask , getTasksByProject, updateTaskStatus, getTaskAuditLogs, assignTask, getTaskAssignmentHistory, getMyTasks , updateTask , deleteTask};