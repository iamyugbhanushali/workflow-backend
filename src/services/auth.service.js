const bcrypt = require("bcrypt");
const userRepo = require("../repositories/user.repo");
const jwtUtil = require("../utils/jwt");

const registerUser = async ({ name, email, password }) => {
  const existingUser = await userRepo.findByEmail(email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userRepo.createUser({
    name,
    email,
    passwordHash: hashedPassword,
    roleId: 3, // employee
  });

  return user;
};

const loginUser = async ({ email, password }) => {
  const user = await userRepo.findUserWithPasswordByEmail(email);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = jwtUtil.generateToken({
    id: user.id,
    role_id: user.role_id,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role_id: user.role_id,
    },
  };
};

module.exports = { registerUser, loginUser };