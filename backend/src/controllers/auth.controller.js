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

export { registerUser };
