import api from "./api";

export const register = (data) => api.post("/auth/register", data);

export const login = (data) => api.post("/auth/login", data);

export const logout = () => api.post("/auth/logout");

export const getProfile = () => api.get("/auth/profile");
