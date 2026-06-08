const ROLE_ADMIN = 1;
const ROLE_MANAGER = 2;
const ROLE_EMPLOYEE = 3;

const isSystemAdmin = (roleId) => roleId === ROLE_ADMIN;

module.exports = {
  ROLE_ADMIN,
  ROLE_MANAGER,
  ROLE_EMPLOYEE,
  isSystemAdmin,
};
