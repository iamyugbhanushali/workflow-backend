const pool = require('../config/db');

const createProject = async ({name , description , createdBy}) => {
   const result = await pool.query(
    `INSERT INTO projects (name, description, created_by)
     VALUES ($1, $2, $3)
     RETURNING id, name, description, created_by, created_at`,
    [name, description || null, createdBy]
   );
    return result.rows[0];
};

const getProjectsByUser = async (userId) => {
  const result = await pool.query(
    `SELECT id, name, description, created_at
     FROM projects
     WHERE created_by = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return result.rows;
};

const getProjectById = async (projectId, userId) => {
  const result = await pool.query(
    `SELECT id, name, description, created_at
     FROM projects
     WHERE id = $1 AND created_by = $2`,
    [projectId, userId]
  );

  return result.rows[0];
};

const findByIdAndUser = async (projectId, userId) => {
  const query = `
    SELECT * FROM projects
    WHERE id = $1 AND created_by = $2
  `;

  const { rows } = await pool.query(query, [projectId, userId]);
  return rows[0];
};

const addProjectMember = async (projectId, userId) => {
  await pool.query(
    `INSERT INTO project_members (project_id, user_id)
     VALUES ($1, $2)`,
    [projectId, userId]
  );
};

const getProjectMember = async (projectId, userId) => {
  const { rows } = await pool.query(
    `SELECT *
     FROM project_members
     WHERE project_id = $1
       AND user_id = $2`,
    [projectId, userId]
  );

  return rows[0];
};

const getProjectMembers = async (projectId) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email
     FROM project_members pm
     JOIN users u ON u.id = pm.user_id
     WHERE pm.project_id = $1
     ORDER BY pm.added_at DESC`,
    [projectId]
  );

  return rows;
};

const updateMemberRole = async (projectId, userId, role) => {
  await pool.query(
    `UPDATE project_members
     SET role = $1
     WHERE project_id = $2
       AND user_id = $3`,
    [role, projectId, userId]
  );
};

const getProjectMemberRole = async (projectId, userId) => {
  const { rows } = await pool.query(
    `SELECT role
     FROM project_members
     WHERE project_id = $1
       AND user_id = $2`,
    [projectId, userId]
  );

  return rows[0];
};

const removeProjectMember = async (projectId, userId) => {
  await pool.query(
    `DELETE FROM project_members
     WHERE project_id = $1
       AND user_id = $2`,
    [projectId, userId]
  );
};

const getProjectStats = async (projectId) => {

  const { rows } = await pool.query(
    `
    SELECT
      COUNT(*)::int AS total,

      COUNT(*) FILTER (WHERE status = 'todo')::int AS todo,

      COUNT(*) FILTER (WHERE status = 'in_progress')::int AS in_progress,

      COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,

      COUNT(*) FILTER (WHERE status = 'blocked')::int AS blocked,

      COUNT(*) FILTER (
        WHERE due_date < CURRENT_DATE
        AND status != 'completed'
      )::int AS overdue

    FROM tasks
    WHERE project_id = $1
      AND is_deleted = FALSE
    `,
    [projectId]
  );

  return rows[0];
};

const getProjectActivity = async (projectId) => {

  const { rows } = await pool.query(
    `
    SELECT * FROM (

      -- STATUS CHANGES
      SELECT
        'STATUS_CHANGE' AS type,
        t.id AS task_id,
        t.title AS task_title,
        tal.old_status,
        tal.new_status,
        u.name AS changed_by,
        tal.changed_at

      FROM task_audit_logs tal
      JOIN tasks t ON t.id = tal.task_id
      JOIN users u ON u.id = tal.changed_by

      WHERE t.project_id = $1


      UNION ALL


      -- ASSIGNMENT CHANGES
      SELECT
        'ASSIGNMENT_CHANGE' AS type,
        t.id AS task_id,
        t.title AS task_title,
        old_user.name AS old_status,
        new_user.name AS new_status,
        actor.name AS changed_by,
        tal.changed_at

      FROM task_assignment_logs tal
      JOIN tasks t ON t.id = tal.task_id
      LEFT JOIN users old_user ON old_user.id = tal.old_assigned_to
      JOIN users new_user ON new_user.id = tal.new_assigned_to
      JOIN users actor ON actor.id = tal.changed_by

      WHERE t.project_id = $1

    ) AS activity

    ORDER BY changed_at DESC
    `,
    [projectId]
  );

  return rows;
};

module.exports = {
  createProject,
  getProjectsByUser,
  getProjectById,
  findByIdAndUser,
  addProjectMember,
  getProjectMember,
  getProjectMembers,
  updateMemberRole,
  getProjectMemberRole,
  removeProjectMember,
  getProjectStats,
  getProjectActivity
};