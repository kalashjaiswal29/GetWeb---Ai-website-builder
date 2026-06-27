const { Router } = require("express");

//Importing ProjectRouter controller
const projectController = require("../controllers/project.controller");
const verifyJwt = require("../middleWares/verifyJWT.middleware");

const projectRouter = Router();


/**
 * @path api/projects/project
 * @description create a new project
 * @access private
 */
projectRouter.post("/project",verifyJwt, projectController.createProjectController);

/**
 * @path api/projects/sidebar
 * @description returns all project title with their project id's respectively belonging to a user
 * @access private
 */
projectRouter.get("/sidebar", verifyJwt, projectController.getAllProjectsByUserIdController)

/**
 * @path api/projects/:projectId
 * @description gives the project details to the frontend
 * @access private
 */
projectRouter.get("/:projectId", verifyJwt, projectController.getProjectByIdController)

/**
 * @path api/projects/:projectId
 * @description Deletes a project from database
 * @access private 
 */
projectRouter.delete("/:projectId", verifyJwt, projectController.deleteByProjectIdController)



module.exports = projectRouter;
