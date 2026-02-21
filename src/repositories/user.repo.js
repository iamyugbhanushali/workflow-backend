const pool = require("../config/db");

const findByEmail = async (email) => {
  const result = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0];
};

const createUser = async ({ name, email, passwordHash, roleId }) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role_id`,
    [name, email, passwordHash, roleId]
  );

  return result.rows[0];
};

const findUserWithPasswordByEmail = async (email) => {
  const result = await pool.query(
    `SELECT id, name, email, password_hash, role_id
     FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0];
};

const findUserById = async (id) => {
  const { rows } = await pool.query(
    `SELECT id, name, email, role_id
     FROM users
     WHERE id = $1`,
    [id]
  );

  return rows[0];
};

module.exports = { findByEmail, createUser ,findUserWithPasswordByEmail, findUserById};