import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import verifyGoogleToken from "../utils/google.js";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "Email already exists");
  }

  let profileImage = "";
  let profileImagePublicId = "";

  // Agar image di gayi hai
  if (req.file) {
    const cloudinaryResponse = await uploadOnCloudinary(req.file.path);

    if (!cloudinaryResponse) {
      throw new ApiError(500, "Image upload failed");
    }

    profileImage = cloudinaryResponse.secure_url;
    profileImagePublicId = cloudinaryResponse.public_id;
  }

  const user = await User.create({
    name,
    email,
    password,
    profileImage,
    profileImagePublicId,
  });

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

  // Name update
  user.name = name.trim();

  // Agar image upload hui hai
  if (req.file) {
    // Old image delete karo
    if (user.profileImagePublicId) {
      await deleteFromCloudinary(user.profileImagePublicId);
    }

    const cloudinaryResponse = await uploadOnCloudinary(req.file.path);

    if (!cloudinaryResponse) {
      throw new ApiError(500, "Image upload failed");
    }

    // Cloudinary ki URL MongoDB mein save karo
    user.profileImage = cloudinaryResponse.secure_url;
    user.profileImagePublicId = cloudinaryResponse.public_id;
  }

  // Database mein save
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"));
});

const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new ApiError(400, "Google ID token is required");
  }

  const googleUser = await verifyGoogleToken(idToken);

  const { sub: googleId, email, name, picture, email_verified } = googleUser;

  if (!email || !email_verified) {
    throw new ApiError(401, "Google email could not be verified");
  }

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      googleId,
      profileImage: picture || "",
      authProvider: "google",
    });
  } else {
    if (!user.googleId) {
      user.googleId = googleId;
      user.authProvider = "google";
      user.profileImage = user.profileImage || picture || "";

      await user.save();
    }
  }

  const token = user.generateAuthToken();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  };

  return res
    .status(200)
    .cookie("token", token, cookieOptions)
    .json(new ApiResponse(200, user, "Google login successful"));
});

export {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  updateProfile,
  googleLogin,
};
