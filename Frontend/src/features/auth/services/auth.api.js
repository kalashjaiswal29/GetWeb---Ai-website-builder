const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

export const register = async ({ name, email, password }) => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    return response.json();
  } catch (err) {
    console.log("Register error: ", err);
  }
};

export const login = async ({ email, password }) => {
  try {
    const res = await fetch(`${BACKEND_API_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    return res.json();
  } catch (err) {
    console.log("Login Error ", err);
  }
};
export const refreshToken = async () => {
  try {
    const res = await fetch(`${BACKEND_API_URL}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
    });
    return res.json();
  } catch (err) {
    console.log("Refresh token api err", err);
  }
};

export const getMe = async (accessToken) => {
  try {
    const res = await fetch(`${BACKEND_API_URL}/auth/get-me`, {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return res.json();
  } catch (err) {
    console.log("getMe api err", err);
  }
};

export const logout = async () => {
  try {
    const res = await fetch(`${BACKEND_API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    return res.json();
  } catch (err) {
    console.log("Error in logOut Api ", err);
  }
};

export const logoutFromAll = async () => {
  try {
    const res = await fetch(`${BACKEND_API_URL}/auth/logout-all`, {
      method: "POST",
      credentials: "include",
    });
    return res.json();
  } catch (err) {
    console.log("LogOut All Error ", err);
  }
};
