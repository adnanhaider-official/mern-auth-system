import api from "./api.js";

// Register user
export const registerUser = async (formData) => {
  const response = await api.post("/auth/register", formData);

  return response.data;
};

// Login user
export const loginUser = async (data) => {
  const response = await api.post("/auth/login", data);

  return response.data;
};

// Google login
export const googleLogin = async (idToken) => {
  const response = await api.post("/auth/google", { idToken });

  return response.data;
};

// Get current logged-in user
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};

// Logout user
export const logoutUser = async () => {
  const response = await api.post("/auth/logout");

  return response.data;
};

// Update profile
export const updateProfile = async (formData) => {
  const response = await api.patch("/auth/profile", formData);

  return response.data;
};
