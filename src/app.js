const express = require("express");
const app = express();
const authMiddleware = require("./middleware/auth.middleware");
const projectRoutes = require("./routes/project.routes");
const taskRoutes = require("./routes/task.routes");




app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require("./routes/auth.routes");
app.use("/api", taskRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user,
  });
});
module.exports = app;