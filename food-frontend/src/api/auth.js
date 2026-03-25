import API from "./api";

// baseURL is already '/api/' so no need to prefix with /api/
export const login = async (username, password) => {
  const res = await API.post("auth/token/", { username, password });
  return res.data;
};

export const refreshAccess = async () => {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) throw new Error("No refresh token");
  const res = await API.post("auth/token/refresh/", { refresh });
  return res.data;
};

export const register = async (payload) => {
  const res = await API.post("auth/register/", payload);
  return res.data;
};

export const getProfile = async () => {
  const res = await API.get("auth/profile/");
  return res.data;
};

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/login";
};
