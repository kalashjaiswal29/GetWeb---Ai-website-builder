const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

//Creating new project Api function
export const createProject = async ({ accessToken, title, prompt }) => {
  console.log("data from create project", accessToken, title, prompt);
  try {
    const response = await fetch(`${BACKEND_API_URL}/projects/project`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        prompt,
      }),
    });
    return response.json();
  } catch (err) {
    console.log("Create Project Api Error ", err);
  }
};

//Loading a project from database to show preview Api
export const getProject = async ({ projectId, accessToken }) => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/projects/${projectId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.json();
  } catch (err) {
    console.log("getProject Api Error ", err);
  }
};

//Importing all project title from database Api
export const getAllProjects = async (accessToken) => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/projects/sidebar`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.json();
  } catch (err) {
    console.log("getAllProjects Api Error ", err);
  }
};

//Delete an existing project Api
export const deleteProject = async ({ projectId, accessToken }) => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/projects/${projectId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (err) {
    console.log("deleteProject Api Error ", err);
  }
};
