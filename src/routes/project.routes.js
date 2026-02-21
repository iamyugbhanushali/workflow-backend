const express = require('express');
const router = express.Router();
const projectController = require("../controllers/project.controller");
const authMiddleware = require('../middleware/auth.middleware');

//Protected Route

router.post("/", authMiddleware, projectController.createProject);

router.get("/", authMiddleware, projectController.getProjects);
router.get("/:id",authMiddleware, projectController.getProjectById);

router.post(
  "/:projectId/members",
  authMiddleware,
  projectController.addProjectMember
);

router.get(
  "/:projectId/members",
  authMiddleware,
  projectController.getProjectMembers
);

router.patch(
  "/:projectId/members/:memberId/role",
  authMiddleware,
  projectController.updateMemberRole
);

router.delete(
  "/:projectId/members/:memberId",
  authMiddleware,
  projectController.removeProjectMember
);

router.get(
  "/:projectId/stats",
  authMiddleware,
  projectController.getProjectStats
);

module.exports = router;