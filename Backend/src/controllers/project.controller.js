const generateCodeUsingAi = require("../services/ai.service");
const projectModel = require("../models/project.model.js"); // Uncomment when your schema is ready to use

const buildRefinedPrompt = require("../constants/refinePrompt.js");
const {emitToUser} = require("../services/socket.js") ;



/**
 * @name createProjectController
 * @description Creates a new Project. Expects a title, userId, prompt
 * @access private
 */
const createProjectController = async (req, res) => {
  try {
    const { title, prompt } = req.body;
    const userId = req.userId;

    if (!title || title.length > 80) {
      return res.status(400).json({
        success: false,
        message: "Title is required and must be under 80 characters.",
      });
    }

    if (!prompt || prompt.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required to generate a webpage.",
      });
    }

    const projectData = await projectModel.create({
      userId,
      title,
      prompt,
      files: [],
      status: "generating",
    });

    res.status(202).json({
      success: true,
      message: "Webpage generation started in the background.",
      status: "generating",
      projectId: projectData._id,
    }) ;

    // Background async worker — non-blocking response already sent above
    setImmediate(async () => {
      try {
        // Build a structured, model-agnostic prompt from the raw user input
        const refinedPrompt = buildRefinedPrompt(prompt.trim());

        const generatedCode = await generateCodeUsingAi(refinedPrompt);

        const { html, css, js } = generatedCode;

        projectData.files = [
          { name: "index.html", content: html || "" },
          { name: "style.css", content: css || "" },
          { name: "script.js", content: js || "" },
        ];

        projectData.status = "completed";
        await projectData.save();

        emitToUser(userId, "project-status-update", {
          success: true,
          projectId: projectData._id,
          message: "Project Completed",
          status: "completed",
        }) ;

        console.log(
          `✅ Project "${title}" completed and saved. [ID: ${projectData._id}]`,
        );
      } catch (aiErr) {
        console.error(
          `❌ Background AI worker failed for project "${title}":`,
          aiErr,
        );
        projectData.status = "failed";
        await projectData.save();
        emitToUser(userId, "project-status-update", {
          success: false,
          projectId: projectData._id,
          message: "Project failed due to internal issue",
          status: "failed",
        }) ;
      }
    });
  } catch (err) {
    console.error("Error at createProjectController:", err);

    if (err instanceof SyntaxError) {
      return res.status(422).json({
        success: false,
        message:
          "The AI output could not be parsed — the design was likely too complex. Try simplifying your prompt slightly.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error during generation pipeline.",
    });
  }
};

/**
 * @name getProjectByIdController
 * @description returns the project details, expects projectId from params and userId from verifyJwt
 * @access private
 */
const getProjectByIdController = async (req, res) => {
  try {
    const { projectId } = req.params;

    const userId = req.userId;

    const project = await projectModel.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.userId.toString() != userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access. You do not own this project.",
      });
    }

    return res.status(200).json({
      success: true,
      status: project.status,
      project,
    });
  } catch (err) {
    console.log("Error in getProjectByIdController ", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching project assets.",
    });
  }
};

/**
 * @name getAllProjectsByUserIdController
 * @description returns all projects of a user with project title and _id, expects userId from accesstoken
 * @access private
 */
const getAllProjectsByUserIdController = async (req, res) => {
  try {
    const userId = req.userId;

    const records = await projectModel
      .find({
        userId,
        status: "completed"

      })
      .select("title")
      .sort({ createdAt: -1 });

    if (!records) {
      return res.status(401).json({
        success: false,
        message: "No project found",
      });
    }

    return res.status(200).json({
      success: true,
      count: records.length,
      projects: records,
    });
  } catch (err) {
    console.log("getAllProjectsController Err", err);
    return res.status(501).json({
      success: false,
      message: "Failed to load recent projects",
    });
  }
};

/**
 * @name deleteByProjectIdController
 * @description deletes the project from database belonging to a user
 * @access private
 */
const deleteByProjectIdController = async (req, res) => {
  try {
    const userId = req.userId;
    const { projectId } = req.params;
    const deletionResult = await projectModel.deleteOne({
      userId: userId,
      _id: projectId,
    });

    console.log("deletion result", deletionResult);

    if (deletionResult.deletedCount == 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found or Unauthorized request",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project deleted succesfully",
    });
  } catch (err) {
    console.log("deleteByProjectIdController error", err);
    return res.status(501).json({
      success: false,
      message: "Failed to delete the project",
    });
  }
};

module.exports = {
  createProjectController,
  getProjectByIdController,
  getAllProjectsByUserIdController,
  deleteByProjectIdController,
};
