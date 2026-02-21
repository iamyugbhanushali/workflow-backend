const taskService = require("../services/task.service");


const createTask = async (req, res) => {
  console.log("BODY:", req.body);
  try {
    const { title, description, priority, assigned_to, due_date } = req.body;
    const { projectId } = req.params;
    const userId = req.user.id;

    if (!title || !priority) {
      return res.status(400).json({
        message: "Title and priority are required",
      });
    }

    const task = await taskService.createTask({
      title,
      description,
      priority,
      assigned_to,
      due_date,
      projectId,
      userId,
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTasksByProject = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  try {
    const tasks = await taskService.getTasksByProject(projectId, userId);

    res.json({
      message: "Tasks fetched successfully",
      tasks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const updatedTask = await taskService.updateTaskStatus(
      taskId,
      status,
      userId
    );

    res.json({
      message: "Task status updated successfully",
      task: updatedTask,
    });
  } catch (err) {
    if (
      err.message.includes("not found") ||
      err.message.includes("Unauthorized") ||
      err.message.includes("Invalid status")
    ) {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: err.message });
  }
};

const getTaskAuditLogs = async (req , res) => {
  try {
    const {taskId} = req.params;
    const userId = req.user.id;

    const logs = await taskService.getTaskAuditLogs(taskId , userId);

    res.json({
      message : "Audit logs fetched successfully",
      logs
    });
  }
  catch(err){
    if (
      err.message.includes("not found") ||
      err.message.includes("Unauthorized")
    ) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

const assignTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { assigned_to } = req.body;
    const userId = req.user.id;

    if (!assigned_to) {
      return res.status(400).json({
        message: "assigned_to is required",
      });
    }

    const task = await taskService.assignTask(
      taskId,
      assigned_to,
      userId
    );

    res.json({
      message: "Task assigned successfully",
      task,
    });
  } catch (err) {
    if (
      err.message.includes("not found") ||
      err.message.includes("Unauthorized")
    ) {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: err.message });
  }
};

const getTaskAssignmentHistory = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const history = await taskService.getTaskAssignmentHistory(
      taskId,
      userId
    );

    res.json({
      message: "Assignment history fetched successfully",
      history,
    });
  } catch (err) {
    if (
      err.message.includes("not found") ||
      err.message.includes("Unauthorized")
    ) {
      return res.status(404).json({ message: err.message });
    }

    res.status(500).json({ message: err.message });
  }
};

const getMyTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      dueBefore: req.query.dueBefore,
      projectId: req.query.projectId,
    };

    const tasks = await taskService.getMyTasks(userId, filters);

    res.json({
      message: "My tasks fetched successfully",
      tasks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const updatedTask = await taskService.updateTask(
      taskId,
      req.body,
      userId
    );

    res.json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (err) {
    if (
      err.message.includes("not found") ||
      err.message.includes("Unauthorized") ||
      err.message.includes("No valid fields")
    ) {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: "Server error" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    await taskService.deleteTask(taskId, userId);

    res.json({
      message: "Task deleted successfully",
    });
  } catch (err) {
    if (
      err.message.includes("not found") ||
      err.message.includes("Unauthorized")
    ) {
      return res.status(404).json({ message: err.message });
    }

    res.status(500).json({ message: "Server error" });
  }
};


module.exports = { createTask, getTasksByProject, updateTaskStatus, getTaskAuditLogs, assignTask, getTaskAssignmentHistory, getMyTasks , updateTask, deleteTask};