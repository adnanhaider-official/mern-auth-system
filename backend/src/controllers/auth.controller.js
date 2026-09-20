import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Required fields check
  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  // Password minimum length
  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "Email already exists");
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  // Remove password from response
  const createdUser = await User.findById(user._id);

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Required fields check
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Password select:false hai,
  // isliye login ke liye explicitly password mangwana hai
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Password compare
  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Incorrect password");
  }

  // JWT generate
  const token = user.generateAuthToken();

  // Cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  // Password response mein nahi bhejna
  user.password = undefined;

  return res
    .status(200)
    .cookie("token", token, cookieOptions)
    .json(new ApiResponse(200, user, "User logged in successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, "Name is required");
  }

  if (name.length < 3) {
    throw new ApiError(400, "Name must be at least 3 characters");
  }

  if (name.length > 50) {
    throw new ApiError(400, "Name cannot exceed 50 characters");
  }

  // Pehle user find karo
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Phir user ka name update karo
  user.name = name.trim();

  // Database mein save karo
  await user.save();

  if (req.file) {
    console.log("File path:", req.file.path);
    console.log("File name:", req.file.filename);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"));
});

export { registerUser, loginUser, getCurrentUser, logoutUser, updateProfile };
