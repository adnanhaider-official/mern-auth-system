import { Router } from "express";

import {
  getCurrentUser,
  googleLogin,
  loginUser,
  logoutUser,
  registerUser,
  updateProfile,
} from "../controllers/auth.controller.js";

import verifyJwt from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

router.post("/register", upload.single("profileImage"), registerUser);
router.post("/login", loginUser);
router.get("/me", verifyJwt, getCurrentUser);
router.post("/logout", verifyJwt, logoutUser);
router.patch(
  "/profile",
  verifyJwt,
  upload.single("profileImage"),
  updateProfile
);
router.post("/google", googleLogin);

export default router;
