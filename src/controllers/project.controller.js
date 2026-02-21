const projectService = require("../services/project.service");

const createProject = async (req , res) => {
  try {
    const {name , description} = req.body;
    if(!name) {
      return res.status(400).json({ message: "Project name is required" });
    }
    const project = await projectService.createProject({
      name,
      description,
      userId: req.user.id,
    });
    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (err) {    res.status(500).json({
      message: "Error creating project",
      error: err.message, 
    });
  }
};

const getProjects = async (req , res) => {
  try {
    const projects = await projectService.getProjects(req.user.id);
    res.json({
      message: "Projects retrieved successfully",
      projects,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving projects",
      error: err.message,
    });
  }
}

const getProjectById = async(req,res) => {
  try{
    const projectId = req.params.id;
    const userId = req.user.id;

    const project = await projectService.getProjectById(projectId , userId);

    if(!project){
      return res.status(404).json({ message: "Project not found" });
    }
    res.json({
      message: "Project retrieved successfully",
      project,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving project",
      error: err.message,
    });
  }
};

const addProjectMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { user_id } = req.body;
    const ownerId = req.user.id;

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    await projectService.addProjectMember(projectId, user_id, ownerId);

    res.status(201).json({
      message: "Member added successfully",
    });
  } catch (err) {
    if (
      err.message.includes("not found") ||
      err.message.includes("Unauthorized") ||
      err.message.includes("already a member")
    ) {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: "Server error" });
  }
};

const getProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const members = await projectService.getProjectMembers(projectId, userId);

    res.json({
      message: "Project members fetched successfully",
      members,
    });
  } catch (err) {
    if (err.message.includes("Unauthorized")) {
      return res.status(403).json({ message: err.message });
    }

    res.status(500).json({ message: "Server error" });
  }
};

const updateMemberRole = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const { role } = req.body;
    const ownerId = req.user.id;

    if (!role) {
      return res.status(400).json({ message: "role is required" });
    }

    await projectService.updateMemberRole(
      projectId,
      memberId,
      role,
      ownerId
    );

    res.json({
      message: "Member role updated successfully",
    });
  } catch (err) {
    if (
      err.message.includes("not found") ||
      err.message.includes("Unauthorized") ||
      err.message.includes("Invalid role")
    ) {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: "Server error" });
  }
};

const removeProjectMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const ownerId = req.user.id;

    await projectService.removeProjectMember(
      projectId,
      memberId,
      ownerId
    );

    res.json({
      message: "Member removed successfully",
    });

  } catch (err) {

    if (
      err.message.includes("Unauthorized") ||
      err.message.includes("not found")
    ) {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: "Server error" });
  }
};

const getProjectStats = async (req, res) => {
  try {

    const { projectId } = req.params;
    const userId = req.user.id;

    const stats = await projectService.getProjectStats(projectId, userId);

    res.json(stats);

  } catch (err) {

    if (err.message.includes("Forbidden")) {
      return res.status(403).json({ message: err.message });
    }

    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  createProject,
  getProjects,
  getProjectById,
  addProjectMember,
  getProjectMembers,
  updateMemberRole,
  removeProjectMember,
  getProjectStats
};