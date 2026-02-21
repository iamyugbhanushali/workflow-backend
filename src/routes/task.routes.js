const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post(
  "/projects/:projectId/tasks",
  authMiddleware,
  taskController.createTask
);

router.get(
  "/projects/:projectId/tasks",
  authMiddleware,
  taskController.getTasksByProject
);

router.patch("/tasks/:taskId/status", authMiddleware, taskController.updateTaskStatus);

router.get("/tasks/:taskId/audit-logs", authMiddleware, taskController.getTaskAuditLogs);

router.patch(
  "/tasks/:taskId/assign",
  authMiddleware,
  taskController.assignTask
);

router.get(
  "/tasks/:taskId/assignment-history",
  authMiddleware,
  taskController.getTaskAssignmentHistory
);

router.get(
  "/tasks/me",
  authMiddleware,
  taskController.getMyTasks
);

router.patch(
  "/tasks/:taskId",
  authMiddleware,
  taskController.updateTask
);

router.delete(
  "/tasks/:taskId",
  authMiddleware,
  taskController.deleteTask
);


module.exports = router;