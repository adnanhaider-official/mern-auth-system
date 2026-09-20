import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const verifyJwt = asyncHandler(async (req, res, next) => {
  // Cookie se token lena
  const token = req.cookies.token;

  // Agar token nahi hai
  if (!token) {
    throw new ApiError(401, "Unauthorized user");
  }

  let decoded;

  try {
    // JWT verify karna
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }

  // Token se user ID lekar database se user find karna
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  // User ko request ke andar store karna
  req.user = user;

  // Next middleware/controller par jana
  next();
});

export default verifyJwt;
