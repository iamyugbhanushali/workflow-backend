const pool = require("../config/db");

const createTask = async ({
  title,
  description,
  priority,
  assigned_to,
  due_date,
  projectId,
  userId,
}) => {
  const result = await pool.query(
    `INSERT INTO tasks 
      (title, description, priority, assigned_to, due_date, project_id, created_by, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'todo')
     RETURNING id, title, description, status, priority, assigned_to, due_date, created_at`,
    [
      title,
      description,
      priority,
      assigned_to || null,
      due_date || null,
      projectId,
      userId,
    ]
  );

  return result.rows[0];
};

const getTasksByProject = async (projectId) => {
  const query = `
    SELECT *
    FROM tasks
    WHERE project_id = $1
      AND is_deleted = FALSE
    ORDER BY created_at DESC
  `;

  const { rows } = await pool.query(query, [projectId]);
  return rows;
};

const getTaskById = async (taskId) => {
  const { rows } = await pool.query(
    `SELECT *
     FROM tasks
     WHERE id = $1
       AND is_deleted = FALSE`,
    [taskId]
  );
  return rows[0];
};

const updateTaskStatus = async (taskId, status) => {
  const { rows } = await pool.query(
    `UPDATE tasks
     SET status = $1
     WHERE id = $2
       AND is_deleted = FALSE
     RETURNING *`,
    [status, taskId]
  );

  return rows[0];
};

const createTaskAuditLog = async ({
  taskId,
  userId,
  oldStatus,
  newStatus,
}) => {
  await pool.query(
    `INSERT INTO task_audit_logs
     (task_id, changed_by, old_status, new_status)
     VALUES ($1, $2, $3, $4)`,
    [taskId, userId, oldStatus, newStatus]
  );
};

const getTaskAuditLogs = async (taskId) => {
  const query = `
    SELECT 
      tal.id,
      tal.old_status,
      tal.new_status,
      tal.changed_by,
      u.name AS changed_by_name,
      tal.changed_at
    FROM task_audit_logs tal
    JOIN users u ON u.id = tal.changed_by
    WHERE tal.task_id = $1
    ORDER BY tal.changed_at DESC
  `;

  const { rows } = await pool.query(query, [taskId]);
  return rows;
};

const updateTaskAssignee = async (taskId, assignedTo) => {
  const { rows } = await pool.query(
    `UPDATE tasks
     SET assigned_to = $1
     WHERE id = $2
       AND is_deleted = FALSE
     RETURNING *`,
    [assignedTo, taskId]
  );

  return rows[0];
};

const createTaskAssignmentLog = async ({
  taskId,
  oldAssigned,
  newAssigned,
  changedBy,
}) => {
  await pool.query(
    `INSERT INTO task_assignment_logs
     (task_id, old_assigned_to, new_assigned_to, changed_by)
     VALUES ($1, $2, $3, $4)`,
    [taskId, oldAssigned, newAssigned, changedBy]
  );
};

const getTaskAssignmentHistory = async (taskId) => {
  const query = `
    SELECT 
      tal.id,
      tal.old_assigned_to,
      old_user.name AS old_assigned_name,
      tal.new_assigned_to,
      new_user.name AS new_assigned_name,
      actor.name AS changed_by_name,
      tal.changed_at
    FROM task_assignment_logs tal
    LEFT JOIN users old_user ON old_user.id = tal.old_assigned_to
    JOIN users new_user ON new_user.id = tal.new_assigned_to
    JOIN users actor ON actor.id = tal.changed_by
    WHERE tal.task_id = $1
    ORDER BY tal.changed_at DESC
  `;

  const { rows } = await pool.query(query, [taskId]);
  return rows;
};

const getTasksAssignedToUser = async (userId, filters) => {
  let baseQuery = `
    SELECT 
      t.id,
      t.title,
      t.description,
      t.status,
      t.priority,
      t.due_date,
      t.created_at,
      p.id AS project_id,
      p.name AS project_name
    FROM tasks t
    JOIN projects p ON p.id = t.project_id
    WHERE t.assigned_to = $1
      AND t.is_deleted = FALSE
  `;

  const values = [userId];
  let index = 2;

  if (filters.status) {
    baseQuery += ` AND t.status = $${index++}`;
    values.push(filters.status);
  }

  if (filters.priority) {
    baseQuery += ` AND t.priority = $${index++}`;
    values.push(filters.priority);
  }

  if (filters.projectId) {
    baseQuery += ` AND t.project_id = $${index++}`;
    values.push(filters.projectId);
  }

  if (filters.dueBefore) {
    baseQuery += ` AND t.due_date <= $${index++}`;
    values.push(filters.dueBefore);
  }

  baseQuery += `
    ORDER BY t.due_date ASC NULLS LAST,
             t.created_at DESC
  `;

  const { rows } = await pool.query(baseQuery, values);
  return rows;
};

const updateTask = async (taskId, updates) => {
  const fields = [];
  const values = [];
  let index = 1;

  for (const key in updates) {
    fields.push(`${key} = $${index}`);
    values.push(updates[key]);
    index++;
  }

  values.push(taskId);

  const query = `
    UPDATE tasks
    SET ${fields.join(", ")}
    WHERE id = $${index}
      AND is_deleted = FALSE
    RETURNING id, title, description, status, priority, assigned_to, due_date, created_at, project_id
  `;

  const { rows } = await pool.query(query, values);
  return rows[0];
};

const softDeleteTask = async (taskId) => {
  await pool.query(
    `UPDATE tasks
     SET is_deleted = TRUE
     WHERE id = $1`,
    [taskId]
  );
};

module.exports = {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTaskStatus,
  createTaskAuditLog,
  getTaskAuditLogs,
  updateTaskAssignee,
  createTaskAssignmentLog,
  getTaskAssignmentHistory,
  getTasksAssignedToUser,
  updateTask,
  softDeleteTask,
};