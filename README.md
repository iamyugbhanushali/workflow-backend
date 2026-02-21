# Workflow & Task Tracking Backend

A production-oriented backend system for managing projects, tasks,
teams, and activity history with **role-based access control (RBAC)**
and **audit-driven workflow tracking**.

This project models how internal workflow tools operate inside real
organizations, with a strong focus on **clean architecture,
authorization design, and data traceability** rather than simple CRUD
operations.

------------------------------------------------------------------------

## 🚀 Overview

The system enables teams to:

-   Create and manage projects
-   Assign and track tasks
-   Control access using project-level roles
-   Maintain a complete audit trail of all critical actions
-   Generate real-time project insights

------------------------------------------------------------------------

## 🛠 Tech Stack

-   Node.js
-   Express.js
-   PostgreSQL
-   JWT Authentication

------------------------------------------------------------------------

## 🧱 Architectural Pattern

Route → Controller → Service → Repository → Database

### Key Rules

-   No SQL outside repositories\
-   No business logic in controllers\
-   Services enforce authorization and workflows

------------------------------------------------------------------------

## 🧩 Domain Model

### Core Entities

-   User
-   Project
-   Task
-   ProjectMember
-   TaskAuditLog
-   TaskAssignmentLog

------------------------------------------------------------------------

## 👑 Project Ownership

Project ownership is derived from:

projects.created_by

------------------------------------------------------------------------

## 🔐 Role-Based Access Control

  Role     Capabilities
  -------- -----------------------------
  OWNER    Full control (team + tasks)
  ADMIN    Task management
  MEMBER   Work on assigned tasks

------------------------------------------------------------------------

## 🧾 Audit & Traceability

Every critical workflow change is recorded:

-   Status History\
-   Assignment History

This enables the system to answer:

-   Who performed the action?\
-   What changed?\
-   When did it happen?

------------------------------------------------------------------------

## ✨ Key Features

### Authentication

-   JWT-based login
-   Request identity via middleware

### Project Management

-   Create project
-   User-scoped project access

### Team Collaboration

-   Add/remove project members
-   Update member roles
-   Retrieve project team

### Task Lifecycle

-   RBAC-protected task creation
-   Update task details
-   Soft delete tasks
-   Assign / reassign tasks
-   Status transitions with audit log

### User-Focused Workflow

-   Fetch tasks assigned to current user
-   Advanced filtering support

------------------------------------------------------------------------

## 📊 Dashboard APIs

### Project Statistics

-   Total tasks
-   Status distribution
-   Overdue tasks

### Activity Timeline

-   Status changes
-   Assignment changes

------------------------------------------------------------------------

## 🗄 Database Design Highlights

-   Soft delete for tasks to preserve audit integrity
-   Unique project membership constraint
-   Aggregation-friendly schema
-   Separation of lifecycle logs from main entities

------------------------------------------------------------------------

## 🔗 Example API Endpoints

### Auth

POST /auth/register\
POST /auth/login

### Projects

POST /projects\
GET /projects\
GET /projects/:id

### Project Members

POST /projects/:projectId/members\
GET /projects/:projectId/members\
PATCH /projects/:projectId/members/:memberId/role\
DELETE /projects/:projectId/members/:memberId

### Tasks

POST /projects/:projectId/tasks\
GET /projects/:projectId/tasks\
PATCH /tasks/:taskId\
PATCH /tasks/:taskId/status\
PATCH /tasks/:taskId/assign\
DELETE /tasks/:taskId

### Insights

GET /projects/:projectId/stats\
GET /projects/:projectId/activity

------------------------------------------------------------------------

## ⚙️ Setup Instructions

### 1. Clone the repository

git clone
https://github.com/`<your-username>`{=html}/workflow-backend.git\
cd workflow-backend

### 2. Install dependencies

npm install

### 3. Configure environment variables

Create a .env file:

PORT=3000

DB_HOST=localhost\
DB_USER=postgres\
DB_PASSWORD=yourpassword\
DB_NAME=workflow_db\
DB_PORT=5432

JWT_SECRET=your_secret

### 4. Run the server

npm run dev

------------------------------------------------------------------------

## 🎯 Design Goals

-   Scalable backend architecture\
-   Real-world authorization modeling\
-   Audit-driven workflow systems\
-   Dashboard-ready data aggregation\
-   Clean separation of concerns

------------------------------------------------------------------------

## 🔮 Future Enhancements

-   Request validation layer\
-   Global error handling middleware\
-   Automated tests\
-   Dockerization\
-   CI/CD pipeline

------------------------------------------------------------------------

## 👤 Author

Yug Bhanushali
