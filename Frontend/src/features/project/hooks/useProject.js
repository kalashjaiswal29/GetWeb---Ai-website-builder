import { useContext } from "react";
import { AuthContext } from "../../auth/data/auth.context";
import { ProjectContext } from "../data/project.context";



//Importing api functions
import {
  createProject,
  getProject,
  getAllProjects,
  deleteProject,
} from "../services/project.api";

const useProject = () => {
  const {
    title,
    setTitle,
    fileData,
    setFileData,
    loading,
    setLoading,
    error,
    setError,
    allProjects,
    setAllProjects,
  } = useContext(ProjectContext);

  const { user, accessToken } = useContext(AuthContext);

  //Function to create a project
  const handleCreateProject = async (prompt) => {
    try {
      const response = await createProject({
        accessToken,
        title,
        prompt,
      });
      if (response.success) setError(response.message);
    } catch (err) {
      console.log("handleCreateProject hook err", err);
    } finally {
      setLoading(false);
    }
  };

  //Function to get the contents of a project to show preview
  const handleGetProject = async (projectId) => {
    setLoading(true);
    try {
      const response = await getProject({ projectId, accessToken });
      console.log("project data ", response.project);
      if (response.success) {
        setTitle(response.project.title);
        setFileData(response.project.files);
        // console.log("file data in useState ", fileData, "\n", title);
      } else {
        console.log("handleGetProject err", response.message);
        setError(response.message);
      }
    } catch (err) {
      console.log("handleCreateProject hook err", err);
    } finally {
      setLoading(false);
    }
  };

  //Function to get all projects title
  const handleGetAllProjects = async () => {
    try {
      const response = await getAllProjects(accessToken);

      if (response.success) {
        setAllProjects(response.projects);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.log("handleCreateProject hook err", err);
    } finally {
      setLoading(false);
    }
  };

  //Function to delete a project
  const handleDeleteProject = async (projectId) => {
    // Optimistic update — remove instantly from UI
    setAllProjects((prev) => prev.filter((p) => p._id !== projectId));
    try {
      const response = await deleteProject({ projectId, accessToken });

      if (!response.success) {
        // Rollback is complex; at minimum surface the error
        setError(response.message);
        // Re-fetch to restore accurate state
        handleGetAllProjects();
      }
    } catch (err) {
      console.log("handleDeleteProject hook err", err);
      setError("Failed to delete project.");
      handleGetAllProjects();
    }
  };

  return {
    handleCreateProject,
    handleGetProject,
    handleGetAllProjects,
    handleDeleteProject,
    user,
    title,
    fileData,
    loading,
    setTitle,
    error,
    allProjects,
  };
};

export default useProject;
